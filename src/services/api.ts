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

export function setAuthToken(token: string) {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Token ${token}`;
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
