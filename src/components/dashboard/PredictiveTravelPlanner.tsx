import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  DollarSign,
  Brain,
  Zap,
  Clock,
  Cloud,
  Star,
  Plane,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/Card';
import { useAdventureStore } from '../../store/adventureStore';
import { userIntelligenceService } from '../../services/userIntelligence';

interface PredictivePlan {
  id: string;
  title: string;
  destination: string;
  duration: number;
  optimalDates: {
    start: Date;
    end: Date;
    confidence: number;
    reasoning: string[];
  };
  predictedCost: {
    min: number;
    max: number;
    confidence: number;
    breakdown: {
      category: string;
      amount: number;
      percentage: number;
    }[];
  };
  weatherPrediction: {
    averageTemp: number;
    condition: string;
    rainProbability: number;
    uvIndex: number;
  };
  crowdPrediction: {
    level: 'low' | 'medium' | 'high';
    percentage: number;
    peakTimes: string[];
  };
  aiRecommendations: {
    type: 'booking' | 'activity' | 'preparation' | 'optimization';
    title: string;
    description: string;
    impact: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  riskFactors: {
    type: 'weather' | 'political' | 'health' | 'price' | 'crowds';
    level: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }[];
  optimizationScore: number;
}

interface PlannerPreferences {
  destinations: string[];
  budget: { min: number; max: number };
  duration: { min: number; max: number };
  travelStyle: string[];
  priorities: string[];
  flexibility: 'low' | 'medium' | 'high';
}

const PredictiveTravelPlanner: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { user } = useAdventureStore();
  const [predictivePlans, setPredictivePlans] = useState<PredictivePlan[]>([]);
  const [preferences, setPreferences] = useState<PlannerPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'optimizer' | 'timeline'>('plans');
  const [, setSelectedPlan] = useState<PredictivePlan | null>(null);

  const fetchPredictiveData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Track planner usage
      await userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'page_view',
        data: { 
          section: 'predictive_planner',
          timestamp: new Date()
        },
        timestamp: new Date(),
        sessionId: ''
      });

      // Fetch user preferences
      const userPrefs = await getUserPreferences();
      setPreferences(userPrefs);

      // Generate predictive plans
      const plans = await generatePredictivePlans(userPrefs);
      setPredictivePlans(plans);

      if (plans.length > 0) {
        setSelectedPlan(plans[0]);
      }

    } catch (error) {
      console.error('Error fetching predictive data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchPredictiveData();
    }
  }, [user, fetchPredictiveData]);

  const getUserPreferences = async (): Promise<PlannerPreferences> => {
    // In a real app, this would fetch from user profile/AI analysis
    return {
      destinations: ['Kerala', 'Rajasthan', 'Himachal Pradesh', 'Goa'],
      budget: { min: 25000, max: 75000 },
      duration: { min: 5, max: 10 },
      travelStyle: ['Adventure', 'Culture', 'Nature', 'Photography'],
      priorities: ['Cost-effective', 'Weather', 'Crowd-avoidance', 'Unique experiences'],
      flexibility: 'medium'
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generatePredictivePlans = async (_preferences: PlannerPreferences): Promise<PredictivePlan[]> => {
    const plans: PredictivePlan[] = [
      {
        id: 'plan_1',
        title: 'Optimal Kerala Experience',
        destination: 'Kerala',
        duration: 7,
        optimalDates: {
          start: new Date('2024-02-15'),
          end: new Date('2024-02-22'),
          confidence: 89,
          reasoning: [
            'Peak season with perfect weather conditions',
            '15% lower flight prices compared to December',
            'Backwater availability at 95%',
            'Minimal monsoon risk'
          ]
        },
        predictedCost: {
          min: 28000,
          max: 42000,
          confidence: 87,
          breakdown: [
            { category: 'Accommodation', amount: 14000, percentage: 40 },
            { category: 'Transportation', amount: 8500, percentage: 24 },
            { category: 'Food & Dining', amount: 7000, percentage: 20 },
            { category: 'Activities', amount: 4200, percentage: 12 },
            { category: 'Miscellaneous', amount: 1400, percentage: 4 }
          ]
        },
        weatherPrediction: {
          averageTemp: 28,
          condition: 'Pleasant',
          rainProbability: 15,
          uvIndex: 6
        },
        crowdPrediction: {
          level: 'medium',
          percentage: 60,
          peakTimes: ['10 AM - 2 PM', '6 PM - 8 PM']
        },
        aiRecommendations: [
          {
            type: 'booking',
            title: 'Early Bird Houseboat Booking',
            description: 'Book houseboat stays now for 25% early bird discounts',
            impact: 'Save ₹3,500',
            priority: 'high'
          },
          {
            type: 'activity',
            title: 'Sunrise Photography Sessions',
            description: 'February offers clearest skies for photography enthusiasts',
            impact: 'Premium experience',
            priority: 'medium'
          },
          {
            type: 'preparation',
            title: 'Light Cotton Clothing',
            description: 'Pack breathable fabrics for humid coastal weather',
            impact: 'Comfort optimization',
            priority: 'low'
          }
        ],
        riskFactors: [
          {
            type: 'price',
            level: 'medium',
            description: 'Peak season pricing may increase closer to dates',
            mitigation: 'Book accommodation within 2 weeks for best rates'
          },
          {
            type: 'crowds',
            level: 'medium',
            description: 'Popular destinations may be crowded on weekends',
            mitigation: 'Plan major attractions for weekdays'
          }
        ],
        optimizationScore: 89
      },
      {
        id: 'plan_2',
        title: 'Rajasthan Desert Adventure',
        destination: 'Rajasthan',
        duration: 8,
        optimalDates: {
          start: new Date('2024-03-10'),
          end: new Date('2024-03-18'),
          confidence: 92,
          reasoning: [
            'Ideal desert weather - not too hot',
            'Holi celebrations add cultural value',
            'Desert safari conditions optimal',
            '20% better flight availability'
          ]
        },
        predictedCost: {
          min: 32000,
          max: 48000,
          confidence: 84,
          breakdown: [
            { category: 'Accommodation', amount: 16000, percentage: 42 },
            { category: 'Transportation', amount: 9500, percentage: 25 },
            { category: 'Food & Dining', amount: 6500, percentage: 17 },
            { category: 'Activities', amount: 4800, percentage: 12 },
            { category: 'Miscellaneous', amount: 1500, percentage: 4 }
          ]
        },
        weatherPrediction: {
          averageTemp: 24,
          condition: 'Perfect',
          rainProbability: 5,
          uvIndex: 8
        },
        crowdPrediction: {
          level: 'high',
          percentage: 80,
          peakTimes: ['11 AM - 3 PM', '7 PM - 9 PM']
        },
        aiRecommendations: [
          {
            type: 'optimization',
            title: 'Skip Crowded Circuits',
            description: 'Alternative routes to avoid tourist crowds',
            impact: 'Better experience',
            priority: 'high'
          },
          {
            type: 'booking',
            title: 'Desert Camp Premium Upgrade',
            description: 'March weather perfect for luxury camping',
            impact: 'Enhanced comfort',
            priority: 'medium'
          }
        ],
        riskFactors: [
          {
            type: 'crowds',
            level: 'high',
            description: 'Peak tourist season with high visitor numbers',
            mitigation: 'Book experiences for early morning or late evening'
          }
        ],
        optimizationScore: 84
      }
    ];

    return plans;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPredictiveData();
    setRefreshing(false);
  };

  const handlePlanAction = async (plan: PredictivePlan, action: string) => {
    if (!user?.id) return;

    // Track plan interaction
    await userIntelligenceService.trackUserBehavior(user.id.toString(), {
      type: 'predictive_plan_action',
      data: { 
        planId: plan.id,
        destination: plan.destination,
        action,
        optimizationScore: plan.optimizationScore
      },
      timestamp: new Date(),
      sessionId: ''
    });

    switch (action) {
      case 'optimize':
        console.log('Optimizing plan:', plan.title);
        break;
      case 'book':
        console.log('Starting booking process for:', plan.title);
        break;
      case 'save':
        console.log('Saving plan to wishlist:', plan.title);
        break;
      default:
        break;
    }
  };

  const getOptimizationColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Predictive Travel Planner</h3>
              <p className="text-purple-100 text-sm">
                AI-powered optimal travel planning with predictive insights
              </p>
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

        {/* Quick Stats */}
        {preferences && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-purple-100 text-xs">Destinations</div>
              <div className="text-lg font-bold">{preferences.destinations.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-purple-100 text-xs">Budget Range</div>
              <div className="text-lg font-bold">₹{(preferences.budget.min / 1000).toFixed(0)}K-₹{(preferences.budget.max / 1000).toFixed(0)}K</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-purple-100 text-xs">Duration</div>
              <div className="text-lg font-bold">{preferences.duration.min}-{preferences.duration.max} days</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-purple-100 text-xs">Flexibility</div>
              <div className="text-lg font-bold capitalize">{preferences.flexibility}</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'plans', label: 'Smart Plans', icon: <Target className="w-4 h-4" /> },
            { id: 'optimizer', label: 'AI Optimizer', icon: <Brain className="w-4 h-4" /> },
            { id: 'timeline', label: 'Predictive Timeline', icon: <Clock className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'plans' | 'optimizer' | 'timeline')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {predictivePlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  {/* Plan Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {plan.destination}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {plan.duration} days
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {plan.optimalDates.start.toLocaleDateString()} - {plan.optimalDates.end.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getOptimizationColor(plan.optimizationScore)}>
                          {plan.optimizationScore}% Optimized
                        </Badge>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-indigo-600">
                            ₹{plan.predictedCost.min.toLocaleString()}
                          </span>
                          <span className="text-gray-500 text-sm">
                            - ₹{plan.predictedCost.max.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Indicators */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">Date Confidence</span>
                          <span className="text-sm font-bold text-blue-600">{plan.optimalDates.confidence}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(plan.optimalDates.confidence, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-900">Cost Accuracy</span>
                          <span className="text-sm font-bold text-green-600">{plan.predictedCost.confidence}%</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(plan.predictedCost.confidence, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-orange-900">Weather Score</span>
                          <span className="text-sm font-bold text-orange-600">
                            {100 - plan.weatherPrediction.rainProbability}%
                          </span>
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(100 - plan.weatherPrediction.rainProbability, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Key Insights */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <Brain className="w-4 h-4 mr-2 text-purple-600" />
                        Why This Plan is Optimal
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {plan.optimalDates.reasoning.slice(0, 4).map((reason, reasonIndex) => (
                          <div key={reasonIndex} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Information */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Cost Breakdown */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                          Cost Breakdown
                        </h5>
                        <div className="space-y-2">
                          {plan.predictedCost.breakdown.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">{item.category}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-medium">₹{item.amount.toLocaleString()}</span>
                                <span className="text-xs text-gray-500 ml-2">({item.percentage}%)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Predictions */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <Cloud className="w-4 h-4 mr-2 text-blue-600" />
                          Conditions Forecast
                        </h5>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Weather</span>
                            <span className="text-sm font-medium text-blue-600">
                              {plan.weatherPrediction.averageTemp}°C, {plan.weatherPrediction.condition}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Crowds</span>
                            <Badge className={`text-xs ${
                              plan.crowdPrediction.level === 'low' ? 'bg-green-100 text-green-800' :
                              plan.crowdPrediction.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {plan.crowdPrediction.level} ({plan.crowdPrediction.percentage}%)
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Rain Probability</span>
                            <span className="text-sm font-medium">
                              {plan.weatherPrediction.rainProbability}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="mt-6">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                        AI Recommendations
                      </h5>
                      <div className="grid md:grid-cols-2 gap-3">
                        {plan.aiRecommendations.map((rec, recIndex) => (
                          <div key={recIndex} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h6 className="text-sm font-medium text-gray-900">{rec.title}</h6>
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                            <div className="text-xs font-medium text-indigo-600">{rec.impact}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {plan.riskFactors.length > 0 && (
                      <div className="mt-6">
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                          Risk Assessment
                        </h5>
                        <div className="space-y-2">
                          {plan.riskFactors.map((risk, riskIndex) => (
                            <div key={riskIndex} className={`rounded-lg p-3 border ${getRiskLevelColor(risk.level)}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium capitalize">{risk.type} Risk</span>
                                <Badge className={`text-xs ${
                                  risk.level === 'low' ? 'bg-green-100 text-green-800' :
                                  risk.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {risk.level}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-700 mb-2">{risk.description}</p>
                              <p className="text-xs text-gray-600">
                                <strong>Mitigation:</strong> {risk.mitigation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <Button
                      onClick={() => handlePlanAction(plan, 'optimize')}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Optimize Further
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handlePlanAction(plan, 'save')}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Save Plan
                    </Button>
                    <Button
                      onClick={() => handlePlanAction(plan, 'book')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plane className="w-4 h-4 mr-2" />
                      Start Booking
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'optimizer' && (
            <motion.div
              key="optimizer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-12"
            >
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Advanced Optimizer
              </h3>
              <p className="text-gray-500 mb-6">
                Fine-tune your travel plans with AI-powered optimization tools.
              </p>
              <Button>
                <Zap className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-12"
            >
              <Clock className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Predictive Timeline
              </h3>
              <p className="text-gray-500 mb-6">
                Visualize your travel plans across time with predictive insights.
              </p>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default PredictiveTravelPlanner;
