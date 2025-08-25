import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchTripRecommendations, generateTripRecommendations, type TripRecommendation } from '../../services/api';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, ArrowRight, RefreshCw, Compass, Mountain, Waves } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

type EnhancedRecommendation = TripRecommendation & {
  icon?: React.ElementType;
  color?: string;
  route?: string;
  trip?: string;
};

export function RecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<EnhancedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Enhanced recommendations with functional navigation
  const enhancedRecommendations: EnhancedRecommendation[] = useMemo(() => [
    {
      id: 1,
      destination: 'Popular Destinations',
      reason: 'Trending spots loved by travelers',
      trip: 'destinations',
      icon: Mountain,
      color: 'from-blue-500 to-cyan-500',
      route: '/destinations'
    },
    {
      id: 2,
      destination: 'Weekend Getaways',
      reason: 'Perfect 2-3 day escapes near you',
      trip: 'weekend',
      icon: Compass,
      color: 'from-emerald-500 to-teal-500',
      route: '/destinations?filter=weekend'
    },
    {
      id: 3,
      destination: 'Adventure Trips',
      reason: 'Thrilling experiences for adrenaline seekers',
      trip: 'adventure',
      icon: Mountain,
      color: 'from-orange-500 to-red-500',
      route: '/destinations?filter=adventure'
    },
    {
      id: 4,
      destination: 'Beach Holidays',
      reason: 'Relaxing coastal destinations',
      trip: 'beach',
      icon: Waves,
      color: 'from-cyan-500 to-blue-500',
      route: '/destinations?filter=beach'
    }
  ], []);

  const handleExplore = (recommendation: EnhancedRecommendation) => {
    if (recommendation.route) {
      navigate(recommendation.route);
    } else {
      // Fallback navigation based on destination name
      if (recommendation.destination.toLowerCase().includes('weekend')) {
        navigate('/destinations?filter=weekend');
      } else if (recommendation.destination.toLowerCase().includes('beach')) {
        navigate('/destinations?filter=beach');
      } else if (recommendation.destination.toLowerCase().includes('adventure')) {
        navigate('/destinations?filter=adventure');
      } else {
        navigate('/destinations');
      }
    }
  };

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get existing recommendations first
      let data = await fetchTripRecommendations();
      
      // If no recommendations exist, use enhanced fallback
      if (data.length === 0) {
        try {
          await generateTripRecommendations();
          data = await fetchTripRecommendations();
        } catch (genError) {
          console.warn('Could not generate recommendations:', genError);
          // Use enhanced fallback recommendations
          data = enhancedRecommendations;
        }
      }
      
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Using suggested destinations');
      // Set enhanced fallback data even on error
      setRecommendations(enhancedRecommendations);
    } finally {
      setLoading(false);
    }
  }, [enhancedRecommendations]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                Curated destinations for you
              </span>
            </div>
            <Button
              size="sm" 
              variant="secondary"
              onClick={fetchRecommendations}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.slice(0, 4).map((recommendation, index) => {
          const IconComponent = recommendation.icon || MapPin;
          const colorClass = recommendation.color || 'from-emerald-400 to-blue-500';
          
          return (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group cursor-pointer"
              onClick={() => handleExplore(recommendation)}
            >
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl hover:shadow-lg hover:from-gray-50 hover:to-gray-100 transition-all duration-300 border border-gray-100 group-hover:border-gray-200">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                      {recommendation.destination}
                    </h4>
                    <p className="text-sm text-gray-600 max-w-xs">{recommendation.reason}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-cyan-700 transition-all shadow-md group-hover:shadow-lg"
                >
                  Explore
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {recommendations.length === 0 && !loading && (
        <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700 mb-2">No recommendations yet</div>
          <div className="text-xs text-gray-500 mb-4">We're learning your preferences</div>
          <Button size="sm" onClick={fetchRecommendations}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Load Recommendations
          </Button>
        </div>
      )}
      
      {/* View All Button */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-4"
      >
        <Button 
          variant="secondary" 
          onClick={() => navigate('/destinations')}
          className="w-full"
        >
          <Compass className="w-4 h-4 mr-2" />
          View All Destinations
        </Button>
      </motion.div>
    </div>
  );
}
