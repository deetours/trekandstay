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
}

export interface UserPreferences {
  favoriteCategories: string[];
  difficulty: string[];
  budget: [number, number];
  notifications: boolean;
}