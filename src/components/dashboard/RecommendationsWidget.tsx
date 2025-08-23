import { useEffect, useState } from 'react';
import { fetchTripRecommendations, generateTripRecommendations, type TripRecommendation } from '../../services/api';
import { motion } from 'framer-motion';

export function RecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<TripRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        // Try to get existing recommendations first
        let data = await fetchTripRecommendations();
        
        // If no recommendations exist, generate new ones
        if (data.length === 0) {
          try {
            await generateTripRecommendations();
            data = await fetchTripRecommendations();
          } catch (genError) {
            console.warn('Could not generate recommendations:', genError);
            // Continue with empty array
          }
        }
        
        setRecommendations(data);
      } catch {
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-lg mb-4">Recommended for You</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-lg mb-4 text-red-600">Error</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-bold text-lg mb-4 text-gray-800">Recommended for You</h3>
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-sm transition-shadow"
          >
            <div>
              <h4 className="font-semibold text-gray-800">{recommendation.destination}</h4>
              <p className="text-sm text-gray-600">{recommendation.reason}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Explore
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
