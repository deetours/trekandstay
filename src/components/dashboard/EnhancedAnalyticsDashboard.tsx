import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Eye,
  Heart,
  Target,
  Zap,
  Clock,
  Filter,
  Download,
  RefreshCw,
  LineChart,
  Activity
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { useAdventureStore } from '../../store/adventureStore';
import { userIntelligenceService } from '../../services/userIntelligence';

interface AnalyticsMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  format: 'number' | 'percentage' | 'currency' | 'time';
  icon: React.ReactNode;
  description: string;
}

interface UserEngagement {
  timeSpent: number;
  pagesViewed: number;
  actionsPerSession: number;
  returnRate: number;
  satisfactionScore: number;
}

interface TravelInsights {
  topDestinations: { name: string; visits: number; growth: number }[];
  seasonalTrends: { month: string; bookings: number; avgSpend: number }[];
  userSegments: { segment: string; percentage: number; revenue: number }[];
  performanceMetrics: { metric: string; current: number; target: number; trend: string }[];
}

interface BusinessIntelligence {
  revenueMetrics: {
    totalRevenue: number;
    monthlyGrowth: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  customerMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    churnRate: number;
  };
  operationalMetrics: {
    bookingVolume: number;
    averageResponseTime: number;
    customerSatisfaction: number;
    systemUptime: number;
  };
}

const EnhancedAnalyticsDashboard: React.FC = () => {
  const { user } = useAdventureStore();
  const [activeTimeRange, setActiveTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<'overview' | 'engagement' | 'travel' | 'business'>('overview');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [engagementData, setEngagementData] = useState<UserEngagement | null>(null);
  const [travelInsights, setTravelInsights] = useState<TravelInsights | null>(null);
  const [businessIntelligence, setBusinessIntelligence] = useState<BusinessIntelligence | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const initializeAnalytics = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Track analytics dashboard usage
      if (user?.id) {
        await userIntelligenceService.trackUserBehavior(user.id.toString(), {
          type: 'analytics_view',
          data: { 
            category: selectedCategory,
            timeRange: activeTimeRange,
            timestamp: new Date()
          },
          timestamp: new Date(),
          sessionId: ''
        });
      }

      // Load analytics data
      const [metricsData, engagementInfo, travelData, businessData] = await Promise.all([
        generateMetrics(),
        generateEngagementData(),
        generateTravelInsights(),
        generateBusinessIntelligence()
      ]);

      setMetrics(metricsData);
      setEngagementData(engagementInfo);
      setTravelInsights(travelData);
      setBusinessIntelligence(businessData);

    } catch (error) {
      console.error('Error initializing analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedCategory, activeTimeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user?.id) {
      initializeAnalytics();
    }
  }, [user, activeTimeRange, initializeAnalytics]);

  const generateMetrics = async (): Promise<AnalyticsMetric[]> => {
    const timeMultiplier = activeTimeRange === '7d' ? 0.3 : activeTimeRange === '30d' ? 1 : activeTimeRange === '90d' ? 2.5 : 8;
    
    return [
      {
        id: 'total_users',
        title: 'Total Users',
        value: Math.floor(12450 * timeMultiplier),
        change: 15.3,
        changeType: 'positive',
        format: 'number',
        icon: <Users className="w-5 h-5" />,
        description: 'Active users in selected period'
      },
      {
        id: 'total_bookings',
        title: 'Total Bookings',
        value: Math.floor(3280 * timeMultiplier),
        change: 23.1,
        changeType: 'positive',
        format: 'number',
        icon: <Calendar className="w-5 h-5" />,
        description: 'Confirmed travel bookings'
      },
      {
        id: 'revenue',
        title: 'Revenue Generated',
        value: Math.floor(1850000 * timeMultiplier),
        change: 18.7,
        changeType: 'positive',
        format: 'currency',
        icon: <DollarSign className="w-5 h-5" />,
        description: 'Total revenue in selected period'
      },
      {
        id: 'avg_rating',
        title: 'Average Rating',
        value: 4.7,
        change: 0.2,
        changeType: 'positive',
        format: 'number',
        icon: <Star className="w-5 h-5" />,
        description: 'Customer satisfaction rating'
      },
      {
        id: 'conversion_rate',
        title: 'Conversion Rate',
        value: 12.4,
        change: 2.1,
        changeType: 'positive',
        format: 'percentage',
        icon: <Target className="w-5 h-5" />,
        description: 'Visitor to booking conversion'
      },
      {
        id: 'engagement_time',
        title: 'Avg. Session Time',
        value: 8.3,
        change: -0.8,
        changeType: 'negative',
        format: 'time',
        icon: <Clock className="w-5 h-5" />,
        description: 'Average time spent per session'
      },
      {
        id: 'social_engagement',
        title: 'Social Engagement',
        value: 5670,
        change: 34.2,
        changeType: 'positive',
        format: 'number',
        icon: <Heart className="w-5 h-5" />,
        description: 'Likes, shares, and comments'
      },
      {
        id: 'ai_interactions',
        title: 'AI Interactions',
        value: Math.floor(15600 * timeMultiplier),
        change: 45.6,
        changeType: 'positive',
        format: 'number',
        icon: <Zap className="w-5 h-5" />,
        description: 'AI assistant conversations'
      }
    ];
  };

  const generateEngagementData = async (): Promise<UserEngagement> => {
    return {
      timeSpent: 8.3,
      pagesViewed: 12.7,
      actionsPerSession: 6.4,
      returnRate: 68.2,
      satisfactionScore: 4.6
    };
  };

  const generateTravelInsights = async (): Promise<TravelInsights> => {
    return {
      topDestinations: [
        { name: 'Goa', visits: 1247, growth: 15.3 },
        { name: 'Manali', visits: 980, growth: 23.1 },
        { name: 'Kerala', visits: 856, growth: 12.7 },
        { name: 'Rajasthan', visits: 743, growth: 18.9 },
        { name: 'Kashmir', visits: 621, growth: 31.2 }
      ],
      seasonalTrends: [
        { month: 'Jan', bookings: 120, avgSpend: 25000 },
        { month: 'Feb', bookings: 145, avgSpend: 28000 },
        { month: 'Mar', bookings: 180, avgSpend: 32000 },
        { month: 'Apr', bookings: 210, avgSpend: 35000 },
        { month: 'May', bookings: 165, avgSpend: 30000 },
        { month: 'Jun', bookings: 95, avgSpend: 22000 }
      ],
      userSegments: [
        { segment: 'Adventure Seekers', percentage: 35, revenue: 650000 },
        { segment: 'Luxury Travelers', percentage: 25, revenue: 850000 },
        { segment: 'Budget Explorers', percentage: 30, revenue: 320000 },
        { segment: 'Family Vacationers', percentage: 10, revenue: 180000 }
      ],
      performanceMetrics: [
        { metric: 'Booking Conversion', current: 12.4, target: 15.0, trend: 'improving' },
        { metric: 'Customer Retention', current: 68.2, target: 75.0, trend: 'stable' },
        { metric: 'Average Order Value', current: 28500, target: 35000, trend: 'improving' },
        { metric: 'Support Response Time', current: 2.3, target: 2.0, trend: 'declining' }
      ]
    };
  };

  const generateBusinessIntelligence = async (): Promise<BusinessIntelligence> => {
    return {
      revenueMetrics: {
        totalRevenue: 1850000,
        monthlyGrowth: 18.7,
        averageOrderValue: 28500,
        conversionRate: 12.4
      },
      customerMetrics: {
        totalUsers: 12450,
        activeUsers: 8230,
        newUsers: 1650,
        churnRate: 5.2
      },
      operationalMetrics: {
        bookingVolume: 3280,
        averageResponseTime: 2.3,
        customerSatisfaction: 4.7,
        systemUptime: 99.8
      }
    };
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await initializeAnalytics();
    setIsRefreshing(false);
  };

  const formatMetricValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return `₹${(value / 100000).toFixed(1)}L`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'time':
        return `${value.toFixed(1)}m`;
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = (changeType: string, change: number) => {
    if (changeType === 'positive' && change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (changeType === 'negative' || change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const categoryTabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'engagement', label: 'User Engagement', icon: <Users className="w-4 h-4" /> },
    { id: 'travel', label: 'Travel Insights', icon: <MapPin className="w-4 h-4" /> },
    { id: 'business', label: 'Business Intel', icon: <Target className="w-4 h-4" /> }
  ];

  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            Analytics Dashboard
            <Badge className="bg-purple-100 text-purple-800">
              AI-Powered
            </Badge>
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced business intelligence and performance insights
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          {/* Time Range Selector */}
          <select
            value={activeTimeRange}
            onChange={(e) => setActiveTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <Button variant="secondary" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as 'overview' | 'engagement' | 'travel' | 'business')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${
              selectedCategory === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedCategory === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.slice(0, 8).map((metric) => (
                <Card key={metric.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      {metric.icon}
                    </div>
                    {getTrendIcon(metric.changeType, metric.change)}
                  </div>
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatMetricValue(metric.value, metric.format)}
                    </div>
                    <div className="text-sm text-gray-600">{metric.title}</div>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`font-medium ${
                      metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                    <span className="text-gray-500 ml-2">vs last period</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* User Growth Chart */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">New Users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Returning</span>
                    </div>
                  </div>
                </div>
                <div className="h-64 flex items-center justify-center bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                  <LineChart className="w-16 h-16 text-gray-400" />
                  <div className="ml-4 text-gray-500">
                    <div className="font-medium">User Growth Visualization</div>
                    <div className="text-sm">Chart implementation ready</div>
                  </div>
                </div>
              </Card>

              {/* Revenue Analysis */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Analysis</h3>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    ₹{(1850000 / 100000).toFixed(1)}L
                  </Badge>
                </div>
                <div className="h-64 flex items-center justify-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <BarChart3 className="w-16 h-16 text-gray-400" />
                  <div className="ml-4 text-gray-500">
                    <div className="font-medium">Revenue Trends</div>
                    <div className="text-sm">Multi-dimensional analysis</div>
                  </div>
                </div>
              </Card>

              {/* Booking Trends */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Booking Trends</h3>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">+23.1%</span>
                  </div>
                </div>
                <div className="h-64 flex items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <Activity className="w-16 h-16 text-gray-400" />
                  <div className="ml-4 text-gray-500">
                    <div className="font-medium">Booking Analytics</div>
                    <div className="text-sm">Conversion & patterns</div>
                  </div>
                </div>
              </Card>

              {/* AI Performance */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">AI Performance</h3>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-600 font-medium">94.2% Success</span>
                  </div>
                </div>
                <div className="h-64 flex items-center justify-center bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                  <Zap className="w-16 h-16 text-gray-400" />
                  <div className="ml-4 text-gray-500">
                    <div className="font-medium">AI Insights</div>
                    <div className="text-sm">Query resolution & learning</div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {selectedCategory === 'engagement' && engagementData && (
          <motion.div
            key="engagement"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { title: 'Time Spent', value: engagementData.timeSpent, format: 'time', icon: <Clock className="w-5 h-5" />, change: 8.3 },
                { title: 'Pages Viewed', value: engagementData.pagesViewed, format: 'number', icon: <Eye className="w-5 h-5" />, change: 15.2 },
                { title: 'Actions/Session', value: engagementData.actionsPerSession, format: 'number', icon: <Activity className="w-5 h-5" />, change: 12.1 },
                { title: 'Return Rate', value: engagementData.returnRate, format: 'percentage', icon: <RefreshCw className="w-5 h-5" />, change: 5.7 },
                { title: 'Satisfaction', value: engagementData.satisfactionScore, format: 'number', icon: <Star className="w-5 h-5" />, change: 4.2 }
              ].map((metric, index) => (
                <Card key={index} className="p-4 text-center">
                  <div className="p-3 bg-indigo-100 rounded-lg mb-3 mx-auto w-fit">
                    {metric.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatMetricValue(metric.value, metric.format)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{metric.title}</div>
                  <div className="text-xs text-green-600 font-medium">
                    +{metric.change}%
                  </div>
                </Card>
              ))}
            </div>

            {/* Engagement Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Journey Analysis</h3>
                <div className="space-y-4">
                  {[
                    { step: 'Landing Page', users: 10000, conversion: 85 },
                    { step: 'Browse Destinations', users: 8500, conversion: 72 },
                    { step: 'View Details', users: 6120, conversion: 45 },
                    { step: 'Add to Cart', users: 2754, conversion: 38 },
                    { step: 'Checkout', users: 1046, conversion: 85 },
                    { step: 'Payment', users: 889, conversion: 95 }
                  ].map((step, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{step.step}</div>
                        <div className="text-sm text-gray-600">{step.users.toLocaleString()} users</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-indigo-600">{step.conversion}%</div>
                        <div className="text-xs text-gray-500">conversion</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage Heatmap</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { feature: 'Search', usage: 95 },
                    { feature: 'AI Chat', usage: 78 },
                    { feature: 'Booking', usage: 67 },
                    { feature: 'Reviews', usage: 89 },
                    { feature: 'Wishlist', usage: 54 },
                    { feature: 'Social', usage: 43 },
                    { feature: 'Maps', usage: 72 },
                    { feature: 'Offers', usage: 86 },
                    { feature: 'Profile', usage: 61 },
                    { feature: 'Support', usage: 34 },
                    { feature: 'Blog', usage: 28 },
                    { feature: 'Compare', usage: 41 }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-center text-sm ${
                        item.usage >= 80 ? 'bg-green-100 text-green-800' :
                        item.usage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        item.usage >= 40 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <div className="font-medium">{item.feature}</div>
                      <div className="text-xs">{item.usage}%</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {selectedCategory === 'travel' && travelInsights && (
          <motion.div
            key="travel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Top Destinations */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Destinations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {travelInsights.topDestinations.map((destination, index) => (
                  <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-gray-900">{destination.name}</span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600 mb-1">
                      {destination.visits.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      +{destination.growth}% growth
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Seasonal Trends & User Segments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Booking Trends</h3>
                <div className="space-y-3">
                  {travelInsights.seasonalTrends.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{month.month}</div>
                        <div className="text-sm text-gray-600">{month.bookings} bookings</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          ₹{(month.avgSpend / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs text-gray-500">avg spend</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Segments</h3>
                <div className="space-y-4">
                  {travelInsights.userSegments.map((segment, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{segment.segment}</div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {segment.percentage}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Revenue contribution</span>
                        <span className="font-semibold text-green-600">
                          ₹{(segment.revenue / 100000).toFixed(1)}L
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${segment.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance vs Targets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {travelInsights.performanceMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-900 mb-2">{metric.metric}</div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Current</span>
                      <span className="font-semibold">
                        {typeof metric.current === 'number' && metric.current > 1000
                          ? `₹${(metric.current / 1000).toFixed(0)}K`
                          : metric.current
                        }
                        {metric.metric.includes('Rate') || metric.metric.includes('Conversion') ? '%' : ''}
                        {metric.metric.includes('Time') ? 'h' : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Target</span>
                      <span className="text-sm font-medium text-gray-800">
                        {typeof metric.target === 'number' && metric.target > 1000
                          ? `₹${(metric.target / 1000).toFixed(0)}K`
                          : metric.target
                        }
                        {metric.metric.includes('Rate') || metric.metric.includes('Conversion') ? '%' : ''}
                        {metric.metric.includes('Time') ? 'h' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {metric.trend === 'improving' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : metric.trend === 'declining' ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <Activity className="w-4 h-4 text-gray-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        metric.trend === 'improving' ? 'text-green-600' :
                        metric.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {selectedCategory === 'business' && businessIntelligence && (
          <motion.div
            key="business"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Business Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Metrics */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Intelligence</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Total Revenue', value: businessIntelligence.revenueMetrics.totalRevenue, format: 'currency' },
                    { label: 'Monthly Growth', value: businessIntelligence.revenueMetrics.monthlyGrowth, format: 'percentage' },
                    { label: 'Avg Order Value', value: businessIntelligence.revenueMetrics.averageOrderValue, format: 'currency' },
                    { label: 'Conversion Rate', value: businessIntelligence.revenueMetrics.conversionRate, format: 'percentage' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <span className="font-semibold text-green-700">
                        {formatMetricValue(item.value, item.format)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Customer Metrics */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Customer Analytics</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Total Users', value: businessIntelligence.customerMetrics.totalUsers, format: 'number' },
                    { label: 'Active Users', value: businessIntelligence.customerMetrics.activeUsers, format: 'number' },
                    { label: 'New Users', value: businessIntelligence.customerMetrics.newUsers, format: 'number' },
                    { label: 'Churn Rate', value: businessIntelligence.customerMetrics.churnRate, format: 'percentage' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <span className="font-semibold text-blue-700">
                        {formatMetricValue(item.value, item.format)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Operational Metrics */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Operations</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Booking Volume', value: businessIntelligence.operationalMetrics.bookingVolume, format: 'number' },
                    { label: 'Response Time', value: businessIntelligence.operationalMetrics.averageResponseTime, format: 'time' },
                    { label: 'Satisfaction', value: businessIntelligence.operationalMetrics.customerSatisfaction, format: 'number' },
                    { label: 'System Uptime', value: businessIntelligence.operationalMetrics.systemUptime, format: 'percentage' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <span className="font-semibold text-purple-700">
                        {formatMetricValue(item.value, item.format)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Advanced Business Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { category: 'Adventure Tours', amount: 650000, percentage: 35 },
                    { category: 'Luxury Packages', amount: 555000, percentage: 30 },
                    { category: 'Budget Travel', amount: 370000, percentage: 20 },
                    { category: 'Corporate Bookings', amount: 185000, percentage: 10 },
                    { category: 'Other Services', amount: 90000, percentage: 5 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{item.category}</div>
                        <div className="text-sm text-gray-600">{item.percentage}% of total</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-indigo-600">
                          ₹{(item.amount / 100000).toFixed(1)}L
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Opportunities</h3>
                <div className="space-y-4">
                  {[
                    {
                      opportunity: 'Mobile App Optimization',
                      impact: 'High',
                      effort: 'Medium',
                      potential: '+₹2.5L/month'
                    },
                    {
                      opportunity: 'AI Personalization',
                      impact: 'High',
                      effort: 'High',
                      potential: '+₹4.2L/month'
                    },
                    {
                      opportunity: 'Social Media Integration',
                      impact: 'Medium',
                      effort: 'Low',
                      potential: '+₹1.8L/month'
                    },
                    {
                      opportunity: 'Corporate Partnerships',
                      impact: 'High',
                      effort: 'Medium',
                      potential: '+₹3.1L/month'
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{item.opportunity}</span>
                        <span className="text-sm font-semibold text-green-600">{item.potential}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.impact === 'High' ? 'bg-red-100 text-red-800' :
                          item.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.impact} Impact
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.effort === 'High' ? 'bg-red-100 text-red-800' :
                          item.effort === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.effort} Effort
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
