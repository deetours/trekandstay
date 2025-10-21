import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Eye, 
  MousePointer, 
  Heart,
  Share2,
  Phone,
  Target,
  Zap,
  Award,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Thermometer,
  Flame,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  MapPin,
  Smartphone,
  Globe,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

export interface EngagementMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  weight: number; // For lead scoring calculation
  category: 'behavioral' | 'temporal' | 'social' | 'conversion' | 'technical';
  description: string;
}

export interface UserBehaviorEvent {
  id: string;
  type: 'click' | 'scroll' | 'hover' | 'focus' | 'blur' | 'resize' | 'keypress';
  element?: string;
  timestamp: number;
  duration?: number;
  coordinates?: { x: number; y: number };
  metadata?: Record<string, any>;
}

export interface LeadScore {
  total: number;
  breakdown: {
    engagement: number;
    intent: number;
    behavior: number;
    social: number;
    technical: number;
  };
  grade: 'Cold' | 'Warm' | 'Hot' | 'Burning';
  likelihood: number; // 0-100 conversion probability
  recommendations: string[];
}

export interface SessionData {
  sessionId: string;
  startTime: number;
  duration: number;
  pageViews: number;
  interactions: number;
  scrollDepth: number;
  exitIntent: boolean;
  referrer?: string;
  userAgent?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionSpeed?: 'slow' | 'fast';
}

interface UserEngagementAnalyticsProps {
  tripData?: any;
  onLeadScoreUpdate?: (score: LeadScore) => void;
  onHighValueAction?: (action: string, score: number) => void;
  showRealTimeAnalytics?: boolean;
  className?: string;
}

export const UserEngagementAnalytics: React.FC<UserEngagementAnalyticsProps> = ({
  tripData,
  onLeadScoreUpdate,
  onHighValueAction,
  showRealTimeAnalytics = false,
  className = ''
}) => {
  const [sessionData, setSessionData] = useState<SessionData>({
    sessionId: `session_${Date.now()}`,
    startTime: Date.now(),
    duration: 0,
    pageViews: 1,
    interactions: 0,
    scrollDepth: 0,
    exitIntent: false,
    deviceType: 'desktop'
  });

  const [behaviorEvents, setBehaviorEvents] = useState<UserBehaviorEvent[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetric[]>([]);
  const [leadScore, setLeadScore] = useState<LeadScore>({
    total: 0,
    breakdown: { engagement: 0, intent: 0, behavior: 0, social: 0, technical: 0 },
    grade: 'Cold',
    likelihood: 0,
    recommendations: []
  });

  const [realTimeStats, setRealTimeStats] = useState({
    activeTime: 0,
    clicksPerMinute: 0,
    scrollVelocity: 0,
    focusTime: 0,
    engagementLevel: 'Low'
  });

  const lastScrollY = useRef(0);
  const sessionTimer = useRef<NodeJS.Timeout>();
  const metricsTimer = useRef<NodeJS.Timeout>();
  const behaviorTracker = useRef<NodeJS.Timeout>();

  // Initialize tracking
  useEffect(() => {
    initializeTracking();
    return () => {
      if (sessionTimer.current) clearInterval(sessionTimer.current);
      if (metricsTimer.current) clearInterval(metricsTimer.current);
      if (behaviorTracker.current) clearInterval(behaviorTracker.current);
    };
  }, []);

  const initializeTracking = () => {
    // Detect device type
    const userAgent = navigator.userAgent;
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Mobile|Android|iPhone/i.test(userAgent)) deviceType = 'mobile';
    else if (/iPad|Tablet/i.test(userAgent)) deviceType = 'tablet';

    // Detect connection speed (approximate)
    const connectionSpeed = (navigator as any).connection?.effectiveType?.includes('4g') ? 'fast' : 'slow';

    setSessionData(prev => ({
      ...prev,
      userAgent,
      deviceType,
      connectionSpeed,
      referrer: document.referrer
    }));

    // Start session timer
    sessionTimer.current = setInterval(() => {
      setSessionData(prev => ({
        ...prev,
        duration: Date.now() - prev.startTime
      }));
    }, 1000);

    // Start metrics calculation timer
    metricsTimer.current = setInterval(() => {
      calculateEngagementMetrics();
      updateLeadScore();
    }, 5000); // Update every 5 seconds

    // Add event listeners
    addEventListeners();
  };

  const addEventListeners = () => {
    // Click tracking
    document.addEventListener('click', (e) => {
      trackBehaviorEvent({
        id: `click_${Date.now()}`,
        type: 'click',
        element: (e.target as HTMLElement).tagName,
        timestamp: Date.now(),
        coordinates: { x: e.clientX, y: e.clientY },
        metadata: {
          elementId: (e.target as HTMLElement).id,
          elementClass: (e.target as HTMLElement).className
        }
      });
      
      setSessionData(prev => ({ ...prev, interactions: prev.interactions + 1 }));
    });

    // Scroll tracking
    document.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      const scrollVelocity = Math.abs(window.scrollY - lastScrollY.current);
      lastScrollY.current = window.scrollY;
      
      setSessionData(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollPercent)
      }));
      
      setRealTimeStats(prev => ({
        ...prev,
        scrollVelocity
      }));
      
      trackBehaviorEvent({
        id: `scroll_${Date.now()}`,
        type: 'scroll',
        timestamp: Date.now(),
        metadata: { scrollPercent, scrollVelocity }
      });
    });

    // Mouse movement tracking (throttled)
    let mouseTracker: NodeJS.Timeout;
    document.addEventListener('mousemove', (e) => {
      clearTimeout(mouseTracker);
      mouseTracker = setTimeout(() => {
        trackBehaviorEvent({
          id: `hover_${Date.now()}`,
          type: 'hover',
          timestamp: Date.now(),
          coordinates: { x: e.clientX, y: e.clientY }
        });
      }, 500);
    });

    // Focus/blur tracking
    window.addEventListener('focus', () => {
      trackBehaviorEvent({
        id: `focus_${Date.now()}`,
        type: 'focus',
        timestamp: Date.now()
      });
    });

    window.addEventListener('blur', () => {
      trackBehaviorEvent({
        id: `blur_${Date.now()}`,
        type: 'blur',
        timestamp: Date.now()
      });
    });

    // Exit intent detection
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0) {
        setSessionData(prev => ({ ...prev, exitIntent: true }));
        trackHighValueAction('exit_intent', -10);
      }
    });

    // Keyboard interaction tracking
    document.addEventListener('keydown', () => {
      trackBehaviorEvent({
        id: `keypress_${Date.now()}`,
        type: 'keypress',
        timestamp: Date.now()
      });
    });
  };

  const trackBehaviorEvent = (event: UserBehaviorEvent) => {
    setBehaviorEvents(prev => [...prev.slice(-99), event]); // Keep last 100 events
  };

  const trackHighValueAction = (action: string, scoreChange: number) => {
    onHighValueAction?.(action, scoreChange);
    
    // Update lead score immediately for high-value actions
    if (Math.abs(scoreChange) >= 10) {
      setTimeout(() => updateLeadScore(), 100);
    }
  };

  const calculateEngagementMetrics = () => {
    const now = Date.now();
    const sessionDuration = now - sessionData.startTime;
    const recentEvents = behaviorEvents.filter(e => now - e.timestamp < 60000); // Last minute

    const metrics: EngagementMetric[] = [
      {
        id: 'session_duration',
        name: 'Session Duration',
        value: Math.round(sessionDuration / 1000),
        trend: 'up',
        weight: 0.2,
        category: 'temporal',
        description: 'Time spent on page'
      },
      {
        id: 'interaction_rate',
        name: 'Interaction Rate',
        value: Math.round((sessionData.interactions / (sessionDuration / 60000)) * 100) / 100,
        trend: recentEvents.length > 5 ? 'up' : recentEvents.length < 2 ? 'down' : 'stable',
        weight: 0.25,
        category: 'behavioral',
        description: 'Interactions per minute'
      },
      {
        id: 'scroll_depth',
        name: 'Scroll Depth',
        value: sessionData.scrollDepth,
        trend: sessionData.scrollDepth > 50 ? 'up' : 'stable',
        weight: 0.15,
        category: 'behavioral',
        description: 'Percentage of page scrolled'
      },
      {
        id: 'click_diversity',
        name: 'Click Diversity',
        value: new Set(behaviorEvents.filter(e => e.type === 'click').map(e => e.element)).size,
        trend: 'stable',
        weight: 0.2,
        category: 'behavioral',
        description: 'Different elements interacted with'
      },
      {
        id: 'focus_consistency',
        name: 'Focus Consistency',
        value: behaviorEvents.filter(e => e.type === 'focus').length,
        trend: 'stable',
        weight: 0.1,
        category: 'behavioral',
        description: 'Page focus events'
      },
      {
        id: 'device_score',
        name: 'Device Score',
        value: sessionData.deviceType === 'mobile' ? 1.2 : sessionData.deviceType === 'tablet' ? 1.1 : 1.0,
        trend: 'stable',
        weight: 0.05,
        category: 'technical',
        description: 'Device type bonus'
      },
      {
        id: 'connection_score',
        name: 'Connection Quality',
        value: sessionData.connectionSpeed === 'fast' ? 1.1 : 0.9,
        trend: 'stable',
        weight: 0.05,
        category: 'technical',
        description: 'Connection speed factor'
      }
    ];

    setEngagementMetrics(metrics);
    
    // Update real-time stats
    setRealTimeStats({
      activeTime: Math.round(sessionDuration / 1000),
      clicksPerMinute: Math.round((sessionData.interactions / (sessionDuration / 60000)) * 100) / 100,
      scrollVelocity: realTimeStats.scrollVelocity,
      focusTime: behaviorEvents.filter(e => e.type === 'focus').length,
      engagementLevel: sessionData.interactions > 10 ? 'High' : sessionData.interactions > 5 ? 'Medium' : 'Low'
    });
  };

  const updateLeadScore = useCallback(() => {
    let totalScore = 0;
    const breakdown = { engagement: 0, intent: 0, behavior: 0, social: 0, technical: 0 };

    // Calculate scores from engagement metrics
    engagementMetrics.forEach(metric => {
      let normalizedValue = 0;
      
      switch (metric.id) {
        case 'session_duration':
          normalizedValue = Math.min(metric.value / 300, 1) * 100; // Max at 5 minutes
          breakdown.engagement += normalizedValue * metric.weight;
          break;
        case 'interaction_rate':
          normalizedValue = Math.min(metric.value / 5, 1) * 100; // Max at 5 interactions/min
          breakdown.behavior += normalizedValue * metric.weight;
          break;
        case 'scroll_depth':
          normalizedValue = metric.value; // Already percentage
          breakdown.intent += normalizedValue * metric.weight;
          break;
        case 'click_diversity':
          normalizedValue = Math.min(metric.value / 10, 1) * 100; // Max at 10 different elements
          breakdown.behavior += normalizedValue * metric.weight;
          break;
        case 'device_score':
        case 'connection_score':
          breakdown.technical += metric.value * 10 * metric.weight;
          break;
      }
      
      totalScore += normalizedValue * metric.weight;
    });

    // Add bonus scores for specific actions (from user progress)
    const userProgressActions = (window as any).adventureUserProgress?.pointsHistory || [];
    
    // Social engagement bonus
    const socialActions = userProgressActions.filter((p: any) => 
      ['share', 'whatsapp', 'call_action'].includes(p.action)
    );
    breakdown.social = Math.min(socialActions.length * 15, 50);

    // Intent signals bonus
    const intentActions = userProgressActions.filter((p: any) => 
      ['booking_start', 'seat_selection', 'weather_check', 'itinerary_view'].includes(p.action)
    );
    breakdown.intent += Math.min(intentActions.length * 20, 60);

    // Calculate final score
    totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    
    // Determine grade and likelihood
    let grade: LeadScore['grade'] = 'Cold';
    let likelihood = 0;
    let recommendations: string[] = [];

    if (totalScore >= 80) {
      grade = 'Burning';
      likelihood = 85 + Math.random() * 15;
      recommendations = [
        'Immediate follow-up recommended',
        'Offer limited-time discount',
        'Direct phone call suggested'
      ];
    } else if (totalScore >= 60) {
      grade = 'Hot';
      likelihood = 60 + Math.random() * 25;
      recommendations = [
        'Send personalized offer',
        'WhatsApp follow-up within 1 hour',
        'Highlight unique trip features'
      ];
    } else if (totalScore >= 40) {
      grade = 'Warm';
      likelihood = 30 + Math.random() * 30;
      recommendations = [
        'Email nurture sequence',
        'Retargeting ads',
        'Social proof notifications'
      ];
    } else {
      grade = 'Cold';
      likelihood = Math.random() * 30;
      recommendations = [
        'Content marketing engagement',
        'General newsletter signup',
        'Social media engagement'
      ];
    }

    const newLeadScore: LeadScore = {
      total: Math.round(totalScore),
      breakdown,
      grade,
      likelihood: Math.round(likelihood),
      recommendations
    };

    setLeadScore(newLeadScore);
    onLeadScoreUpdate?.(newLeadScore);
  }, [engagementMetrics, onLeadScoreUpdate]);

  const getGradeColor = (grade: LeadScore['grade']) => {
    switch (grade) {
      case 'Burning': return 'from-red-500 to-orange-600';
      case 'Hot': return 'from-orange-500 to-yellow-600';
      case 'Warm': return 'from-yellow-500 to-green-500';
      case 'Cold': return 'from-blue-500 to-gray-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTrendIcon = (trend: EngagementMetric['trend']) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  if (!showRealTimeAnalytics) {
    // Compact lead score display
    return (
      <div className={`bg-white/10 backdrop-blur-md rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Lead Score</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getGradeColor(leadScore.grade)}`}>
            {leadScore.grade}
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm text-white/80 mb-1">
            <span>Score: {leadScore.total || 0}/100</span>
            <span>{leadScore.likelihood || 0}% likely</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className={`bg-gradient-to-r ${getGradeColor(leadScore.grade)} h-2 rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${leadScore.total}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="text-xs text-white/70">
          Session: {Math.round((realTimeStats.activeTime || 0) / 60)}m | 
          Interactions: {sessionData.interactions || 0} | 
          Engagement: {realTimeStats.engagementLevel || 'Low'}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-xl ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Live Analytics</h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">Real-time</span>
        </div>
      </div>

      {/* Lead Score Card */}
      <div className={`bg-gradient-to-r ${getGradeColor(leadScore.grade)} rounded-xl p-6 text-white mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Lead Score: {leadScore.total}</h3>
            <p className="text-white/90">Grade: {leadScore.grade} ({leadScore.likelihood}% conversion likelihood)</p>
          </div>
          <Thermometer className="w-12 h-12" />
        </div>
        
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Object.entries(leadScore.breakdown).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-lg font-bold">{Math.round(value)}</div>
              <div className="text-xs opacity-90 capitalize">{key}</div>
            </div>
          ))}
        </div>

        <div className="text-sm">
          <strong>Recommendations:</strong> {Array.isArray(leadScore.recommendations) ? leadScore.recommendations.join(', ') : 'Analyzing...'}
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Active Time</span>
          </div>
          <div className="text-2xl font-bold">{Math.round(realTimeStats.activeTime / 60)}m</div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer className="w-5 h-5" />
            <span className="font-semibold">Clicks/Min</span>
          </div>
          <div className="text-2xl font-bold">{realTimeStats.clicksPerMinute}</div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5" />
            <span className="font-semibold">Scroll Depth</span>
          </div>
          <div className="text-2xl font-bold">{sessionData.scrollDepth}%</div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">Engagement</span>
          </div>
          <div className="text-2xl font-bold">{realTimeStats.engagementLevel}</div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Engagement Metrics</h3>
          <div className="space-y-3">
            {engagementMetrics.slice(0, 5).map(metric => (
              <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{metric.name}</div>
                  <div className="text-sm text-gray-600">{metric.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{metric.value}</span>
                  {getTrendIcon(metric.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Device Type</span>
              <span className="font-medium capitalize">{sessionData.deviceType}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Connection Speed</span>
              <span className="font-medium capitalize">{sessionData.connectionSpeed}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Page Views</span>
              <span className="font-medium">{sessionData.pageViews}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Interactions</span>
              <span className="font-medium">{sessionData.interactions}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Exit Intent</span>
              <span className={`font-medium ${sessionData.exitIntent ? 'text-red-600' : 'text-green-600'}`}>
                {sessionData.exitIntent ? 'Detected' : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};