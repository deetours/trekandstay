import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Zap, 
  Gift, 
  Target, 
  Award,
  Flame,
  Crown,
  Shield,
  Compass,
  Mountain,
  Camera,
  Heart,
  Share2,
  Phone,
  Calendar,
  Users,
  MapPin,
  Clock,
  TrendingUp,
  Plus,
  Cloud
} from 'lucide-react';

// Types for the gamification system
export interface AdventurePoint {
  id: string;
  action: string;
  points: number;
  timestamp: number;
  category: 'engagement' | 'social' | 'exploration' | 'booking' | 'sharing';
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  points: number;
  unlocked: boolean;
  unlockedAt?: number;
  category: 'explorer' | 'social' | 'adventurer' | 'loyal' | 'champion';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: 'points' | 'actions' | 'time' | 'social' | 'combo';
    value: number;
    actions?: string[];
  };
}

export interface UserProgress {
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  pointsHistory: AdventurePoint[];
  streakCount: number;
  lastActivity: number;
  badges: string[];
  challengesCompleted: number;
}

interface AdventurePointsSystemProps {
  onPointsEarned?: (points: number, action: string) => void;
  onAchievementUnlocked?: (achievement: Achievement) => void;
  onLevelUp?: (newLevel: number) => void;
  className?: string;
}

// Predefined achievements
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Welcome to your adventure journey!',
    icon: Mountain,
    points: 50,
    unlocked: false,
    category: 'explorer',
    rarity: 'common',
    requirement: { type: 'points', value: 10 }
  },
  {
    id: 'weather_watcher',
    name: 'Weather Watcher',
    description: 'Checked weather conditions',
    icon: Cloud,
    points: 25,
    unlocked: false,
    category: 'explorer',
    rarity: 'common',
    requirement: { type: 'actions', value: 1, actions: ['weather_check'] }
  },
  {
    id: 'trip_explorer',
    name: 'Trip Explorer',
    description: 'Discovered new adventures',
    icon: Compass,
    points: 75,
    unlocked: false,
    category: 'explorer',
    rarity: 'rare',
    requirement: { type: 'actions', value: 3, actions: ['trip_view', 'itinerary_view'] }
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Shared adventures with friends',
    icon: Share2,
    points: 100,
    unlocked: false,
    category: 'social',
    rarity: 'rare',
    requirement: { type: 'actions', value: 2, actions: ['share', 'whatsapp'] }
  },
  {
    id: 'booking_champion',
    name: 'Booking Champion',
    description: 'Made your first booking!',
    icon: Trophy,
    points: 200,
    unlocked: false,
    category: 'adventurer',
    rarity: 'epic',
    requirement: { type: 'actions', value: 1, actions: ['booking_completed'] }
  },
  {
    id: 'engagement_master',
    name: 'Engagement Master',
    description: 'Highly engaged user',
    icon: Zap,
    points: 150,
    unlocked: false,
    category: 'loyal',
    rarity: 'epic',
    requirement: { type: 'points', value: 500 }
  },
  {
    id: 'adventure_legend',
    name: 'Adventure Legend',
    description: 'Ultimate adventure enthusiast',
    icon: Crown,
    points: 500,
    unlocked: false,
    category: 'champion',
    rarity: 'legendary',
    requirement: { type: 'points', value: 1000 }
  }
];

// Points for different actions
const POINT_VALUES: Record<string, number> = {
  // Basic interactions
  'page_load': 5,
  'hero_cta_click': 15,
  'scroll_milestone': 10,
  
  // Engagement actions
  'weather_check': 20,
  'trip_discovery': 25,
  'itinerary_view': 30,
  'gallery_view': 25,
  'highlights_read': 20,
  
  // Social actions
  'share': 50,
  'whatsapp': 40,
  'call_action': 35,
  'wishlist_add': 30,
  
  // Booking actions
  'booking_start': 75,
  'seat_selection': 50,
  'booking_completed': 200,
  'lead_capture': 100,
  
  // Interactive elements
  'floating_action': 15,
  'widget_interaction': 20,
  'animation_trigger': 10,
  'achievement_celebrated': 25,
  
  // Time-based bonuses
  'session_time': 5,
  'session_5min': 25,
  'session_10min': 50,
  'return_visitor': 40,
  
  // New interactive actions
  'button_click': 10,
  'modal_open': 15,
  'form_interaction': 20,
  'cta_interaction': 25
};

export const AdventurePointsSystem: React.FC<AdventurePointsSystemProps> = ({
  onPointsEarned,
  onAchievementUnlocked,
  onLevelUp,
  className = ''
}) => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 0,
    level: 1,
    achievements: ACHIEVEMENTS,
    pointsHistory: [],
    streakCount: 0,
    lastActivity: Date.now(),
    badges: [],
    challengesCompleted: 0
  });

  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [recentPoints, setRecentPoints] = useState<{ points: number; action: string } | null>(null);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('adventure_progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setUserProgress(prev => ({
          ...prev,
          ...parsed,
          achievements: ACHIEVEMENTS.map(achievement => {
            const saved = parsed.achievements?.find((a: Achievement) => a.id === achievement.id);
            return saved ? { ...achievement, ...saved } : achievement;
          })
        }));
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((progress: UserProgress) => {
    try {
      localStorage.setItem('adventure_progress', JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, []);

  // Calculate level from points
  const calculateLevel = (points: number): number => {
    return Math.floor(points / 100) + 1;
  };

  // Check if achievements should be unlocked
  const checkAchievements = useCallback((newProgress: UserProgress) => {
    const updatedAchievements = newProgress.achievements.map(achievement => {
      if (achievement.unlocked) return achievement;

      const { requirement } = achievement;
      let shouldUnlock = false;

      switch (requirement.type) {
        case 'points':
          shouldUnlock = newProgress.totalPoints >= requirement.value;
          break;
        case 'actions':
          if (requirement.actions) {
            const actionCount = newProgress.pointsHistory.filter(point => 
              requirement.actions!.includes(point.action)
            ).length;
            shouldUnlock = actionCount >= requirement.value;
          }
          break;
        case 'time':
          // Time-based achievements (could be session time, return visits, etc.)
          break;
        case 'social': {
          const socialActions = newProgress.pointsHistory.filter(point => 
            point.category === 'social'
          ).length;
          shouldUnlock = socialActions >= requirement.value;
          break;
        }
        case 'combo':
          // Complex combination requirements
          break;
      }

      if (shouldUnlock) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: Date.now()
        };
        
        // Trigger achievement callback
        setTimeout(() => {
          setShowAchievement(unlockedAchievement);
          onAchievementUnlocked?.(unlockedAchievement);
        }, 500);

        return unlockedAchievement;
      }

      return achievement;
    });

    return { ...newProgress, achievements: updatedAchievements };
  }, [onAchievementUnlocked]);

  // Award points for an action
  const awardPoints = useCallback((action: string, customPoints?: number) => {
    const points = customPoints || POINT_VALUES[action] || 10;
    const now = Date.now();

    const newPoint: AdventurePoint = {
      id: `${action}_${now}`,
      action,
      points,
      timestamp: now,
      category: getCategoryForAction(action),
      description: getDescriptionForAction(action)
    };

    setUserProgress(prevProgress => {
      const newTotalPoints = prevProgress.totalPoints + points;
      const newLevel = calculateLevel(newTotalPoints);
      const oldLevel = prevProgress.level;

      let updatedProgress: UserProgress = {
        ...prevProgress,
        totalPoints: newTotalPoints,
        level: newLevel,
        pointsHistory: [...prevProgress.pointsHistory, newPoint],
        lastActivity: now
      };

      // Check for level up
      if (newLevel > oldLevel) {
        setTimeout(() => onLevelUp?.(newLevel), 300);
      }

      // Check for new achievements
      updatedProgress = checkAchievements(updatedProgress);

      // Save progress
      saveProgress(updatedProgress);

      return updatedProgress;
    });

    // Show points animation
    setRecentPoints({ points, action });
    setShowPointsAnimation(true);
    onPointsEarned?.(points, action);

    // Hide animation after delay
    setTimeout(() => {
      setShowPointsAnimation(false);
      setRecentPoints(null);
    }, 2000);
  }, [checkAchievements, saveProgress, onPointsEarned, onLevelUp]);

  // Helper functions
  const getCategoryForAction = (action: string): AdventurePoint['category'] => {
    if (action.includes('share') || action.includes('whatsapp')) return 'social';
    if (action.includes('booking')) return 'booking';
    if (action.includes('discovery') || action.includes('explore')) return 'exploration';
    return 'engagement';
  };

  const getDescriptionForAction = (action: string): string => {
    const descriptions: Record<string, string> = {
      'page_load': 'Visited the page',
      'hero_cta_click': 'Clicked main CTA',
      'weather_check': 'Checked weather conditions',
      'trip_discovery': 'Explored trip options',
      'share': 'Shared adventure',
      'booking_completed': 'Completed booking',
      // Add more as needed
    };
    return descriptions[action] || 'Performed action';
  };

  const getRarityColor = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Expose the awardPoints function globally for other components
  useEffect(() => {
    (window as any).awardAdventurePoints = awardPoints;
    return () => {
      delete (window as any).awardAdventurePoints;
    };
  }, [awardPoints]);

  // Auto-award points for page interactions
  useEffect(() => {
    // Award points for initial page load
    const timer = setTimeout(() => {
      awardPoints('page_load', 5);
    }, 1000);

    // Award points for scroll milestones
    let lastScrollY = 0;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercent = (scrollY / (documentHeight - windowHeight)) * 100;

      // Award points for different scroll milestones
      if (scrollPercent > 25 && lastScrollY <= 25) {
        awardPoints('scroll_milestone', 10);
      } else if (scrollPercent > 50 && lastScrollY <= 50) {
        awardPoints('scroll_milestone', 15);
      } else if (scrollPercent > 75 && lastScrollY <= 75) {
        awardPoints('scroll_milestone', 20);
      }
      
      lastScrollY = scrollPercent;
    };

    // Award points for time spent on page
    const timeInterval = setInterval(() => {
      awardPoints('session_time', 5);
    }, 30000); // Every 30 seconds

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      clearInterval(timeInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [awardPoints]);

  // Auto-show widget after some activity
  useEffect(() => {
    if (userProgress.totalPoints > 20) {
      setIsVisible(true);
    }
  }, [userProgress.totalPoints]);

  if (!isVisible && userProgress.totalPoints <= 20) return null;

  return (
    <div className={`${className}`}>
      {/* Points Animation */}
      <AnimatePresence>
        {showPointsAnimation && recentPoints && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.5 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span className="font-bold">+{recentPoints.points} Points!</span>
              <Zap className="w-5 h-5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Unlock Animation */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50, rotateY: 90 }}
              animate={{ y: 0, rotateY: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
            >
              {/* Celebration particles */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%'
                  }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(i * 18 * Math.PI / 180) * 150,
                    y: Math.sin(i * 18 * Math.PI / 180) * 150,
                    opacity: 0
                  }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              ))}

              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: 2 }}
                className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <showAchievement.icon className="w-10 h-10 text-white" />
              </motion.div>

              <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 Achievement Unlocked!</h3>
              <h4 className="text-xl font-semibold text-emerald-600 mb-2">{showAchievement.name}</h4>
              <p className="text-gray-600 mb-4">{showAchievement.description}</p>
              
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(showAchievement.rarity)} mb-4`}>
                {showAchievement.rarity.toUpperCase()}
              </div>

              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <Star className="w-5 h-5" />
                <span className="font-bold">+{showAchievement.points} Points</span>
              </div>

              <button
                onClick={() => {
                  setShowAchievement(null);
                  // Award bonus points for completing achievement
                  awardPoints('achievement_celebrated', 25);
                }}
                className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Awesome! 🎉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Progress Widget (always visible when points > 20) */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-36 right-4 z-40 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/20 max-w-xs cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
        onClick={() => {
          awardPoints('widget_interaction', 15);
          setIsVisible(true);
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-800">Level {userProgress.level}</div>
            <div className="text-sm text-gray-600">{userProgress.totalPoints} points</div>
          </div>
        </div>

        {/* Progress bar to next level */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Level {userProgress.level}</span>
            <span>Level {userProgress.level + 1}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
              style={{ 
                width: `${((userProgress.totalPoints % 100) / 100) * 100}%` 
              }}
              initial={{ width: 0 }}
              animate={{ width: `${((userProgress.totalPoints % 100) / 100) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Recent achievements */}
        <div className="flex gap-1">
          {userProgress.achievements
            .filter(a => a.unlocked)
            .slice(-3)
            .map(achievement => (
              <div
                key={achievement.id}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${getRarityColor(achievement.rarity)}`}
                title={achievement.name}
              >
                <achievement.icon className="w-3 h-3" />
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  );
};

// Export the awardPoints function for use by other components
export const useAdventurePoints = () => {
  return {
    awardPoints: (action: string, customPoints?: number) => {
      if ((window as any).awardAdventurePoints) {
        (window as any).awardAdventurePoints(action, customPoints);
      }
    }
  };
};