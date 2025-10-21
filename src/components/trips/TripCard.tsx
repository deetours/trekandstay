import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Trip } from '../../types';

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-cloud-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
    >
      <div className="relative">
        <img
          src={trip.image}
          alt={trip.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-alert-crimson text-cloud-white px-3 py-1 rounded-full text-sm font-bold">
          {trip.spotsLeft} Spots Left
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-serif text-deep-forest mb-2">
          {trip.title}
        </h3>
        
        <div className="bg-sage-green/10 text-sage-green px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
          FROM: {trip.transformation.from} → TO: {trip.transformation.to}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-mystic-indigo font-medium">
            {trip.duration}
          </span>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{trip.rating}</span>
              <span className="text-soft-grey">({trip.reviewCount})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-deep-forest">
              ₹{trip.price.toLocaleString()}
            </span>
            {trip.originalPrice && (
              <span className="text-soft-grey line-through">
                ₹{trip.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <Link to={`/trips/${trip.slug}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-sunrise-coral text-cloud-white py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-deep-forest transition-colors duration-300"
          >
            Explore This Transformation →
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}