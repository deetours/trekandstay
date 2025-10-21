import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Home, MapPin, Calendar, Star, Phone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationProps {
  currentTrip?: {
    id: string;
    title: string;
    location: string;
    price: number;
    rating: number;
  };
}

export const EnhancedNavigation: React.FC<NavigationProps> = ({ currentTrip }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);
  const [lastPage, setLastPage] = useState<string>('/');

  useEffect(() => {
    // Track navigation history for smart back navigation
    const currentPath = location.pathname;
    if (currentPath !== '/') {
      setLastPage('/');
    }
    setShowBreadcrumbs(currentPath.includes('/land/'));
  }, [location]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleBackToPrevious = () => {
    navigate(lastPage);
  };

  const BreadcrumbTrail = () => (
    <AnimatePresence>
      {showBreadcrumbs && (
        <motion.div
          className="fixed top-4 left-4 z-40 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={handleBackToHome}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Home</span>
            </motion.button>
            
            <ArrowRight className="w-4 h-4 text-gray-400" />
            
            <div className="flex items-center space-x-2 text-gray-700">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">
                {currentTrip?.location || 'Adventure'}
              </span>
            </div>
            
            {currentTrip && (
              <>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900 max-w-32 truncate">
                  {currentTrip.title}
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const SmartBackButton = () => (
    <motion.div
      className="fixed bottom-20 left-4 z-40"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      <motion.button
        onClick={handleBackToPrevious}
        className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-4 rounded-full shadow-2xl flex items-center space-x-2"
        whileHover={{ scale: 1.1, from: 'gray-800', to: 'black' }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowLeft className="w-6 h-6" />
        <span className="text-sm font-medium sr-only md:not-sr-only">Back</span>
      </motion.button>
    </motion.div>
  );

  return (
    <>
      <BreadcrumbTrail />
      {showBreadcrumbs && <SmartBackButton />}
    </>
  );
};

// Enhanced sticky quick actions for both homepage and trip pages
export const StickyQuickActions: React.FC<{
  tripId?: string;
  tripPrice?: number;
  onCallRequest: () => void;
  onBookingRequest: () => void;
}> = ({ tripId, tripPrice, onCallRequest, onBookingRequest }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show sticky actions after scrolling 200px
      setIsVisible(currentScrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-4"
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex items-center space-x-4">
            {tripPrice && (
              <div className="text-center">
                <p className="text-xs text-gray-600">Starting from</p>
                <p className="text-lg font-bold text-green-600">₹{tripPrice.toLocaleString()}</p>
              </div>
            )}
            
            <motion.button
              onClick={onCallRequest}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
              whileHover={{ scale: 1.05, from: 'green-600', to: 'emerald-700' }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-5 h-5" />
              <span>Call Back</span>
            </motion.button>
            
            <motion.button
              onClick={onBookingRequest}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
              whileHover={{ scale: 1.05, from: 'blue-600', to: 'purple-700' }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar className="w-5 h-5" />
              <span>Book Now</span>
            </motion.button>
          </div>
          
          {/* Quick trip info for trip pages */}
          {tripId && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Trip ID: {tripId}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>4.8/5</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Interactive elements that appear based on user behavior
export const InteractiveFloatingElements: React.FC<{
  onInteraction: (type: string, data: Record<string, unknown>) => void;
}> = ({ onInteraction }) => {
  const [showHelpBubble, setShowHelpBubble] = useState(false);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      
      // Show help bubble after 30 seconds of inactivity
      idleTimer = setTimeout(() => {
        setShowHelpBubble(true);
      }, 30000);
    };

    const handleActivity = () => {
      resetIdleTimer();
      if (showHelpBubble) {
        setShowHelpBubble(false);
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('click', resetIdleTimer);
    window.addEventListener('keypress', resetIdleTimer);
    window.addEventListener('scroll', resetIdleTimer);
    
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('click', resetIdleTimer);
      window.removeEventListener('keypress', resetIdleTimer);
      window.removeEventListener('scroll', resetIdleTimer);
    };
  }, [showHelpBubble]);

  const HelpBubble = () => (
    <AnimatePresence>
      {showHelpBubble && (
        <motion.div
          className="fixed top-1/2 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl shadow-2xl max-w-sm"
          style={{
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
          initial={{ x: 400, opacity: 0, rotate: 10 }}
          animate={{ x: 0, opacity: 1, rotate: 0 }}
          exit={{ x: 400, opacity: 0, rotate: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-2">Need Help Choosing? 🤔</h4>
              <p className="text-sm opacity-90 mb-4">
                Our travel experts are here to help you find the perfect adventure!
              </p>
              <div className="space-y-2">
                <motion.button
                  onClick={() => {
                    onInteraction('help_request', { type: 'call_back' });
                    setShowHelpBubble(false);
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  📞 Get a Call Back
                </motion.button>
                <motion.button
                  onClick={() => {
                    onInteraction('help_request', { type: 'chat' });
                    setShowHelpBubble(false);
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  💬 Live Chat
                </motion.button>
              </div>
            </div>
            <button
              onClick={() => setShowHelpBubble(false)}
              className="text-white/60 hover:text-white transition-colors ml-4"
            >
              ×
            </button>
          </div>
          
          {/* Floating animation */}
          <motion.div
            className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return <HelpBubble />;
};

export default { EnhancedNavigation, StickyQuickActions, InteractiveFloatingElements };
