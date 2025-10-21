import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Calendar, 
  Mountain, 
  Waves,
  Trees,
  Castle,
  Calculator,
  Star,
  ArrowRight,
  X
} from 'lucide-react';

interface TrekDiscoveryWidgetProps {
  onTripSelect?: (trip: any) => void;
  className?: string;
}

interface TrekFilters {
  difficulty: number;
  groupSize: number;
  season: string;
  region: string;
}

export const TrekDiscoveryWidget: React.FC<TrekDiscoveryWidgetProps> = ({ 
  onTripSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'difficulty' | 'season' | 'group'>('map');
  const [filters, setFilters] = useState<TrekFilters>({
    difficulty: 3,
    groupSize: 4,
    season: 'monsoon',
    region: 'maharashtra'
  });
  
  const regions = [
    { id: 'maharashtra', name: 'Maharashtra', icon: Mountain, color: 'emerald', trips: 12 },
    { id: 'goa', name: 'Goa', icon: Waves, color: 'blue', trips: 8 },
    { id: 'karnataka', name: 'Karnataka', icon: Trees, color: 'green', trips: 15 },
    { id: 'rajasthan', name: 'Rajasthan', icon: Castle, color: 'orange', trips: 6 }
  ];

  const seasons = [
    { id: 'monsoon', name: 'Monsoon', months: 'Jun-Sep', icon: '🌧️', color: 'blue' },
    { id: 'winter', name: 'Winter', months: 'Oct-Feb', icon: '❄️', color: 'cyan' },
    { id: 'summer', name: 'Summer', months: 'Mar-May', icon: '☀️', color: 'yellow' }
  ];

  const difficultyLevels = [
    { level: 1, label: 'Easy', description: 'Beginner friendly', color: 'green' },
    { level: 2, label: 'Moderate', description: 'Some experience needed', color: 'yellow' },
    { level: 3, label: 'Challenging', description: 'Good fitness required', color: 'orange' },
    { level: 4, label: 'Expert', description: 'Advanced trekkers only', color: 'red' },
    { level: 5, label: 'Extreme', description: 'Professional level', color: 'purple' }
  ];

  const calculatePrice = (basePrice: number) => {
    const groupDiscount = filters.groupSize > 4 ? 0.1 : 0;
    const seasonMultiplier = filters.season === 'monsoon' ? 1.2 : 1;
    return Math.round(basePrice * (1 - groupDiscount) * seasonMultiplier);
  };

  const filteredTrips = [
    {
      id: 1,
      name: 'Waterfall Rappelling Adventure',
      basePrice: 8500,
      difficulty: 3,
      region: 'maharashtra',
      season: ['monsoon'],
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'Fort Exploration Trek',
      basePrice: 6500,
      difficulty: 2,
      region: 'maharashtra',
      season: ['winter', 'summer'],
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    }
  ].filter(trip => 
    trip.difficulty <= filters.difficulty &&
    trip.region === filters.region &&
    trip.season.includes(filters.season)
  );

  return (
    <div>
      {/* Trigger Button - Now relative positioned */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-full shadow-lg hover:shadow-emerald-500/25 ${className}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(16, 185, 129, 0.7)',
            '0 0 0 8px rgba(16, 185, 129, 0)',
            '0 0 0 0 rgba(16, 185, 129, 0)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MapPin className="w-5 h-5" />
      </motion.button>

      {/* Discovery Widget Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-800">🗺️ Discover Your Perfect Trek</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
                  {[
                    { id: 'map', label: 'Regions', icon: MapPin },
                    { id: 'difficulty', label: 'Difficulty', icon: Mountain },
                    { id: 'season', label: 'Season', icon: Calendar },
                    { id: 'group', label: 'Group Size', icon: Users }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white text-emerald-600 shadow-sm'
                          : 'text-gray-600 hover:text-emerald-600'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Region Selection */}
                {activeTab === 'map' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Your Adventure Region</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {regions.map(region => {
                        const IconComponent = region.icon;
                        return (
                          <motion.button
                            key={region.id}
                            onClick={() => setFilters({ ...filters, region: region.id })}
                            className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                              filters.region === region.id
                                ? `border-${region.color}-500 bg-${region.color}-50`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg bg-${region.color}-100`}>
                                <IconComponent className={`w-6 h-6 text-${region.color}-600`} />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-800">{region.name}</h5>
                                <p className="text-gray-600 text-sm mt-1">{region.trips} adventures available</p>
                                <div className="flex items-center gap-1 mt-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                  ))}
                                  <span className="text-xs text-gray-500 ml-1">4.8 avg rating</span>
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Difficulty Selection */}
                {activeTab === 'difficulty' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h4 className="text-lg font-semibold text-gray-800">Choose Your Challenge Level</h4>
                    
                    {/* Interactive Slider */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Mountain className="w-5 h-5 text-emerald-600" />
                        <div className="flex-1">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={filters.difficulty}
                            onChange={(e) => setFilters({ ...filters, difficulty: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(filters.difficulty - 1) * 25}%, #e5e7eb ${(filters.difficulty - 1) * 25}%, #e5e7eb 100%)`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-12">Level {filters.difficulty}</span>
                      </div>
                      
                      {/* Difficulty Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        {difficultyLevels.map(level => (
                          <motion.div
                            key={level.level}
                            className={`p-4 rounded-lg border text-center transition-all duration-200 ${
                              filters.difficulty >= level.level
                                ? `border-${level.color}-500 bg-${level.color}-50`
                                : 'border-gray-200 bg-gray-50'
                            }`}
                            animate={{
                              scale: filters.difficulty >= level.level ? 1.05 : 1
                            }}
                          >
                            <div className="font-semibold text-sm">{level.label}</div>
                            <div className="text-xs text-gray-600 mt-1">{level.description}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Season Selection */}
                {activeTab === 'season' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h4 className="text-lg font-semibold text-gray-800">Best Time to Adventure</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {seasons.map(season => (
                        <motion.button
                          key={season.id}
                          onClick={() => setFilters({ ...filters, season: season.id })}
                          className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                            filters.season === season.id
                              ? `border-${season.color}-500 bg-${season.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-3xl mb-2">{season.icon}</div>
                          <h5 className="font-semibold text-gray-800">{season.name}</h5>
                          <p className="text-gray-600 text-sm">{season.months}</p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Group Size Calculator */}
                {activeTab === 'group' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <Calculator className="w-5 h-5 text-emerald-600" />
                      <h4 className="text-lg font-semibold text-gray-800">Group Size & Pricing</h4>
                    </div>
                    
                    <div className="bg-emerald-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-700">Group Size:</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setFilters({ ...filters, groupSize: Math.max(1, filters.groupSize - 1) })}
                            className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center hover:bg-emerald-300 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xl font-bold text-emerald-600 w-12 text-center">{filters.groupSize}</span>
                          <button
                            onClick={() => setFilters({ ...filters, groupSize: Math.min(20, filters.groupSize + 1) })}
                            className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center hover:bg-emerald-300 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Base Price (per person):</span>
                          <span>₹8,500</span>
                        </div>
                        {filters.groupSize > 4 && (
                          <div className="flex justify-between text-sm text-emerald-600">
                            <span>Group Discount (10%):</span>
                            <span>-₹850</span>
                          </div>
                        )}
                        {filters.season === 'monsoon' && (
                          <div className="flex justify-between text-sm text-blue-600">
                            <span>Peak Season (+20%):</span>
                            <span>+₹1,700</span>
                          </div>
                        )}
                        <hr className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>Total per person:</span>
                          <span className="text-emerald-600">₹{calculatePrice(8500).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total for {filters.groupSize} people:</span>
                          <span className="text-emerald-600">₹{(calculatePrice(8500) * filters.groupSize).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Filtered Results */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Perfect Matches ({filteredTrips.length})
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredTrips.map(trip => (
                      <motion.div
                        key={trip.id}
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          onTripSelect?.(trip);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex gap-4">
                          <img
                            src={trip.image}
                            alt={trip.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800">{trip.name}</h5>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{trip.rating}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-lg font-bold text-emerald-600">
                                ₹{calculatePrice(trip.basePrice).toLocaleString()}
                              </span>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};