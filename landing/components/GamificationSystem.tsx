import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Target, Mountain, Camera, Map, 
  Award, Gift, Crown, Flame,
  TrendingUp, Users, Clock
} from 'lucide-react';
import { THEME } from '../../src/config/theme';

interface UserProgress {
  points: number;
  level: number;
  badges: string[];
  completedChallenges: string[];
  streak: number;
  totalBookings: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  points: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  deadline: string;
  completed: boolean;
  progress: number;
  maxProgress: number;
  action: string;
}

export const GamificationSystem: React.FC = () => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    points: 120,
    level: 2,
    badges: ['explorer', 'early-bird'],
    completedChallenges: ['first-visit', 'profile-complete'],
    streak: 3,
    totalBookings: 1
  });

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const achievements: Achievement[] = React.useMemo(() => [
    {
      id: 'explorer',
      title: 'Explorer',
      description: 'Visited 5+ trip pages',
      icon: Map,
      points: 50,
      unlocked: true,
      progress: 8,
      maxProgress: 5
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Book a trip 30+ days in advance',
      icon: Clock,
      points: 100,
      unlocked: true
    },
    {
      id: 'social-butterfly',
      title: 'Social Butterfly',
      description: 'Share 3 trips on social media',
      icon: Users,
      points: 75,
      unlocked: false,
      progress: 1,
      maxProgress: 3
    },
    {
      id: 'photographer',
      title: 'Adventure Photographer',
      description: 'Upload 10 trip photos',
      icon: Camera,
      points: 150,
      unlocked: false,
      progress: 0,
      maxProgress: 10
    },
    {
      id: 'summit-master',
      title: 'Summit Master',
      description: 'Complete 5 trekking adventures',
      icon: Mountain,
      points: 500,
      unlocked: false,
      progress: 1,
      maxProgress: 5
    },
    {
      id: 'loyal-adventurer',
      title: 'Loyal Adventurer',
      description: 'Book 10 trips with us',
      icon: Crown,
      points: 1000,
      unlocked: false,
      progress: 1,
      maxProgress: 10
    }
  ], []);

  const challenges: Challenge[] = [
    {
      id: 'weekend-warrior',
      title: 'Weekend Warrior',
      description: 'Book a weekend trek',
      reward: 100,
      deadline: '2024-09-30',
      completed: false,
      progress: 0,
      maxProgress: 1,
      action: 'Book Now'
    },
    {
      id: 'referral-master',
      title: 'Bring a Friend',
      description: 'Refer 2 friends this month',
      reward: 200,
      deadline: '2024-09-30',
      completed: false,
      progress: 0,
      maxProgress: 2,
      action: 'Invite Friends'
    },
    {
      id: 'review-writer',
      title: 'Review Writer',
      description: 'Write detailed reviews for 2 trips',
      reward: 150,
      deadline: '2024-10-15',
      completed: false,
      progress: 1,
      maxProgress: 2,
      action: 'Write Review'
    }
  ];

  const getCurrentLevel = (points: number) => {
    if (points < 100) return 1;
    if (points < 300) return 2;
    if (points < 600) return 3;
    if (points < 1000) return 4;
    return 5;
  };

  const getPointsToNextLevel = (points: number) => {
    const level = getCurrentLevel(points);
    const thresholds = [0, 100, 300, 600, 1000, 2000];
    return thresholds[level] - points;
  };

  const awardPoints = useCallback((points: number) => {
    setUserProgress(prev => {
      const newPoints = prev.points + points;
      const newLevel = getCurrentLevel(newPoints);
      const leveledUp = newLevel > prev.level;
      
      if (leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      return {
        ...prev,
        points: newPoints,
        level: newLevel
      };
    });
  }, []);

  // Simulate user interactions triggering gamification
  useEffect(() => {
    const handleUserInteraction = (event: string) => {
      switch (event) {
        case 'trip_view':
          awardPoints(5);
          break;
        case 'trip_share':
          awardPoints(20);
          break;
        case 'review_written':
          awardPoints(50);
          break;
        case 'booking_completed':
          awardPoints(200);
          break;
      }
    };

    // Simulate some events for demo
    const timer = setTimeout(() => {
      handleUserInteraction('trip_view');
    }, 2000);

    return () => clearTimeout(timer);
  }, [awardPoints]);

  const LevelUpNotification = () => (
    <AnimatePresence>
      {showLevelUp && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl shadow-2xl"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Level Up!</h3>
              <p className="text-sm opacity-90">You've reached Level {userProgress.level}!</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <LevelUpNotification />
      
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header with User Stats */}
        <div className="bg-gradient-to-r from-forest-green to-waterfall-blue text-white p-6" style={{
          background: `linear-gradient(135deg, ${THEME.colors.forestGreen}, ${THEME.colors.waterfallBlue})`
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Adventure Level {userProgress.level}</h2>
                <p className="opacity-80">{userProgress.points} Adventure Points</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <span className="text-sm font-medium">
                  {getPointsToNextLevel(userProgress.points)} points to Level {userProgress.level + 1}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-white h-full rounded-full"
                style={{ 
                  width: `${((userProgress.points % 300) / 300) * 100}%` 
                }}
                initial={{ width: 0 }}
                animate={{ width: `${((userProgress.points % 300) / 300) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'challenges', label: 'Challenges', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 bg-opacity-5'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={activeTab === tab.id ? {
                  color: THEME.colors.forestGreen,
                  borderColor: THEME.colors.forestGreen,
                  backgroundColor: `${THEME.colors.forestGreen}10`
                } : {}}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-700 font-medium">Current Streak</p>
                    <p className="text-3xl font-bold text-emerald-900">{userProgress.streak} days</p>
                  </div>
                  <Flame className="w-12 h-12 text-emerald-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-700 font-medium">Total Bookings</p>
                    <p className="text-3xl font-bold text-indigo-900">{userProgress.totalBookings}</p>
                  </div>
                  <Mountain className="w-12 h-12 text-indigo-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-700 font-medium">Badges Earned</p>
                    <p className="text-3xl font-bold text-violet-900">{userProgress.badges.length}</p>
                  </div>
                  <Award className="w-12 h-12 text-violet-600" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    achievement.unlocked
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      achievement.unlocked
                        ? 'text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                    style={achievement.unlocked ? {
                      backgroundColor: THEME.colors.forestGreen
                    } : {}}
                    >
                      {React.createElement(achievement.icon, { className: "w-6 h-6" })}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${
                        achievement.unlocked ? 'text-green-900' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium" style={{ color: THEME.colors.waterfallBlue }}>
                          +{achievement.points} points
                        </span>
                        {achievement.progress !== undefined && (
                          <span className="text-xs text-gray-500">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        )}
                      </div>
                      {achievement.progress !== undefined && (
                        <div className="mt-2 bg-gray-200 rounded-full h-1">
                          <div
                            className="h-1 rounded-full"
                            style={{ 
                              width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%`,
                              backgroundColor: THEME.colors.waterfallBlue
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  className="p-6 rounded-xl border"
                  whileHover={{ scale: 1.01 }}
                  style={{
                    background: `linear-gradient(135deg, ${THEME.colors.adventureOrange}15, ${THEME.colors.waterfallBlue}15)`,
                    borderColor: THEME.colors.adventureOrange
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold" style={{ color: THEME.colors.forestGreen }}>
                        {challenge.title}
                      </h3>
                      <p className="mt-1" style={{ color: THEME.colors.waterfallBlue }}>
                        {challenge.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <Gift className="w-5 h-5" style={{ color: THEME.colors.adventureOrange }} />
                          <span className="font-medium" style={{ color: THEME.colors.forestGreen }}>
                            +{challenge.reward} points
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5" style={{ color: THEME.colors.adventureOrange }} />
                          <span className="text-sm" style={{ color: THEME.colors.waterfallBlue }}>
                            Until {challenge.deadline}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium" style={{ color: THEME.colors.forestGreen }}>
                            Progress
                          </span>
                          <span className="text-sm" style={{ color: THEME.colors.waterfallBlue }}>
                            {challenge.progress}/{challenge.maxProgress}
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(challenge.progress / challenge.maxProgress) * 100}%`,
                              backgroundColor: THEME.colors.adventureOrange
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <motion.button
                      className="ml-6 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        background: `linear-gradient(135deg, ${THEME.colors.forestGreen}, ${THEME.colors.waterfallBlue})`
                      }}
                    >
                      {challenge.action}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default GamificationSystem;
