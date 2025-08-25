import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, MapPin, Clock, Users, Mountain } from 'lucide-react';
import { useLeadCaptureStore, TripPreference } from '../../../store/leadCaptureStore';

export const StepTwo: React.FC = () => {
  const { formData, updateFormData, updateTripPreference, loadTripsForSelection } = useLeadCaptureStore();
  const [popularTrips, setPopularTrips] = useState<TripPreference[]>([]);

  // Load popular trips for selection
  useEffect(() => {
    const fetchPopularTrips = async () => {
      try {
        // Mock popular trips data (replace with actual API call)
        const mockTrips: TripPreference[] = [
          {
            id: 'maharashtra-7day',
            name: 'Maharashtra 7 Days Adventure',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
            price: 15000,
            duration: '7 days',
            difficulty: 'Moderate',
            interested: false
          },
          {
            id: 'maharashtra-5day',
            name: 'Waterfall Edition 5 Days',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
            price: 9000,
            duration: '5 days',
            difficulty: 'Easy',
            interested: false
          },
          {
            id: 'rajmachi-trek',
            name: 'Rajmachi Fort Trek',
            image: 'https://images.unsplash.com/photo-1464822759844-d150baec53c1?w=300&h=200&fit=crop',
            price: 3500,
            duration: '2 days',
            difficulty: 'Easy',
            interested: false
          },
          {
            id: 'devkund-waterfall',
            name: 'Devkund Waterfall Trek',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
            price: 2500,
            duration: '1 day',
            difficulty: 'Easy',
            interested: false
          },
          {
            id: 'bhandardara',
            name: 'Bhandardara Adventure',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
            price: 4500,
            duration: '2 days',
            difficulty: 'Moderate',
            interested: false
          },
          {
            id: 'lonavala-khandala',
            name: 'Lonavala-Khandala Escape',
            image: 'https://images.unsplash.com/photo-1464822759844-d150baec53c1?w=300&h=200&fit=crop',
            price: 3000,
            duration: '2 days',
            difficulty: 'Easy',
            interested: false
          }
        ];

        setPopularTrips(mockTrips);
        loadTripsForSelection(mockTrips);
      } catch (error) {
        console.error('Failed to load trips:', error);
      }
    };

    fetchPopularTrips();
  }, [loadTripsForSelection]);

  const handleBudgetChange = (values: number[]) => {
    updateFormData({ budget: [values[0], values[1]] });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    updateFormData({
      preferredDates: {
        ...formData.preferredDates,
        [field]: value
      }
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

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
          Tell us about your dream adventure! ✨
        </h3>
        <p className="text-gray-600">
          Help us find the perfect trip that matches your preferences and budget
        </p>
      </motion.div>

      {/* Budget Selection */}
      <motion.div variants={itemVariants} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          <DollarSign className="inline w-4 h-4 mr-1" />
          Budget Range (per person)
        </label>
        <div className="px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">₹{formData.budget[0].toLocaleString()}</span>
            <span className="text-sm text-gray-600">₹{formData.budget[1].toLocaleString()}</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={formData.budget[0]}
              onChange={(e) => handleBudgetChange([parseInt(e.target.value), formData.budget[1]])}
              className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={formData.budget[1]}
              onChange={(e) => handleBudgetChange([formData.budget[0], parseInt(e.target.value)])}
              className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: 'Budget', range: [2000, 8000] },
            { label: 'Mid-Range', range: [8000, 20000] },
            { label: 'Premium', range: [20000, 50000] }
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleBudgetChange(preset.range)}
              className="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:border-adventure-orange hover:bg-orange-50 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Date Selection */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Preferred Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.preferredDates.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            min={today}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adventure-orange focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Preferred End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.preferredDates.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            min={formData.preferredDates.startDate || today}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adventure-orange focus:border-transparent"
          />
        </div>
      </motion.div>

      {/* Trip Selection */}
      <motion.div variants={itemVariants} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          <Mountain className="inline w-4 h-4 mr-1" />
          Which adventures interest you? (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {formData.tripPreferences.map((trip) => (
            <motion.div
              key={trip.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${trip.interested 
                  ? 'border-adventure-orange bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => updateTripPreference(trip.id, !trip.interested)}
            >
              {/* Selection Indicator */}
              <div className={`
                absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${trip.interested 
                  ? 'border-adventure-orange bg-adventure-orange' 
                  : 'border-gray-300'
                }
              `}>
                {trip.interested && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>

              {/* Trip Image */}
              <div className="w-full h-24 bg-gray-200 rounded-lg mb-2 overflow-hidden">
                <img
                  src={trip.image}
                  alt={trip.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Trip Info */}
              <h4 className="font-semibold text-sm text-gray-900 mb-1 pr-6">
                {trip.name}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {trip.duration}
                  </span>
                  <span className={`px-2 py-1 rounded-full ${getDifficultyColor(trip.difficulty)}`}>
                    {trip.difficulty}
                  </span>
                </div>
                <span className="font-semibold text-adventure-orange">
                  ₹{trip.price.toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        
        {formData.tripPreferences.filter(t => t.interested).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <p className="text-sm text-green-700">
              Great choice! You've selected {formData.tripPreferences.filter(t => t.interested).length} adventure(s). 
              We'll personalize recommendations based on your interests.
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};