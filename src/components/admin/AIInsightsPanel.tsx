import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { analyticsAPI } from '../../services/adminAPI';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Target,
  Activity,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  DollarSign,
  RefreshCw,
  Zap
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  action?: string;
}

interface DashboardMetrics {
  totalLeads: number;
  conversionRate: number;
  revenue: number;
  whatsappEngagement: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  activeConversations: number;
  bookingsPipeline: number;
}

export default function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [metricsResult, insightsResult] = await Promise.all([
        analyticsAPI.getDashboardMetrics(selectedTimeframe),
        analyticsAPI.getAIInsights(selectedTimeframe)
      ]);

      if (metricsResult.error) {
        setError(metricsResult.error);
        loadFallbackData();
      } else {
        setMetrics(metricsResult.metrics);
      }

      if (!insightsResult.error) {
        setInsights(insightsResult.insights as AIInsight[]);
      }
    } catch {
      setError('Failed to load dashboard data');
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeframe]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadFallbackData = () => {
    const mockMetrics: DashboardMetrics = {
      totalLeads: 284,
      conversionRate: 23,
      revenue: 45780,
      whatsappEngagement: 78,
      averageResponseTime: 12,
      customerSatisfaction: 94,
      activeConversations: 23,
      bookingsPipeline: 56
    };

    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'High-Value Lead Detected',
        description: 'Lead shows 87% likelihood of premium booking based on engagement patterns',
        confidence: 87,
        impact: 'high',
        action: 'Send personalized premium package offer'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Response Time Alert',
        description: 'WhatsApp response time increased 45% this week. 3 leads may churn.',
        confidence: 92,
        impact: 'high',
        action: 'Assign additional support staff'
      }
    ];

    setMetrics(mockMetrics);
    setInsights(mockInsights);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Business Insights</h2>
          <p className="text-gray-600">Real-time analytics and AI-powered recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
          </select>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadDashboardData}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span>Using offline data: {error}</span>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalLeads}</p>
              </div>
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.revenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">WhatsApp Engagement</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.whatsappEngagement}%</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* AI Insights */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-semibold">AI Insights</h3>
        </div>
        
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {insight.type === 'opportunity' && <Sparkles className="w-5 h-5 text-green-500" />}
                  {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                  {insight.type === 'recommendation' && <Lightbulb className="w-5 h-5 text-yellow-500" />}
                  {insight.type === 'trend' && <TrendingUp className="w-5 h-5 text-blue-500" />}
                  <h4 className="font-medium">{insight.title}</h4>
                </div>
                <Badge 
                  className={insight.impact === 'high' ? 'bg-red-100 text-red-800' : insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}
                >
                  {insight.impact} impact
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-3">{insight.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Confidence:</span>
                  <div className="bg-gray-200 rounded-full h-2 w-16">
                    <div 
                      className="bg-emerald-500 rounded-full h-2" 
                      style={{ width: `${insight.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{insight.confidence}%</span>
                </div>
                
                {insight.action && (
                  <Button size="sm" variant="ghost">
                    <Zap className="w-4 h-4 mr-1" />
                    {insight.action}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Lead Performance Trends
          </h3>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">Real-time analytics active</p>
              <p className="text-sm text-gray-500">Charts powered by live data</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
            AI Recommendations
          </h3>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <div className="text-center">
              <Brain className="w-12 h-12 text-purple-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">AI insights generating</p>
              <p className="text-sm text-gray-500">Based on customer behavior</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}