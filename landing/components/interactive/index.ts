// Interactive Components for Landing Pages
export { ParallaxBackground } from './ParallaxBackground';
export { TrekDiscoveryWidget } from './TrekDiscoveryWidget';
export { FloatingActionBubbles } from './FloatingActionBubbles';
export { LiveWeatherWidget } from './LiveWeatherWidget';
export { AnimatedCTAButton } from './AnimatedCTAButton';

// Gamification System Components
export { 
  AdventurePointsSystem, 
  AchievementBadgeSystem, 
  ProgressTrackingDashboard, 
  InteractiveChallenges, 
  UserEngagementAnalytics,
  useAdventurePoints
} from '../gamification';

// Gamification Types
export type { 
  AdventurePoint, 
  Achievement, 
  UserProgress,
  Badge,
  BadgeUnlockCondition,
  UserJourneyStep,
  ProgressMetrics,
  Challenge,
  ChallengeResult,
  EngagementMetric,
  LeadScore
} from '../gamification';