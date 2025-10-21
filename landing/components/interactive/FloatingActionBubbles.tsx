import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Phone, 
  Heart, 
  Share2, 
  Camera, 
  MapPin, 
  Clock, 
  Users,
  Star,
  Gift,
  Zap,
  ThumbsUp
} from 'lucide-react';

interface FloatingActionBubblesProps {
  tripData?: any;
  onActionClick?: (action: string, data?: any) => void;
  className?: string;
}

interface Bubble {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  action: string;
  color: string;
  delay: number;
  position: { bottom: string; right: string };
}

export const FloatingActionBubbles: React.FC<FloatingActionBubblesProps> = ({
  tripData,
  onActionClick,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [recentActions, setRecentActions] = useState<string[]>([]);
  const [showRewardBurst, setShowRewardBurst] = useState(false);

  const bubbles: Bubble[] = [
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp Inquiry',
      action: 'whatsapp',
      color: 'green',
      delay: 0.1,
      position: { bottom: '140px', right: '20px' }
    },
    {
      id: 'call',
      icon: Phone,
      label: 'Quick Call',
      action: 'call',
      color: 'blue',
      delay: 0.2,
      position: { bottom: '120px', right: '80px' }
    },
    {
      id: 'wishlist',
      icon: Heart,
      label: 'Add to Wishlist',
      action: 'wishlist',
      color: 'red',
      delay: 0.3,
      position: { bottom: '200px', right: '60px' }
    },
    {
      id: 'share',
      icon: Share2,
      label: 'Share Adventure',
      action: 'share',
      color: 'purple',
      delay: 0.4,
      position: { bottom: '180px', right: '120px' }
    },
    {
      id: 'photos',
      icon: Camera,
      label: 'View Gallery',
      action: 'gallery',
      color: 'indigo',
      delay: 0.5,
      position: { bottom: '240px', right: '40px' }
    }
  ];

  const handleActionClick = (bubble: Bubble) => {
    // Add to recent actions for gamification
    setRecentActions(prev => [...prev, bubble.id].slice(-3));
    
    // Trigger reward animation for multiple actions
    if (recentActions.length >= 2) {
      setShowRewardBurst(true);
      setTimeout(() => setShowRewardBurst(false), 2000);
    }

    // Execute the action
    switch (bubble.action) {
      case 'whatsapp': {
        const message = `Hi! I'm interested in ${tripData?.name || 'your adventure trips'}. Can you share more details?`;
        window.open(`https://wa.me/919902937730?text=${encodeURIComponent(message)}`, '_blank');
        break;
      }
      case 'call':
        window.open('tel:+919902937730', '_self');
        break;
      case 'wishlist':
        // Add to wishlist logic
        break;
      case 'share': {
        if (navigator.share) {
          navigator.share({
            title: tripData?.name || 'Amazing Adventure',
            text: 'Check out this amazing adventure!',
            url: window.location.href
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          // Show copied feedback
        }
        break;
      }
      case 'gallery':
        // Open photo gallery
        break;
    }

    onActionClick?.(bubble.action, { bubble, tripData });
  };

  // Auto-expand after a delay to draw attention
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(true);
      setTimeout(() => setIsExpanded(false), 3000); // Auto-collapse after 3 seconds
    }, 5000); // Show after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Reward Burst Animation */}
      <AnimatePresence>
        {showRewardBurst && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute -top-16 -left-8 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              🎉 Engagement Streak!
            </div>
            {/* Confetti particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{ 
                  x: 0, 
                  y: 0,
                  opacity: 1 
                }}
                animate={{
                  x: Math.random() * 100 - 50,
                  y: -Math.random() * 50 - 20,
                  opacity: 0
                }}
                transition={{ duration: 1 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Bubbles */}
      <AnimatePresence>
        {bubbles.map((bubble) => {
          const IconComponent = bubble.icon;
          const isVisible = isExpanded || activeTooltip === bubble.id;
          
          return isVisible ? (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0, scale: 0, x: 50, y: 50 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: 0, 
                y: 0,
                rotate: [0, 5, -5, 0]
              }}
              exit={{ opacity: 0, scale: 0, x: 50, y: 50 }}
              transition={{ 
                delay: bubble.delay,
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="absolute"
              style={{
                bottom: bubble.position.bottom,
                right: bubble.position.right
              }}
            >
              <div className="relative group">
                {/* Tooltip */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-full top-1/2 -translate-y-1/2 mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                >
                  <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                    {bubble.label}
                  </div>
                  <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-black/80"></div>
                </motion.div>

                {/* Bubble Button */}
                <motion.button
                  onClick={() => handleActionClick(bubble)}
                  className={`w-12 h-12 bg-gradient-to-r from-${bubble.color}-500 to-${bubble.color}-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-${bubble.color}-500/25 transition-all duration-200`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 10,
                    boxShadow: '0 0 20px rgba(0,0,0,0.3)'
                  }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    y: [0, -5, 0],
                    boxShadow: [
                      '0 4px 20px rgba(0,0,0,0.1)',
                      '0 8px 25px rgba(0,0,0,0.15)',
                      '0 4px 20px rgba(0,0,0,0.1)'
                    ]
                  }}
                  transition={{
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <IconComponent className="w-5 h-5" />
                </motion.button>

                {/* Activity indicator */}
                {recentActions.includes(bubble.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center"
                  >
                    <ThumbsUp className="w-2 h-2 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : null;
        })}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isExpanded ? 45 : 0,
          boxShadow: [
            '0 0 0 0 rgba(16, 185, 129, 0.7)',
            '0 0 0 10px rgba(16, 185, 129, 0)',
            '0 0 0 20px rgba(16, 185, 129, 0)'
          ]
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity }
        }}
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Icon */}
        <div className="relative z-10">
          {isExpanded ? (
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 45 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Zap className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gift className="w-6 h-6" />
            </motion.div>
          )}
        </div>

        {/* Notification badge */}
        {recentActions.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {recentActions.length}
          </motion.div>
        )}
      </motion.button>

      {/* Engagement Meter */}
      {recentActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-0 right-0 text-center"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-medium text-gray-700 shadow-lg">
            🔥 Engagement: {recentActions.length}/3
          </div>
        </motion.div>
      )}

      {/* Interactive Hints */}
      <AnimatePresence>
        {!isExpanded && recentActions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -left-20 top-1/2 -translate-y-1/2"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
              Tap to explore! 👆
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};