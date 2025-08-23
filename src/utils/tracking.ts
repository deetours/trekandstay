// Basic Phase A tracking utility
import { API_BASE } from './api';

interface TrackEvent {
  type: 'view_trip' | 'click_book' | 'route_select' | 'exit_intent' | 'booking_open' | 'booking_close' | 'booking_abandoned';
  trip_id?: string | number;
  route_label?: string;
  ts?: number;
  [k: string]: unknown;
}

const QUEUE: TrackEvent[] = [];
let flushing = false;
let anonId = localStorage.getItem('anon_id');
if (!anonId) { anonId = crypto.randomUUID(); localStorage.setItem('anon_id', anonId); }
let sessionId = sessionStorage.getItem('session_id');
if (!sessionId) { sessionId = crypto.randomUUID(); sessionStorage.setItem('session_id', sessionId); }

function flush() {
  if (flushing || QUEUE.length === 0) return;
  flushing = true;
  const batch = QUEUE.splice(0, 25);
  fetch(`${API_BASE}/api/track/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: batch.map(e => ({ ...e, anon_id: anonId, session_id: sessionId, ts: e.ts || Date.now() })) })
  }).catch(()=>undefined).finally(()=>{ flushing = false; if (QUEUE.length) setTimeout(flush, 1000); });
}

let flushTimer: number | undefined;
export function track(ev: TrackEvent) {
  QUEUE.push(ev);
  if (!flushTimer) {
    flushTimer = window.setTimeout(() => { flushTimer = undefined; flush(); }, 1200);
  }
  if (QUEUE.length >= 10) flush();
}

// Helper wrappers
export const trackTripView = (tripId: string|number) => track({ type:'view_trip', trip_id: tripId });
export const trackBookClick = (tripId: string|number) => track({ type:'click_book', trip_id: tripId });
export const trackRouteSelect = (tripId: string|number, route_label: string) => track({ type:'route_select', trip_id: tripId, route_label });
export const trackExitIntent = (tripId?: string|number) => track({ type:'exit_intent', trip_id: tripId });
export const trackBookingOpen = (tripId: string|number) => track({ type:'booking_open', trip_id: tripId });
export const trackBookingClose = (tripId: string|number, abandoned?: boolean) => track({ type: abandoned ? 'booking_abandoned':'booking_close', trip_id: tripId });
