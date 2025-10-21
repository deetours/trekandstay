import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import TripCard from '../components/trips/TripCard';
import Footer from '../components/shared/Footer';
import WhatsAppFloat from '../components/shared/WhatsAppFloat';
import { allTrips } from '../data/trips';

export default function TripsPage() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

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

          <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allTrips.map((trip, index) => (
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
        </div>
      </div>
      
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}