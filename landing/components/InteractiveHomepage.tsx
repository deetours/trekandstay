import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Calendar, Star, Heart, Share2, 
  Phone, Gift, TrendingUp,
  Eye, ThumbsUp, BookOpen, Camera, Trophy
} from 'lucide-react';

interface Trip {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  duration: string;
  location: string;
  rating: number;
  image: string;
  spotsLeft: number;
  nextDeparture: string;
}

interface InteractiveHomepageProps {
  trips: Trip[];
  onTripInterest: (tripId: string) => void;
  onLeadCapture: (data: Record<string, unknown>) => void;
}

// Real-time user activity tracker
const useUserActivity = () => {
  const [activity, setActivity] = useState({
    mouseMovements: 0,
    clicks: 0,
    scrollDepth: 0,
    timeSpent: 0,
    interestSignals: 0,
    engagementLevel: 'low' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    const startTime = Date.now();
    let mouseMoveCount = 0;
    let clickCount = 0;

    const handleMouseMove = () => {
      mouseMoveCount++;
      setActivity(prev => ({ ...prev, mouseMovements: mouseMoveCount }));
    };

    const handleClick = () => {
      clickCount++;
      setActivity(prev => ({ 
        ...prev, 
        clicks: clickCount,
        interestSignals: prev.interestSignals + 1
      }));
    };

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
      
      setActivity(prev => ({ ...prev, scrollDepth: scrollPercent }));
    };

    const updateTime = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      setActivity(prev => {
        const engagementScore = prev.clicks + prev.scrollDepth / 20 + timeSpent / 30;
        const engagementLevel = engagementScore > 10 ? 'high' : engagementScore > 5 ? 'medium' : 'low';
        
        return { 
          ...prev, 
          timeSpent,
          engagementLevel 
        };
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);
    
    const interval = setInterval(updateTime, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return activity;
};

export const InteractiveHomepage: React.FC<InteractiveHomepageProps> = ({
  trips,
  onTripInterest,
  onLeadCapture
}) => {
  const activity = useUserActivity();
  const [hoveredTrip, setHoveredTrip] = useState<string | null>(null);
  const [likedTrips, setLikedTrips] = useState<Set<string>>(new Set());
  const [sharedTrips, setSharedTrips] = useState<Set<string>>(new Set());
  const [viewedTrips, setViewedTrips] = useState<Set<string>>(new Set());
  const [showEngagementRewards, setShowEngagementRewards] = useState(false);
  const [recentViewers, setRecentViewers] = useState(42);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const tripRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Sort trips by date priority: upcoming -> future -> completed
  const sortTripsByDatePriority = (trips: Trip[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
    
    return trips.sort((a, b) => {
      const dateA = new Date(a.nextDeparture);
      const dateB = new Date(b.nextDeparture);
      
      // Reset to start of day for comparison
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);
      
      const daysDiffA = Math.ceil((dateA.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const daysDiffB = Math.ceil((dateB.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Categorize trips
      const getCategoryPriority = (daysDiff: number) => {
        if (daysDiff < 0) return 3; // Past trips (completed)
        if (daysDiff <= 7) return 0; // Urgent (within 7 days)
        if (daysDiff <= 30) return 1; // Soon (within 30 days)
        return 2; // Future (more than 30 days)
      };
      
      const priorityA = getCategoryPriority(daysDiffA);
      const priorityB = getCategoryPriority(daysDiffB);
      
      // First sort by priority category
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Within same category, sort by actual date
      if (priorityA === 3) {
        // For past trips, show most recent first (descending)
        return dateB.getTime() - dateA.getTime();
      } else {
        // For upcoming trips, show earliest first (ascending)
        return dateA.getTime() - dateB.getTime();
      }
    });
  };

  // Helper function to get trip urgency status
  const getTripUrgencyStatus = (nextDeparture: string) => {
    const today = new Date();
    const tripDate = new Date(nextDeparture);
    const daysDiff = Math.ceil((tripDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return { status: 'completed', label: 'Completed', color: 'bg-gray-500', priority: 'low' };
    } else if (daysDiff <= 3) {
      return { status: 'urgent', label: 'Booking Closes Soon!', color: 'bg-red-500', priority: 'high' };
    } else if (daysDiff <= 7) {
      return { status: 'soon', label: 'Starting Soon', color: 'bg-orange-500', priority: 'high' };
    } else if (daysDiff <= 30) {
      return { status: 'upcoming', label: 'Upcoming', color: 'bg-green-500', priority: 'medium' };
    } else {
      return { status: 'future', label: 'Future Trip', color: 'bg-blue-500', priority: 'medium' };
    }
  };

  // Get sorted trips
  const sortedTrips = sortTripsByDatePriority([...trips]);

  // Track trip views with Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tripId = entry.target.getAttribute('data-trip-id');
            if (tripId && !viewedTrips.has(tripId)) {
              setViewedTrips(prev => new Set([...prev, tripId]));
              onTripInterest(tripId);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [viewedTrips, onTripInterest]);

  // Attach observer to trip cards
  useEffect(() => {
    Object.values(tripRefs.current).forEach(ref => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });
  }, [trips]);

  // Simulate real-time activity
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentViewers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Show rewards for high engagement
  useEffect(() => {
    if (activity.engagementLevel === 'high' && !showEngagementRewards) {
      setShowEngagementRewards(true);
    }
  }, [activity.engagementLevel, showEngagementRewards]);

  // Show points feedback
  const showPointsFeedback = (points: number) => {
    setPointsEarned(prev => prev + points);
    setShowPointsPopup(true);
    setTimeout(() => setShowPointsPopup(false), 2000);
  };

  const handleTripLike = (tripId: string) => {
    setLikedTrips(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(tripId)) {
        newLiked.delete(tripId);
      } else {
        newLiked.add(tripId);
        // Award points for liking a trip
        if ((window as any).awardAdventurePoints) {
          (window as any).awardAdventurePoints('trip_like', 15);
        }
        showPointsFeedback(15);
      }
      return newLiked;
    });
  };

  const handleTripShare = (tripId: string, tripTitle: string) => {
    setSharedTrips(prev => new Set([...prev, tripId]));
    
    // Award points for sharing
    if ((window as any).awardAdventurePoints) {
      (window as any).awardAdventurePoints('trip_share', 25);
    }
    showPointsFeedback(25);
    
    // Simulate social sharing
    if (navigator.share) {
      navigator.share({
        title: `Check out ${tripTitle}`,
        text: 'Amazing adventure waiting for you!',
        url: `${window.location.origin}/land/${tripId}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/land/${tripId}`);
      // Show success feedback
      alert('Link copied to clipboard! Share with friends for bonus points!');
    }
  };

  const EngagementRewards = () => (
    <AnimatePresence>
      {showEngagementRewards && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl shadow-2xl max-w-sm"
          initial={{ x: 400, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 400, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white/20 p-2 rounded-full">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">🎉 You're Engaged!</h3>
              <p className="text-sm opacity-90">Unlock exclusive rewards</p>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span>Time on site:</span>
              <span className="font-bold">{Math.floor(activity.timeSpent / 60)}m {activity.timeSpent % 60}s</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Trips viewed:</span>
              <span className="font-bold">{viewedTrips.size}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Engagement level:</span>
              <span className="font-bold capitalize text-yellow-300">{activity.engagementLevel}</span>
            </div>
          </div>

          <motion.button
            onClick={() => onLeadCapture({ 
              source: 'engagement_reward', 
              engagementData: activity 
            })}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-bold transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🎁 Claim Your Discount!
          </motion.button>

          <button
            onClick={() => setShowEngagementRewards(false)}
            className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const LiveActivityBar = () => (
    <motion.div 
      className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ delay: 1 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>{recentViewers} people viewing now</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Live bookings: 12 in last hour</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <motion.div
            className="flex items-center space-x-1"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs">Live</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  const EnhancedTripCard = ({ trip, index }: { trip: any; index: number }) => {
    const isLiked = likedTrips.has(trip.id);
    const isShared = sharedTrips.has(trip.id);
    const isViewed = viewedTrips.has(trip.id);
    const isHovered = hoveredTrip === trip.id;
    const urgencyStatus = getTripUrgencyStatus(trip.nextDeparture);

    return (
      <motion.div
        ref={(el) => { tripRefs.current[trip.id] = el; }}
        data-trip-id={trip.id}
        className="relative group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ 
          scale: 1.03, 
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)" 
        }}
        onMouseEnter={() => setHoveredTrip(trip.id)}
        onMouseLeave={() => setHoveredTrip(null)}
      >
        {/* Live indicators */}
        <div className="absolute top-4 left-4 z-20">
          <div className="flex space-x-2">
            {/* Urgency Status Badge */}
            <motion.div
              className={`${urgencyStatus.color} text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {urgencyStatus.status === 'urgent' && '🔥'}
              {urgencyStatus.status === 'soon' && '⏰'}
              {urgencyStatus.status === 'upcoming' && '📅'}
              {urgencyStatus.status === 'future' && '🗓️'}
              {urgencyStatus.status === 'completed' && '✅'}
              <span>{urgencyStatus.label}</span>
            </motion.div>
            {isViewed && (
              <motion.div
                className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                ✓ Viewed
              </motion.div>
            )}
            {trip.spotsLeft <= 3 && urgencyStatus.status !== 'completed' && (
              <motion.div
                className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🔥 {trip.spotsLeft} left
              </motion.div>
            )}
          </div>
        </div>

        {/* Interactive overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Trip image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={trip.image}
            alt={trip.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Interactive action buttons */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute top-4 right-4 z-20 flex space-x-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <motion.button
                  onClick={() => handleTripLike(trip.id)}
                  className={`p-2 rounded-full transition-colors ${
                    isLiked 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </motion.button>
                
                <motion.button
                  onClick={() => handleTripShare(trip.id, trip.title)}
                  className={`p-2 rounded-full transition-colors ${
                    isShared 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trip details */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {trip.title}
              </h3>
              <p className="text-gray-600 text-sm">{trip.subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">₹{trip.price.toLocaleString()}</p>
              {trip.originalPrice && (
                <p className="text-sm text-gray-500 line-through">₹{trip.originalPrice.toLocaleString()}</p>
              )}
            </div>
          </div>

          {/* Trip metadata */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{trip.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{trip.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{trip.rating}/5</span>
            </div>
          </div>

          {/* Engagement stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {likedTrips.has(trip.id) && (
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-3 h-3 text-blue-500" />
                  <span>Liked</span>
                </div>
              )}
              {sharedTrips.has(trip.id) && (
                <div className="flex items-center space-x-1">
                  <Share2 className="w-3 h-3 text-green-500" />
                  <span>Shared</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Eye className="w-3 h-3" />
              <span>{Math.floor(Math.random() * 50) + 10} views today</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <motion.button
              onClick={() => onLeadCapture({ 
                source: 'trip_call_back', 
                tripId: trip.id,
                tripTitle: trip.title,
                urgency: 'immediate'
              })}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:from-green-600 hover:to-emerald-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="w-5 h-5" />
              <span>Call Back</span>
            </motion.button>
            
            <motion.button
              onClick={() => {
                onTripInterest(trip.id);
                // Navigate to trip page
                window.location.href = `/land/${trip.slug}`;
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-purple-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BookOpen className="w-5 h-5" />
              <span>View Details</span>
            </motion.button>
          </div>
        </div>

        {/* Hover effects */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600/90 to-transparent p-6 text-white z-10"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Next departure:</p>
                  <p className="text-lg font-bold">{trip.nextDeparture}</p>
                </div>
                <motion.button
                  className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Camera className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="relative">
      <LiveActivityBar />
      <EngagementRewards />
      
      {/* Points Popup */}
      <AnimatePresence>
        {showPointsPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2"
          >
            <Star className="w-5 h-5" />
            <span className="font-bold">Points Earned!</span>
            <Gift className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total Points Indicator */}
      {pointsEarned > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          <span className="font-bold">{pointsEarned} Points!</span>
        </motion.div>
      )}
      
      {/* Main trip grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-16">
        {sortedTrips.map((trip, index) => (
          <EnhancedTripCard key={trip.id} trip={trip} index={index} />
        ))}
      </div>

      {/* Engagement analytics (hidden, for debugging) */}
      <div className="hidden">
        <div>Engagement Level: {activity.engagementLevel}</div>
        <div>Time Spent: {activity.timeSpent}s</div>
        <div>Trips Viewed: {viewedTrips.size}</div>
        <div>Trips Liked: {likedTrips.size}</div>
        <div>Scroll Depth: {Math.round(activity.scrollDepth)}%</div>
      </div>
    </div>
  );
};

export default InteractiveHomepage;
