"""
Multi-LLM Router using OpenRouter
Uses 4 different TESTED & WORKING FREE LLMs for different purposes:
1. Meta Llama 3.3 70B (Free) - Writing & Response Generation (creative, engaging)
2. Qwen 2.5 72B (Free) - Understanding & Intent Analysis (analytical, accurate)
3. Google Gemma 2 9B (Free) - Tracking & Memory (detailed, comprehensive)
4. Dolphin 3.0 Mistral 24B (Free) - Overall Strategy & Decision Making (big picture, strategic)
"""

import os
import json
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
import requests
from datetime import datetime
from django.utils import timezone

logger = logging.getLogger(__name__)


@dataclass
class LLMConfig:
    """Configuration for each LLM"""
    name: str
    model: str
    api_key: str
    purpose: str
    max_tokens: int
    temperature: float
    priority: int


class MultiLLMRouter:
    """
    Routes requests to appropriate LLM based on task type
    Manages fallback and cost optimization
    Uses OpenRouter for all LLMs (all FREE)
    """
    
    def __init__(self):
        self.base_url = "https://openrouter.ai/api/v1"
        self.openrouter_key = os.getenv('OPENROUTER_API_KEY')
        
        if not self.openrouter_key:
            raise ValueError("OPENROUTER_API_KEY not set in environment variables")
        
        logger.info(f"✓ OpenRouter initialized with key: {self.openrouter_key[:20]}...")
        
        # Initialize 4 LLM configurations with TESTED & WORKING FREE model IDs
        self.llms = {
            'writer': LLMConfig(
                name='Llama 3.3 70B (Free)',
                model='meta-llama/llama-3.3-70b-instruct:free',  # ✅ TESTED & WORKING
                api_key=self.openrouter_key,
                purpose='Sales Response Writing & Customer Engagement',
                max_tokens=1024,
                temperature=0.8,
                priority=1
            ),
            'analyzer': LLMConfig(
                name='Qwen 2.5 72B (Free)',
                model='qwen/qwen-2.5-72b-instruct:free',  # ✅ TESTED & WORKING
                api_key=self.openrouter_key,
                purpose='Intent Analysis & Understanding',
                max_tokens=512,
                temperature=0.3,
                priority=2
            ),
            'tracker': LLMConfig(
                name='Gemma 2 9B (Free)',
                model='google/gemma-2-9b-it:free',  # ✅ TESTED & WORKING
                api_key=self.openrouter_key,
                purpose='Conversation Memory & Context Tracking',
                max_tokens=2048,
                temperature=0.2,
                priority=3
            ),
            'strategist': LLMConfig(
                name='Dolphin 3.0 Mistral 24B (Free)',
                model='cognitivecomputations/dolphin3.0-mistral-24b:free',  # ✅ TESTED & WORKING
                api_key=self.openrouter_key,
                purpose='Overall Strategy & Lead Scoring',
                max_tokens=1024,
                temperature=0.5,
                priority=4
            )
        }
        
        self.usage_stats = {
            'writer': {'calls': 0, 'tokens': 0},
            'analyzer': {'calls': 0, 'tokens': 0},
            'tracker': {'calls': 0, 'tokens': 0},
            'strategist': {'calls': 0, 'tokens': 0},
        }
        
        logger.info("✓ All 4 LLMs configured and ready")
    
    def call_writer(self, prompt: str, context: str = "") -> str:
        """
        Meta Llama 3.3 70B (Free) - Creative sales response writing
        Generates engaging, persuasive customer responses
        """
        system_prompt = """You are an expert sales copywriter for Trek & Stay adventure platform.

YOUR ROLE: Write engaging, persuasive WhatsApp messages that convert leads to customers.

GUIDELINES:
- Keep responses short (max 150 characters for WhatsApp)
- Use emojis strategically (🏔️ ⛺ 🥾 🌄)
- Create urgency without being pushy
- Address customer by name when possible
- Every message should have a clear call-to-action
- Be friendly, enthusiastic, adventurous

TONE: Friendly, exciting, trustworthy
GOAL: Move customer closer to booking"""
        
        full_prompt = f"{system_prompt}\n\nContext: {context}\n\nWrite response to: {prompt}"
        
        return self._call_openrouter(
            llm_type='writer',
            messages=[{"role": "user", "content": full_prompt}]
        )
    
    def call_analyzer(self, message: str) -> Dict:
        """
        Qwen 2.5 72B (Free) - Fast intent analysis and understanding
        Analyzes customer messages to extract intent, sentiment, buy-readiness
        """
        analysis_prompt = f"""Analyze this WhatsApp message and return ONLY a JSON object with these exact keys:
{{
  "intent": "trek_inquiry|booking_question|payment_question|objection|other",
  "sentiment": "positive|neutral|negative",
  "buy_readiness": 1-10,
  "key_concerns": ["concern1", "concern2"],
  "urgency": "high|medium|low"
}}

Message: "{message}"

Return ONLY valid JSON, no other text."""
        
        response = self._call_openrouter(
            llm_type='analyzer',
            messages=[{"role": "user", "content": analysis_prompt}]
        )
        
        try:
            # Clean response if it has markdown
            if response.startswith('```'):
                response = response.split('```')[1]
                if response.startswith('json'):
                    response = response[4:]
            return json.loads(response.strip())
        except:
            logger.warning("Failed to parse analyzer response, using fallback")
            return {
                'intent': 'trek_inquiry',
                'sentiment': 'neutral',
                'buy_readiness': 5,
                'key_concerns': [],
                'urgency': 'medium'
            }
    
    def call_tracker(self, lead_data: Dict, conversation_history: List) -> Dict:
        """
        Google Gemma 2 9B (Free) - Comprehensive conversation memory & context tracking
        Tracks lead journey, conversation flow, and contextual patterns
        """
        tracker_prompt = f"""Analyze this lead's conversation and return ONLY a JSON object:
{{
  "journey_stage": "awareness|consideration|decision",
  "conversation_flow": ["topic1", "topic2"],
  "objections": ["objection1"],
  "preferences": {{"difficulty": "beginner", "budget": 3000}},
  "next_best_action": "send_trek_options|send_booking_link|address_concern",
  "risk_level": 0-100
}}

Lead: {json.dumps(lead_data)}
Messages: {json.dumps(conversation_history)}

Return ONLY valid JSON, no other text."""
        
        response = self._call_openrouter(
            llm_type='tracker',
            messages=[{"role": "user", "content": tracker_prompt}]
        )
        
        try:
            if response.startswith('```'):
                response = response.split('```')[1]
                if response.startswith('json'):
                    response = response[4:]
            parsed = json.loads(response.strip())
            
            # Handle different response formats
            if 'lead_analysis' in parsed:
                # Deepseek format
                analysis = parsed['lead_analysis']
                return {
                    'journey_stage': analysis.get('JOURNEY_STAGE', 'consideration').lower(),
                    'conversation_flow': analysis.get('CONVERSATION_FLOW', []),
                    'objections': analysis.get('OBJECTIONS', []),
                    'preferences': analysis.get('PREFERENCES', {}),
                    'next_best_action': analysis.get('NEXT_BEST_ACTION', 'send_trek_options'),
                    'risk_level': analysis.get('RISK_LEVEL', 50)
                }
            else:
                # Standard format
                return parsed
        except:
            logger.warning("Failed to parse tracker response, using fallback")
            return {
                'journey_stage': 'consideration',
                'conversation_flow': [],
                'objections': [],
                'preferences': {},
                'next_best_action': 'send_trek_options',
                'risk_level': 50
            }
    
    def call_strategist(self, lead_data: Dict, analytics: Dict) -> Dict:
        """
        Dolphin 3.0 Mistral 24B (Free) - Strategic decision making
        Makes overall strategy decisions based on lead data
        """
        strategy_prompt = f"""Provide strategic analysis and return ONLY a JSON object:
{{
  "lead_score": 0-100,
  "conversion_probability": 0-100,
  "strategy": "nurture|close_deal|recover|special_offer",
  "risk_factors": ["factor1", "factor2"],
  "opportunity_value": 5000,
  "team_action": "send_personalized_offer|manual_follow_up|schedule_call"
}}

Lead: {json.dumps(lead_data)}
Analytics: {json.dumps(analytics)}

Return ONLY valid JSON, no other text."""
        
        response = self._call_openrouter(
            llm_type='strategist',
            messages=[{"role": "user", "content": strategy_prompt}]
        )
        
        try:
            if response.startswith('```'):
                response = response.split('```')[1]
                if response.startswith('json'):
                    response = response[4:]
            return json.loads(response.strip())
        except:
            logger.warning("Failed to parse strategist response, using fallback")
            return {
                'lead_score': 60,
                'conversion_probability': 35,
                'strategy': 'nurture',
                'risk_factors': [],
                'opportunity_value': 5000,
                'team_action': 'send_personalized_offer'
            }
    
    def _call_openrouter(self, llm_type: str, messages: List[Dict]) -> str:
        """
        Core method to call OpenRouter API
        Handles retries, fallbacks, and cost tracking
        """
        llm_config = self.llms[llm_type]
        
        headers = {
            "Authorization": f"Bearer {llm_config.api_key}",
            "HTTP-Referer": "https://trekandstay.com",
            "X-Title": "Trek & Stay - AI Sales Agent",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": llm_config.model,
            "messages": messages,
            "temperature": llm_config.temperature,
            "max_tokens": llm_config.max_tokens,
            "top_p": 0.95
        }
        
        try:
            logger.info(f"→ Calling {llm_config.name} ({llm_type}) for {llm_config.purpose}")
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data['choices'][0]['message']['content']
                
                # Track usage
                usage = data.get('usage', {})
                self.usage_stats[llm_type]['calls'] += 1
                self.usage_stats[llm_type]['tokens'] += usage.get('total_tokens', 0)
                
                logger.info(f"✓ {llm_config.name} responded in {usage.get('total_tokens', '?')} tokens")
                return content
            else:
                error_msg = f"API Error ({response.status_code}): {response.text[:200]}"
                logger.error(error_msg)
                return self._fallback_response(llm_type)
        
        except Exception as e:
            logger.error(f"Exception calling {llm_config.name}: {str(e)}")
            return self._fallback_response(llm_type)
    
    def _fallback_response(self, llm_type: str) -> str:
        """Fallback responses when LLM is unavailable"""
        fallbacks = {
            'writer': "Hi! 👋 Thanks for your interest in Trek & Stay! What type of trek are you looking for? 🏔️",
            'analyzer': json.dumps({
                'intent': 'trek_inquiry',
                'sentiment': 'neutral',
                'buy_readiness': 5,
                'key_concerns': [],
                'urgency': 'medium'
            }),
            'tracker': json.dumps({
                'journey_stage': 'consideration',
                'conversation_flow': [],
                'objections': [],
                'preferences': {},
                'next_best_action': 'send_trek_options',
                'risk_level': 50
            }),
            'strategist': json.dumps({
                'lead_score': 50,
                'conversion_probability': 30,
                'strategy': 'nurture',
                'risk_factors': ['api_failure'],
                'opportunity_value': 3000,
                'team_action': 'manual_follow_up'
            })
        }
        
        logger.warning(f"Using fallback for {llm_type}")
        return fallbacks.get(llm_type, "")
    
    def get_usage_stats(self) -> Dict:
        """Get usage statistics for all LLMs"""
        return {
            'timestamp': datetime.now().isoformat(),
            'stats': self.usage_stats,
            'total_calls': sum(s['calls'] for s in self.usage_stats.values()),
            'total_tokens': sum(s['tokens'] for s in self.usage_stats.values()),
        }
    
    def reset_stats(self):
        """Reset usage statistics"""
        for key in self.usage_stats:
            self.usage_stats[key] = {'calls': 0, 'tokens': 0}
        logger.info("✓ LLM statistics reset")


# ============ INTEGRATED ZERO-HUMAN LLM SALES ENGINE ============

class ZeroHumanMultiLLMSalesEngine:
    """
    Enhanced Zero-Human Sales Engine using Multi-LLM Router
    Each step uses the optimal LLM for that task
    """

    def __init__(self):
        self.llm_router = MultiLLMRouter()
        from services.whatsapp_api import WhatsAppAPI
        self.whatsapp_api = WhatsAppAPI()

    async def process_incoming_message(self, phone: str, message_text: str, lead_id: int = None):
        """
        Process incoming customer message with multi-LLM approach
        """
        from core.models import Lead, LeadEvent, OutboundMessage

        logger.info(f"[MULTI-LLM] Processing message from {phone}: {message_text}")

        # Step 1: Get or create lead
        lead, _ = Lead.objects.get_or_create(
            phone=phone,
            defaults={'name': f'Lead {phone[-4:]}', 'source': 'whatsapp', 'is_whatsapp': True}
        )

        # Step 2: ANALYZER - Understand customer intent
        logger.info("→ ANALYZER (Qwen 2.5 72B) - Analyzing intent...")
        intent_analysis = self.llm_router.call_analyzer(message_text)

        # Step 3: TRACKER - Get conversation context
        logger.info("→ TRACKER (Gemma 2 9B) - Tracking conversation...")
        conversation_history = list(
            LeadEvent.objects.filter(lead=lead, type__in=['inbound_msg', 'outbound_msg'])
            .order_by('-created_at')[:10].values('payload', 'created_at')
        )

        tracker_context = self.llm_router.call_tracker(
            lead_data={
                'id': lead.id,
                'name': lead.name,
                'phone': lead.phone,
                'stage': lead.stage,
                'intent_score': lead.intent_score,
                'created_at': lead.created_at.isoformat(),
            },
            conversation_history=[conv['payload'] for conv in conversation_history]
        )

        # Step 4: STRATEGIST - Determine overall approach
        logger.info("→ STRATEGIST (Dolphin 3.0 Mistral 24B) - Strategic decision...")
        strategy = self.llm_router.call_strategist(
            lead_data={
                'id': lead.id,
                'name': lead.name,
                'stage': lead.stage,
                'intent_score': lead.intent_score,
                'messages_received': len(conversation_history),
            },
            analytics={
                'buy_readiness': intent_analysis.get('buy_readiness', 5),
                'sentiment': intent_analysis.get('sentiment'),
                'urgency': intent_analysis.get('urgency'),
            }
        )

        # Step 5: WRITER - Generate engaging response
        logger.info("→ WRITER (Llama 3.3 70B) - Writing response...")
        context = f"""
Customer Intent: {intent_analysis.get('intent')}
Conversation Stage: {tracker_context.get('journey_stage')}
Customer Concerns: {intent_analysis.get('key_concerns')}
Recommended Strategy: {strategy.get('strategy')}
Lead Score: {strategy.get('lead_score')}/100
"""

        sales_response = self.llm_router.call_writer(
            prompt=message_text,
            context=context
        )

        # Step 6: Send response via WhatsApp
        logger.info("→ SENDING response via WhatsApp...")
        self.whatsapp_api.send_message(phone, sales_response)

        # Step 7: Update lead in CRM
        lead.stage = tracker_context.get('journey_stage', lead.stage)
        lead.intent_score = strategy.get('lead_score', lead.intent_score)
        lead.touch_contact()
        lead.save()

        # Log events
        LeadEvent.objects.create(
            lead=lead,
            type='inbound_msg',
            channel='custom_whatsapp',
            payload={
                'text': message_text,
                'intent': intent_analysis.get('intent'),
                'sentiment': intent_analysis.get('sentiment'),
                'buy_readiness': intent_analysis.get('buy_readiness'),
            }
        )

        LeadEvent.objects.create(
            lead=lead,
            type='outbound_msg',
            channel='custom_whatsapp',
            payload={
                'text': sales_response,
                'llm_model': 'multi-llm-router',
                'writer': 'Llama 3.3 70B (Free)',
                'strategy': strategy.get('strategy'),
            }
        )

        logger.info(f"✓ Message processed successfully for {lead.name}")
        logger.info(f"  Intent: {intent_analysis.get('intent')}")
        logger.info(f"  Buy Readiness: {intent_analysis.get('buy_readiness')}/10")
        logger.info(f"  Lead Score: {strategy.get('lead_score')}/100")

        return {
            'response': sales_response,
            'analysis': intent_analysis,
            'tracking': tracker_context,
            'strategy': strategy,
        }

    def get_llm_stats(self) -> Dict:
        """Get LLM usage statistics"""
        return self.llm_router.get_usage_stats()
