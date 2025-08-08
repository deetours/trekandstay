import { useEffect, useState } from 'react';
import { mockApi, TripHistory } from '../../services/mockApi';
import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';

export function TripHistoryWidget() {
  const [history, setHistory] = useState<TripHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await mockApi.getTripHistory();
        setHistory(data);
      } catch (err) {
        setError('Failed to load trip history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-lg mb-4">Your Adventures</h3>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
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
      <h3 className="font-bold text-lg mb-4 text-gray-800">Your Adventures</h3>
      <div className="space-y-4">
        {history.map((trip, index) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 rounded-r-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-gray-800">{trip.destination}</h4>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{new Date(trip.date).toLocaleDateString()}</span>
            </div>
            {trip.feedback && (
              <p className="text-sm text-gray-700 italic">"{trip.feedback}"</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
