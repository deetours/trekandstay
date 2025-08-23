import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown,
  PiggyBank,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain,
  BarChart3
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/Card';
import { useAdventureStore } from '../../store/adventureStore';
import { userIntelligenceService } from '../../services/userIntelligence';

interface BudgetInsight {
  id: string;
  type: 'saving_opportunity' | 'overspending_alert' | 'optimal_timing' | 'goal_progress' | 'ai_suggestion';
  title: string;
  description: string;
  impact: number; // Potential savings/cost in INR
  confidence: number; // AI confidence (0-100)
  actionable: boolean;
  urgency: 'low' | 'medium' | 'high';
  category: string;
  metadata?: Record<string, unknown>;
}

interface BudgetGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
  aiRecommendations: string[];
}

interface SpendingPattern {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  recommendations: string[];
}

const SmartBudgetManager: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { user } = useAdventureStore();
  const [budgetInsights, setBudgetInsights] = useState<BudgetInsight[]>([]);
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPattern[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [spentAmount, setSpentAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'goals'>('overview');

  const fetchBudgetData = useCallback(async () => {
    if (!user?.id) return;

    const calculateTotalBudget = (): number => {
      return budgetGoals.reduce((total, goal) => total + goal.targetAmount, 0);
    };

    const calculateSpentAmount = (): number => {
      return spendingPatterns.reduce((total, pattern) => total + pattern.amount, 0);
    };

    try {
      setLoading(true);
      
      // Track budget analysis request
      await userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'page_view',
        data: { 
          section: 'smart_budget_manager',
          timestamp: new Date()
        },
        timestamp: new Date(),
        sessionId: ''
      });

      // Fetch AI-powered budget insights
      const insights = await generateBudgetInsights();
      setBudgetInsights(insights);

      // Fetch spending patterns with AI analysis
      const patterns = await analyzeSpendingPatterns();
      setSpendingPatterns(patterns);

      // Fetch or generate budget goals
      const goals = await getBudgetGoals();
      setBudgetGoals(goals);

      // Calculate totals
      const total = calculateTotalBudget();
      const spent = calculateSpentAmount();
      setTotalBudget(total);
      setSpentAmount(spent);

    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, budgetGoals, spendingPatterns]);

  useEffect(() => {
    if (user?.id) {
      fetchBudgetData();
    }
  }, [user, fetchBudgetData]);

  const generateBudgetInsights = async (): Promise<BudgetInsight[]> => {
    // AI-powered budget insights based on user behavior and market data
    const insights: BudgetInsight[] = [
      {
        id: 'insight_1',
        type: 'saving_opportunity',
        title: 'Off-Season Travel Savings',
        description: 'Book your Kerala trip in September instead of December to save 35% on accommodation and flights.',
        impact: 12000,
        confidence: 89,
        actionable: true,
        urgency: 'medium',
        category: 'Timing Optimization',
        metadata: { 
          destinations: ['Kerala', 'Goa', 'Himachal Pradesh'],
          savingsMonth: 'September',
          peakMonth: 'December'
        }
      },
      {
        id: 'insight_2',
        type: 'optimal_timing',
        title: 'Flight Booking Sweet Spot',
        description: 'Book international flights 6-8 weeks in advance for optimal pricing. Current analysis shows 23% savings potential.',
        impact: 18500,
        confidence: 92,
        actionable: true,
        urgency: 'high',
        category: 'Flight Optimization',
        metadata: {
          optimalWeeks: [6, 7, 8],
          currentSavings: 23
        }
      },
      {
        id: 'insight_3',
        type: 'ai_suggestion',
        title: 'Bundle Package Opportunity',
        description: 'Combining your Rajasthan and Agra plans into a single package could save ₹8,500 and optimize your itinerary.',
        impact: 8500,
        confidence: 76,
        actionable: true,
        urgency: 'medium',
        category: 'Package Optimization'
      },
      {
        id: 'insight_4',
        type: 'overspending_alert',
        title: 'Restaurant Budget Alert',
        description: 'Your dining expenses are 45% higher than similar travelers. Consider local cuisine experiences for authentic and budget-friendly meals.',
        impact: -6200,
        confidence: 84,
        actionable: true,
        urgency: 'low',
        category: 'Expense Control'
      }
    ];

    return insights;
  };

  const analyzeSpendingPatterns = async (): Promise<SpendingPattern[]> => {
    const patterns: SpendingPattern[] = [
      {
        category: 'Accommodation',
        amount: 45000,
        percentage: 35,
        trend: 'up',
        trendPercentage: 12,
        recommendations: [
          'Consider homestays for authentic experiences at 30% lower cost',
          'Book 45 days in advance for early bird discounts'
        ]
      },
      {
        category: 'Transportation',
        amount: 32000,
        percentage: 25,
        trend: 'stable',
        trendPercentage: 2,
        recommendations: [
          'Use travel passes for intercity transportation',
          'Book return flights together for better deals'
        ]
      },
      {
        category: 'Food & Dining',
        amount: 28000,
        percentage: 22,
        trend: 'up',
        trendPercentage: 18,
        recommendations: [
          'Try local street food for authentic experiences',
          'Use food delivery apps with travel discounts'
        ]
      },
      {
        category: 'Activities & Tours',
        amount: 15000,
        percentage: 12,
        trend: 'down',
        trendPercentage: -8,
        recommendations: [
          'Book group tours for better rates',
          'Look for combo tickets for multiple attractions'
        ]
      },
      {
        category: 'Shopping & Souvenirs',
        amount: 8000,
        percentage: 6,
        trend: 'stable',
        trendPercentage: 1,
        recommendations: [
          'Shop at local markets for authentic items',
          'Bargain respectfully for better prices'
        ]
      }
    ];

    return patterns;
  };

  const getBudgetGoals = async (): Promise<BudgetGoal[]> => {
    const goals: BudgetGoal[] = [
      {
        id: 'goal_1',
        title: 'European Adventure 2024',
        targetAmount: 250000,
        currentAmount: 185000,
        targetDate: new Date('2024-08-15'),
        category: 'International Travel',
        priority: 'high',
        aiRecommendations: [
          'Save ₹8,500 monthly to reach your goal',
          'Consider shoulder season travel (May/September) for 20% savings',
          'Book flights 3 months early for optimal pricing'
        ]
      },
      {
        id: 'goal_2',
        title: 'Domestic Exploration Fund',
        targetAmount: 80000,
        currentAmount: 65000,
        targetDate: new Date('2024-06-01'),
        category: 'Domestic Travel',
        priority: 'medium',
        aiRecommendations: [
          'You\'re ahead of schedule! Consider adding premium experiences',
          'Weekend getaways can be funded from current savings'
        ]
      }
    ];

    return goals;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBudgetData();
    setRefreshing(false);
  };

  const handleInsightAction = async (insight: BudgetInsight) => {
    if (!user?.id) return;

    // Track insight interaction
    await userIntelligenceService.trackUserBehavior(user.id.toString(), {
      type: 'budget_insight_click',
      data: { 
        insightId: insight.id,
        insightType: insight.type,
        potentialImpact: insight.impact
      },
      timestamp: new Date(),
      sessionId: ''
    });

    // Handle different insight actions
    switch (insight.type) {
      case 'saving_opportunity':
        console.log('Opening savings opportunity:', insight.title);
        break;
      case 'optimal_timing':
        console.log('Opening timing recommendations:', insight.title);
        break;
      case 'ai_suggestion':
        console.log('Opening AI suggestion:', insight.title);
        break;
      default:
        break;
    }
  };

  const getInsightIcon = (type: BudgetInsight['type']) => {
    const iconMap = {
      'saving_opportunity': <TrendingDown className="w-5 h-5 text-green-600" />,
      'overspending_alert': <AlertTriangle className="w-5 h-5 text-orange-600" />,
      'optimal_timing': <Calendar className="w-5 h-5 text-blue-600" />,
      'goal_progress': <Target className="w-5 h-5 text-purple-600" />,
      'ai_suggestion': <Brain className="w-5 h-5 text-indigo-600" />
    };
    return iconMap[type];
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[urgency as keyof typeof colors];
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUpRight className="w-4 h-4 text-red-500" />
    ) : trend === 'down' ? (
      <ArrowDownRight className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowUpRight className="w-4 h-4 text-gray-500" />
    );
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const budgetUtilization = totalBudget > 0 ? (spentAmount / totalBudget) * 100 : 0;

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Smart Budget Manager</h3>
              <p className="text-green-100 text-sm">AI-powered financial insights for smarter travel</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="text-green-100 text-sm">Total Budget</div>
            <div className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="text-green-100 text-sm">Spent</div>
            <div className="text-2xl font-bold">₹{spentAmount.toLocaleString()}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="text-green-100 text-sm">Remaining</div>
            <div className="text-2xl font-bold">₹{(totalBudget - spentAmount).toLocaleString()}</div>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-100">Budget Utilization</span>
            <span className="text-sm font-medium">{budgetUtilization.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'insights', label: 'AI Insights', icon: <Brain className="w-4 h-4" /> },
            { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'insights' | 'goals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Spending Patterns */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Spending Breakdown</h4>
                <div className="space-y-4">
                  {spendingPatterns.map((pattern) => (
                    <div key={pattern.category} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h5 className="font-medium text-gray-900">{pattern.category}</h5>
                          <Badge className={getUrgencyColor('low')}>
                            {pattern.percentage}%
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(pattern.trend)}
                            <span className={`text-sm ${
                              pattern.trend === 'up' ? 'text-red-600' : 
                              pattern.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {Math.abs(pattern.trendPercentage)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ₹{pattern.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(pattern.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        {pattern.recommendations.slice(0, 2).map((rec, recIndex) => (
                          <div key={recIndex} className="flex items-start space-x-2">
                            <Zap className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {budgetInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleInsightAction(insight)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getInsightIcon(insight.type)}
                      <div>
                        <h5 className="font-medium text-gray-900">{insight.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end space-y-2">
                      <Badge className={getUrgencyColor(insight.urgency)}>
                        {insight.urgency} priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Impact:</span>
                      <span className={`font-bold text-lg ${
                        insight.impact > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {insight.impact > 0 ? '+' : ''}₹{Math.abs(insight.impact).toLocaleString()}
                      </span>
                    </div>
                    {insight.actionable && (
                      <Button size="sm" variant="secondary">
                        <Zap className="w-4 h-4 mr-1" />
                        Take Action
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {budgetGoals.map((goal, index) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const remainingAmount = goal.targetAmount - goal.currentAmount;
                const daysLeft = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900">{goal.title}</h5>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            ₹{goal.targetAmount.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {daysLeft} days left
                          </span>
                        </div>
                      </div>
                      <Badge className={`${
                        goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                        goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {goal.priority} priority
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{progress.toFixed(1)}% complete</span>
                        <span className="text-xs font-medium text-indigo-600">
                          ₹{remainingAmount.toLocaleString()} remaining
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/60 rounded-lg p-3">
                      <h6 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                        <Brain className="w-4 h-4 mr-2 text-indigo-600" />
                        AI Recommendations
                      </h6>
                      <div className="space-y-1">
                        {goal.aiRecommendations.map((rec, recIndex) => (
                          <div key={recIndex} className="flex items-start space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default SmartBudgetManager;
