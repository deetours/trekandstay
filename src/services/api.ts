// src/services/api.ts
// API service with Firestore fallback

import axios from 'axios';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getDbOrThrow } from '../firebase';

// Firestore fallback URL (for now)
export const API_BASE_URL = 'firestore-fallback';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API error:', err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Token ${authToken}`;
  return headers;
}

// Firestore-based trip fetching (fallback)
export async function fetchTrips() {
  try {
    console.log('Fetching trips from Firestore...');
    const db = getDbOrThrow();
    const tripsRef = collection(db, 'trips');
    const q = query(tripsRef, orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);

    const trips = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Ensure required fields exist
      name: doc.data().name || doc.data().title || 'Unnamed Trip',
      location: doc.data().location || 'TBD',
      price: doc.data().price || 0,
      duration_days: doc.data().duration_days || doc.data().duration || 3,
      difficulty_level: doc.data().difficulty_level || doc.data().difficulty || 'Moderate',
      spots_available: doc.data().spots_available || doc.data().availableSlots || 10,
      total_spots: doc.data().total_spots || doc.data().maxCapacity || 20,
      image_url: doc.data().image_url || doc.data().image || doc.data().images?.[0],
      description: doc.data().description || '',
      highlights: doc.data().highlights || [],
      tags: doc.data().tags || [],
      rating: doc.data().rating || 4.5,
      review_count: doc.data().review_count || doc.data().reviewCount || 0,
      start_date: doc.data().start_date || doc.data().nextDeparture,
      end_date: doc.data().end_date,
      is_active: doc.data().is_active !== false,
      createdAt: doc.data().createdAt,
    }));

    console.log('Fetched trips from Firestore:', trips.length);
    return trips;
  } catch (error) {
    console.error('Error fetching from Firestore:', error);
    // Return empty array as fallback
    return [];
  }
}

export async function fetchTripBySlug(slug: string) {
  // Firestore fallback - return mock trip
  console.log('fetchTripBySlug called - returning mock trip (Firestore fallback)');
  return {
    id: slug,
    name: 'Sample Trip',
    location: 'Sample Location',
    price: 5000,
    duration_days: 3,
    difficulty_level: 'Moderate',
    description: 'A sample trip for testing',
    highlights: ['Scenic views', 'Great experience'],
    images: ['https://via.placeholder.com/400x300?text=Trip'],
    rating: 4.5,
    review_count: 10
  };
}

export async function fetchTripHistory() {
  // Firestore fallback - return empty array
  console.log('fetchTripHistory called - returning empty array (Firestore fallback)');
  return [];
}

export async function fetchTripRecommendations() {
  // Firestore fallback - return empty array
  console.log('fetchTripRecommendations called - returning empty array (Firestore fallback)');
  return [];
}

export async function generateTripRecommendations() {
  // Firestore fallback - return empty array
  console.log('generateTripRecommendations called - returning empty array (Firestore fallback)');
  return [];
}

export async function fetchWishlist() {
  // Firestore fallback - return empty array
  console.log('fetchWishlist called - returning empty array (Firestore fallback)');
  return [];
}

export async function addToWishlist(tripId: number) {
  // Firestore fallback - mock success
  console.log('addToWishlist called - mock success (Firestore fallback)');
  return { id: Date.now(), trip: tripId };
}

export async function removeFromWishlist(wishlistId: number) {
  // Firestore fallback - mock success
  console.log('removeFromWishlist called - mock success (Firestore fallback)');
  return true;
}

export async function fetchUserProfile() {
  // Firestore fallback - return mock profile
  console.log('fetchUserProfile called - returning mock profile (Firestore fallback)');
  return {
    id: 1,
    username: 'guest',
    email: 'guest@example.com',
    first_name: 'Guest',
    last_name: 'User'
  };
}

// Booking-related APIs
export async function createBooking(data: {
  trip: number;
  seats: number;
  traveler_name: string;
  traveler_phone: string;
  traveler_email: string;
  notes?: string;
}) {
  // Firestore fallback - mock booking creation
  console.log('createBooking called - mock success (Firestore fallback)', data);
  return {
    id: Date.now(),
    ...data,
    status: 'pending',
    created_at: new Date().toISOString()
  };
}

export async function acquireSeatLock(tripId: number, seats: number) {
  // Firestore fallback - mock success
  console.log('acquireSeatLock called - mock success (Firestore fallback)');
  return { success: true, lock_id: Date.now() };
}

// Types for the API responses
export interface Trip {
  id: number;
  name: string;
  location: string;
  price: number;
  duration_days: number;
  spots_available: number;
  total_spots: number;
  start_date: string;
  end_date: string;
  difficulty_level: string;
  image_url?: string;
  description?: string;
}

export interface TripHistory {
  id: number;
  destination: string;
  date: string;
  feedback?: string;
  rating?: number;
}

export interface TripRecommendation {
  id: number;
  destination: string;
  reason: string;
  trip_id?: number;
}

export interface DashboardSummary {
  user: {
    id: number;
    name: string;
    email: string;
    completedTrips: number;
    adventurePoints: number;
  };
  stats: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    wishlistCount: number;
    recommendationsCount: number;
    completedTrips: number;
    adventurePoints: number;
  };
  recentActivity: {
    bookings: Booking[];
    wishlist: WishlistItem[];
  };
}

export interface Booking {
  id: number;
  trip_name?: string;
  traveler_name: string;
  traveler_phone: string;
  traveler_email: string;
  seats: number;
  amount: number;
  status: string;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  trip: number;
  trip_name?: string;
  trip_image?: string;
  notes?: string;
  created_at: string;
}

// ============= ADMIN API ENDPOINTS =============

export const adminAPI = {
  // Trip Management (Admin Only)
  createTrip: async (tripData: {
    name: string;
    location: string;
    price: number;
    duration_days: number;
    difficulty_level: string;
    description: string;
    highlights?: string[];
    included?: string[];
    images?: string[];
    guide_id?: number;
    total_spots: number;
    spots_available: number;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.post('/admin/trips/', tripData);
    return response.data;
  },

  updateTrip: async (tripId: number, tripData: Partial<{
    name: string;
    location: string;
    price: number;
    duration_days: number;
    difficulty_level: string;
    description: string;
    highlights: string[];
    included: string[];
    images: string[];
    guide_id: number;
    total_spots: number;
    spots_available: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
  }>) => {
    const response = await api.patch(`/admin/trips/${tripId}/`, tripData);
    return response.data;
  },

  deleteTrip: async (tripId: number) => {
    const response = await api.delete(`/admin/trips/${tripId}/`);
    return response.data;
  },

  // Booking Management (Admin Only)
  getAllBookings: async (filters?: {
    status?: string;
    trip_id?: number;
    user_id?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    const response = await api.get('/admin/bookings/', { params: filters });
    return response.data;
  },

  updateBookingStatus: async (bookingId: number, status: string, notes?: string) => {
    const response = await api.patch(`/admin/bookings/${bookingId}/`, { status, notes });
    return response.data;
  },

  deleteBooking: async (bookingId: number) => {
    const response = await api.delete(`/admin/bookings/${bookingId}/`);
    return response.data;
  },

  // Lead Management (Admin Only)
  getAllLeads: async (filters?: {
    status?: string;
    lead_score_min?: number;
    source?: string;
    trip_id?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    const response = await api.get('/admin/leads/', { params: filters });
    return response.data;
  },

  updateLead: async (leadId: number, leadData: Partial<{
    status: string;
    lead_score: number;
    notes: string;
    assigned_to: number;
  }>) => {
    const response = await api.patch(`/admin/leads/${leadId}/`, leadData);
    return response.data;
  },

  deleteLead: async (leadId: number) => {
    const response = await api.delete(`/admin/leads/${leadId}/`);
    return response.data;
  },

  sendWhatsAppToLead: async (leadId: number, message: string) => {
    const response = await api.post(`/admin/leads/${leadId}/send-whatsapp/`, { message });
    return response.data;
  },

  // User Management (Admin Only)
  getAllUsers: async (filters?: {
    is_active?: boolean;
    is_staff?: boolean;
    search?: string;
  }) => {
    const response = await api.get('/admin/users/', { params: filters });
    return response.data;
  },

  updateUser: async (userId: number, userData: Partial<{
    is_active: boolean;
    is_staff: boolean;
    email: string;
    username: string;
  }>) => {
    const response = await api.patch(`/admin/users/${userId}/`, userData);
    return response.data;
  },

  deleteUser: async (userId: number) => {
    const response = await api.delete(`/admin/users/${userId}/`);
    return response.data;
  },

  // Guide Management (Admin Only)
  createGuide: async (guideData: {
    name: string;
    bio: string;
    specialty: string;
    experience: string;
    image?: string;
    phone_number?: string;
    email?: string;
  }) => {
    const response = await api.post('/admin/guides/', guideData);
    return response.data;
  },

  updateGuide: async (guideId: number, guideData: Partial<{
    name: string;
    bio: string;
    specialty: string;
    experience: string;
    image: string;
    phone_number: string;
    email: string;
  }>) => {
    const response = await api.patch(`/admin/guides/${guideId}/`, guideData);
    return response.data;
  },

  deleteGuide: async (guideId: number) => {
    const response = await api.delete(`/admin/guides/${guideId}/`);
    return response.data;
  },

  getAllGuides: async () => {
    const response = await api.get('/admin/guides/');
    return response.data;
  },

  // Analytics (Admin Only)
  getAnalytics: async (period?: string) => {
    const response = await api.get('/admin/analytics/', { params: { period } });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats/');
    return response.data;
  },

  getRevenueReport: async (startDate: string, endDate: string) => {
    const response = await api.get('/admin/reports/revenue/', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  getConversionReport: async () => {
    const response = await api.get('/admin/reports/conversion/');
    return response.data;
  },

  // Review Management (Admin Only)
  getAllReviews: async (filters?: {
    trip_id?: number;
    rating_min?: number;
    is_approved?: boolean;
  }) => {
    const response = await api.get('/admin/reviews/', { params: filters });
    return response.data;
  },

  approveReview: async (reviewId: number) => {
    const response = await api.post(`/admin/reviews/${reviewId}/approve/`);
    return response.data;
  },

  rejectReview: async (reviewId: number, reason: string) => {
    const response = await api.post(`/admin/reviews/${reviewId}/reject/`, { reason });
    return response.data;
  },

  deleteReview: async (reviewId: number) => {
    const response = await api.delete(`/admin/reviews/${reviewId}/`);
    return response.data;
  },
};

export async function fetchBookings() {
  // Firestore fallback - return empty array for now
  console.log('fetchBookings called - returning empty array (Firestore fallback)');
  return [];
}

export async function me(): Promise<{ id: number; username: string; email: string; is_staff?: boolean }> {
  // Firestore fallback - return mock user
  console.log('me() called - returning mock user (Firestore fallback)');
  return { id: 1, username: 'guest', email: 'guest@example.com', is_staff: false };
}

// Dashboard and user data APIs
export async function getDashboardSummary() {
  // Firestore fallback - return mock data
  console.log('getDashboardSummary called - returning mock data (Firestore fallback)');
  return {
    user: { id: 1, name: 'Guest User', email: 'guest@example.com', completedTrips: 0, adventurePoints: 0 },
    stats: { totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, wishlistCount: 0, recommendationsCount: 0, completedTrips: 0, adventurePoints: 0 },
    recentActivity: { bookings: [], wishlist: [] }
  };
}
