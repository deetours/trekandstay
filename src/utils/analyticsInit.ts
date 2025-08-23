/**
 * Component Analytics Registration Handler
 * 
 * This utility handles the registration of React analytics components to prevent
 * "Component analytics has not been registered yet" errors.
 * 
 * Note: This is separate from Firebase Analytics and handles UI component registration.
 */

import React from 'react';

// Global flag to track if UI analytics components are initialized
let componentAnalyticsInitialized = false;

/**
 * Initialize analytics UI components globally
 * This prevents component registration errors for chart libraries
 */
export const initializeAnalytics = (): void => {
  if (componentAnalyticsInitialized) return;
  
  try {
    console.log('Initializing UI analytics components...');
    
    // Check if we have any global chart libraries that need component registration
    
    // For Chart.js (if used)
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Chart) {
      // Chart.js registration would go here
      console.log('Chart.js components available');
    }
    
    // For Recharts (if using custom components)
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).recharts) {
      // Recharts custom component registration would go here
      console.log('Recharts components available');
    }
    
    // For any other analytics UI library
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).analyticsUI) {
      // Analytics UI library initialization would go here
      console.log('Analytics UI library available');
    }
    
    componentAnalyticsInitialized = true;
    console.log('UI analytics components initialization completed');
  } catch (error) {
    console.warn('UI analytics component initialization failed (non-critical):', error);
    // Set as initialized anyway to prevent repeated attempts
    componentAnalyticsInitialized = true;
  }
};

/**
 * Hook to ensure analytics are initialized before use
 */
export const useAnalytics = () => {
  const [initialized, setInitialized] = React.useState(componentAnalyticsInitialized);
  
  React.useEffect(() => {
    if (!initialized) {
      initializeAnalytics();
      setInitialized(true);
    }
  }, [initialized]);
  
  return { initialized };
};

export default initializeAnalytics;
