// src/services/api.ts
// Hybrid API service: Firestore for trips + Django backend for other features

import axios from 'axios';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getDbOrThrow } from '../firebase';

// ============= API BASE URLS =============
export const FIRESTORE_API = 'firestore'; // marker for Firestore queries
export const DJANGO_API_BASE_URL = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://150.230.130.48/api';

// Django API client
export const djangoAPI = axios.create({
  baseURL: DJANGO_API_BASE_URL,
  timeout: 15000,
});

// Fallback for old API calls
export const api = djangoAPI;

djangoAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    console.warn('Django API call:', err?.config?.url, 'Status:', err?.response?.status);
    return Promise.reject(err);
  }
);

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    djangoAPI.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete djangoAPI.defaults.headers.common['Authorization'];
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Token ${authToken}`;
  return headers;
}

// ============= FIRESTORE-BASED TRIP FETCHING (PRIMARY) =============

export async function fetchTrips() {
  try {
    console.log('✅ Fetching trips from Firestore...');
    const db = getDbOrThrow();
    const tripsRef = collection(db, 'trips');
    const q = query(tripsRef, orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);

    const trips = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
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

    console.log('✅ Loaded trips from Firestore:', trips.length);
    return trips;
  } catch (error) {
    console.error('❌ Error fetching from Firestore:', error);
    return [];
  }
}

export async function fetchTripBySlug(slug: string) {
  try {
    const db = getDbOrThrow();
    const tripsRef = collection(db, 'trips');
    const q = query(tripsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const trip = querySnapshot.docs.find(doc =>
      doc.data().slug === slug || doc.id === slug
    );

    if (trip) {
      return {
        id: trip.id,
        ...trip.data(),
        name: trip.data().name || trip.data().title,
        location: trip.data().location || 'TBD',
      };
    }
    console.warn('Trip not found in Firestore:', slug);
    return null;
  } catch (error) {
    console.error('Error fetching trip by slug:', error);
    return null;
  }
}

// ============= DJANGO-BASED APIS (BOOKINGS, WISHLIST, LEADS, WHATSAPP) =============

export async function fetchTripHistory() {
  try {
    const response = await djangoAPI.get('/trips/history/', {
      headers: getAuthHeaders(),
    });
    console.log('✅ Fetched trip history from Django');
    return response.data;
  } catch (error) {
    console.warn('⚠️  Trip history unavailable:', error);
    return [];
  }
}

export async function fetchTripRecommendations() {
  try {
    const response = await djangoAPI.get('/trips/recommendations/', {
      headers: getAuthHeaders(),
    });
    console.log('✅ Fetched recommendations from Django');
    return response.data;
  } catch (error) {
    console.warn('⚠️  Recommendations unavailable:', error);
    return [];
  }
}

export async function generateTripRecommendations() {
  try {
    const response = await djangoAPI.post('/trips/recommendations/generate/', {}, {
      headers: getAuthHeaders(),
    });
    console.log('✅ Generated recommendations from Django');
    return response.data;
  } catch (error) {
    console.warn('⚠️  Recommendation generation unavailable:', error);
    return [];
  }
}

export async function fetchWishlist() {
  try {
    const response = await djangoAPI.get('/wishlist/', {
      headers: getAuthHeaders(),
    });
    console.log('✅ Fetched wishlist from Django');
    return response.data;
  } catch (error) {
    console.warn('⚠️  Wishlist unavailable, using local fallback:', error);
    return [];
  }
}

export async function addToWishlist(tripId: number) {
  try {
    const response = await djangoAPI.post('/wishlist/', { trip: tripId }, {
      headers: getAuthHeaders(),
    });
    console.log('✅ Added to wishlist on Django');
    return response.data;
  } catch (error) {
    console.error('❌ Add to wishlist failed:', error);
    throw error;
  }
}

export async function removeFromWishlist(id: number) {
  try {
    await djangoAPI.delete(`/wishlist/${id}/`, {
      headers: getAuthHeaders(),
    });
    console.log('✅ Removed from wishlist on Django');
    return true;
  } catch (error) {
    console.error('❌ Remove from wishlist failed:', error);
    throw error;
  }
}

export async function fetchUserProfile() {
  try {
    const response = await djangoAPI.get('/auth/me/', {
      headers: getAuthHeaders(),
    });
    console.log('✅ Fetched user profile from Django');
    return response.data;
  } catch (error) {
    console.warn('⚠️  User profile unavailable:', error);
    return { id: 1, username: 'guest', email: 'guest@example.com' };
  }
}

export async function createBooking(data: {
  trip: number;
  seats: number;
  traveler_name: string;
  traveler_phone: string;
  traveler_email: string;
  notes?: string;
}) {
  try {
    const response = await djangoAPI.post('/bookings/', data, {
      headers: getAuthHeaders(),
    });
    console.log('✅ Booking created on Django');
    return response.data;
  } catch (error) {
    console.error('❌ Booking creation failed:', error);
    throw error;
  }
}

export async function acquireSeatLock(id: number, count: number) {
  try {
    const response = await djangoAPI.post(`/trips/${id}/seat-lock/`, { seats: count }, {
      headers: getAuthHeaders(),
    });
    console.log('✅ Seat lock acquired on Django');
    return response.data;
  } catch (error) {
    console.error('❌ Seat lock failed:', error);
    throw error;
  }
}

// ============= TYPE DEFINITIONS =============

export interface Trip {
  id: number | string;
  name: string;
  location: string;
  price: number;
  duration_days: number;
  spots_available: number;
  total_spots: number;
  start_date: string;
  end_date?: string;
  difficulty_level: string;
  image_url?: string;
  description?: string;
  rating?: number;
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
  user: { id: number; name: string; email: string; completedTrips: number; adventurePoints: number };
  stats: { totalBookings: number; pendingBookings: number; confirmedBookings: number; wishlistCount: number; recommendationsCount: number; completedTrips: number; adventurePoints: number };
  recentActivity: { bookings: Booking[]; wishlist: WishlistItem[] };
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

// ============= ADMIN API ENDPOINTS (DJANGO) =============

export const adminAPI = {
  // Trip Management
  createTrip: async (tripData: Record<string, unknown>) => {
    const response = await djangoAPI.post('/admin/trips/', tripData, { headers: getAuthHeaders() });
    return response.data;
  },

  updateTrip: async (tripId: number, tripData: Record<string, unknown>) => {
    const response = await djangoAPI.patch(`/admin/trips/${tripId}/`, tripData, { headers: getAuthHeaders() });
    return response.data;
  },

  deleteTrip: async (tripId: number) => {
    const response = await djangoAPI.delete(`/admin/trips/${tripId}/`, { headers: getAuthHeaders() });
    return response.data;
  },

  // Booking Management
  getAllBookings: async (filters?: Record<string, unknown>) => {
    const response = await djangoAPI.get('/admin/bookings/', { params: filters, headers: getAuthHeaders() });
    return response.data;
  },

  updateBookingStatus: async (bookingId: number, status: string, notes?: string) => {
    const response = await djangoAPI.patch(`/admin/bookings/${bookingId}/`, { status, notes }, { headers: getAuthHeaders() });
    return response.data;
  },

  // Lead Management
  getAllLeads: async (filters?: Record<string, unknown>) => {
    const response = await djangoAPI.get('/admin/leads/', { params: filters, headers: getAuthHeaders() });
    return response.data;
  },

  updateLead: async (leadId: number, leadData: Record<string, unknown>) => {
    const response = await djangoAPI.patch(`/admin/leads/${leadId}/`, leadData, { headers: getAuthHeaders() });
    return response.data;
  },

  sendWhatsAppToLead: async (leadId: number, message: string) => {
    const response = await djangoAPI.post(`/admin/leads/${leadId}/send-whatsapp/`, { message }, { headers: getAuthHeaders() });
    return response.data;
  },

  // Analytics
  getAnalytics: async (period?: string) => {
    const response = await djangoAPI.get('/admin/analytics/', { params: { period }, headers: getAuthHeaders() });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await djangoAPI.get('/admin/dashboard/stats/', { headers: getAuthHeaders() });
    return response.data;
  },
};

export default djangoAPI;

export async function fetchBookings() {
  try {
    const response = await djangoAPI.get('/bookings/', {
      headers: getAuthHeaders(),
    });
    console.log('✅ Fetched bookings from Django');
    return response.data;
  } catch (error) {
    console.warn('⚠️  Bookings unavailable:', error);
    return [];
  }
}

export async function me(): Promise<{ id: number; username: string; email: string; is_staff?: boolean }> {
  try {
    const response = await djangoAPI.get('/auth/me/', {
      headers: getAuthHeaders(),
    });
    console.log('✅ Fetched current user from Django');
    return response.data;
  } catch (error) {
    console.warn('⚠️  Current user unavailable:', error);
    return { id: 1, username: 'guest', email: 'guest@example.com', is_staff: false };
  }
}

export async function getDashboardSummary() {
  try {
    const response = await djangoAPI.get('/dashboard/summary/', {
      headers: getAuthHeaders(),
    });
    console.log('✅ Fetched dashboard summary from Django');
    return response.data;
  } catch (error) {
    console.warn('⚠️  Dashboard unavailable, using fallback:', error);
    return {
      user: { id: 1, name: 'Guest User', email: 'guest@example.com', completedTrips: 0, adventurePoints: 0 },
      stats: { totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, wishlistCount: 0, recommendationsCount: 0, completedTrips: 0, adventurePoints: 0 },
      recentActivity: { bookings: [], wishlist: [] }
    };
  }
}

// ============= WHATSAPP & LEADS APIS (DJANGO) =============

export async function createLead(data: {
  name: string;
  phone: string;
  email?: string;
  trip_interest?: number;
  source?: string;
  message?: string;
}) {
  try {
    const response = await djangoAPI.post('/leads/', data);
    console.log('✅ Lead created on Django');
    return response.data;
  } catch (error) {
    console.error('❌ Lead creation failed:', error);
    throw error;
  }
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  try {
    const response = await djangoAPI.post('/whatsapp/send/', { phone, message }, {
      headers: getAuthHeaders(),
    });
    console.log('✅ WhatsApp message sent via Django');
    return response.data;
  } catch (error) {
    console.error('❌ WhatsApp send failed:', error);
    throw error;
  }
}

export async function sendWhatsAppToLead(leadId: number, message: string) {
  try {
    const response = await djangoAPI.post(`/leads/${leadId}/send-whatsapp/`, { message }, {
      headers: getAuthHeaders(),
    });
    console.log('✅ WhatsApp sent to lead via Django');
    return response.data;
  } catch (error) {
    console.error('❌ WhatsApp to lead failed:', error);
    throw error;
  }
}

// ============= REVIEW APIS (DJANGO) =============

export async function submitReview(data: {
  trip: number;
  rating: number;
  comment: string;
  traveler_name?: string;
}) {
  try {
    const response = await djangoAPI.post('/reviews/', data, {
      headers: getAuthHeaders(),
    });
    console.log('✅ Review submitted to Django');
    return response.data;
  } catch (error) {
    console.error('❌ Review submission failed:', error);
    throw error;
  }
}

export async function fetchReviews(tripId: number) {
  try {
    const response = await djangoAPI.get(`/trips/${tripId}/reviews/`);
    console.log('✅ Fetched reviews from Django');
    return response.data;
  } catch (error) {
    console.warn('⚠️  Reviews unavailable:', error);
    return [];
  }
}
