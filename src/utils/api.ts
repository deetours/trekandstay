// Simple API helper using fetch. Configure backend base URL via VITE_API_BASE_URL
import type { Booking, WishlistItem, RecommendationItem, TripHistoryItem } from '../types';

// API Response Types
export interface ApiTrip {
  id: number | string;
  name: string;
  location: string;
  price: number | string;
  next_departure?: string;
  nextDeparture?: string;
  spots_available?: number;
  spotsAvailable?: number;
  safety_record?: string;
  safetyRecord?: string;
  [key: string]: unknown;
}

export interface ApiLead {
  id: number;
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface ApiWhatsAppResponse {
  success: boolean;
  message: string;
}

export interface ApiBookingPayload {
  destination: string;
  date: string;
  status?: string;
  amount?: number;
  trip?: number;
  seats?: number;
  seat_lock?: number;
  route?: string;
}

export interface ApiPayment {
  id: number;
  amount: number;
  status: string;
}

export interface ApiSeatLock {
  id: number;
  trip: number;
  seats: number;
  expires_at: string;
}

let API_BASE: string = (() => {
  const ls = (() => { try { return localStorage.getItem('api_base'); } catch { return null; } })();
  if (ls) return ls.replace(/\/$/, '');
  // Vite exposes env at import.meta.env
  const envBase = (import.meta as ImportMeta).env?.VITE_API_BASE_URL || (import.meta as ImportMeta).env?.VITE_API_URL;
  return (envBase || 'http://localhost:8000').replace(/\/$/, '');
})();

export function setApiBaseOverride(url?: string) {
  try {
    if (url) {
      const clean = url.replace(/\/$/, '');
      localStorage.setItem('api_base', clean);
      API_BASE = clean;
    } else {
      localStorage.removeItem('api_base');
    }
  } catch {
    // Ignore storage errors
  }
}

function getAuthToken(): string | null {
  try { return localStorage.getItem('auth_token'); } catch { return null; }
}
function setAuthToken(token: string) {
  try { localStorage.setItem('auth_token', token); } catch {
    // Ignore storage errors
  }
}
function clearAuthToken() {
  try { localStorage.removeItem('auth_token'); } catch {
    // Ignore storage errors  
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Token ${token}`;

  const base = API_BASE.replace(/\/$/, '');
  let rel = path;
  if (base.match(/\/api\/?$/) && path.startsWith('/api/')) {
    rel = path.replace(/^\/api/, '');
  }
  const url = `${base}${rel.startsWith('/') ? '' : '/'}${rel}`;
  const res = await fetch(url, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  // @ts-expect-error - Returning undefined for non-JSON responses
  return undefined;
}

// Map API Trip (snake_case) to frontend camelCase fields where needed
function mapTripResponse(apiTrip: ApiTrip): ApiTrip {
  if (!apiTrip || typeof apiTrip !== 'object') return apiTrip;
  return {
    ...apiTrip,
    nextDeparture: apiTrip.next_departure ?? apiTrip.nextDeparture,
    spotsAvailable: apiTrip.spots_available ?? apiTrip.spotsAvailable,
    safetyRecord: apiTrip.safety_record ?? apiTrip.safetyRecord,
    // Normalize price to number when possible
    price: typeof apiTrip.price === 'string' ? Number(apiTrip.price) : apiTrip.price,
  };
}

export async function getTrips(): Promise<ApiTrip[]> {
  try {
    const data = await request<ApiTrip[]>(`/api/v1/trips/`);
    return Array.isArray(data) ? data.map(mapTripResponse) : data;
  } catch (error) {
    console.warn('Trips API not available, returning empty array:', error);
    return [];
  }
}

export async function getTrip(id: string): Promise<ApiTrip> {
  const data = await request<ApiTrip>(`/api/v1/trips/${id}/`);
  return mapTripResponse(data);
}

export async function createLead(data: {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  source?: string; // e.g., 'book-cta' | 'whatsapp-cta' | 'web'
  tripId?: string | number;
}): Promise<ApiLead> {
  const payload: Record<string, unknown> = {
    name: data.name || 'Site Lead',
    phone: data.phone || '',
    email: data.email || '',
    message: data.message || '',
    // Map custom sources to backend choices
    source: data.source?.startsWith('whatsapp') ? 'whatsapp' : 'web',
    trip: data.tripId ?? undefined,
    is_whatsapp: data.source?.startsWith('whatsapp') ? true : false,
  };
  return request<ApiLead>(`/api/leads/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendWhatsApp(data: { to: string; message: string; tripId?: string | number }): Promise<ApiWhatsAppResponse> {
  const payload = { phone: data.to, message: data.message, trip_id: data.tripId };
  return request<ApiWhatsAppResponse>(`/api/whatsapp/send/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// --- Auth API ---
export async function login(username: string, password: string): Promise<{ token: string }> {
  return request<{ token: string }>(`/api/v1/auth/token/`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function me(): Promise<{ id: number; username: string; email: string }> {
  return request<{ id: number; username: string; email: string }>(`/api/v1/auth/me/`);
}

// --- Bookings ---
export async function getBookings(userId?: number): Promise<Booking[]> {
  try {
    const data = await request<Booking[]>(`/api/v1/bookings/`);
    return Array.isArray(data) ? (userId ? data.filter(b => b.user === userId) : data) : [];
  } catch (error) {
    console.warn('Bookings API not available, returning empty array:', error);
    return [];
  }
}
export async function createBooking(payload: ApiBookingPayload): Promise<Booking> {
  return request<Booking>(`/api/v1/bookings/`, { method: 'POST', body: JSON.stringify({ status: 'pending', ...payload }) });
}

// --- Payments (UPI) ---
export async function createPaymentIntent(bookingId: number, amount: number, merchantVpa?: string): Promise<{ payment: ApiPayment; upi: { intent: string; vpa: string } }> {
  return request(`/api/payments/create-upi-intent/`, { method: 'POST', body: JSON.stringify({ booking: bookingId, amount, merchant_vpa: merchantVpa }) });
}
export async function confirmPayment(paymentId: number, data: { upiTxnId?: string; phone?: string }): Promise<ApiPayment> {
  return request(`/api/payments/${paymentId}/confirm/`, { method: 'POST', body: JSON.stringify({ upi_txn_id: data.upiTxnId, phone: data.phone }) });
}

// --- Wishlist ---
export async function getWishlist(): Promise<WishlistItem[]> {
  try {
    return await request<WishlistItem[]>(`/api/v1/wishlist/`);
  } catch (error) {
    console.warn('Wishlist API not available, returning mock data:', error);
    // Return mock wishlist data for development
    return [
      {
        id: 1,
        trip: 1,
        trip_name: 'Himalayan Adventure',
        trip_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
        notes: 'Bucket list destination',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        trip: 2,
        trip_name: 'Kerala Backwaters',
        trip_image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=200',
        notes: 'Peaceful getaway',
        created_at: new Date().toISOString(),
      }
    ];
  }
}
export async function addToWishlist(tripId: number, notes?: string): Promise<WishlistItem> {
  return request<WishlistItem>(`/api/v1/wishlist/`, { method: 'POST', body: JSON.stringify({ trip: tripId, notes }) });
}
export async function removeWishlist(id: number): Promise<void> {
  // In development, just log the removal
  console.log('Would remove wishlist item:', id);
  // await request<void>(`/api/v1/wishlist/${id}/`, { method: 'DELETE' });
}

// --- Recommendations & Trip History ---
export async function getTripHistory(): Promise<TripHistoryItem[]> {
  try {
    return await request<TripHistoryItem[]>(`/api/v1/triphistory/`);
  } catch (error) {
    console.warn('Trip history API not available, returning mock data:', error);
    // Return mock trip history for development
    return [
      {
        id: 1,
        destination: 'Goa Beach Trek',
        date: '2024-12-15',
        feedback: true
      },
      {
        id: 2,
        destination: 'Manali Adventure',
        date: '2024-11-20',
        feedback: false
      }
    ];
  }
}
export async function getRecommendations(): Promise<RecommendationItem[]> {
  try {
    return await request<RecommendationItem[]>(`/api/v1/triprecommendations/`);
  } catch (error) {
    console.warn('Recommendations API not available, returning mock data:', error);
    // Return mock recommendations for development
    return [
      {
        id: 1,
        destination: 'Rajasthan Desert Safari',
        reason: 'Based on your love for adventure trips',
        trip: '3'
      },
      {
        id: 2,
        destination: 'Andaman Island Hopping',
        reason: 'Perfect for beach lovers',
        trip: '4'
      }
    ];
  }
}

// --- Seat Locks ---
export async function acquireSeatLock(tripId: number, seats: number): Promise<ApiSeatLock> {
  return request<ApiSeatLock>(`/api/seatlocks/acquire/`, { method: 'POST', body: JSON.stringify({ trip: tripId, seats }) });
}
export async function refreshSeatLock(id: number): Promise<ApiSeatLock> {
  return request<ApiSeatLock>(`/api/seatlocks/${id}/refresh/`, { method: 'POST' });
}
export async function releaseSeatLock(id: number): Promise<void> {
  return request<void>(`/api/seatlocks/${id}/release/`, { method: 'POST' });
}

export { API_BASE, getAuthToken, setAuthToken, clearAuthToken };
