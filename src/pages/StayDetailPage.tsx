import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Star, 
  Users, 
  Wifi, 
  Car, 
  ChevronLeft, 
  Calendar,
  CreditCard,
  Check,
  Phone,
  Mail,
  Clock,
  Shield,
  Heart,
  Share2,
  Camera,
  Waves,
  Sun,
  Utensils,
  Dumbbell,
  Sparkles,
  Home,
  Award,
  Timer,
  ChevronRight,
  PlayCircle,
  ImageIcon,
  Palette
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/layout/PageTransition';
import { LocalScene } from '../components/3d/LocalScene';

interface StayDetail {
  id: string;
  name: string;
  location: string;
  type: string;
  capacity: number;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  description: string;
  features: string[];
  rooms: number;
  bathrooms: number;
  checkIn: string;
  checkOut: string;
  policies: string[];
  contact: {
    phone: string;
    email: string;
  };
}

// Mock data for individual stay
const mockStayDetail: StayDetail = {
  id: '1',
  name: 'Mountain View Resort',
  location: 'Coorg, Karnataka',
  type: 'Resort',
  capacity: 8,
  price: 8500,
  rating: 4.8,
  reviewCount: 142,
  images: [
    'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
    'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'
  ],
  amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa', 'Parking', 'Room Service', 'Gym', 'Garden'],
  description: 'Experience luxury amidst nature at our Mountain View Resort in Coorg. Nestled in the lush hills of Karnataka, this resort offers panoramic views of misty mountains and coffee plantations. Perfect for couples, families, and groups seeking a tranquil escape with world-class amenities.',
  features: [
    'Panoramic Mountain Views',
    'Swimming Pool with Infinity Edge', 
    'Full-service Spa',
    'Multi-cuisine Restaurant',
    'Coffee Plantation Tours',
    'Nature Walks & Bird Watching',
    'Bonfire Evenings',
    'Cultural Performances'
  ],
  rooms: 4,
  bathrooms: 3,
  checkIn: '2:00 PM',
  checkOut: '11:00 AM',
  policies: [
    'Free cancellation up to 24 hours before check-in',
    'Pets allowed with prior approval',
    'No smoking inside rooms',
    'Valid ID required at check-in',
    'Extra guest charges apply for more than 4 guests'
  ],
  contact: {
    phone: '+91 9902937730',
    email: 'bookings@mountainviewresort.com'
  }
};

const amenityIcons: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string, bgColor: string }> = {
  'WiFi': { icon: Wifi, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  'Parking': { icon: Car, color: 'text-green-500', bgColor: 'bg-green-50' },
  'Restaurant': { icon: Utensils, color: 'text-orange-500', bgColor: 'bg-orange-50' },
  'Pool': { icon: Waves, color: 'text-cyan-500', bgColor: 'bg-cyan-50' },
  'Spa': { icon: Star, color: 'text-pink-500', bgColor: 'bg-pink-50' },
  'Room Service': { icon: Clock, color: 'text-purple-500', bgColor: 'bg-purple-50' },
  'Gym': { icon: Dumbbell, color: 'text-red-500', bgColor: 'bg-red-50' },
  'Garden': { icon: Home, color: 'text-emerald-500', bgColor: 'bg-emerald-50' }
};

export const StayDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [stay, setStay] = useState<StayDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    // Simulate loading stay details
    setLoading(true);
    setTimeout(() => {
      setStay(mockStayDetail);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-stone-gray pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-96 bg-gray-200 rounded-2xl mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!stay) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-stone-gray pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Stay not found</h2>
            <Link to="/stays">
              <Button>Back to Stays</Button>
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * stay.price : 0;
  };

  const nights = calculateTotal() / (stay.price || 1);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-16 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-10 right-10 opacity-30">
          <LocalScene variant="fireflies" size={120} />
        </div>
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full opacity-20 blur-xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Back Button */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/stays">
              <Button variant="secondary" className="flex items-center bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <ChevronLeft className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-gray-700 font-medium">Back to Stays</span>
              </Button>
            </Link>
          </motion.div>

          {/* Hero Section with Enhanced Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div className="mb-4 lg:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-lg">
                      {stay.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-600">Premium</span>
                    </div>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                    {stay.name}
                  </h1>
                  <div className="flex items-center gap-6 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                      <span className="font-medium">{stay.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-green-500" />
                      <span>Up to {stay.capacity} guests</span>
                    </div>
                    <div className="flex items-center">
                      <Home className="w-5 h-5 mr-2 text-purple-500" />
                      <span>{stay.rooms} rooms • {stay.bathrooms} baths</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-2" />
                      <span className="font-bold text-xl text-gray-800">{stay.rating}</span>
                      <span className="text-gray-600 ml-2">({stay.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="secondary" className="bg-white/80 backdrop-blur border border-gray-200 hover:bg-white">
                      <Share2 className="w-4 h-4 mr-2 text-blue-500" />
                      Share
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/80 backdrop-blur border border-gray-200 hover:bg-white">
                      <Heart className="w-4 h-4 mr-2 text-red-500" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stay Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Enhanced Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                      <Camera className="w-6 h-6 mr-3 text-blue-500" />
                      Photo Gallery
                    </h3>
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                      <ImageIcon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">
                        {selectedImage + 1} of {stay.images.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden mb-6 group">
                    <img
                      src={stay.images[selectedImage]}
                      alt={stay.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center justify-between">
                        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full">
                          <span className="text-sm font-semibold text-gray-800">
                            {stay.name} - Gallery
                          </span>
                        </div>
                        <Button size="sm" className="bg-white/20 backdrop-blur hover:bg-white/30 border border-white/30">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Virtual Tour
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    {stay.images.map((image, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative h-20 lg:h-24 rounded-xl overflow-hidden transition-all duration-300 ${
                          selectedImage === index 
                            ? 'ring-4 ring-blue-500 ring-offset-2 scale-105 shadow-xl' 
                            : 'hover:scale-105 hover:shadow-lg ring-2 ring-gray-200'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img
                          src={image}
                          alt={`${stay.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {selectedImage === index && (
                          <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
                            <Check className="w-6 h-6 text-white font-bold drop-shadow-lg" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Description Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Sparkles className="w-6 h-6 mr-3 text-purple-500" />
                    About This Place
                  </h3>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      {stay.description}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Features Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Award className="w-6 h-6 mr-3 text-yellow-500" />
                    What Makes This Special
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stay.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                          <Check className="w-5 h-5 text-white font-bold" />
                        </div>
                        <span className="text-gray-800 font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Amenities Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Palette className="w-6 h-6 mr-3 text-indigo-500" />
                    Amenities & Services
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stay.amenities.map((amenity, index) => {
                      const amenityData = amenityIcons[amenity] || { icon: Check, color: 'text-gray-500', bgColor: 'bg-gray-50' };
                      const IconComponent = amenityData.icon;
                      return (
                        <motion.div
                          key={index}
                          className={`flex flex-col items-center p-6 ${amenityData.bgColor} rounded-2xl border border-white/50 hover:shadow-xl transition-all duration-300 group cursor-pointer`}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className={`w-12 h-12 ${amenityData.bgColor} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <IconComponent className={`w-6 h-6 ${amenityData.color}`} />
                          </div>
                          <span className="text-gray-800 font-medium text-sm text-center">{amenity}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Policies Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-blue-500" />
                    House Rules & Policies
                  </h3>
                  
                  {/* Check-in/Check-out Times */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Timer className="w-8 h-8 text-blue-500 mr-4" />
                        <div>
                          <h4 className="font-semibold text-gray-800">Check-in Time</h4>
                          <p className="text-blue-600 font-medium">{stay.checkIn}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                      <div className="flex items-center">
                        <Clock className="w-8 h-8 text-orange-500 mr-4" />
                        <div>
                          <h4 className="font-semibold text-gray-800">Check-out Time</h4>
                          <p className="text-orange-600 font-medium">{stay.checkOut}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Policies */}
                  <div className="space-y-3">
                    {stay.policies.map((policy, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors duration-300"
                        whileHover={{ x: 5 }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-md">
                          <Check className="w-4 h-4 text-white font-bold" />
                        </div>
                        <span className="text-gray-800 font-medium">{policy}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Enhanced Booking Card */}
            <div className="lg:col-span-1">
              <motion.div
                className="sticky top-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500">
                  {/* Enhanced Price Display */}
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white mb-6 shadow-lg">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold">₹{stay.price.toLocaleString()}</span>
                        <span className="text-blue-100 ml-2 text-lg">/night</span>
                      </div>
                      <div className="flex items-center justify-center mt-2">
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="text-blue-100 text-sm">Best Price Guaranteed</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Booking Form */}
                  <div className="space-y-6 mb-8">
                    {/* Date Selection */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                        Select Your Dates
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-1 text-green-500" />
                            Check-in
                          </label>
                          <input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-1 text-orange-500" />
                            Check-out
                          </label>
                          <input
                            type="date"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            min={checkInDate || new Date().toISOString().split('T')[0]}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guest Selection */}
                    <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        <Users className="w-5 h-5 inline mr-2 text-purple-500" />
                        Number of Guests
                      </label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                      >
                        {Array.from({ length: stay.capacity }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num} guest{num > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Enhanced Price Breakdown */}
                  {checkInDate && checkOutDate && calculateTotal() > 0 && (
                    <motion.div
                      className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-green-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-green-500" />
                        Price Breakdown
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            ₹{stay.price.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}
                          </span>
                          <span className="font-medium text-gray-800">₹{calculateTotal().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-green-600">
                          <span>Service fee discount</span>
                          <span>-₹0</span>
                        </div>
                        <div className="border-t border-green-200 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-800">Total</span>
                            <span className="text-2xl font-bold text-green-600">₹{calculateTotal().toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Enhanced Book Button */}
                  <Link 
                    to={`/payment?stayId=${stay.id}&checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}&total=${calculateTotal()}`}
                    className={`block w-full ${
                      !checkInDate || !checkOutDate || calculateTotal() <= 0
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }`}
                  >
                    <Button 
                      className={`w-full py-4 text-lg font-bold rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl ${
                        calculateTotal() > 0 
                          ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                      disabled={!checkInDate || !checkOutDate || calculateTotal() <= 0}
                    >
                      {calculateTotal() > 0 ? (
                        <div className="flex items-center justify-center">
                          <CreditCard className="w-6 h-6 mr-3" />
                          Book Now - ₹{calculateTotal().toLocaleString()}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Calendar className="w-6 h-6 mr-3" />
                          Select Your Dates
                        </div>
                      )}
                    </Button>
                  </Link>

                  {/* Free Cancellation Notice */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center text-blue-700">
                      <Shield className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Free cancellation up to 24 hours before check-in</span>
                    </div>
                  </div>

                  {/* Enhanced Contact Info */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Sun className="w-5 h-5 mr-2 text-yellow-500" />
                      Contact Property
                    </h4>
                    <div className="space-y-3">
                      <motion.div 
                        className="flex items-center p-3 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Call Now</span>
                          <p className="font-medium text-gray-800">{stay.contact.phone}</p>
                        </div>
                      </motion.div>
                      <motion.div 
                        className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Send Email</span>
                          <p className="font-medium text-gray-800 text-sm">{stay.contact.email}</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StayDetailPage;
