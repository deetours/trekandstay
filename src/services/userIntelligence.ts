// AI-Powered User Intelligence Service

// Helper function to make API calls
const API_BASE = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` })
  };
};

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<{data: T}> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

export interface UserAction {
  type: 'page_view' | 'trip_click' | 'search' | 'wishlist_add' | 'booking_attempt' | 'chat_interaction' | 'segmentation_view' | 'segment_select' | 'analytics_view' | 'social_view' | 'social_interaction' | 'budget_insight_click' | 'predictive_plan_action' | 'layout_view' | 'layout_change';
  data: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export interface UserBehaviorData {
  clickPatterns: ClickPattern[];
  searchHistory: SearchQuery[];
  bookingPatterns: BookingPattern[];
  seasonalPreferences: SeasonalData;
  budgetHistory: BudgetRange[];
  socialInteractions: SocialAction[];
  travelPersonality?: TravelPersonality;
}

export interface ClickPattern {
  element: string;
  frequency: number;
  timeOfDay: number;
  dayOfWeek: number;
  context: string;
}

export interface SearchQuery {
  query: string;
  timestamp: Date;
  resultsClicked: number;
  bookingCompleted: boolean;
  destination?: string;
  priceRange?: [number, number];
}

export interface BookingPattern {
  destination: string;
  season: string;
  bookingLeadTime: number; // days before travel
  priceRange: [number, number];
  travelDuration: number;
  companions: number;
}

export interface SeasonalData {
  preferredMonths: string[];
  avoidedMonths: string[];
  budgetByMonth: Record<string, number>;
}

export interface BudgetRange {
  min: number;
  max: number;
  actual: number;
  destination: string;
  date: Date;
}

export interface SocialAction {
  type: 'share' | 'review' | 'recommendation' | 'group_join';
  target: string;
  timestamp: Date;
  engagement: number;
}

export interface TravelPersonality {
  type: 'adventure_seeker' | 'luxury_traveler' | 'budget_explorer' | 'cultural_enthusiast' | 'nature_lover';
  traits: string[];
  description: string;
  confidence: number;
}

export interface AIRecommendation {
  id: string;
  destination: string;
  reason: string;
  personalizedReason: string;
  aiConfidence: number;
  priceRange: [number, number];
  bestTravelTime: string;
  similarTravelers: number;
  weatherForecast?: WeatherData;
  crowdLevel: 'low' | 'medium' | 'high';
  tags: string[];
  urgency: 'low' | 'medium' | 'high';
  potentialSavings?: number;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  rainfall: number;
}

export interface PersonalInsight {
  id: string;
  icon: string;
  title: string;
  description: string;
  actionable: boolean;
  actionText?: string;
  confidence: number;
  category: 'budget' | 'timing' | 'destination' | 'social' | 'sustainability';
}

export interface TravelAnalytics {
  totalTrips: number;
  countriesVisited: number;
  citiesVisited: number;
  totalSpent: number;
  averageSpend: number;
  carbonFootprint: number;
  favoriteDestinationType: string;
  preferredTravelDuration: number;
  socialScore: number;
  adventureScore: number;
  luxuryScore: number;
  budgetScore: number;
  travelPersonality: TravelPersonality;
  yearOverYearGrowth: number;
  nextTripPrediction?: AIRecommendation;
}

class UserIntelligenceService {
  private behaviorBuffer: UserAction[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startBehaviorTracking();
  }

  private startBehaviorTracking() {
    // Flush behavior data every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushBehaviorData();
    }, 30000);

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushBehaviorData();
      }
    });
  }

  async trackUserBehavior(userId: string, action: UserAction): Promise<void> {
    const enhancedAction: UserAction = {
      ...action,
      userId,
      timestamp: new Date(),
      sessionId: this.getSessionId()
    };

    this.behaviorBuffer.push(enhancedAction);

    // Real-time tracking for important actions
    if (['booking_attempt', 'chat_interaction'].includes(action.type)) {
      await this.sendBehaviorData([enhancedAction]);
    }
  }

  private async flushBehaviorData(): Promise<void> {
    if (this.behaviorBuffer.length === 0) return;

    try {
      await this.sendBehaviorData([...this.behaviorBuffer]);
      this.behaviorBuffer = [];
    } catch (error) {
      console.error('Failed to flush behavior data:', error);
    }
  }

  private async sendBehaviorData(actions: UserAction[]): Promise<void> {
    try {
      await apiCall('/api/user-intelligence/track/', {
        method: 'POST',
        body: JSON.stringify({ actions })
      });
    } catch (error) {
      console.error('Error sending behavior data:', error);
    }
  }

  async getUserBehavior(userId: string): Promise<UserBehaviorData> {
    try {
      const response = await apiCall<UserBehaviorData>(`/api/user-intelligence/behavior/${userId}/`);
      return response.data || this.getDefaultBehaviorData();
    } catch (error) {
      console.error('Error fetching user behavior:', error);
      return this.getDefaultBehaviorData();
    }
  }

  async generatePersonalizedRecommendations(userId: string, context?: Record<string, unknown>): Promise<AIRecommendation[]> {
    try {
      const response = await apiCall<AIRecommendation[]>('/api/user-intelligence/recommendations/', {
        method: 'POST',
        body: JSON.stringify({ 
          userId, 
          context,
          includeWeather: true,
          includePricing: true,
          limit: 10
        })
      });
      return response.data || this.getFallbackRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations();
    }
  }

  async getTravelPersonality(userId: string): Promise<TravelPersonality> {
    try {
      const response = await apiCall<TravelPersonality>(`/api/user-intelligence/personality/${userId}/`);
      return response.data || this.getDefaultPersonality();
    } catch (error) {
      console.error('Error fetching travel personality:', error);
      return this.getDefaultPersonality();
    }
  }

  async getTravelAnalytics(userId: string): Promise<TravelAnalytics> {
    try {
      const response = await apiCall<TravelAnalytics>(`/api/user-intelligence/analytics/${userId}/`);
      return response.data || this.getDefaultAnalytics();
    } catch (error) {
      console.error('Error fetching travel analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  async getPersonalInsights(userId: string): Promise<PersonalInsight[]> {
    try {
      const response = await apiCall<PersonalInsight[]>(`/api/user-intelligence/insights/${userId}/`);
      return response.data || this.getDefaultInsights();
    } catch (error) {
      console.error('Error fetching personal insights:', error);
      return this.getDefaultInsights();
    }
  }

  async updateUserPreferences(userId: string, preferences: Record<string, unknown>): Promise<void> {
    try {
      await apiCall(`/api/user-intelligence/preferences/${userId}/`, {
        method: 'POST',
        body: JSON.stringify(preferences)
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('user_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('user_session_id', sessionId);
    }
    return sessionId;
  }

  private getDefaultBehaviorData(): UserBehaviorData {
    return {
      clickPatterns: [],
      searchHistory: [],
      bookingPatterns: [],
      seasonalPreferences: {
        preferredMonths: ['October', 'November', 'December', 'January', 'February'],
        avoidedMonths: ['June', 'July', 'August'],
        budgetByMonth: {}
      },
      budgetHistory: [],
      socialInteractions: []
    };
  }

  private getDefaultPersonality(): TravelPersonality {
    return {
      type: 'cultural_enthusiast',
      traits: ['Curious', 'Budget-conscious', 'Social'],
      description: 'You enjoy exploring new cultures and connecting with local experiences while being mindful of your budget.',
      confidence: 75
    };
  }

  private getDefaultAnalytics(): TravelAnalytics {
    return {
      totalTrips: 0,
      countriesVisited: 0,
      citiesVisited: 0,
      totalSpent: 0,
      averageSpend: 0,
      carbonFootprint: 0,
      favoriteDestinationType: 'Mountains',
      preferredTravelDuration: 5,
      socialScore: 60,
      adventureScore: 70,
      luxuryScore: 30,
      budgetScore: 80,
      travelPersonality: this.getDefaultPersonality(),
      yearOverYearGrowth: 0
    };
  }

  private getDefaultInsights(): PersonalInsight[] {
    return [
      {
        id: '1',
        icon: '🎯',
        title: 'Perfect Timing',
        description: 'October-February are ideal months for your preferred destinations with 30% savings.',
        actionable: true,
        actionText: 'Explore Winter Deals',
        confidence: 85,
        category: 'timing'
      },
      {
        id: '2',
        icon: '💰',
        title: 'Budget Optimization',
        description: 'You can save ₹15,000 annually by booking 45 days in advance.',
        actionable: true,
        actionText: 'Set Price Alerts',
        confidence: 78,
        category: 'budget'
      }
    ];
  }

  private getFallbackRecommendations(): AIRecommendation[] {
    return [
      {
        id: 'fallback_1',
        destination: 'Kerala Backwaters',
        reason: 'Perfect for peaceful getaways',
        personalizedReason: 'Based on your love for nature and cultural experiences',
        aiConfidence: 75,
        priceRange: [15000, 25000],
        bestTravelTime: 'October - March',
        similarTravelers: 234,
        crowdLevel: 'medium',
        tags: ['Nature', 'Culture', 'Peaceful'],
        urgency: 'medium',
        weatherForecast: {
          temperature: 28,
          condition: 'Sunny',
          humidity: 65,
          rainfall: 0
        }
      },
      {
        id: 'fallback_2',
        destination: 'Himachal Pradesh',
        reason: 'Adventure meets tranquility',
        personalizedReason: 'Perfect for your adventurous spirit with stunning mountain views',
        aiConfidence: 82,
        priceRange: [20000, 35000],
        bestTravelTime: 'September - November',
        similarTravelers: 456,
        crowdLevel: 'high',
        tags: ['Adventure', 'Mountains', 'Photography'],
        urgency: 'high',
        potentialSavings: 8000
      }
    ];
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushBehaviorData();
  }
}

export const userIntelligenceService = new UserIntelligenceService();
