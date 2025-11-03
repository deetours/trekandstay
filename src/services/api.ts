// src/services/api.ts
// Real API service for Django backend

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const api = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:8000/api/',
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

export async function fetchBookings() {
  const res = await fetch(`${API_BASE_URL || 'http://localhost:8000/api'}/bookings/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

export async function me(): Promise<{ id: number; username: string; email: string; is_staff?: boolean }> {
  const res = await api.get('/auth/me/');
  return res.data;
}

// Dashboard and user data APIs
export async function getDashboardSummary() {
  const res = await api.get('/dashboard/summary/');
  return res.data;
}

// Trip-related APIs
export async function fetchTrips() {
  const res = await api.get('/trips/');
  return res.data;
}

export async function fetchTripBySlug(slug: string) {
  const res = await api.get(`/trips/${slug}/`);
  return res.data;
}

export async function fetchTripHistory() {
  const res = await api.get('/triphistory/');
  return res.data;
}

export async function fetchTripRecommendations() {
  const res = await api.get('/triprecommendations/');
  return res.data;
}

export async function generateTripRecommendations() {
  const res = await api.post('/triprecommendations/generate/');
  return res.data;
}

export async function fetchWishlist() {
  const res = await api.get('/wishlist/');
  return res.data;
}

export async function addToWishlist(tripId: number) {
  const res = await api.post('/wishlist/', { trip: tripId });
  return res.data;
}

export async function removeFromWishlist(wishlistId: number) {
  const res = await api.delete(`/wishlist/${wishlistId}/`);
  return res.data;
}

export async function fetchUserProfile() {
  const res = await api.get('/userprofiles/');
  return res.data;
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
  const res = await api.post('/bookings/', data);
  return res.data;
}

export async function acquireSeatLock(tripId: number, seats: number) {
  const res = await api.post('/seatlocks/acquire/', { trip: tripId, seats });
  return res.data;
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
