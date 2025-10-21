import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Users, 
  ArrowRight, 
  Phone, 
  Mountain,
  Camera,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronDown,
  Award,
  Shield
} from 'lucide-react';
import TripLandingPage from './pages/TripLandingPage';
import { InteractiveHomepage } from './components/InteractiveHomepage';
import { collection, getDocs } from 'firebase/firestore';
import { getDbOrThrow } from '../src/firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LeadCaptureModal } from './components/modals';
import { useLeadCaptureStore } from './store';
import { usePopupTriggers } from './hooks';
import './index.css';

// Enhanced Interactive Components - Phase 1 & 2
import HeroSVGs from '../src/components/ui/HeroSVGs';
import WeatherWidget from '../src/components/ui/WeatherWidget';
import PricingCalculator from '../src/components/ui/PricingCalculator';
import InteractiveCalendar from '../src/components/ui/InteractiveCalendar';
import PaymentSelector from '../src/components/ui/PaymentSelector';
import LiveNotifications from '../src/components/ui/LiveNotifications';
import ReviewCarousel from '../src/components/ui/ReviewCarousel';
import { AdventurePointsSystem } from './components/gamification/AdventurePointsSystem';
import { UserEngagementAnalytics } from './components/gamification/UserEngagementAnalytics';

// Social Media Icons (using lucide-react alternatives)
// const Instagram = MessageCircle;
// const Facebook = MessageCircle; 
// const Youtube = Play;

// Enhanced Interactive Homepage Component with Gamification and Trip Challenges
const StunningHomepage = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showInteractiveMode, setShowInteractiveMode] = useState(false);
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // List of video sources (fallback to main video if others don't exist)
  const videoSources = [
    { src: '/videos/t&s.mp4', type: 'video/mp4' },
    { src: '/videos/t&s.mp4', type: 'video/mp4' },
    { src: '/videos/t&s.mp4', type: 'video/mp4' },
    { src: '/videos/t&s.mp4', type: 'video/mp4' }
  ];
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  
  const { loadTripsForSelection, openPopup } = useLeadCaptureStore();
  const { triggerPopup } = usePopupTriggers();

  const trips = useMemo(() => [
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



  const stats = useMemo(() => [
    { label: 'Happy Travelers', value: '2,500+', icon: Users },
    { label: 'Adventure Trips', value: '150+', icon: Mountain },
    { label: 'Safety Record', value: '100%', icon: Shield },
    { label: 'Years Experience', value: '8+', icon: Award }
  ], []);

  // Fetch real trips from Firestore
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const db = getDbOrThrow();
        const tripsRef = collection(db, 'trips');
        const querySnapshot = await getDocs(tripsRef);
        
        const tripsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          slug: doc.data().slug,
          title: doc.data().name,
          subtitle: doc.data().subtitle || doc.data().location,
          price: doc.data().price,
          originalPrice: doc.data().originalPrice,
          duration: doc.data().duration,
          location: doc.data().location,
          rating: doc.data().rating || 4.5,
          image: doc.data().images?.[0] || '/default-trip.jpg',
          spotsLeft: doc.data().spotsAvailable || 0,
          nextDeparture: doc.data().batchDates?.[0] || '2024-12-01',
          tags: doc.data().tags || [],
          highlights: doc.data().highlights || [],
          difficulty: doc.data().difficulty || 'Moderate'
        }));

        setAllTrips([...trips, ...tripsData]); // Combine hardcoded and Firestore trips
        setLoading(false);
        
        // Initialize lead capture store with trip data
        const tripPreferences = [...trips, ...tripsData].map(trip => ({
          id: trip.id.toString(),
          name: trip.title,
          image: trip.image,
          price: trip.price,
          duration: trip.duration,
          difficulty: trip.difficulty,
          interested: false
        }));
        
        loadTripsForSelection(tripPreferences);
      } catch (error) {
        console.error('Error fetching trips:', error);
        setAllTrips(trips); // Fallback to hardcoded trips
        setLoading(false);
      }
    };

    fetchTrips();
  }, [loadTripsForSelection, trips]);
  
  useEffect(() => {
    triggerPopup('page_load', 'homepage');
  }, [triggerPopup]);

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
    // Open lead capture modal directly
    openPopup('hero_cta_button', 'homepage');
  };

  const handleAboutUs = () => {
    // Navigate to about page
    window.location.href = '/about';
  };

  const handleTripInteraction = (tripId: string) => {
    console.log('User interacted with trip:', tripId);
  };

  const handleLeadCapture = (data: Record<string, unknown>) => {
    console.log('Lead captured from interactive mode:', data);
    openPopup('interactive_lead_capture', 'homepage');
  };

  const toggleInteractiveMode = () => {
    setShowInteractiveMode(!showInteractiveMode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Adventure Points System - Always visible for gamification */}
      <AdventurePointsSystem />
      
      {/* User Engagement Analytics - Bottom left to avoid overlap with header */}
      <UserEngagementAnalytics className="fixed bottom-4 left-4 z-40" />

      {/* Interactive Mode Toggle Button */}
      <motion.button
        onClick={toggleInteractiveMode}
        className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Sparkles className="w-5 h-5" />
        <span>{showInteractiveMode ? '🎬 Show Hero' : '🎮 Interactive Mode'}</span>
        {!showInteractiveMode && (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-3 h-3 bg-yellow-400 rounded-full"
          />
        )}
      </motion.button>

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
              <a href="/" className="relative">
                <img 
                  src="/logo.png" 
                  alt="Trek and Stay Adventures" 
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-400 ring-offset-2 ring-offset-white/50"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </a>
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
                  <span>Start Adventure</span>
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
            loop={false}
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop"
            onEnded={() => {
              // Move to next video when current one ends
              setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
            }}
          >
            <source src={videoSources[currentVideoIndex].src} type={videoSources[currentVideoIndex].type} />
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
              className="text-xl md:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Discover breathtaking landscapes, conquer majestic peaks, and create memories that last a lifetime with India's most trusted adventure travel company.
            </motion.p>

            {/* Interactive Mode Promotion */}
            {!showInteractiveMode && (
              <motion.div
                className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20 max-w-2xl mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                  <h3 className="text-xl font-bold text-white">🎮 Try Interactive Mode!</h3>
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </div>
                <p className="text-white/90 text-lg mb-4">
                  ✨ Explore trips, earn points, unlock achievements & compete with fellow adventurers!
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-white/80">
                  <span>❤️ Like trips: +15 pts</span>
                  <span>📤 Share trips: +25 pts</span>
                  <span>🏆 Achievements: Bonus rewards</span>
                </div>
              </motion.div>
            )}
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
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
                onClick={toggleInteractiveMode}
                className="group flex items-center space-x-3 text-white px-8 py-4 rounded-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-md border border-white/20 hover:from-purple-600/90 hover:to-pink-600/90 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-6 h-6" />
                <span className="text-lg font-medium">
                  {showInteractiveMode ? 'Show Hero' : 'Interactive Mode'}
                </span>
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

      {/* Interactive Widgets Section - Phase 1 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Plan Your Perfect Adventure
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get real-time weather updates, pricing calculations, and interactive trip planning tools
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Weather Widget */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <WeatherWidget className="h-full" />
            </motion.div>

            {/* Interactive Calendar */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <InteractiveCalendar className="h-full" />
            </motion.div>
          </div>

          {/* Pricing Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <PricingCalculator className="mb-16" />
          </motion.div>
        </div>
      </section>

      {/* Enhanced Payment & Reviews Section - Phase 2 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Seamless Booking Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Secure payments, real-time notifications, and authentic reviews from fellow adventurers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Payment Selector */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <PaymentSelector 
                amount={8999} 
                onPaymentSelect={(method) => console.log('Payment method selected:', method)}
                className="h-full"
              />
            </motion.div>

            {/* Review Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <ReviewCarousel className="h-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section with Enhanced Animations */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.div
                    className="text-4xl md:text-5xl font-bold text-white mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-emerald-100 font-medium">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Interactive Trip Cards Section - Always visible with interactive elements */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              🎮 Test Your Adventure Knowledge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Interact with trips, earn points, unlock achievements and discover your perfect adventure!
            </p>
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white inline-block">
              <h3 className="text-2xl font-bold mb-4">🏆 Interactive Challenges Active!</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="font-bold">❤️ Like Trips</div>
                  <div>Earn 15 points each</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="font-bold">📤 Share Trips</div>
                  <div>Earn 25 points each</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="font-bold">📖 View Details</div>
                  <div>Earn 20 points each</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="font-bold">🎯 High Engagement</div>
                  <div>Bonus rewards!</div>
                </div>
              </div>
            </div>
            
            {/* Trip Priority Legend */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white">
              <h4 className="text-lg font-bold mb-3">📅 Trip Priority Order</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="bg-red-500/30 rounded p-2 border border-red-400">
                  <div className="font-bold">🔥 URGENT</div>
                  <div>Closing soon!</div>
                </div>
                <div className="bg-orange-500/30 rounded p-2 border border-orange-400">
                  <div className="font-bold">⏰ STARTING SOON</div>
                  <div>Within 7 days</div>
                </div>
                <div className="bg-green-500/30 rounded p-2 border border-green-400">
                  <div className="font-bold">📅 UPCOMING</div>
                  <div>Within 30 days</div>
                </div>
                <div className="bg-blue-500/30 rounded p-2 border border-blue-400">
                  <div className="font-bold">🗓️ FUTURE</div>
                  <div>Plan ahead</div>
                </div>
                <div className="bg-gray-500/30 rounded p-2 border border-gray-400">
                  <div className="font-bold">✅ COMPLETED</div>
                  <div>Past trips</div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <InteractiveHomepage 
            trips={allTrips}
            onTripInterest={handleTripInteraction}
            onLeadCapture={handleLeadCapture}
          />
        </div>
      </section>

      {/* Live Notifications Component */}
      <LiveNotifications onNotificationAction={(id, action) => console.log('Notification action:', id, action)} />

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