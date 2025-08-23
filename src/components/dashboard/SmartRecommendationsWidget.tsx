import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Users, 
  TrendingUp, 
  Zap, 
  Heart, 
  Cloud,
  Sun,
  CloudRain,
  Eye,
  RefreshCw,
  Sparkles,
  Target
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/Card';
import { useAdventureStore } from '../../store/adventureStore';
import { userIntelligenceService, AIRecommendation, TravelPersonality } from '../../services/userIntelligence';

interface SmartRecommendationsWidgetProps {
  className?: string;
  limit?: number;
}

interface TravelPersonalityInsight {
  type: string;
  description: string;
  traits: string[];
  confidence: number;
  nextLevelTip: string;
}

const SmartRecommendationsWidget: React.FC<SmartRecommendationsWidgetProps> = ({ 
  className = "", 
  limit = 6 
}) => {
  const { user } = useAdventureStore();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [personalityInsights, setPersonalityInsights] = useState<TravelPersonalityInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Recommendations', icon: '🎯' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'culture', label: 'Cultural', icon: '🏛️' },
    { id: 'nature', label: 'Nature', icon: '🌿' },
    { id: 'budget', label: 'Budget-Friendly', icon: '💰' },
    { id: 'luxury', label: 'Luxury', icon: '✨' }
  ];

  // useEffect moved below function declarations

  const fetchSmartRecommendations = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      // Track recommendation request
      await userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'page_view',
        data: { 
          section: 'smart_recommendations', 
          category: selectedCategory,
          timestamp: new Date()
        },
        timestamp: new Date(),
        sessionId: ''
      });

      const context = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        includeWeather: true,
        includePricing: true,
        includeUserHistory: true,
        currentSeason: getCurrentSeason(),
        userLocation: await getUserLocation()
      };

      const smartRecs = await userIntelligenceService.generatePersonalizedRecommendations(
        user.id.toString(), 
        context
      );

      setRecommendations(smartRecs.slice(0, limit));
    } catch (err) {
      console.error('Error fetching smart recommendations:', err);
      setError('Failed to load personalized recommendations');
      setRecommendations(getFallbackRecommendations());
    } finally {
      setLoading(false);
    }
  }, [user, selectedCategory, limit]);

  const fetchPersonalityInsights = useCallback(async () => {
    if (!user?.id) return;

    try {
      const personality = await userIntelligenceService.getTravelPersonality(user.id.toString());
      const insight: TravelPersonalityInsight = {
        type: personality.type.replace('_', ' ').toUpperCase(),
        description: personality.description,
        traits: personality.traits,
        confidence: personality.confidence,
        nextLevelTip: generateNextLevelTip(personality)
      };
      setPersonalityInsights(insight);
    } catch (error) {
      console.error('Error fetching personality insights:', error);
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSmartRecommendations();
    setRefreshing(false);
  };

  const handleRecommendationClick = async (recommendation: AIRecommendation, action: string) => {
    if (!user?.id) return;

    // Track interaction
    await userIntelligenceService.trackUserBehavior(user.id.toString(), {
      type: 'trip_click',
      data: { 
        recommendationId: recommendation.id,
        destination: recommendation.destination,
        action,
        aiConfidence: recommendation.aiConfidence,
        priceRange: recommendation.priceRange
      },
      timestamp: new Date(),
      sessionId: ''
    });

    // Handle different actions
    switch (action) {
      case 'view_details':
        // Navigate to trip details
        window.open(`/trip/${recommendation.id}`, '_blank');
        break;
      case 'add_wishlist':
        // Add to wishlist logic
        console.log('Adding to wishlist:', recommendation.destination);
        break;
      case 'book_now':
        // Navigate to booking
        window.open(`/book/${recommendation.id}`, '_blank');
        break;
      default:
        break;
    }
  };

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  const getUserLocation = async (): Promise<string | undefined> => {
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        return `${position.coords.latitude},${position.coords.longitude}`;
      }
    } catch {
      console.log('Location access not available');
    }
    return undefined;
  };

  const generateNextLevelTip = (personality: TravelPersonality): string => {
    const tips = {
      adventure_seeker: "Try adding cultural experiences to your adventures for a more enriching journey!",
      luxury_traveler: "Consider off-season luxury travel for 40% savings with the same premium experience.",
      budget_explorer: "Book 45-60 days in advance to unlock hidden deals and save up to 35%.",
      cultural_enthusiast: "Combine cultural sites with local food tours for an immersive experience.",
      nature_lover: "Visit during shoulder seasons for better weather and fewer crowds."
    };
    return tips[personality.type as keyof typeof tips] || "Keep exploring to discover your unique travel style!";
  };

  const getFallbackRecommendations = (): AIRecommendation[] => {
    return [
      {
        id: 'fallback_1',
        destination: 'Kerala Backwaters',
        reason: 'Perfect for peaceful getaways',
        personalizedReason: 'Matches your preference for serene, cultural experiences',
        aiConfidence: 87,
        priceRange: [18000, 28000],
        bestTravelTime: 'October - March',
        similarTravelers: 342,
        crowdLevel: 'low',
        tags: ['Nature', 'Culture', 'Peaceful', 'Photography'],
        urgency: 'medium',
        weatherForecast: {
          temperature: 26,
          condition: 'Pleasant',
          humidity: 68,
          rainfall: 2
        }
      },
      {
        id: 'fallback_2',
        destination: 'Himachal Pradesh',
        reason: 'Adventure meets tranquility',
        personalizedReason: 'Perfect blend of adventure and scenic beauty for your travel style',
        aiConfidence: 92,
        priceRange: [22000, 38000],
        bestTravelTime: 'April - June, September - November',
        similarTravelers: 567,
        crowdLevel: 'medium',
        tags: ['Adventure', 'Mountains', 'Trekking', 'Snow'],
        urgency: 'high',
        potentialSavings: 12000,
        weatherForecast: {
          temperature: 15,
          condition: 'Clear',
          humidity: 45,
          rainfall: 0
        }
      }
    ];
  };

  const getWeatherIcon = (condition: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'sunny': <Sun className="w-4 h-4 text-yellow-500" />,
      'clear': <Sun className="w-4 h-4 text-yellow-500" />,
      'cloudy': <Cloud className="w-4 h-4 text-gray-500" />,
      'rainy': <CloudRain className="w-4 h-4 text-blue-500" />,
      'pleasant': <Sun className="w-4 h-4 text-green-500" />
    };
    return iconMap[condition.toLowerCase()] || <Sun className="w-4 h-4 text-yellow-500" />;
  };

  const getCrowdLevelColor = (level: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800', 
      'high': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // ...existing code...
  useEffect(() => {
    if (user?.id) {
      fetchSmartRecommendations();
      fetchPersonalityInsights();
    }
  }, [user, selectedCategory, fetchSmartRecommendations, fetchPersonalityInsights]);

  if (loading && recommendations.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center">
                Smart Recommendations
                <Sparkles className="w-5 h-5 ml-2" />
              </h3>
              <p className="text-indigo-100 text-sm">
                AI-powered suggestions tailored for you
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

        {/* Travel Personality Insight */}
        {personalityInsights && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-lg">Your Travel DNA</h4>
              <Badge className="bg-white/20 text-white border-white/30">
                {personalityInsights.confidence}% Match
              </Badge>
            </div>
            <p className="text-indigo-100 text-sm mb-3">
              <strong>{personalityInsights.type}:</strong> {personalityInsights.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {personalityInsights.traits.map((trait, index) => (
                <Badge key={index} className="bg-white/15 text-white text-xs border-white/20">
                  {trait}
                </Badge>
              ))}
            </div>
            <div className="bg-yellow-400/20 rounded-lg p-3 border border-yellow-400/30">
              <p className="text-yellow-100 text-sm flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                <strong>AI Tip:</strong> {personalityInsights.nextLevelTip}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-indigo-50'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-6">
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="secondary">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <AnimatePresence mode="wait">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {rec.destination}
                        </h4>
                        <p className="text-gray-600 text-sm mt-1">
                          {rec.personalizedReason}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <Badge 
                          className={`${
                            rec.aiConfidence >= 85 
                              ? 'bg-green-100 text-green-800' 
                              : rec.aiConfidence >= 70 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {rec.aiConfidence}% match
                        </Badge>
                      </div>
                    </div>

                    {/* Price and Timing */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-bold text-indigo-600">
                          ₹{rec.priceRange[0].toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">
                          - ₹{rec.priceRange[1].toLocaleString()}
                        </span>
                        {rec.potentialSavings && (
                          <div className="text-green-600 text-xs font-medium">
                            Save ₹{rec.potentialSavings.toLocaleString()}!
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {rec.bestTravelTime}
                        </div>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <Users className="w-3 h-3 mr-1" />
                          {rec.similarTravelers} similar travelers
                        </div>
                      </div>
                    </div>

                    {/* Weather and Crowd Info */}
                    {rec.weatherForecast && (
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg mb-3">
                        <div className="flex items-center space-x-2">
                          {getWeatherIcon(rec.weatherForecast.condition)}
                          <span className="text-sm text-gray-600">
                            {rec.weatherForecast.temperature}°C, {rec.weatherForecast.condition}
                          </span>
                        </div>
                        <Badge className={`text-xs ${getCrowdLevelColor(rec.crowdLevel)}`}>
                          {rec.crowdLevel} crowds
                        </Badge>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {rec.tags.slice(0, 4).map((tag, tagIndex) => (
                        <Badge 
                          key={tagIndex} 
                          variant="outline" 
                          className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {rec.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{rec.tags.length - 4} more
                        </Badge>
                      )}
                    </div>

                    {/* Urgency Indicator */}
                    {rec.urgency === 'high' && (
                      <div className="flex items-center text-orange-600 text-sm mb-3">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="font-medium">High demand - Book soon!</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-gray-50 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRecommendationClick(rec, 'view_details')}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRecommendationClick(rec, 'add_wishlist')}
                      className="hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRecommendationClick(rec, 'book_now')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Book
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {recommendations.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No recommendations found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or refresh to get new suggestions.
            </p>
            <Button onClick={handleRefresh}>
              Refresh Recommendations
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SmartRecommendationsWidget;
