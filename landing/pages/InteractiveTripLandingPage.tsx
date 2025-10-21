import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Calendar, Star, Heart, Share2, 
  Phone, Gift, TrendingUp, Eye, ThumbsUp, 
  BookOpen, Camera, Trophy, Zap
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDbOrThrow } from '../../src/firebase';

// Import main TripLandingPage component
import TripLandingPageMain from '../../src/pages/TripLandingPage';

// Import Interactive Components
import { InteractiveHomepage } from '../components/InteractiveHomepage';
import { useAdventurePoints } from '../components/interactive';

interface Trip {
  id: string;
  slug: string;
  name: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  duration: string;
  location: string;
  rating: number;
  image: string;
  spotsAvailable: number;
  spotsLeft: number;
  nextDeparture: string;
  tags: string[];
  highlights: string[];
}

// Enhanced Interactive Landing Page
const InteractiveTripLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showInteractiveMode, setShowInteractiveMode] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { awardPoints } = useAdventurePoints();

  // Activity tracking state
  const [userActivity, setUserActivity] = useState({
    timeSpent: 0,
    interactions: 0,
    scrollDepth: 0,
    engagementLevel: 'low' as 'low' | 'medium' | 'high'
  });

  // Fetch trips and current trip
  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getDbOrThrow();
        const tripsRef = collection(db, 'trips');
        
        // Get all trips for the interactive mode
        const allTripsSnapshot = await getDocs(tripsRef);
        const tripsData = allTripsSnapshot.docs.map(doc => ({
          id: doc.id,
          slug: doc.data().slug,
          name: doc.data().name,
          title: doc.data().name,
          subtitle: doc.data().subtitle || doc.data().location,
          price: doc.data().price,
          originalPrice: doc.data().originalPrice,
          duration: doc.data().duration,
          location: doc.data().location,
          rating: doc.data().rating || 4.5,
          image: doc.data().images?.[0] || '/default-trip.jpg',
          spotsAvailable: doc.data().spotsAvailable || 0,
          spotsLeft: doc.data().spotsAvailable || 0,
          nextDeparture: doc.data().batchDates?.[0] || '2024-12-01',
          tags: doc.data().tags || [],
          highlights: doc.data().highlights || []
        })) as Trip[];

        setAllTrips(tripsData);

        // Get current trip if slug provided
        if (slug) {
          const q = query(tripsRef, where('slug', '==', slug));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            const trip = {
              id: doc.id,
              slug: data.slug,
              name: data.name,
              title: data.name,
              subtitle: data.location,
              price: data.price,
              duration: data.duration,
              location: data.location,
              rating: data.rating || 4.5,
              image: data.images?.[0] || '/default-trip.jpg',
              spotsAvailable: data.spotsAvailable || 0,
              spotsLeft: data.spotsAvailable || 0,
              nextDeparture: data.batchDates?.[0] || '2024-12-01',
              tags: data.tags || [],
              highlights: data.highlights || []
            };
            setCurrentTrip(trip);
          }
        } else {
          // No slug provided - show interactive homepage mode
          setShowInteractiveMode(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trips:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Track user activity
  useEffect(() => {
    const startTime = Date.now();
    let interactionCount = 0;

    const updateActivity = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      const engagementScore = interactionCount + scrollPercent / 20 + timeSpent / 30;
      const engagementLevel = engagementScore > 15 ? 'high' : engagementScore > 8 ? 'medium' : 'low';

      setUserActivity({
        timeSpent,
        interactions: interactionCount,
        scrollDepth: scrollPercent,
        engagementLevel
      });
    };

    const handleInteraction = () => {
      interactionCount++;
      awardPoints('user_interaction', 5);
      updateActivity();
    };

    const handleScroll = () => {
      updateActivity();
    };

    // Add event listeners
    window.addEventListener('click', handleInteraction);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleInteraction);

    const activityInterval = setInterval(updateActivity, 2000);

    // Award points for different engagement milestones
    const engagementTimer = setTimeout(() => {
      if (userActivity.engagementLevel === 'high') {
        awardPoints('high_engagement', 50);
      }
    }, 30000);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleInteraction);
      clearInterval(activityInterval);
      clearTimeout(engagementTimer);
    };
  }, [awardPoints, userActivity.engagementLevel]);

  const handleTripInterest = (tripId: string) => {
    awardPoints('trip_interest', 20);
    console.log('User showed interest in trip:', tripId);
  };

  const handleLeadCapture = (data: Record<string, unknown>) => {
    awardPoints('lead_capture', 100);
    console.log('Lead captured:', data);
  };

  const toggleMode = () => {
    setShowInteractiveMode(!showInteractiveMode);
    awardPoints('mode_switch', 15);
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
    <div className="min-h-screen relative">
      {/* Mode Toggle Button */}
      <motion.button
        onClick={toggleMode}
        className="fixed top-4 right-20 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {showInteractiveMode ? (
          <>
            <BookOpen className="w-4 h-4" />
            Trip Details
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Interactive Mode
          </>
        )}
      </motion.button>

      {/* Engagement Level Indicator */}
      <motion.div
        className="fixed top-16 right-20 z-40 bg-white/90 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg text-sm font-medium"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            userActivity.engagementLevel === 'high' ? 'bg-green-500' :
            userActivity.engagementLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="capitalize">{userActivity.engagementLevel} Engagement</span>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {userActivity.interactions} interactions • {userActivity.timeSpent}s
        </div>
      </motion.div>

      {/* Conditional Rendering */}
      <AnimatePresence mode="wait">
        {showInteractiveMode && allTrips.length > 0 ? (
          <motion.div
            key="interactive"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <InteractiveHomepage 
              trips={allTrips}
              onTripInterest={handleTripInterest}
              onLeadCapture={handleLeadCapture}
            />
          </motion.div>
        ) : (
          <motion.div
            key="trip-details"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <TripLandingPageMain />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Activity Tracking Overlay */}
      {userActivity.engagementLevel === 'high' && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-4 left-4 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-xl shadow-2xl max-w-xs"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6" />
            <div>
              <div className="font-bold">High Engagement!</div>
              <div className="text-sm opacity-90">You're really exploring!</div>
            </div>
          </div>
          <div className="text-xs opacity-75">
            Keep exploring to unlock more achievements and get exclusive offers!
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveTripLandingPage;