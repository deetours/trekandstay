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

// Add more API functions as needed for other widgets
