import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import TripCard from '../components/trips/TripCard';
import Footer from '../components/shared/Footer';
import WhatsAppFloat from '../components/shared/WhatsAppFloat';
import { fetchTrips } from '../services/api';
import { Trip } from '../types';

export default function TripsPage() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrips() {
      try {
        setLoading(true);
        const data = await fetchTrips();
        setTrips(data);
      } catch (err) {
        console.error('Error loading trips:', err);
        setError('Failed to load trips. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, []);

  return (
    <div className="min-h-screen bg-warm-sand">
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-serif text-deep-forest mb-6">
              All Transformational Journeys
            </h1>
            <p className="text-xl text-mystic-indigo max-w-2xl mx-auto">
              Choose the retreat that speaks to your soul. Each journey is designed to help you return to yourself.
            </p>
          </motion.div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-deep-forest"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-deep-forest underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && trips.length === 0 && (
            <div className="text-center py-20">
              <p className="text-mystic-indigo text-xl">No trips available at the moment. Please check back later!</p>
            </div>
          )}

          {!loading && !error && trips.length > 0 && (
            <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                >
                  <TripCard trip={trip} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}