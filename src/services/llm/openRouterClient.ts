import axios, { AxiosInstance } from 'axios';

/**
 * OpenRouter LLM Client - Unified API for multiple LLM providers
 * Supports: Qwen, Kimi, Grok, DeepSeek, Claude, GPT-4, etc.
 */

interface LLMModel {
  id: string;
  name: string;
  provider: 'qwen' | 'kimi' | 'grok' | 'deepseek' | 'claude' | 'openai';
  costPer1kTokens: number; // input tokens
  costPer1kOutputTokens: number;
  latency: number; // estimated ms
  strengths: string[];
  maxContextLength: number;
  bestFor: string[];
}

interface TaskContext {
  type: 'lead_qualification' | 'email_copy' | 'challenge_generation' | 'trip_recommendation' | 'customer_response' | 'refund_decision' | 'point_calculation' | 'chat';
  priority: 'speed' | 'quality' | 'cost' | 'balanced';
  complexity: 'simple' | 'medium' | 'complex';
  inputLength?: number;
  userId?: string;
}

interface LLMRequest {
  model: string;
  messages: Array<{ role: 'user' | 'system' | 'assistant'; content: string }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

interface LLMResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  latency: number;
  provider: string;
  timestamp: Date;
}

interface RoutingDecision {
  model: LLMModel;
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
}

class OpenRouterClient {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';
  private client: AxiosInstance;
  private models: Map<string, LLMModel> = new Map();
  private costTracker: Map<string, number> = new Map();
  private latencyHistory: Array<{ model: string; latency: number; timestamp: Date }> = [];

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️  OpenRouter API key not found. Set OPENROUTER_API_KEY environment variable.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://trekandstay.com',
        'X-Title': 'Trek And Stay - LLM Orchestrator',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    this.initializeModels();
  }

  /**
   * Initialize available LLM models with pricing and characteristics
   */
  private initializeModels(): void {
    const models: LLMModel[] = [
      // COST-EFFECTIVE & FAST
      {
        id: 'qwen/qwen-3-72b-instruct',
        name: 'Qwen 3 (72B)',
        provider: 'qwen',
        costPer1kTokens: 0.00003,
        costPer1kOutputTokens: 0.00006,
        latency: 500,
        strengths: ['fast', 'cost-effective', 'reasoning', 'multilingual'],
        maxContextLength: 32000,
        bestFor: ['email_copy', 'point_calculation', 'challenge_generation']
      },

      // LOGIC & REASONING
      {
        id: 'deepseek/deepseek-coder',
        name: 'DeepSeek Coder',
        provider: 'deepseek',
        costPer1kTokens: 0.00014,
        costPer1kOutputTokens: 0.00028,
        latency: 800,
        strengths: ['coding', 'logic', 'technical-writing', 'reasoning'],
        maxContextLength: 4096,
        bestFor: ['lead_qualification', 'technical_analysis']
      },

      // LONG CONTEXT & REASONING
      {
        id: 'jina/jina-coder-s',
        name: 'Kimi K2 Alternative',
        provider: 'kimi',
        costPer1kTokens: 0.00025,
        costPer1kOutputTokens: 0.00050,
        latency: 1200,
        strengths: ['long-context', 'reasoning', 'analysis', 'detailed-responses'],
        maxContextLength: 128000,
        bestFor: ['trip_recommendation', 'customer_response', 'complex_analysis']
      },

      // REAL-TIME & CREATIVE
      {
        id: 'grok/grok-3',
        name: 'Grok 3',
        provider: 'grok',
        costPer1kTokens: 0.00030,
        costPer1kOutputTokens: 0.00060,
        latency: 700,
        strengths: ['real-time-knowledge', 'creative', 'conversational', 'edgy-tone'],
        maxContextLength: 8000,
        bestFor: ['chat', 'customer_response', 'creative_writing']
      },

      // HIGHEST QUALITY
      {
        id: 'anthropic/claude-3-sonnet-20250219',
        name: 'Claude 3 Sonnet',
        provider: 'claude',
        costPer1kTokens: 0.00300,
        costPer1kOutputTokens: 0.01500,
        latency: 1500,
        strengths: ['accuracy', 'nuanced-reasoning', 'safety', 'reliability'],
        maxContextLength: 200000,
        bestFor: ['refund_decision', 'complex_reasoning', 'sensitive_tasks']
      },

      // BALANCED & RELIABLE
      {
        id: 'openai/gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        costPer1kTokens: 0.01000,
        costPer1kOutputTokens: 0.03000,
        latency: 1800,
        strengths: ['general-purpose', 'reliability', 'quality'],
        maxContextLength: 128000,
        bestFor: ['critical_decisions']
      }
    ];

    models.forEach(model => {
      this.models.set(model.id, model);
      this.costTracker.set(model.provider, 0);
    });
  }

  /**
   * Intelligent task routing - Select best LLM based on task characteristics
   */
  routeTask(context: TaskContext): RoutingDecision {
    let selectedModel: LLMModel | null = null;
    let reason = '';

    // STRATEGY 1: COST PRIORITY
    if (context.priority === 'cost') {
      selectedModel = this.models.get('qwen/qwen-3-72b-instruct')!;
      reason = 'Qwen selected: Most cost-effective option';
    }
    // STRATEGY 2: SPEED PRIORITY
    else if (context.priority === 'speed') {
      if (context.type === 'email_copy' || context.type === 'point_calculation') {
        selectedModel = this.models.get('qwen/qwen-3-72b-instruct')!;
        reason = 'Qwen selected: Fastest for simple tasks (500ms)';
      } else {
        selectedModel = this.models.get('grok/grok-3')!;
        reason = 'Grok selected: Fast with real-time capabilities (700ms)';
      }
    }
    // STRATEGY 3: QUALITY PRIORITY
    else if (context.priority === 'quality') {
      if (context.type === 'refund_decision' || context.complexity === 'complex') {
        selectedModel = this.models.get('anthropic/claude-3-sonnet-20250219')!;
        reason = 'Claude selected: Highest accuracy for critical decisions';
      } else if (context.type === 'trip_recommendation' || context.inputLength! > 50000) {
        selectedModel = this.models.get('jina/jina-coder-s')!;
        reason = 'Kimi selected: Best for long context and detailed reasoning';
      } else {
        selectedModel = this.models.get('deepseek/deepseek-coder')!;
        reason = 'DeepSeek selected: Excellent reasoning for quality output';
      }
    }
    // STRATEGY 4: BALANCED (DEFAULT)
    else {
      switch (context.type) {
        case 'lead_qualification':
          selectedModel = this.models.get('deepseek/deepseek-coder')!;
          reason = 'DeepSeek: Optimal for logical lead scoring';
          break;

        case 'email_copy':
          selectedModel = this.models.get('qwen/qwen-3-72b-instruct')!;
          reason = 'Qwen: Fast and cost-effective for email generation';
          break;

        case 'challenge_generation':
          selectedModel = this.models.get('qwen/qwen-3-72b-instruct')!;
          reason = 'Qwen: Quick generation of personalized challenges';
          break;

        case 'point_calculation':
          selectedModel = this.models.get('qwen/qwen-3-72b-instruct')!;
          reason = 'Qwen: Simple calculation logic, very fast';
          break;

        case 'trip_recommendation':
          selectedModel = this.models.get('jina/jina-coder-s')!;
          reason = 'Kimi: Best for reasoning about user preferences and recommendations';
          break;

        case 'customer_response':
          if (context.complexity === 'complex') {
            selectedModel = this.models.get('jina/jina-coder-s')!;
            reason = 'Kimi: Complex customer issues need deep reasoning';
          } else {
            selectedModel = this.models.get('grok/grok-3')!;
            reason = 'Grok: Conversational responses with real-time understanding';
          }
          break;

        case 'refund_decision':
          selectedModel = this.models.get('anthropic/claude-3-sonnet-20250219')!;
          reason = 'Claude: Critical decision requires highest accuracy';
          break;

        case 'chat':
          selectedModel = this.models.get('grok/grok-3')!;
          reason = 'Grok: Natural conversational flow';
          break;

        default:
          selectedModel = this.models.get('qwen/qwen-3-72b-instruct')!;
          reason = 'Qwen: Default safe choice';
      }
    }

    const estimatedCost = (context.inputLength || 500) / 1000 * selectedModel.costPer1kTokens;
    const estimatedLatency = selectedModel.latency;

    return {
      model: selectedModel,
      reason,
      estimatedCost,
      estimatedLatency
    };
  }

  /**
   * Execute task with selected LLM
   */
  async executeTask(
    prompt: string,
    context: TaskContext,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    const routing = this.routeTask(context);
    const model = routing.model;

    console.log(`\n🤖 [LLM Router] Routing task: ${context.type}`);
    console.log(`📊 Selected: ${model.name} (${model.provider})`);
    console.log(`💡 Reason: ${routing.reason}`);
    console.log(`⏱️  Est. latency: ${routing.estimatedLatency}ms`);
    console.log(`💰 Est. cost: $${routing.estimatedCost.toFixed(6)}`);

    try {
      const startTime = Date.now();

      const request: LLMRequest = {
        model: model.id,
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are a helpful assistant. Provide clear, accurate, and concise responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9
      };

      const response = await this.client.post('/chat/completions', request);
      const latency = Date.now() - startTime;

      const content = response.data.choices[0].message.content;
      const inputTokens = response.data.usage?.prompt_tokens || 0;
      const outputTokens = response.data.usage?.completion_tokens || 0;
      const totalTokens = inputTokens + outputTokens;

      const cost = (inputTokens / 1000) * model.costPer1kTokens + (outputTokens / 1000) * model.costPer1kOutputTokens;

      // Track costs
      this.costTracker.set(model.provider, (this.costTracker.get(model.provider) || 0) + cost);
      this.latencyHistory.push({ model: model.id, latency, timestamp: new Date() });

      console.log(`✅ Success | Tokens: ${totalTokens} | Cost: $${cost.toFixed(6)} | Latency: ${latency}ms\n`);

      return {
        content,
        model: model.id,
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
        latency,
        provider: model.provider,
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error(`❌ Error with ${model.name}:`, error.message);
      throw new Error(`LLM request failed: ${error.message}`);
    }
  }

  /**
   * Batch process multiple tasks
   */
  async batchProcess(
    tasks: Array<{ prompt: string; context: TaskContext; systemPrompt?: string }>
  ): Promise<LLMResponse[]> {
    const results: LLMResponse[] = [];
    let totalCost = 0;
    let totalTime = 0;

    console.log(`\n📦 [Batch Processing] Starting ${tasks.length} tasks...\n`);

    for (let i = 0; i < tasks.length; i++) {
      try {
        const result = await this.executeTask(tasks[i].prompt, tasks[i].context, tasks[i].systemPrompt);
        results.push(result);
        totalCost += result.cost;
        totalTime += result.latency;
      } catch (error: any) {
        console.error(`Task ${i + 1} failed:`, error.message);
      }
    }

    console.log(`\n📊 [Batch Summary]`);
    console.log(`✅ Completed: ${results.length}/${tasks.length}`);
    console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
    console.log(`⏱️  Avg latency: ${(totalTime / results.length).toFixed(0)}ms`);
    console.log(`📈 Total tokens: ${results.reduce((sum, r) => sum + r.totalTokens, 0)}\n`);

    return results;
  }

  /**
   * Get cost breakdown by provider
   */
  getCostBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    this.costTracker.forEach((cost, provider) => {
      breakdown[provider] = parseFloat(cost.toFixed(6));
    });
    return breakdown;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const metrics: Record<string, any> = {};

    const providers = new Set(this.latencyHistory.map(h => h.model.split('/')[0]));

    providers.forEach(provider => {
      const providerLatencies = this.latencyHistory
        .filter(h => h.model.includes(provider))
        .map(h => h.latency);

      if (providerLatencies.length > 0) {
        const avgLatency = providerLatencies.reduce((a, b) => a + b, 0) / providerLatencies.length;
        metrics[provider] = {
          avgLatency: Math.round(avgLatency),
          minLatency: Math.min(...providerLatencies),
          maxLatency: Math.max(...providerLatencies),
          requests: providerLatencies.length,
          totalCost: this.costTracker.get(provider as any) || 0
        };
      }
    });

    return metrics;
  }

  /**
   * Print cost report
   */
  printCostReport(): void {
    console.log('\n💰 [Cost Report]');
    const breakdown = this.getCostBreakdown();
    let totalCost = 0;

    Object.entries(breakdown).forEach(([provider, cost]) => {
      console.log(`  ${provider.toUpperCase()}: $${cost.toFixed(6)}`);
      totalCost += cost;
    });

    console.log(`  TOTAL: $${totalCost.toFixed(4)}\n`);
  }

  /**
   * Print performance report
   */
  printPerformanceReport(): void {
    console.log('\n📊 [Performance Report]');
    const metrics = this.getPerformanceMetrics();

    Object.entries(metrics).forEach(([provider, data]) => {
      console.log(`\n  ${provider.toUpperCase()}`);
      console.log(`    Avg Latency: ${data.avgLatency}ms`);
      console.log(`    Min/Max: ${data.minLatency}ms / ${data.maxLatency}ms`);
      console.log(`    Requests: ${data.requests}`);
      console.log(`    Total Cost: $${data.totalCost.toFixed(6)}`);
    });
  }
}

export const openRouterClient = new OpenRouterClient();
export default OpenRouterClient;
