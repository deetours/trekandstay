import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  MapPin,
  Leaf,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { useAdventureStore } from '../../store/adventureStore';
import { useAnalytics } from '../../utils/analyticsInit';

interface TravelAnalytics {
  totalTrips: number;
  countriesVisited: number;
  totalSpent: number;
  carbonFootprint: number;
  favoriteDestination: string;
  averageTripDuration: number;
  travelPersonality: string;
  upcomingSavings: number;
}

interface PersonalInsight {
  id: string;
  icon: string;
  title: string;
  description: string;
  actionable: boolean;
  actionText?: string;
}

const TravelAnalyticsWidget: React.FC = () => {
  const { user } = useAdventureStore();
  // Removed unused 'initialized' from analytics hook
  useAnalytics();
  const [analytics, setAnalytics] = useState<TravelAnalytics | null>(null);
  const [insights, setInsights] = useState<PersonalInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulated analytics data - replace with API call
        const mockAnalytics: TravelAnalytics = {
          totalTrips: 12,
          countriesVisited: 5,
          totalSpent: 185000,
          carbonFootprint: 2400,
          favoriteDestination: 'Himachal Pradesh',
          averageTripDuration: 4.2,
          travelPersonality: 'Adventure Explorer',
          upcomingSavings: 25000
        };

        const mockInsights: PersonalInsight[] = [
          {
            id: '1',
            icon: '🌱',
            title: 'Eco-Conscious Traveler',
            description: 'Your carbon footprint is 15% below average. Consider offsetting remaining emissions.',
            actionable: true,
            actionText: 'Offset Carbon'
          },
          {
            id: '2',
            icon: '💰',
            title: 'Budget Optimizer',
            description: 'You could save ₹8,000 on your next trip by booking 3 weeks earlier.',
            actionable: true,
            actionText: 'Set Alerts'
          },
          {
            id: '3',
            icon: '🏔️',
            title: 'Mountain Enthusiast',
            description: '80% of your trips include mountain destinations. New routes available in Uttarakhand.',
            actionable: true,
            actionText: 'Explore Routes'
          }
        ];

        setTimeout(() => {
          setAnalytics(mockAnalytics);
          setInsights(mockInsights);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to load analytics');
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  if (!user) return null;

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <div className="text-center text-red-600">
          <div className="text-lg font-semibold">Analytics Unavailable</div>
          <div className="text-sm text-red-500 mt-2">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Your Travel Analytics
          </h3>
          <p className="text-sm text-gray-600 mt-1">Insights from your travel journey</p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-800">
          AI Insights
        </Badge>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-3 text-center animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {analytics.totalTrips}
              </div>
              <div className="text-xs text-gray-600">Total Trips</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.countriesVisited}
              </div>
              <div className="text-xs text-gray-600">Countries</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                ₹{analytics.totalSpent.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Total Spent</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analytics.carbonFootprint}kg
              </div>
              <div className="text-xs text-gray-600">CO₂ Footprint</div>
            </div>
          </div>

          {/* Travel Pattern Insights */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">AI Travel Insights</h4>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-3 border-l-4 border-emerald-500"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{insight.icon}</span>
                    <h5 className="font-medium text-sm">{insight.title}</h5>
                  </div>
                  <p className="text-xs text-gray-600">{insight.description}</p>
                  {insight.actionable && (
                    <Button size="sm" variant="secondary" className="mt-2 text-xs">
                      {insight.actionText}
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Travel Personality Profile */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Travel Personality</h4>
              <Badge variant="secondary">{analytics.travelPersonality}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-gray-600">Favorite: {analytics.favoriteDestination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Avg Duration: {analytics.averageTripDuration} days</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">Saved: ₹{analytics.upcomingSavings.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">15% Below Avg CO₂</span>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TravelAnalyticsWidget;
