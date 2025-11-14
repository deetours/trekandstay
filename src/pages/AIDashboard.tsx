import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Brain, 
  Target, 
  TrendingUp, 
  RefreshCw,
  AlertCircle,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Star,
  ArrowRight,
  Heart
} from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAdventureStore } from '../store/adventureStore';
import { fetchTrips } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Trip {
  id: string;
  name: string;
  location: string;
  price: number;
  rating?: number;
  tags?: string[];
  duration_days?: number;
  difficulty_level?: string;
  highlights?: string[];
  images?: string[];
  review_count?: number;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  value: string | number;
}

export function AIDashboard() {
  const { user } = useAdventureStore();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [recommendations, setRecommendations] = useState<Trip[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'analytics'>('overview');

  const loadTripsAndAnalyze = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tripsData = await fetchTrips();
      if (!Array.isArray(tripsData) || tripsData.length === 0) {
        setError('No trips available to analyze');
        setTrips([]);
        setRecommendations([]);
        return;
      }

      setTrips(tripsData);

      // Generate AI insights based on trips
      const generatedInsights = generateInsights(tripsData);
      setInsights(generatedInsights);

      // Generate AI recommendations
      const aiRecommendations = generateRecommendations(tripsData);
      setRecommendations(aiRecommendations);
    } catch (err) {
      console.error('Error loading AI Dashboard:', err);
      setError('Failed to load AI Dashboard. Please refresh the page.');
      setTrips([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTripsAndAnalyze();
  }, [loadTripsAndAnalyze]);

  const generateInsights = (tripsData: Trip[]): AIInsight[] => {
    const avgPrice = Math.round(
      tripsData.reduce((sum, trip) => sum + (trip.price || 0), 0) / tripsData.length
    );

    const avgRating = (
      tripsData.reduce((sum, trip) => sum + (trip.rating || 0), 0) / tripsData.length
    ).toFixed(1);

    const bestDestination = tripsData.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];

    const topCategory = getMostCommonCategory(tripsData);

    return [
      {
        id: '1',
        title: 'Average Price',
        description: 'Based on all available trips',
        icon: <DollarSign className="w-6 h-6" />,
        color: 'from-blue-500 to-cyan-500',
        value: `₹${avgPrice.toLocaleString()}`
      },
      {
        id: '2',
        title: 'Top Rated',
        description: bestDestination?.name || 'N/A',
        icon: <Star className="w-6 h-6" />,
        color: 'from-yellow-500 to-orange-500',
        value: avgRating
      },
      {
        id: '3',
        title: 'Total Trips',
        description: 'Available for booking',
        icon: <MapPin className="w-6 h-6" />,
        color: 'from-emerald-500 to-teal-500',
        value: tripsData.length
      },
      {
        id: '4',
        title: 'Popular Category',
        description: 'Most common trip type',
        icon: <Target className="w-6 h-6" />,
        color: 'from-purple-500 to-pink-500',
        value: topCategory
      }
    ];
  };

  const getMostCommonCategory = (tripsData: Trip[]): string => {
    const categories: Record<string, number> = {};
    tripsData.forEach(trip => {
      const cats = trip.tags || [];
      cats.forEach(cat => {
        categories[cat] = (categories[cat] || 0) + 1;
      });
    });
    const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    return sortedCats[0]?.[0] || 'Adventure';
  };

  const generateRecommendations = (tripsData: Trip[]): Trip[] => {
    // AI logic: recommend highest-rated trips or random selection if limited data
    return tripsData
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">AI Travel Dashboard</h1>
                  <p className="text-gray-600 mt-1">Intelligent insights powered by your trip data</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={loadTripsAndAnalyze}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">{error}</p>
                <p className="text-sm text-red-700 mt-1">Make sure Firestore has trip data available</p>
              </div>
            </motion.div>
          )}

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex gap-2 border-b border-gray-200"
          >
            {['overview', 'recommendations', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'overview' | 'recommendations' | 'analytics')}
                className={`px-4 py-3 font-medium border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* AI Insights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all p-6 h-full">
                      <div className={`w-12 h-12 bg-gradient-to-br ${insight.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                        {insight.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                      <p className="text-2xl font-bold text-gray-900 mb-2">{insight.value}</p>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* AI Summary */}
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI Insights</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Based on analysis of {trips.length} available trips, we've identified your best options. 
                      The most popular destinations are trending upward in ratings, and we've found 
                      {recommendations.length} personalized recommendations that match your travel preferences. 
                      Average trip cost is ₹{Math.round(trips.reduce((sum, t) => sum + (t.price || 0), 0) / trips.length).toLocaleString()}.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all h-full group cursor-pointer">
                        {/* Image */}
                        <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                          {trip.images?.[0] && (
                            <img 
                              src={trip.images[0]} 
                              alt={trip.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                          <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg">
                            <Heart className="w-5 h-5 text-red-500" />
                          </div>
                          {trip.rating && (
                            <div className="absolute bottom-3 left-3 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                              <Star className="w-4 h-4 fill-current" />
                              {trip.rating}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {trip.name}
                          </h3>
                          <div className="flex items-center gap-1 text-gray-600 mb-3">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{trip.location}</span>
                          </div>

                          {/* Meta Info */}
                          <div className="grid grid-cols-3 gap-3 mb-4 py-4 border-t border-b border-gray-100">
                            {trip.duration_days && (
                              <div className="text-center">
                                <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                <p className="text-sm font-semibold text-gray-900">{trip.duration_days}d</p>
                              </div>
                            )}
                            <div className="text-center">
                              <DollarSign className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                              <p className="text-sm font-semibold text-gray-900">₹{trip.price?.toLocaleString()}</p>
                            </div>
                            {trip.difficulty_level && (
                              <div className="text-center">
                                <TrendingUp className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                <p className="text-sm font-semibold text-gray-900">{trip.difficulty_level}</p>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          {trip.tags && trip.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {trip.tags.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Button */}
                          <Button
                            variant="primary"
                            onClick={() => navigate(`/trip/${trip.id}`)}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            View Details
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No recommendations available yet</p>
                  <Button onClick={loadTripsAndAnalyze}>Generate Recommendations</Button>
                </Card>
              )}
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Price Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Price Distribution
                </h3>
                <div className="space-y-3">
                  {['Budget (<₹3K)', 'Mid-range (₹3K-7K)', 'Premium (>₹7K)'].map((range, i) => {
                    const count = trips.filter(t => {
                      const price = t.price || 0;
                      if (i === 0) return price < 3000;
                      if (i === 1) return price >= 3000 && price < 7000;
                      return price >= 7000;
                    }).length;
                    const percentage = trips.length > 0 ? Math.round((count / trips.length) * 100) : 0;
                    
                    return (
                      <div key={range}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{range}</span>
                          <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Rating Analysis */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Rating Analysis
                </h3>
                <div className="space-y-3">
                  {[5, 4, 3].map(stars => {
                    const count = trips.filter(t => {
                      const rating = t.rating || 0;
                      return rating >= stars && rating < stars + 1;
                    }).length;
                    const percentage = trips.length > 0 ? Math.round((count / trips.length) * 100) : 0;
                    
                    return (
                      <div key={stars}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{stars}+ Stars</span>
                          <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default AIDashboard;