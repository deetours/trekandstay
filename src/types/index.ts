export interface Destination {
  id: string;
  name: string;
  category: 'waterfall' | 'fort' | 'beach' | 'hill';
  location: string;
  state: 'Karnataka' | 'Maharashtra';
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
  duration: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  description: string;
  highlights: string[];
  included: string[];
  itinerary: ItineraryDay[];
  weather: WeatherInfo;
  coordinates: [number, number];
  maxGroupSize: number;
  availableDates: string[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: DailyForecast[];
}

export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
}

export interface BookingData {
  destinationId: string;
  startDate: string;
  endDate: string;
  groupSize: number;
  totalPrice: number;
  addOns: string[];
  customerInfo: CustomerInfo;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  medicalConditions?: string;
  dietaryRestrictions?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  adventurePoints: number;
  completedTrips: number;
  badges: string[];
  preferences: UserPreferences;
  isAdmin?: boolean; // added: admin flag for moderation UI
}

export interface UserPreferences {
  favoriteCategories: string[];
  difficulty: string[];
  budget: [number, number];
  notifications: boolean;
}

// Dashboard domain types
export interface Booking {
  id: number;
  user: number;
  destination: string;
  trip?: number | string;
  date: string; // ISO or display
  status: 'pending' | 'confirmed' | 'cancelled';
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface WishlistItem {
  id: number;
  trip: number | string;
  trip_name?: string;
  trip_image?: string;
  notes?: string;
  created_at?: string;
}

export interface RecommendationItem {
  id: number | string;
  trip?: number | string;
  destination: string;
  reason?: string;
}

export interface TripHistoryItem {
  id: number;
  trip?: number | string;
  destination: string;
  date: string;
  feedback?: boolean;
}