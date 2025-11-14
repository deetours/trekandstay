import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award, 
  Star,
  BarChart3,
  Activity,
  Eye,
  Share2,
  MapPin,
  Users,
  Zap,
  Trophy,
  BookOpen,
  CheckCircle,
  Circle,
  Flame,
  Sparkles
} from 'lucide-react';

export interface PointAction {
  action: string;
  timestamp?: number;
  points?: number;
  category?: string;
}

export interface Achievement {
  id: string;
  unlocked: boolean;
  name?: string;
}

export interface UserProgress {
  totalPoints: number;
  pointsHistory?: PointAction[];
  achievements?: Achievement[];
  timeSpent?: number;
  sessionsCount?: number;
  socialShares?: number;
  conversions?: number;
  streakDays?: number;
  lastActivity?: number;
}

export interface UserJourneyStep {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  completedAt?: number;
  points: number;
  category: 'discovery' | 'engagement' | 'consideration' | 'conversion' | 'advocacy';
  order: number;
}

export interface ProgressMetrics {
  totalPoints: number;
  level: number;
  experienceProgress: number; // 0-1 for current level progress
  badges: number;
  achievements: number;
  timeSpent: number;
  sessionsCount: number;
  avgSessionTime: number;
  completionRate: number;
  engagementScore: number;
  socialShares: number;
  conversions: number;
  streakDays: number;
  lastActivity: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: number;
  points: number;
  category: string;
  description: string;
}

interface ProgressTrackingDashboardProps {
  userProgress?: UserProgress;
  showDetailed?: boolean;
  onJourneyStepComplete?: (step: UserJourneyStep) => void;
  className?: string;
}

// Define the user journey steps
const JOURNEY_STEPS: UserJourneyStep[] = [
  {
    id: 'land_arrival',
    name: 'Arrival',
    description: 'First visit to the adventure page',
    icon: MapPin,
    completed: false,
    points: 5,
    category: 'discovery',
    order: 1
  },
  {
    id: 'content_exploration',
    name: 'Exploration',
    description: 'Explored trip details and highlights',
    icon: Eye,
    completed: false,
    points: 15,
    category: 'discovery',
    order: 2
  },
  {
    id: 'weather_check',
    name: 'Weather Awareness',
    description: 'Checked weather conditions',
    icon: Activity,
    completed: false,
    points: 20,
    category: 'engagement',
    order: 3
  },
  {
    id: 'itinerary_deep_dive',
    name: 'Planning Phase',
    description: 'Reviewed detailed itinerary',
    icon: BookOpen,
    completed: false,
    points: 25,
    category: 'engagement',
    order: 4
  },
  {
    id: 'social_interaction',
    name: 'Social Engagement',
    description: 'Shared or contacted about the trip',
    icon: Share2,
    completed: false,
    points: 35,
    category: 'consideration',
    order: 5
  },
  {
    id: 'price_consideration',
    name: 'Investment Evaluation',
    description: 'Considered pricing and packages',
    icon: Target,
    completed: false,
    points: 30,
    category: 'consideration',
    order: 6
  },
  {
    id: 'booking_initiation',
    name: 'Commitment Start',
    description: 'Started the booking process',
    icon: Calendar,
    completed: false,
    points: 75,
    category: 'conversion',
    order: 7
  },
  {
    id: 'seat_selection',
    name: 'Personal Choice',
    description: 'Selected preferred seats',
    icon: Users,
    completed: false,
    points: 50,
    category: 'conversion',
    order: 8
  },
  {
    id: 'booking_completion',
    name: 'Adventure Secured',
    description: 'Completed booking and payment',
    icon: Trophy,
    completed: false,
    points: 200,
    category: 'conversion',
    order: 9
  },
  {
    id: 'advocacy_sharing',
    name: 'Adventure Ambassador',
    description: 'Shared experience with others',
    icon: Sparkles,
    completed: false,
    points: 100,
    category: 'advocacy',
    order: 10
  }
];

export const ProgressTrackingDashboard: React.FC<ProgressTrackingDashboardProps> = ({
  userProgress,
  showDetailed = false,
  onJourneyStepComplete,
  className = ''
}) => {
  const [journeySteps, setJourneySteps] = useState<UserJourneyStep[]>(JOURNEY_STEPS);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  // Calculate comprehensive metrics
  const metrics = useMemo((): ProgressMetrics => {
    if (!userProgress) {
      return {
        totalPoints: 0,
        level: 1,
        experienceProgress: 0,
        badges: 0,
        achievements: 0,
        timeSpent: 0,
        sessionsCount: 1,
        avgSessionTime: 0,
        completionRate: 0,
        engagementScore: 0,
        socialShares: 0,
        conversions: 0,
        streakDays: 0,
        lastActivity: Date.now()
      };
    }

    const totalPoints = userProgress.totalPoints || 0;
    const level = Math.floor(totalPoints / 100) + 1;
    const experienceProgress = (totalPoints % 100) / 100;
    const completedSteps = journeySteps.filter(step => step.completed).length;
    const completionRate = completedSteps / journeySteps.length;
    
    // Calculate engagement score based on various factors
    const pointsScore = Math.min(totalPoints / 10, 50); // Max 50 from points
    const timeScore = Math.min((userProgress.timeSpent || 0) / 60000 * 10, 30); // Max 30 from time
    const socialScore = (userProgress.socialShares || 0) * 5; // 5 points per share
    const completionScore = completionRate * 20; // Max 20 from completion
    const engagementScore = Math.min(pointsScore + timeScore + socialScore + completionScore, 100);

    return {
      totalPoints,
      level,
      experienceProgress,
      badges: userProgress.achievements?.filter((a: Achievement) => a.unlocked).length || 0,
      achievements: userProgress.achievements?.length || 0,
      timeSpent: userProgress.timeSpent || 0,
      sessionsCount: userProgress.sessionsCount || 1,
      avgSessionTime: (userProgress.timeSpent || 0) / (userProgress.sessionsCount || 1),
      completionRate,
      engagementScore,
      socialShares: userProgress.socialShares || 0,
      conversions: userProgress.conversions || 0,
      streakDays: userProgress.streakDays || 0,
      lastActivity: userProgress.lastActivity || Date.now()
    };
  }, [userProgress, journeySteps]);

  // Update journey steps based on user progress
  useEffect(() => {
    if (!userProgress?.pointsHistory) return;

    const updatedSteps = journeySteps.map(step => {
      let shouldComplete = false;
      let completionTime: number | undefined;

      // Check completion criteria for each step
      switch (step.id) {
        case 'land_arrival': {
          shouldComplete = userProgress.pointsHistory.some((p: PointAction) => p.action === 'page_load');
          break;
        }
        case 'content_exploration': {
          shouldComplete = userProgress.pointsHistory.some((p: PointAction) => 
            ['highlights_read', 'content_scroll'].includes(p.action)
          );
          break;
        }
        case 'weather_check': {
          shouldComplete = userProgress.pointsHistory.some((p: PointAction) => p.action === 'weather_check');
          break;
        }
        case 'itinerary_deep_dive': {
          shouldComplete = userProgress.pointsHistory.some((p: PointAction) => p.action === 'itinerary_view');
          break;
        }
        case 'social_interaction': {
          shouldComplete = userProgress.pointsHistory.some((p: PointAction) => 
            ['share', 'whatsapp', 'call_action'].includes(p.action)
          );
          break;
        }
        case 'price_consideration': {
          shouldComplete = userProgress.pointsHistory.some((p: PointAction) => 
            ['pricing_view', 'calculator_use'].includes(p.action)
          );
          break;
        }
        case 'booking_initiation': {
          shouldComplete = userProgress.pointsHistory.some((p: PointAction) => p.action === 'booking_start');
          break;
        }
        case 'seat_selection': {
          shouldComplete = userProgress.pointsHistory.some((p: PointAction) => p.action === 'seat_selection');
          break;
        }
        case 'booking_completion': {
          shouldComplete = userProgress.pointsHistory.some((p: PointAction) => p.action === 'booking_completed');
          break;
        }
        case 'advocacy_sharing': {
          const shareCount = userProgress.pointsHistory.filter((p: PointAction) => 
            ['share', 'whatsapp'].includes(p.action)
          ).length;
          shouldComplete = shareCount >= 2;
          break;
        }
      }

      if (shouldComplete && !step.completed) {
        const relatedAction = userProgress.pointsHistory.find((p: PointAction) => {
          switch (step.id) {
            case 'land_arrival': return p.action === 'page_load';
            case 'weather_check': return p.action === 'weather_check';
            // Add other mappings as needed
            default: return false;
          }
        });
        
        completionTime = relatedAction?.timestamp || Date.now();
        
        // Trigger completion callback
        if (onJourneyStepComplete) {
          setTimeout(() => onJourneyStepComplete({ ...step, completed: true, completedAt: completionTime }), 100);
        }
      }

      return {
        ...step,
        completed: shouldComplete || step.completed,
        completedAt: step.completedAt || completionTime
      };
    });

    setJourneySteps(updatedSteps);
  }, [userProgress, onJourneyStepComplete, journeySteps]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getProgressColor = (progress: number): string => {
    if (progress < 0.3) return 'from-red-400 to-red-600';
    if (progress < 0.6) return 'from-yellow-400 to-yellow-600';
    if (progress < 0.8) return 'from-blue-400 to-blue-600';
    return 'from-emerald-400 to-emerald-600';
  };

  const getCategoryColor = (category: UserJourneyStep['category']): string => {
    switch (category) {
      case 'discovery': return 'from-purple-400 to-purple-600';
      case 'engagement': return 'from-blue-400 to-blue-600';
      case 'consideration': return 'from-yellow-400 to-yellow-600';
      case 'conversion': return 'from-emerald-400 to-emerald-600';
      case 'advocacy': return 'from-pink-400 to-pink-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (!showDetailed) {
    // Compact progress display
    return (
      <div className={`bg-white/10 backdrop-blur-md rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-semibold">Progress</span>
          </div>
          <button
            onClick={() => setShowJourneyModal(true)}
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>

        {/* Level Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-sm text-white/80 mb-1">
            <span>Level {metrics.level}</span>
            <span>{Math.round(metrics.experienceProgress * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.experienceProgress * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-white">{metrics.totalPoints}</div>
            <div className="text-xs text-white/70">Points</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{metrics.badges}</div>
            <div className="text-xs text-white/70">Badges</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{Math.round(metrics.completionRate * 100)}%</div>
            <div className="text-xs text-white/70">Journey</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Dashboard */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Adventure Progress</h2>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'all'] as const).map(timeframe => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Level</span>
            </div>
            <div className="text-2xl font-bold">{metrics.level}</div>
            <div className="text-sm opacity-90">{metrics.totalPoints} total points</div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <span className="font-semibold">Badges</span>
            </div>
            <div className="text-2xl font-bold">{metrics.badges}</div>
            <div className="text-sm opacity-90">of {metrics.achievements} available</div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Journey</span>
            </div>
            <div className="text-2xl font-bold">{Math.round(metrics.completionRate * 100)}%</div>
            <div className="text-sm opacity-90">completion rate</div>
          </div>

          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Engagement</span>
            </div>
            <div className="text-2xl font-bold">{Math.round(metrics.engagementScore)}</div>
            <div className="text-sm opacity-90">out of 100</div>
          </div>
        </div>

        {/* Journey Progress Visualization */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Adventure Journey</h3>
          <div className="space-y-3">
            {journeySteps.map((step, index) => (
              <motion.div
                key={step.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? `bg-gradient-to-r ${getCategoryColor(step.category)} text-white` 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-600">+{step.points}</span>
                    </div>
                  </div>
                  <p className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                  {step.completedAt && (
                    <p className="text-xs text-emerald-600 mt-1">
                      ✓ Completed {new Date(step.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Progress Line */}
                {index < journeySteps.length - 1 && (
                  <div className="absolute left-9 mt-12 w-0.5 h-6 bg-gray-200" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Time Analytics */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Analytics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Time Spent:</span>
                <span className="font-semibold">{formatTime(metrics.timeSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Session:</span>
                <span className="font-semibold">{formatTime(metrics.avgSessionTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sessions Count:</span>
                <span className="font-semibold">{metrics.sessionsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Streak Days:</span>
                <span className="font-semibold flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {metrics.streakDays}
                </span>
              </div>
            </div>
          </div>

          {/* Engagement Analytics */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Engagement Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Social Shares:</span>
                <span className="font-semibold">{metrics.socialShares}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversions:</span>
                <span className="font-semibold">{metrics.conversions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Engagement Score:</span>
                <span className="font-semibold">{Math.round(metrics.engagementScore)}/100</span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Overall Progress</span>
                  <span>{Math.round(metrics.completionRate * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${getProgressColor(metrics.completionRate)} h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${metrics.completionRate * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Modal */}
      <AnimatePresence>
        {showJourneyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Adventure Journey Map</h2>
                <button
                  onClick={() => setShowJourneyModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Journey visualization content */}
              <div className="space-y-4">
                {Object.entries(
                  journeySteps.reduce((acc, step) => {
                    if (!acc[step.category]) acc[step.category] = [];
                    acc[step.category].push(step);
                    return acc;
                  }, {} as Record<string, UserJourneyStep[]>)
                ).map(([category, steps]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3 capitalize">
                      {category} Phase ({steps.filter(s => s.completed).length}/{steps.length})
                    </h3>
                    <div className="space-y-2">
                      {steps.map(step => (
                        <div key={step.id} className="flex items-center gap-3 p-2 rounded">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-emerald-500 text-white' : 'bg-gray-200'
                          }`}>
                            {step.completed ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          </div>
                          <span className={step.completed ? 'text-gray-800' : 'text-gray-400'}>
                            {step.name}
                          </span>
                          <span className="text-sm text-gray-500">+{step.points}pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};