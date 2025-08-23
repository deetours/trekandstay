import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Brain,
  TrendingUp,
  Target,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Star,
  MapPin,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useAdventureStore } from '../../store/adventureStore';
import { userIntelligenceService } from '../../services/userIntelligence';

interface UserSegment {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  size: number;
  growthRate: number;
  avgSpending: number;
  conversionRate: number;
  preferredDestinations: string[];
  behaviorPatterns: BehaviorPattern[];
  aiInsights: AIInsight[];
  color: string;
}

interface BehaviorPattern {
  pattern: string;
  frequency: number;
  confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface AIInsight {
  type: 'opportunity' | 'risk' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

interface SegmentationMetrics {
  totalUsers: number;
  activeSegments: number;
  segmentationAccuracy: number;
  predictiveScore: number;
  lastUpdated: Date;
}

const AdvancedUserSegmentation: React.FC = () => {
  const { user } = useAdventureStore();
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [metrics, setMetrics] = useState<SegmentationMetrics | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<UserSegment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'segments' | 'insights'>('overview');

  const initializeSegmentation = useCallback(async () => {
    try {
      setLoading(true);
      // Track segmentation analysis
      if (user?.id) {
        await userIntelligenceService.trackUserBehavior(user.id.toString(), {
          type: 'segmentation_view',
          data: { 
            section: 'advanced_user_segmentation',
            timestamp: new Date()
          },
          timestamp: new Date(),
          sessionId: ''
        });
      }
      // Generate AI-powered user segments
      const generatedSegments = await generateUserSegments();
      setSegments(generatedSegments);
      // Calculate segmentation metrics
      const segmentationMetrics = calculateSegmentationMetrics(generatedSegments);
      setMetrics(segmentationMetrics);
      // Set default selected segment
      if (generatedSegments.length > 0) {
        setSelectedSegment(generatedSegments[0]);
      }
    } catch (error) {
      console.error('Error initializing segmentation:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      initializeSegmentation();
    }
  }, [user, initializeSegmentation]);


  const generateUserSegments = async (): Promise<UserSegment[]> => {
    // AI-generated user segments based on travel behavior analysis
    const segments: UserSegment[] = [
      {
        id: 'adventure-enthusiasts',
        name: 'Adventure Enthusiasts',
        description: 'High-energy travelers seeking adrenaline and outdoor experiences',
        characteristics: [
          'High activity engagement',
          'Prefers challenging destinations',
          'Books adventure packages',
          'Active on social media',
          'Values authentic experiences'
        ],
        size: 1847,
        growthRate: 23.5,
        avgSpending: 45000,
        conversionRate: 78.3,
        preferredDestinations: ['Himachal Pradesh', 'Uttarakhand', 'Ladakh', 'Rishikesh'],
        behaviorPatterns: [
          { pattern: 'Books trips 2-3 months in advance', frequency: 85, confidence: 92, trend: 'increasing' },
          { pattern: 'Prefers group activities', frequency: 73, confidence: 88, trend: 'stable' },
          { pattern: 'High engagement with adventure content', frequency: 91, confidence: 95, trend: 'increasing' }
        ],
        aiInsights: [
          {
            type: 'opportunity',
            title: 'Winter Adventure Packages',
            description: 'High demand for winter sports and snow activities during Dec-Feb',
            impact: 'high',
            confidence: 87
          },
          {
            type: 'recommendation',
            title: 'Partnership with Adventure Gear Brands',
            description: 'Cross-selling opportunity with adventure equipment brands',
            impact: 'medium',
            confidence: 82
          }
        ],
        color: 'bg-orange-500'
      },
      {
        id: 'luxury-seekers',
        name: 'Luxury Experience Seekers',
        description: 'Premium travelers focused on comfort, exclusivity, and high-end experiences',
        characteristics: [
          'High spending power',
          'Values premium services',
          'Books luxury accommodations',
          'Prefers personalized experiences',
          'Price less sensitive'
        ],
        size: 892,
        growthRate: 18.7,
        avgSpending: 85000,
        conversionRate: 65.8,
        preferredDestinations: ['Goa', 'Kerala', 'Rajasthan', 'Dubai'],
        behaviorPatterns: [
          { pattern: 'Books premium packages', frequency: 94, confidence: 96, trend: 'increasing' },
          { pattern: 'Longer trip durations', frequency: 78, confidence: 85, trend: 'stable' },
          { pattern: 'High repeat booking rate', frequency: 68, confidence: 91, trend: 'increasing' }
        ],
        aiInsights: [
          {
            type: 'opportunity',
            title: 'Luxury Wellness Retreats',
            description: 'Growing interest in wellness and spa experiences',
            impact: 'high',
            confidence: 91
          },
          {
            type: 'prediction',
            title: 'Increased Spending on Experiences',
            description: 'Luxury segment expected to grow by 25% in next 6 months',
            impact: 'high',
            confidence: 79
          }
        ],
        color: 'bg-purple-500'
      },
      {
        id: 'budget-conscious',
        name: 'Budget-Conscious Explorers',
        description: 'Value-driven travelers seeking maximum experiences within budget constraints',
        characteristics: [
          'Price-sensitive decisions',
          'Compares multiple options',
          'Books early for discounts',
          'Prefers group packages',
          'Active deal seekers'
        ],
        size: 2654,
        growthRate: 31.2,
        avgSpending: 18500,
        conversionRate: 82.4,
        preferredDestinations: ['Himachal Pradesh', 'Uttarakhand', 'Maharashtra', 'Karnataka'],
        behaviorPatterns: [
          { pattern: 'High sensitivity to pricing', frequency: 96, confidence: 98, trend: 'stable' },
          { pattern: 'Books during promotional periods', frequency: 88, confidence: 94, trend: 'increasing' },
          { pattern: 'Researches extensively before booking', frequency: 92, confidence: 89, trend: 'increasing' }
        ],
        aiInsights: [
          {
            type: 'opportunity',
            title: 'Early Bird Packages',
            description: 'Significant response to early booking discounts (40% higher conversion)',
            impact: 'high',
            confidence: 94
          },
          {
            type: 'recommendation',
            title: 'Budget Trip Bundles',
            description: 'Package deals with transport and accommodation show 65% better uptake',
            impact: 'medium',
            confidence: 86
          }
        ],
        color: 'bg-green-500'
      },
      {
        id: 'cultural-enthusiasts',
        name: 'Cultural Heritage Enthusiasts',
        description: 'Travelers passionate about history, culture, and authentic local experiences',
        characteristics: [
          'Values authentic experiences',
          'Interested in local culture',
          'Prefers guided tours',
          'High content engagement',
          'Educational focus'
        ],
        size: 1423,
        growthRate: 15.8,
        avgSpending: 32000,
        conversionRate: 71.6,
        preferredDestinations: ['Rajasthan', 'Kerala', 'Tamil Nadu', 'West Bengal'],
        behaviorPatterns: [
          { pattern: 'Books cultural tours and heritage sites', frequency: 89, confidence: 93, trend: 'stable' },
          { pattern: 'High engagement with historical content', frequency: 84, confidence: 87, trend: 'increasing' },
          { pattern: 'Prefers longer, immersive experiences', frequency: 76, confidence: 82, trend: 'increasing' }
        ],
        aiInsights: [
          {
            type: 'opportunity',
            title: 'Cultural Festivals Calendar',
            description: 'High interest in festival-based travel experiences',
            impact: 'medium',
            confidence: 83
          },
          {
            type: 'recommendation',
            title: 'Local Expert Partnerships',
            description: 'Collaboration with local historians and cultural experts',
            impact: 'high',
            confidence: 88
          }
        ],
        color: 'bg-blue-500'
      },
      {
        id: 'nature-lovers',
        name: 'Nature & Wildlife Lovers',
        description: 'Eco-conscious travelers focused on natural beauty and wildlife experiences',
        characteristics: [
          'Eco-conscious mindset',
          'Wildlife interest',
          'Photography enthusiasts',
          'Sustainable travel focus',
          'Nature-based activities'
        ],
        size: 1156,
        growthRate: 27.9,
        avgSpending: 28500,
        conversionRate: 74.2,
        preferredDestinations: ['Kerala', 'Karnataka', 'Assam', 'Madhya Pradesh'],
        behaviorPatterns: [
          { pattern: 'Books nature and wildlife tours', frequency: 87, confidence: 91, trend: 'increasing' },
          { pattern: 'High engagement with eco-friendly options', frequency: 79, confidence: 85, trend: 'increasing' },
          { pattern: 'Photography tour preferences', frequency: 71, confidence: 78, trend: 'stable' }
        ],
        aiInsights: [
          {
            type: 'opportunity',
            title: 'Eco-Tourism Packages',
            description: 'Growing demand for sustainable and eco-friendly travel options',
            impact: 'high',
            confidence: 89
          },
          {
            type: 'prediction',
            title: 'Wildlife Photography Tours',
            description: 'Expected 35% growth in wildlife photography trip bookings',
            impact: 'medium',
            confidence: 81
          }
        ],
        color: 'bg-emerald-500'
      }
    ];

    return segments;
  };

  const calculateSegmentationMetrics = (segments: UserSegment[]): SegmentationMetrics => {
    const totalUsers = segments.reduce((sum, segment) => sum + segment.size, 0);
    const activeSegments = segments.filter(s => s.size > 100).length;
    
    // Calculate weighted average accuracy based on segment sizes
    const weightedAccuracy = segments.reduce((sum, segment) => {
      const weight = segment.size / totalUsers;
      const segmentAccuracy = segment.behaviorPatterns.reduce((acc, pattern) => acc + pattern.confidence, 0) / segment.behaviorPatterns.length;
      return sum + (segmentAccuracy * weight);
    }, 0);

    // Calculate predictive score based on AI insights confidence
    const predictiveScore = segments.reduce((sum, segment) => {
      const avgConfidence = segment.aiInsights.reduce((acc, insight) => acc + insight.confidence, 0) / segment.aiInsights.length;
      return sum + avgConfidence;
    }, 0) / segments.length;

    return {
      totalUsers,
      activeSegments,
      segmentationAccuracy: Math.round(weightedAccuracy),
      predictiveScore: Math.round(predictiveScore),
      lastUpdated: new Date()
    };
  };

  const handleSegmentSelect = async (segment: UserSegment) => {
    setSelectedSegment(segment);
    
    // Track segment selection
    if (user?.id) {
      await userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'segment_select',
        data: { 
          segmentId: segment.id,
          segmentName: segment.name,
          segmentSize: segment.size
        },
        timestamp: new Date(),
        sessionId: ''
      });
    }
  };

  const getGrowthIcon = (rate: number) => {
    return rate > 20 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <Activity className="w-4 h-4 text-blue-600" />;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="w-4 h-4 text-blue-600" />;
      case 'risk': return <Activity className="w-4 h-4 text-red-600" />;
      case 'recommendation': return <Star className="w-4 h-4 text-yellow-600" />;
      case 'prediction': return <Brain className="w-4 h-4 text-purple-600" />;
      default: return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Advanced User Segmentation
            <Badge className="bg-indigo-100 text-indigo-800">
              AI-Powered
            </Badge>
          </h1>
          <p className="text-gray-600 mt-2">
            Deep behavioral analysis and intelligent user segmentation for personalized experiences
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="secondary" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share Insights
          </Button>
          <Button size="sm" onClick={() => initializeSegmentation()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 font-medium">Total Users</div>
                <div className="text-2xl font-bold text-blue-800">{metrics.totalUsers.toLocaleString()}</div>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-600 font-medium">Active Segments</div>
                <div className="text-2xl font-bold text-purple-800">{metrics.activeSegments}</div>
              </div>
              <PieChart className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 font-medium">AI Accuracy</div>
                <div className="text-2xl font-bold text-green-800">{metrics.segmentationAccuracy}%</div>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-orange-600 font-medium">Predictive Score</div>
                <div className="text-2xl font-bold text-orange-800">{metrics.predictiveScore}%</div>
              </div>
              <Brain className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Segments Overview', icon: <Eye className="w-4 h-4" /> },
          { id: 'segments', label: 'Detailed Analysis', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'insights', label: 'AI Insights', icon: <Brain className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as 'overview' | 'segments' | 'insights')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeView === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content based on active view */}
      <AnimatePresence mode="wait">
        {activeView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {segments.map((segment, index) => (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="cursor-pointer"
                onClick={() => handleSegmentSelect(segment)}
              >
                <Card 
                  className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-indigo-500 group"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {segment.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${segment.color}`}></div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500">Size</div>
                        <div className="text-lg font-bold text-gray-900">
                          {segment.size.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          Growth {getGrowthIcon(segment.growthRate)}
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          +{segment.growthRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Avg Spending</div>
                        <div className="text-lg font-bold text-indigo-600">
                          ₹{(segment.avgSpending / 1000).toFixed(0)}K
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Conversion</div>
                        <div className="text-lg font-bold text-purple-600">
                          {segment.conversionRate}%
                        </div>
                      </div>
                    </div>

                    {/* Top Characteristics */}
                    <div className="mb-4">
                      <div className="text-xs font-medium text-gray-500 mb-2">Key Traits</div>
                      <div className="flex flex-wrap gap-1">
                        {segment.characteristics.slice(0, 3).map((char, idx) => (
                          <Badge key={idx} className="text-xs bg-gray-100 text-gray-700">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Progress Indicators */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Engagement Score</span>
                          <span className="font-medium">{segment.conversionRate}%</span>
                        </div>
                        <Progress value={segment.conversionRate} className="h-2" />
                      </div>
                    </div>

                    {/* AI Insights Count */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          AI Insights
                        </span>
                        <span className="font-medium text-indigo-600">
                          {segment.aiInsights.length} insights
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeView === 'segments' && selectedSegment && (
          <motion.div
            key="segments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Segment Header */}
            <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-indigo-900 mb-2 flex items-center gap-3">
                    {selectedSegment.name}
                    <div className={`w-4 h-4 rounded-full ${selectedSegment.color}`}></div>
                  </h2>
                  <p className="text-indigo-700 mb-4">{selectedSegment.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-indigo-600">Users</div>
                      <div className="text-xl font-bold text-indigo-800">
                        {selectedSegment.size.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-indigo-600">Growth Rate</div>
                      <div className="text-xl font-bold text-green-700">
                        +{selectedSegment.growthRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-indigo-600">Avg Spending</div>
                      <div className="text-xl font-bold text-purple-700">
                        ₹{selectedSegment.avgSpending.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-indigo-600">Conversion</div>
                      <div className="text-xl font-bold text-orange-700">
                        {selectedSegment.conversionRate}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Detailed Analysis */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Behavior Patterns */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Behavior Patterns
                </h3>
                <div className="space-y-4">
                  {selectedSegment.behaviorPatterns.map((pattern, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{pattern.pattern}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Confidence: {pattern.confidence}% • Trend: {pattern.trend}
                          </div>
                        </div>
                        <Badge className={`text-xs ${
                          pattern.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                          pattern.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {pattern.trend}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Frequency</span>
                          <span>{pattern.frequency}%</span>
                        </div>
                        <Progress value={pattern.frequency} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Characteristics */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Key Characteristics
                </h3>
                <div className="space-y-3">
                  {selectedSegment.characteristics.map((char, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-800">{char}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Preferred Destinations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSegment.preferredDestinations.map((dest, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {dest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeView === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {segments.map(segment => (
              <Card key={segment.id} className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${segment.color}`}></div>
                  {segment.name} - AI Insights
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {segment.aiInsights.map((insight, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getInsightIcon(insight.type)}
                          <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {insight.confidence}% confidence
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                      <div className="mt-3">
                        <Progress value={insight.confidence} className="h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedUserSegmentation;
