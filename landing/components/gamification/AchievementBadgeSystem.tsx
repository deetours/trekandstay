import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Shield, 
  Crown, 
  Zap, 
  Target,
  Award,
  Gift,
  Flame,
  Heart,
  Eye,
  Map,
  Compass,
  Mountain,
  Camera,
  Share2,
  Users,
  Calendar,
  Phone,
  Clock,
  Rocket,
  Diamond,
  Gem,
  Medal,
  Sparkles,
  TrendingUp,
  Bookmark,
  MessageCircle,
  MapPin,
  Sunrise,
  Moon,
  Sun,
  CloudRain,
  Wind,
  Snowflake,
  Leaf
} from 'lucide-react';

export interface BadgeUnlockCondition {
  id: string;
  type: 'points' | 'actions' | 'time_spent' | 'social_actions' | 'engagement_level' | 'combo' | 'streak';
  threshold: number;
  actions?: string[];
  timeframe?: number; // in milliseconds
  description: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  icon: React.ComponentType<any>;
  bgGradient: string;
  iconColor: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';
  category: 'explorer' | 'social' | 'adventurer' | 'master' | 'legend' | 'seasonal';
  points: number;
  unlockConditions: BadgeUnlockCondition[];
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number; // 0-1 for progress tracking
  isHidden?: boolean; // Secret badges
  seasonalExpiry?: number; // For time-limited badges
}

interface AchievementBadgeSystemProps {
  userProgress?: any;
  onBadgeUnlocked?: (badge: Badge) => void;
  showDetailed?: boolean;
  className?: string;
}

// Comprehensive badge definitions
const BADGE_DEFINITIONS: Badge[] = [
  // Explorer Category
  {
    id: 'first_explorer',
    name: 'First Explorer',
    description: 'Started your adventure journey',
    longDescription: 'Welcome to the world of adventures! This badge marks the beginning of your exploration journey.',
    icon: Mountain,
    bgGradient: 'from-emerald-400 to-emerald-600',
    iconColor: 'text-white',
    rarity: 'bronze',
    category: 'explorer',
    points: 25,
    unlockConditions: [{
      id: 'first_action',
      type: 'points',
      threshold: 10,
      description: 'Earn your first 10 points'
    }],
    unlocked: false
  },
  {
    id: 'weather_sage',
    name: 'Weather Sage',
    description: 'Mastered weather tracking',
    longDescription: 'You understand the importance of weather in adventure planning. A true outdoor enthusiast!',
    icon: CloudRain,
    bgGradient: 'from-blue-400 to-blue-600',
    iconColor: 'text-white',
    rarity: 'silver',
    category: 'explorer',
    points: 50,
    unlockConditions: [{
      id: 'weather_master',
      type: 'actions',
      threshold: 5,
      actions: ['weather_check', 'weather_expand'],
      description: 'Check weather conditions 5 times'
    }],
    unlocked: false
  },
  {
    id: 'destination_discoverer',
    name: 'Destination Discoverer',
    description: 'Explored multiple destinations',
    longDescription: 'Your curiosity knows no bounds! You have explored various adventure destinations.',
    icon: Compass,
    bgGradient: 'from-purple-400 to-purple-600',
    iconColor: 'text-white',
    rarity: 'gold',
    category: 'explorer',
    points: 100,
    unlockConditions: [{
      id: 'multi_destination',
      type: 'actions',
      threshold: 10,
      actions: ['trip_view', 'itinerary_expand', 'highlights_read'],
      description: 'Explore 10 different trip aspects'
    }],
    unlocked: false
  },

  // Social Category
  {
    id: 'social_starter',
    name: 'Social Starter',
    description: 'Made first social interaction',
    longDescription: 'Adventures are better when shared! You have taken your first step into social engagement.',
    icon: Share2,
    bgGradient: 'from-pink-400 to-pink-600',
    iconColor: 'text-white',
    rarity: 'bronze',
    category: 'social',
    points: 30,
    unlockConditions: [{
      id: 'first_share',
      type: 'actions',
      threshold: 1,
      actions: ['share', 'whatsapp', 'social_action'],
      description: 'Make your first social interaction'
    }],
    unlocked: false
  },
  {
    id: 'conversation_catalyst',
    name: 'Conversation Catalyst',
    description: 'Initiated multiple conversations',
    longDescription: 'You are not shy about reaching out! Building connections is your specialty.',
    icon: MessageCircle,
    bgGradient: 'from-indigo-400 to-indigo-600',
    iconColor: 'text-white',
    rarity: 'silver',
    category: 'social',
    points: 75,
    unlockConditions: [{
      id: 'multi_contact',
      type: 'actions',
      threshold: 3,
      actions: ['whatsapp', 'call_action', 'contact_form'],
      description: 'Initiate contact 3 times'
    }],
    unlocked: false
  },
  {
    id: 'influence_champion',
    name: 'Influence Champion',
    description: 'Shared adventures extensively',
    longDescription: 'Your enthusiasm is contagious! You have shared the adventure spirit far and wide.',
    icon: Crown,
    bgGradient: 'from-yellow-400 to-orange-600',
    iconColor: 'text-white',
    rarity: 'gold',
    category: 'social',
    points: 150,
    unlockConditions: [{
      id: 'share_master',
      type: 'actions',
      threshold: 10,
      actions: ['share', 'whatsapp', 'social_action'],
      description: 'Share content 10 times'
    }],
    unlocked: false
  },

  // Adventurer Category
  {
    id: 'booking_rookie',
    name: 'Booking Rookie',
    description: 'Started the booking process',
    longDescription: 'You have taken the leap from dreaming to planning! The adventure begins now.',
    icon: Calendar,
    bgGradient: 'from-teal-400 to-teal-600',
    iconColor: 'text-white',
    rarity: 'silver',
    category: 'adventurer',
    points: 100,
    unlockConditions: [{
      id: 'booking_start',
      type: 'actions',
      threshold: 1,
      actions: ['booking_modal_open', 'booking_start'],
      description: 'Start the booking process'
    }],
    unlocked: false
  },
  {
    id: 'seat_selector',
    name: 'Seat Selector',
    description: 'Carefully chose adventure seats',
    longDescription: 'Attention to detail is your strength! You carefully selected your perfect spot.',
    icon: Target,
    bgGradient: 'from-green-400 to-green-600',
    iconColor: 'text-white',
    rarity: 'silver',
    category: 'adventurer',
    points: 75,
    unlockConditions: [{
      id: 'seat_selection',
      type: 'actions',
      threshold: 1,
      actions: ['seat_selection', 'seat_confirmed'],
      description: 'Select seats for your adventure'
    }],
    unlocked: false
  },
  {
    id: 'adventure_committed',
    name: 'Adventure Committed',
    description: 'Completed first booking',
    longDescription: 'Congratulations! You have officially committed to your adventure. The journey awaits!',
    icon: Trophy,
    bgGradient: 'from-amber-400 to-red-600',
    iconColor: 'text-white',
    rarity: 'gold',
    category: 'adventurer',
    points: 250,
    unlockConditions: [{
      id: 'booking_complete',
      type: 'actions',
      threshold: 1,
      actions: ['booking_completed', 'payment_completed'],
      description: 'Complete your first booking'
    }],
    unlocked: false
  },

  // Master Category
  {
    id: 'engagement_expert',
    name: 'Engagement Expert',
    description: 'Highly engaged user',
    longDescription: 'Your enthusiasm shines through! You have mastered the art of engagement.',
    icon: Zap,
    bgGradient: 'from-violet-400 to-violet-600',
    iconColor: 'text-white',
    rarity: 'platinum',
    category: 'master',
    points: 200,
    unlockConditions: [{
      id: 'high_engagement',
      type: 'points',
      threshold: 500,
      description: 'Earn 500 total points'
    }],
    unlocked: false
  },
  {
    id: 'time_devotee',
    name: 'Time Devotee',
    description: 'Spent significant time exploring',
    longDescription: 'Time well spent! Your dedication to exploring every detail is commendable.',
    icon: Clock,
    bgGradient: 'from-cyan-400 to-blue-600',
    iconColor: 'text-white',
    rarity: 'platinum',
    category: 'master',
    points: 150,
    unlockConditions: [{
      id: 'time_spent',
      type: 'time_spent',
      threshold: 300000, // 5 minutes
      description: 'Spend 5 minutes exploring'
    }],
    unlocked: false
  },

  // Legend Category
  {
    id: 'adventure_legend',
    name: 'Adventure Legend',
    description: 'Legendary adventure enthusiast',
    longDescription: 'You have achieved legendary status! Your passion for adventure is truly inspiring.',
    icon: Crown,
    bgGradient: 'from-yellow-400 via-orange-500 to-red-600',
    iconColor: 'text-white',
    rarity: 'legendary',
    category: 'legend',
    points: 500,
    unlockConditions: [{
      id: 'legend_points',
      type: 'points',
      threshold: 1000,
      description: 'Earn 1000 total points'
    }],
    unlocked: false,
    isHidden: true // Secret achievement
  },
  {
    id: 'diamond_explorer',
    name: 'Diamond Explorer',
    description: 'Ultimate exploration mastery',
    longDescription: 'Rarest of the rare! You have reached the pinnacle of adventure exploration.',
    icon: Diamond,
    bgGradient: 'from-blue-200 via-purple-400 to-pink-600',
    iconColor: 'text-white',
    rarity: 'diamond',
    category: 'legend',
    points: 750,
    unlockConditions: [{
      id: 'diamond_combo',
      type: 'combo',
      threshold: 1,
      actions: ['booking_completed', 'social_share_5', 'time_devotee'],
      description: 'Complete booking + 5 shares + 5min session'
    }],
    unlocked: false,
    isHidden: true
  },

  // Seasonal Category
  {
    id: 'monsoon_warrior',
    name: 'Monsoon Warrior',
    description: 'Explored during monsoon season',
    longDescription: 'You embrace the rain and adventure! A true monsoon enthusiast.',
    icon: CloudRain,
    bgGradient: 'from-blue-600 to-indigo-800',
    iconColor: 'text-white',
    rarity: 'gold',
    category: 'seasonal',
    points: 200,
    unlockConditions: [{
      id: 'monsoon_explorer',
      type: 'actions',
      threshold: 1,
      actions: ['monsoon_trip_view', 'weather_check'],
      description: 'Explore monsoon adventures'
    }],
    unlocked: false,
    seasonalExpiry: Date.now() + (90 * 24 * 60 * 60 * 1000) // 90 days
  }
];

export const AchievementBadgeSystem: React.FC<AchievementBadgeSystemProps> = ({
  userProgress,
  onBadgeUnlocked,
  showDetailed = false,
  className = ''
}) => {
  const [badges, setBadges] = useState<Badge[]>(BADGE_DEFINITIONS);
  const [showBadgeModal, setShowBadgeModal] = useState<Badge | null>(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Badge[]>([]);

  // Check for badge unlocks
  useEffect(() => {
    if (!userProgress) return;

    const updatedBadges = badges.map(badge => {
      if (badge.unlocked) return badge;

      // Check each unlock condition
      const allConditionsMet = badge.unlockConditions.every(condition => {
        switch (condition.type) {
          case 'points':
            return userProgress.totalPoints >= condition.threshold;
          
          case 'actions':
            if (!condition.actions) return false;
            const actionCount = userProgress.pointsHistory?.filter((point: any) => 
              condition.actions!.includes(point.action)
            ).length || 0;
            return actionCount >= condition.threshold;
          
          case 'time_spent':
            const sessionTime = Date.now() - (userProgress.sessionStart || Date.now());
            return sessionTime >= condition.threshold;
          
          case 'social_actions':
            const socialCount = userProgress.pointsHistory?.filter((point: any) => 
              point.category === 'social'
            ).length || 0;
            return socialCount >= condition.threshold;
          
          case 'engagement_level':
            return userProgress.totalPoints >= condition.threshold;
          
          case 'streak':
            return (userProgress.streakCount || 0) >= condition.threshold;
          
          case 'combo':
            // Complex combination logic
            if (!condition.actions) return false;
            return condition.actions.every(requiredAction => 
              userProgress.pointsHistory?.some((point: any) => point.action === requiredAction)
            );
          
          default:
            return false;
        }
      });

      if (allConditionsMet) {
        const unlockedBadge = {
          ...badge,
          unlocked: true,
          unlockedAt: Date.now()
        };

        // Add to newly unlocked for animation
        setNewlyUnlocked(prev => [...prev, unlockedBadge]);
        setTimeout(() => {
          setShowBadgeModal(unlockedBadge);
          onBadgeUnlocked?.(unlockedBadge);
        }, 500);

        return unlockedBadge;
      } else {
        // Calculate progress for partial completion
        const progress = badge.unlockConditions.reduce((acc, condition) => {
          let conditionProgress = 0;
          
          switch (condition.type) {
            case 'points':
              conditionProgress = Math.min(1, userProgress.totalPoints / condition.threshold);
              break;
            case 'actions':
              if (condition.actions) {
                const actionCount = userProgress.pointsHistory?.filter((point: any) => 
                  condition.actions!.includes(point.action)
                ).length || 0;
                conditionProgress = Math.min(1, actionCount / condition.threshold);
              }
              break;
            // Add other progress calculations as needed
          }
          
          return acc + (conditionProgress / badge.unlockConditions.length);
        }, 0);

        return { ...badge, progress };
      }
    });

    setBadges(updatedBadges);
  }, [userProgress, badges, onBadgeUnlocked]);

  const getRarityStyle = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'bronze': return 'ring-amber-600 bg-gradient-to-r from-amber-100 to-amber-200';
      case 'silver': return 'ring-gray-500 bg-gradient-to-r from-gray-100 to-gray-300';
      case 'gold': return 'ring-yellow-500 bg-gradient-to-r from-yellow-100 to-yellow-300';
      case 'platinum': return 'ring-blue-500 bg-gradient-to-r from-blue-100 to-purple-200';
      case 'diamond': return 'ring-purple-500 bg-gradient-to-r from-purple-100 to-pink-200';
      case 'legendary': return 'ring-red-500 bg-gradient-to-r from-red-100 to-orange-300';
      default: return 'ring-gray-400 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: Badge['category']) => {
    switch (category) {
      case 'explorer': return Mountain;
      case 'social': return Users;
      case 'adventurer': return Rocket;
      case 'master': return Crown;
      case 'legend': return Trophy;
      case 'seasonal': return Leaf;
      default: return Star;
    }
  };

  const unlockedBadges = badges.filter(b => b.unlocked && !b.isHidden);
  const visibleBadges = badges.filter(b => !b.isHidden);

  return (
    <div className={className}>
      {/* Badge Collection Grid */}
      {showDetailed && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {visibleBadges.map(badge => (
            <motion.div
              key={badge.id}
              className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                badge.unlocked 
                  ? `${getRarityStyle(badge.rarity)} ring-2 hover:scale-105` 
                  : 'bg-gray-100 opacity-50'
              }`}
              whileHover={badge.unlocked ? { scale: 1.05 } : {}}
              onClick={() => badge.unlocked && setShowBadgeModal(badge)}
            >
              {/* Badge Icon */}
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${badge.bgGradient} flex items-center justify-center mb-2 mx-auto ${
                badge.unlocked ? '' : 'grayscale'
              }`}>
                <badge.icon className={`w-6 h-6 ${badge.iconColor}`} />
              </div>

              {/* Badge Name */}
              <h4 className={`text-sm font-semibold text-center mb-1 ${
                badge.unlocked ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {badge.name}
              </h4>

              {/* Badge Description */}
              <p className={`text-xs text-center ${
                badge.unlocked ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {badge.description}
              </p>

              {/* Progress Bar for Locked Badges */}
              {!badge.unlocked && badge.progress !== undefined && badge.progress > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${badge.progress * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {Math.round(badge.progress * 100)}% Complete
                  </p>
                </div>
              )}

              {/* Rarity Indicator */}
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                badge.unlocked ? getRarityStyle(badge.rarity) : 'bg-gray-300'
              }`}>
                {badge.rarity === 'legendary' && <Crown className="w-3 h-3" />}
                {badge.rarity === 'diamond' && <Diamond className="w-3 h-3" />}
                {badge.rarity === 'platinum' && <Star className="w-3 h-3" />}
                {badge.rarity === 'gold' && <Medal className="w-3 h-3" />}
                {badge.rarity === 'silver' && <Shield className="w-3 h-3" />}
                {badge.rarity === 'bronze' && <Award className="w-3 h-3" />}
              </div>

              {/* New Badge Indicator */}
              {newlyUnlocked.some(nb => nb.id === badge.id) && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-yellow-400/20 pointer-events-none"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: 3 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Compact Badge Display */}
      {!showDetailed && unlockedBadges.length > 0 && (
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <div className="flex gap-1">
            {unlockedBadges.slice(0, 5).map(badge => (
              <div
                key={badge.id}
                className={`w-8 h-8 rounded-full bg-gradient-to-r ${badge.bgGradient} flex items-center justify-center`}
                title={badge.name}
              >
                <badge.icon className={`w-4 h-4 ${badge.iconColor}`} />
              </div>
            ))}
            {unlockedBadges.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                +{unlockedBadges.length - 5}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {showBadgeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className={`absolute inset-0 bg-gradient-to-r ${showBadgeModal.bgGradient} opacity-10`} />
              
              <div className="relative z-10">
                {/* Badge Icon */}
                <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${showBadgeModal.bgGradient} flex items-center justify-center mb-4 mx-auto`}>
                  <showBadgeModal.icon className={`w-10 h-10 ${showBadgeModal.iconColor}`} />
                </div>

                {/* Badge Info */}
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{showBadgeModal.name}</h3>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getRarityStyle(showBadgeModal.rarity)}`}>
                  {showBadgeModal.rarity.toUpperCase()}
                </div>
                <p className="text-gray-600 mb-4">{showBadgeModal.longDescription || showBadgeModal.description}</p>
                
                {/* Points Earned */}
                <div className="flex items-center justify-center gap-2 text-emerald-600 mb-6">
                  <Star className="w-5 h-5" />
                  <span className="font-bold">+{showBadgeModal.points} Points Earned</span>
                </div>

                {/* Unlock Conditions */}
                <div className="text-left">
                  <h4 className="font-semibold text-gray-700 mb-2">Unlock Conditions:</h4>
                  <ul className="space-y-1">
                    {showBadgeModal.unlockConditions.map((condition, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span>{condition.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unlocked Date */}
                {showBadgeModal.unlockedAt && (
                  <p className="text-xs text-gray-500 mt-4">
                    Unlocked: {new Date(showBadgeModal.unlockedAt).toLocaleDateString()}
                  </p>
                )}

                <button
                  onClick={() => setShowBadgeModal(null)}
                  className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};