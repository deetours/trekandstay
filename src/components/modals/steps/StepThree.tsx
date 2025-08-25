import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, Users, Heart, Phone, Mail, MessageCircle } from 'lucide-react';
import { useLeadCaptureStore } from '../../../store/leadCaptureStore';

export const StepThree: React.FC = () => {
  const { formData } = useLeadCaptureStore();

  // Generate personalized recommendations based on user preferences
  const recommendations = useMemo(() => {
    const interestedTrips = formData.tripPreferences.filter(trip => trip.interested);
    const [minBudget, maxBudget] = formData.budget;

    // Filter trips that match budget
    const budgetMatchedTrips = interestedTrips.filter(trip => 
      trip.price >= minBudget && trip.price <= maxBudget
    );

    // If no exact matches, show closest options
    const finalRecommendations = budgetMatchedTrips.length > 0 
      ? budgetMatchedTrips 
      : interestedTrips.slice(0, 3);

    return finalRecommendations.map(trip => ({
      ...trip,
      matchScore: Math.floor(Math.random() * 15) + 85, // Mock match score 85-100%
      availableSlots: Math.floor(Math.random() * 8) + 2,
      rating: (Math.random() * 0.8 + 4.2).toFixed(1)
    }));
  }, [formData.tripPreferences, formData.budget]);

  const getTotalEstimate = () => {
    return recommendations.reduce((total, trip) => total + trip.price, 0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h3 className="text-xl font-oswald font-bold text-gray-900 mb-2">
          Perfect Adventures Await, {formData.name}! 🎯
        </h3>
        <p className="text-gray-600">
          Based on your preferences, here are our top recommendations
        </p>
      </motion.div>

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <motion.div variants={itemVariants} className="space-y-4">
          {recommendations.map((trip, index) => (
            <motion.div
              key={trip.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200"
            >
              {/* Match Score Badge */}
              <div className="absolute top-3 right-3">
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  {trip.matchScore}% Match
                </span>
              </div>

              {/* Ranking Badge */}
              {index === 0 && (
                <div className="absolute top-3 left-3">
                  <span className="bg-adventure-orange text-white text-xs font-bold px-2 py-1 rounded-full">
                    #1 Pick
                  </span>
                </div>
              )}

              <div className="flex space-x-4">
                {/* Trip Image */}
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={trip.image}
                    alt={trip.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Trip Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-oswald font-bold text-gray-900 mb-1 pr-16">
                    {trip.name}
                  </h4>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{trip.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                      <span>{trip.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{trip.availableSlots} slots left</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-adventure-orange">
                        ₹{trip.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">per person</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why This Trip */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Why we recommend this:</span> {' '}
                  {index === 0 && 'Perfect match for your budget and adventure level!'}
                  {index === 1 && 'Great value with amazing experiences included.'}
                  {index === 2 && 'Popular choice among travelers with similar preferences.'}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Summary Card */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200"
          >
            <h4 className="font-semibold text-gray-900 mb-2">Trip Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Selected Adventures:</span>
                <div className="font-medium">{recommendations.length} trips</div>
              </div>
              <div>
                <span className="text-gray-600">Total Estimated Cost:</span>
                <div className="font-bold text-adventure-orange">₹{getTotalEstimate().toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Travel Period:</span>
                <div className="font-medium">
                  {formData.preferredDates.startDate 
                    ? `${formData.preferredDates.startDate} - ${formData.preferredDates.endDate || 'Flexible'}`
                    : 'Flexible dates'
                  }
                </div>
              </div>
              <div>
                <span className="text-gray-600">Budget Range:</span>
                <div className="font-medium">₹{formData.budget[0].toLocaleString()} - ₹{formData.budget[1].toLocaleString()}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        /* No Recommendations Fallback */
        <motion.div variants={itemVariants} className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Let's find your perfect adventure!</h4>
          <p className="text-gray-600 mb-4">
            We'll connect with you personally to understand your preferences better and recommend the best trips.
          </p>
        </motion.div>
      )}

      {/* Next Steps */}
      <motion.div variants={itemVariants} className="bg-adventure-orange/10 rounded-lg p-4">
        <h4 className="font-semibold text-adventure-orange mb-3 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          What happens next?
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
            <span>Our travel expert will WhatsApp you within 15 minutes</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
            <span>Get detailed itineraries and personalized pricing</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
            <span>Book your adventure with easy payment options</span>
          </div>
        </div>
      </motion.div>

      {/* Contact Info Display */}
      <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Your contact details:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>+91 {formData.whatsapp}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{formData.email}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          We'll never share your information with third parties. 
          <button className="text-adventure-orange hover:underline ml-1">Privacy Policy</button>
        </p>
      </motion.div>
    </motion.div>
  );
};