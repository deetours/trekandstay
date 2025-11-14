/**
 * Safe Firebase Analytics Wrapper
 * 
 * Provides safe access to Firebase Analytics with error handling
 * to prevent crashes when analytics is not available.
 */

import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

/**
 * Safely log an event to Firebase Analytics
 * @param eventName The name of the event to log
 * @param parameters Optional parameters for the event
 */
export const logAnalyticsEvent = (eventName: string, parameters?: Record<string, unknown>): void => {
  if (!analytics) {
    console.warn(`Analytics not available - would log event: ${eventName}`, parameters);
    return;
  }
  
  try {
    if (analytics) {
      logEvent(analytics, eventName, parameters);
    }
  } catch (error) {
    console.warn('Analytics event logging failed:', error);
  }
};

/**
 * Check if Firebase Analytics is available
 */
export const isAnalyticsAvailable = (): boolean => {
  return analytics !== null;
};

/**
 * Safe analytics tracking for common events
 */
export const trackEvent = {
  pageView: (pageName: string) => {
    logAnalyticsEvent('page_view', { page_title: pageName });
  },
  
  tripView: (tripId: string) => {
    logAnalyticsEvent('trip_view', { trip_id: tripId });
  },
  
  bookingStart: (tripId: string) => {
    logAnalyticsEvent('booking_start', { trip_id: tripId });
  },
  
  bookingComplete: (tripId: string, amount: number) => {
    logAnalyticsEvent('booking_complete', { trip_id: tripId, value: amount });
  },
  
  userAction: (action: string, category?: string) => {
    logAnalyticsEvent('user_action', { 
      action_name: action, 
      category: category || 'general' 
    });
  }
};

export default trackEvent;
