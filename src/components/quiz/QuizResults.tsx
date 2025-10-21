import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuizAnswers } from '../../types';
import { featuredTrips } from '../../data/trips';

interface QuizResultsProps {
  answers: QuizAnswers;
}

export default function QuizResults({ answers }: QuizResultsProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Simple matching logic
  const getMatchedTrips = () => {
    const values = Object.values(answers);
    
    // Check for burnout/digital overload
    if (values.includes('digital_overload') || values.includes('burnout')) {
      return featuredTrips.filter(trip => trip.slug.includes('agumbe') || trip.slug.includes('digital'));
    }
    // Check for couples
    if (values.includes('couple')) {
      return featuredTrips.filter(trip => trip.slug.includes('couples'));
    }
    // Check for spiritual seeking
    if (values.includes('searching') || values.includes('clarity')) {
      return featuredTrips.filter(trip => trip.slug.includes('spiti') || trip.slug.includes('spiritual'));
    }
    
    // Default
    return featuredTrips;
  };

  const matchedTrips = getMatchedTrips();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setSubmitted(true);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi! I just completed the transformation quiz. I'm interested in these retreats: ${matchedTrips.map(t => t.title).join(', ')}. Can you help me choose the right journey?`
    );
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-warm-sand py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-deep-forest mb-4">
            Your Transformation Awaits
          </h1>
          <p className="text-xl text-mystic-indigo">
            Based on your answers, these journeys are calling you
          </p>
        </motion.div>

        {/* Email Capture */}
        {!submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-cloud-white rounded-xl shadow-lg p-8 mb-12"
          >
            <div className="flex items-start gap-4 mb-6">
              <Mail className="w-8 h-8 text-sunrise-coral flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-serif text-deep-forest mb-2">
                  Get Your Full Transformation Guide
                </h3>
                <p className="text-mystic-indigo">
                  We'll send you a detailed PDF with your personalized retreat recommendations,
                  preparation tips, and a burnout recovery checklist.
                </p>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="flex-1 px-4 py-3 border-2 border-soft-grey rounded-lg focus:border-sage-green focus:outline-none"
              />
              <button
                type="submit"
                className="bg-sunrise-coral text-cloud-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-deep-forest transition-colors"
              >
                Send My Guide
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-sage-green text-cloud-white rounded-xl shadow-lg p-8 mb-12 text-center"
          >
            <h3 className="text-2xl font-serif mb-2">Check Your Inbox! 📧</h3>
            <p>Your personalized guide is on its way to {email}</p>
          </motion.div>
        )}

        {/* Matched Trips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {matchedTrips.slice(0, 2).map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.2 }}
              className="bg-cloud-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={trip.image}
                alt={trip.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-serif text-deep-forest mb-2">
                  {trip.title}
                </h3>
                <div className="bg-sage-green/10 text-sage-green px-3 py-1 rounded-full text-sm font-medium mb-3 inline-block">
                  FROM: {trip.transformation.from} → TO: {trip.transformation.to}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-mystic-indigo">{trip.duration}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{trip.rating} ({trip.reviewCount})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-deep-forest">
                    ₹{trip.price.toLocaleString()}
                  </span>
                  <Link to={`/trips/${trip.slug}`}>
                    <button className="bg-sunrise-coral text-cloud-white px-4 py-2 rounded-lg font-semibold hover:bg-deep-forest transition-colors">
                      Learn More
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center"
        >
          <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-serif text-deep-forest mb-4">
            Ready to Transform Your Life?
          </h3>
          <p className="text-mystic-indigo mb-6">
            Chat with us on WhatsApp for instant answers and exclusive booking offers.
          </p>
          <button
            onClick={handleWhatsAppClick}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider transition-colors flex items-center gap-2 mx-auto"
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </button>
        </motion.div>
      </div>
    </div>
  );
}