import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import TripCard from '../trips/TripCard';
import { featuredTrips } from '../../data/trips';

export default function FeaturedTrips() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-20 bg-warm-sand">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-4xl md:text-5xl font-serif text-deep-forest text-center mb-4"
        >
          Choose Your Transformation
        </motion.h2>
        <p className="text-center text-mystic-indigo text-lg mb-12 max-w-2xl mx-auto">
          These aren't vacations. They're carefully crafted journeys designed to return you to yourself.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2 }}
            >
              <TripCard trip={trip} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}