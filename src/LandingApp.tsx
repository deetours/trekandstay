import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  ArrowRight, 
  Phone, 
  Mail,
  Mountain,
  Camera,
  Heart,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronDown,
  Award,
  Shield,
  Calendar,
  MessageCircle,
  Timer,
  TrendingUp,
  CheckCircle,
  Quote
} from 'lucide-react';
import TripLandingPage from './pages/TripLandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LeadCaptureModal } from './components/modals/LeadCaptureModal';
import { useLeadCaptureStore } from './store/leadCaptureStore';
import { usePopupTriggers } from './hooks/usePopupTriggers';
import { analytics } from './services/analyticsTracker';
import './index.css';
import HeroSVGs from './components/ui/HeroSVGs';

// Social Media Icons (using lucide-react alternatives)
const Instagram = MessageCircle;
const Facebook = MessageCircle; 
const Youtube = Play;

interface RecentBooking {
  name: string;
  location: string;
  trip: string;
  timeAgo: number;
}

interface Trip {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  duration: string;
  location: string;
  rating: number;
  image: string;
  highlights: string[];
  difficulty: string;
  spotsLeft: number;
  nextDeparture: string;
  originalPrice?: number;
}

// Stunning Interactive Homepage Component
const StunningHomepage = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [visitorCount, setVisitorCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  
  const { loadTripsForSelection } = useLeadCaptureStore();
  const { triggerPopup } = usePopupTriggers();

  const trips: Trip[] = useMemo(() => [
    {
      id: 1,
      slug: 'adventure-maharashtra-5days-trek',
      title: 'Adventure Maharashtra',
      subtitle: 'Ultimate 5-Day Adventure',
      price: 9500,
      duration: '5 Days',
      location: 'Maharashtra',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      highlights: ['Waterfall Rappelling', 'Cave Exploration', 'Mountain Trekking'],
      difficulty: 'Moderate',
      spotsLeft: 3,
      nextDeparture: '2024-09-15',
      originalPrice: 12000
    },
    {
      id: 2,
      slug: 'kaalu-waterfall-harishchandragad-sandhan-valley-5d',
      title: 'Kaalu Waterfall Adventure',
      subtitle: 'Harishchandragad & Sandhan Valley',
      price: 8999,
      duration: '5 Days',
      location: 'Maharashtra',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
      highlights: ['Waterfall Trek', 'Valley Exploration', 'Night Camping'],
      difficulty: 'Challenging',
      spotsLeft: 7,
      nextDeparture: '2024-09-20',
      originalPrice: 11000
    },
    {
      id: 3,
      slug: 'dudhsagar-trek-3d',
      title: 'Dudhsagar Falls Trek',
      subtitle: 'Goa\'s Majestic Waterfall',
      price: 4500,
      duration: '3 Days',
      location: 'Goa',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=800&h=600&fit=crop',
      highlights: ['Waterfall Swimming', 'Railway Trek', 'Wildlife Spotting'],
      difficulty: 'Easy',
      spotsLeft: 12,
      nextDeparture: '2024-09-10',
      originalPrice: 5500
    },
    {
      id: 4,
      slug: 'kedarnath-7d',
      title: 'Kedarnath Pilgrimage',
      subtitle: 'Spiritual Mountain Journey',
      price: 14999,
      duration: '7 Days',
      location: 'Uttarakhand',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop',
      highlights: ['Sacred Temple', 'Mountain Views', 'Spiritual Experience'],
      difficulty: 'Challenging',
      spotsLeft: 5,
      nextDeparture: '2024-09-25',
      originalPrice: 18000
    },
    {
      id: 5,
      slug: 'kumbhe-waterfall-rappelling-5d',
      title: 'Kumbhe Waterfall Rappelling',
      subtitle: 'Extreme Adventure Experience',
      price: 9500,
      duration: '5 Days',
      location: 'Maharashtra',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=800&h=600&fit=crop',
      highlights: ['Waterfall Rappelling', 'Rock Climbing', 'Adventure Sports'],
      difficulty: 'Expert',
      spotsLeft: 2,
      nextDeparture: '2024-09-30',
      originalPrice: 12500
    },
    {
      id: 6,
      slug: 'maharashtra-waterfall-edition-4d',
      title: 'Maharashtra Waterfall Edition',
      subtitle: 'Multi-Waterfall Adventure',
      price: 8500,
      duration: '4 Days',
      location: 'Maharashtra',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      highlights: ['Multiple Waterfalls', 'Photography', 'Nature Immersion'],
      difficulty: 'Moderate',
      spotsLeft: 8,
      nextDeparture: '2024-09-18',
      originalPrice: 10000
    }
  ], []);

  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      location: 'Mumbai',
      rating: 5,
      text: 'An absolutely life-changing experience! The waterfall rappelling was thrilling beyond words.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop',
      trip: 'Maharashtra Adventure'
    },
    {
      id: 2,
      name: 'Rahul Verma',
      location: 'Delhi',
      rating: 5,
      text: 'Perfect organization, amazing guides, and memories that will last forever!',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      trip: 'Kedarnath Pilgrimage'
    },
    {
      id: 3,
      name: 'Sneha Patel',
      location: 'Pune',
      rating: 5,
      text: 'Trek and Stay made my adventure dreams come true. Highly recommended!',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      trip: 'Dudhsagar Trek'
    }
  ];

  const stats = [
    { label: 'Happy Travelers', value: '2,500+', icon: Users },
    { label: 'Adventure Trips', value: '150+', icon: Mountain },
    { label: 'Safety Record', value: '100%', icon: Shield },
    { label: 'Years Experience', value: '8+', icon: Award }
  ];

  useEffect(() => {
    // Initialize lead capture store with trip data
    const tripPreferences = trips.map(trip => ({
      id: trip.id.toString(),
      name: trip.title,
      image: trip.image,
      price: trip.price,
      duration: trip.duration,
      difficulty: trip.difficulty,
      interested: false
    }));
    
    loadTripsForSelection(tripPreferences);
    
    // Simulate recent bookings for social proof
    const simulateBookings = () => {
      const names = ['Arjun', 'Priya', 'Raj', 'Sneha', 'Vikram', 'Kavya'];
      const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'];
      
      const booking = {
        name: names[Math.floor(Math.random() * names.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        trip: trips[Math.floor(Math.random() * trips.length)].title,
        timeAgo: Math.floor(Math.random() * 30) + 1
      };
      
      setRecentBookings(prev => [booking, ...prev.slice(0, 4)]);
    };
    
    // Initial booking
    simulateBookings();
    
    // Random new bookings
    const interval = setInterval(simulateBookings, 15000 + Math.random() * 10000);
    
    // Visitor counter
    const baseCount = 1847;
    setVisitorCount(baseCount + Math.floor(Math.random() * 50));
    
    return () => clearInterval(interval);
  }, [loadTripsForSelection, trips]);
  
  useEffect(() => {
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);
  
  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };
  
  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleGetStarted = () => {
    triggerPopup('cta_button', 'homepage');
  };
  
  const handleTripInterest = (tripId: number) => {
    // Find trip details
    const trip = trips.find(t => t.id === tripId);
    
    // Track gamification event: trip_view
    if (trip) {
      analytics.trackGamificationEvent('trip_view', {
        trip_id: trip.id.toString(),
        trip_title: trip.title,
        trip_slug: trip.slug,
        trip_price: trip.price
      }).catch(err => console.error('Failed to track trip view:', err));
    }
    
    // Track trip interest and potentially trigger popup
    console.log('Trip interest tracked for trip:', tripId);
    triggerPopup('trip_interest', 'homepage');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'challenging': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  const getUrgencyColor = (spotsLeft: number) => {
    if (spotsLeft <= 3) return 'text-red-600 bg-red-50';
    if (spotsLeft <= 7) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Enhanced Header with Glassmorphism */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="Trek and Stay Adventures" 
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-400 ring-offset-2 ring-offset-white/50"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Trek & Stay</h1>
                <p className="text-sm text-gray-600 font-medium">Adventures Await</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <motion.a 
                href="tel:9902937730" 
                className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-all duration-300 bg-white/50 px-3 py-2 rounded-lg backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">9902937730</span>
              </motion.a>
              
              <motion.button
                onClick={handleGetStarted}
                className="relative group bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Stunning Hero Section with Video Background */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop"
          >
            <source src="/videos/t&s.mp4" type="video/mp4" />
          </video>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
          
          {/* Animated Gradient Overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 via-transparent to-teal-600/30"
            animate={{
              background: [
                'linear-gradient(135deg, rgba(5, 150, 105, 0.3) 0%, transparent 50%, rgba(8, 145, 178, 0.3) 100%)',
                'linear-gradient(225deg, rgba(8, 145, 178, 0.3) 0%, transparent 50%, rgba(5, 150, 105, 0.3) 100%)',
                'linear-gradient(135deg, rgba(5, 150, 105, 0.3) 0%, transparent 50%, rgba(8, 145, 178, 0.3) 100%)'
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        {/* Video Controls */}
        <div className="absolute top-24 right-8 z-20 flex space-x-2">
          <motion.button
            onClick={handleVideoToggle}
            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isVideoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>
          
          <motion.button
            onClick={handleMuteToggle}
            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </motion.button>
        </div>
        
        {/* Hero Content */}
        <motion.div 
          className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{ y: y1, opacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.span 
              className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-full text-lg font-semibold mb-8 border border-white/20"
              whileHover={{ scale: 1.05 }}
            >
              🏔️ India's Premier Adventure Company
            </motion.span>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-none relative">
              <HeroSVGs className="absolute inset-0 z-0" />
              <motion.span 
                className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Trek & Stay
              </motion.span>
              <motion.span 
                className="block text-white relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Welcome to the Wilderness
              </motion.span>
            </h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Discover breathtaking landscapes, conquer majestic peaks, and create memories that last a lifetime with India's most trusted adventure travel company.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <motion.button
                onClick={handleGetStarted}
                className="group relative bg-gradient-to-r from-forest-green to-waterfall-blue text-white px-10 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-forest-green/30 transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-3">
                  <Sparkles className="w-6 h-6" />
                  <span>Start Your Adventure</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </motion.button>
              
              <motion.button
                className="group flex items-center space-x-3 text-white px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-6 h-6" />
                <span className="text-lg font-medium">Watch Stories</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Floating Elements */}
        <motion.div 
          className="absolute top-32 left-16 text-white/20 hidden lg:block"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mountain className="w-20 h-20" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-32 right-16 text-white/20 hidden lg:block"
          animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Camera className="w-16 h-16" />
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Scroll to explore</span>
            <ChevronDown className="w-6 h-6" />
          </div>
        </motion.div>
      </section>
      {/* Social Proof & Stats Section */}
      <motion.section 
        className="py-20 bg-white/95 backdrop-blur-md relative"
        style={{ y: y2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center group"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="relative mx-auto w-16 h-16 mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-forest-green to-waterfall-blue rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center w-full h-full">
                      <IconComponent className="w-8 h-8 text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* Recent Bookings Ticker */}
          {recentBookings.length > 0 && (
            <motion.div 
              className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-emerald-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Live Bookings</span>
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">{recentBookings[0]?.name}</span> from{' '}
                  <span className="text-emerald-600">{recentBookings[0]?.location}</span> just booked{' '}
                  <span className="font-medium">{recentBookings[0]?.trip}</span>
                  <span className="text-gray-500 text-sm ml-2">{recentBookings[0]?.timeAgo}m ago</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Enhanced Trips Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold mb-4">
              🌍 Handpicked Adventures
            </span>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Popular <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Adventures</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Embark on carefully curated journeys that blend thrill, beauty, and unforgettable moments across India's most spectacular destinations.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Trip Image */}
                <div className="relative overflow-hidden">
                  <img 
                    src={trip.image} 
                    alt={trip.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(trip.difficulty)}`}>
                      {trip.difficulty}
                    </span>
                    {trip.spotsLeft <= 5 && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(trip.spotsLeft)}`}>
                        {trip.spotsLeft} spots left!
                      </span>
                    )}
                  </div>
                  
                  {/* Rating */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold">{trip.rating}</span>
                    </div>
                  </div>
                  
                  {/* Discount Badge */}
                  {trip.originalPrice && trip.originalPrice > trip.price && (
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        SAVE {Math.round(((trip.originalPrice - trip.price) / trip.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}
                  
                  {/* Heart Icon */}
                  <motion.button
                    className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className="w-5 h-5" />
                  </motion.button>
                </div>
                
                {/* Trip Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">{trip.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{trip.duration}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                    {trip.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{trip.subtitle}</p>
                  
                  {/* Highlights */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {trip.highlights.slice(0, 2).map((highlight, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
                          {highlight}
                        </span>
                      ))}
                      {trip.highlights.length > 2 && (
                        <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium border">
                          +{trip.highlights.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Next Departure */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Next departure: {new Date(trip.nextDeparture).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  
                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-emerald-600">
                          {formatPrice(trip.price)}
                        </span>
                        {trip.originalPrice && trip.originalPrice > trip.price && (
                          <span className="text-lg text-gray-400 line-through">
                            {formatPrice(trip.originalPrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 text-sm">per person</span>
                    </div>
                    
                    <motion.a
                      href={`/land/${trip.slug}`}
                      onClick={() => handleTripInterest(trip.id)}
                      className="group bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 overflow-hidden relative"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative flex items-center space-x-2">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* View All Button */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.button
              onClick={handleGetStarted}
              className="group bg-white text-emerald-600 px-8 py-4 rounded-full text-lg font-semibold border-2 border-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center space-x-2">
                <span>Discover All Adventures</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Interactive Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-4">
              💬 Real Stories, Real Adventures
            </span>
            <h2 className="text-5xl font-bold text-white mb-6">
              What Our Adventurers Say
            </h2>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
              Don't just take our word for it. Here's what thousands of happy adventurers have to say about their experiences.
            </p>
          </motion.div>
          
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
              >
                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img 
                        src={testimonials[currentTestimonial].image}
                        alt={testimonials[currentTestimonial].name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                      />
                      <div className="absolute -top-2 -right-2 bg-emerald-400 rounded-full p-2">
                        <Quote className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start mb-4">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <blockquote className="text-xl text-white mb-6 leading-relaxed">
                      "{testimonials[currentTestimonial].text}"
                    </blockquote>
                    
                    <div className="text-white">
                      <div className="font-bold text-lg">{testimonials[currentTestimonial].name}</div>
                      <div className="text-emerald-200">{testimonials[currentTestimonial].location}</div>
                      <div className="text-sm text-emerald-100 mt-1">
                        Trip: {testimonials[currentTestimonial].trip}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative inline-block mb-8">
              <span className="text-6xl">🏦</span>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Ready for Your Next <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Adventure?</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join over <span className="font-bold text-emerald-600">{visitorCount.toLocaleString()}</span> adventurers who have discovered the thrill of exploring India's most beautiful destinations with us.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
              <motion.button
                onClick={handleGetStarted}
                className="group relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-3">
                  <Heart className="w-6 h-6" />
                  <span>Get Personalized Recommendations</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </motion.button>
              
              <motion.a
                href="tel:9902937730"
                className="group flex items-center space-x-3 text-emerald-600 px-8 py-4 rounded-full bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="w-6 h-6" />
                <span className="text-lg font-semibold">Speak to an Expert</span>
              </motion.a>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium">100% Safe</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium">Expert Guides</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Award className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium">Award Winning</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Timer className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium">Quick Response</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900/20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/logo.png" 
                  alt="Trek and Stay Adventures" 
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-400"
                />
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Trek & Stay
                  </h3>
                  <p className="text-gray-400">Adventures Await</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                India's premier adventure travel company, crafting unforgettable experiences across the most spectacular destinations. From mountain peaks to hidden valleys, we make your adventure dreams come true.
              </p>
              
              <div className="flex space-x-4">
                <motion.a 
                  href="#" 
                  className="p-3 bg-white/10 rounded-full hover:bg-emerald-600 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Instagram className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="p-3 bg-white/10 rounded-full hover:bg-emerald-600 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Facebook className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="p-3 bg-white/10 rounded-full hover:bg-emerald-600 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Youtube className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="https://wa.me/919902937730" 
                  className="p-3 bg-green-600 rounded-full hover:bg-green-700 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MessageCircle className="w-5 h-5" />
                </motion.a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-emerald-400">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">All Trips</a></li>
                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Safety Guidelines</a></li>
                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Reviews</a></li>
                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-emerald-400">Get in Touch</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <a href="tel:9902937730" className="text-gray-300 hover:text-emerald-400 transition-colors">
                    +91 99029 37730
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <a href="mailto:info@trekandstay.com" className="text-gray-300 hover:text-emerald-400 transition-colors">
                    info@trekandstay.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <a href="https://wa.me/919902937730" className="text-gray-300 hover:text-emerald-400 transition-colors">
                    WhatsApp Support
                  </a>
                </div>
              </div>
              
              <motion.button
                onClick={handleGetStarted}
                className="mt-6 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Plan My Adventure
              </motion.button>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Trek & Stay Adventures. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Cancellation Policy</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Lead Capture Modal Integration */}
      <LeadCaptureModal />
    </div>
  );
};

// Main App Component with Router
const LandingApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<StunningHomepage />} />
          <Route path="/land/:slug" element={<TripLandingPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default LandingApp;