import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  ArrowRight, 
  Phone, 
  Mail,
  X,
  Send,
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
  Zap,
  Calendar,
  DollarSign,
  MessageCircle,
  Timer,
  TrendingUp,
  CheckCircle,
  Quote
} from 'lucide-react';
import TripLandingPage from './pages/TripLandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LeadCaptureModal } from './components/modals';
import { useLeadCaptureStore } from './store';
import { usePopupTriggers } from './hooks';
import './index.css';
import HeroSVGs from './components/ui/HeroSVGs';

// Social Media Icons (using lucide-react alternatives)
const Instagram = MessageCircle;
const Facebook = MessageCircle; 
const Youtube = Play;

// Stunning Interactive Homepage Component
const StunningHomepage = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [visitorCount, setVisitorCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  
  const { openPopup, loadTripsForSelection } = useLeadCaptureStore();
  const { triggerPopup } = usePopupTriggers();

  const trips = [
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
  ];

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
  }, [loadTripsForSelection]);
  
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
    // Track trip interest and potentially trigger popup
    triggerPopup('trip_interest', 'homepage');
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will now be handled by the lead capture modal
    triggerPopup('manual_form', 'homepage');
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
                className="group relative bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 overflow-hidden"
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

      {/* Lead Capture Modal */}
      <LeadCaptureModal />
    </div>
  );
};

// Main Landing App Component
const LandingApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<StunningHomepage />} />
        <Route path="/land/:slug" element={<TripLandingPage />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default LandingApp;