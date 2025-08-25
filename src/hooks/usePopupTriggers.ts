import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLeadCaptureStore } from '../store/leadCaptureStore';

interface PopupTriggerConfig {
  page: string;
  timeDelay?: number;
  scrollPercentage?: number;
  exitIntent?: boolean;
  enabled?: boolean;
}

const PAGE_CONFIGS: Record<string, PopupTriggerConfig> = {
  '/': {
    page: 'homepage',
    timeDelay: 45000, // 45 seconds
    scrollPercentage: 50,
    exitIntent: true,
    enabled: true
  },
  '/destinations': {
    page: 'destinations',
    timeDelay: 30000, // 30 seconds
    scrollPercentage: 60,
    exitIntent: true,
    enabled: true
  },
  '/destinations/*': {
    page: 'destinations-category',
    timeDelay: 20000, // 20 seconds
    scrollPercentage: 40,
    exitIntent: true,
    enabled: true
  },
  '/trip/*': {
    page: 'trip-detail',
    timeDelay: 60000, // 60 seconds
    scrollPercentage: 70,
    exitIntent: true,
    enabled: true
  },
  '/dashboard': {
    page: 'dashboard',
    timeDelay: 120000, // 2 minutes for returning users
    scrollPercentage: 80,
    exitIntent: false,
    enabled: true
  }
};

// Pages where popup should be disabled
const DISABLED_PAGES = [
  '/booking',
  '/payment',
  '/thank-you',
  '/signin',
  '/signup',
  '/admin'
];

export const usePopupTriggers = () => {
  const location = useLocation();
  const { openPopup, isOpen, isSubmitted, triggerCount } = useLeadCaptureStore();
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const pageLoadTime = useRef<number>(Date.now());
  const hasTriggeredScroll = useRef<boolean>(false);
  const hasTriggeredTime = useRef<boolean>(false);
  const hasTriggeredExit = useRef<boolean>(false);

  // Get current page config
  const getCurrentConfig = useCallback((): PopupTriggerConfig | null => {
    const pathname = location.pathname;
    
    // Check if page is disabled
    if (DISABLED_PAGES.some(page => pathname.startsWith(page))) {
      return null;
    }

    // Find matching config
    for (const [pattern, config] of Object.entries(PAGE_CONFIGS)) {
      if (pattern.includes('*')) {
        const basePattern = pattern.replace('/*', '');
        if (pathname.startsWith(basePattern)) {
          return config;
        }
      } else if (pathname === pattern) {
        return config;
      }
    }

    return null;
  }, [location.pathname]);

  // Time-based trigger
  const setupTimeBasedTrigger = useCallback((config: PopupTriggerConfig) => {
    if (!config.timeDelay || hasTriggeredTime.current) return;

    timeoutRef.current = setTimeout(() => {
      if (!isOpen && !isSubmitted && triggerCount < 3) {
        openPopup('time_based', config.page);
        hasTriggeredTime.current = true;
      }
    }, config.timeDelay);
  }, [isOpen, isSubmitted, triggerCount, openPopup]);

  // Scroll-based trigger
  const setupScrollBasedTrigger = useCallback((config: PopupTriggerConfig) => {
    if (!config.scrollPercentage || hasTriggeredScroll.current) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / scrollHeight) * 100;

      if (scrollPercentage >= config.scrollPercentage! && !hasTriggeredScroll.current) {
        // Add small delay to prevent immediate trigger
        scrollTimeoutRef.current = setTimeout(() => {
          if (!isOpen && !isSubmitted && triggerCount < 3) {
            openPopup('scroll_based', config.page);
            hasTriggeredScroll.current = true;
          }
        }, 2000);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, isSubmitted, triggerCount, openPopup]);

  // Exit intent trigger
  const setupExitIntentTrigger = useCallback((config: PopupTriggerConfig) => {
    if (!config.exitIntent || hasTriggeredExit.current) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving from the top of the page
      if (e.clientY <= 0 && !hasTriggeredExit.current) {
        // Ensure user has been on page for at least 10 seconds
        const timeOnPage = Date.now() - pageLoadTime.current;
        if (timeOnPage >= 10000 && !isOpen && !isSubmitted && triggerCount < 3) {
          openPopup('exit_intent', config.page);
          hasTriggeredExit.current = true;
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isOpen, isSubmitted, triggerCount, openPopup]);

  // Setup triggers based on current page
  useEffect(() => {
    // Reset flags for new page
    hasTriggeredScroll.current = false;
    hasTriggeredTime.current = false;
    hasTriggeredExit.current = false;
    pageLoadTime.current = Date.now();

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const config = getCurrentConfig();
    if (!config || !config.enabled) {
      return;
    }

    // Setup triggers
    const cleanupFunctions: (() => void)[] = [];

    // Time-based trigger
    setupTimeBasedTrigger(config);

    // Scroll-based trigger
    const scrollCleanup = setupScrollBasedTrigger(config);
    if (scrollCleanup) cleanupFunctions.push(scrollCleanup);

    // Exit intent trigger (only on desktop)
    if (!('ontouchstart' in window)) {
      const exitCleanup = setupExitIntentTrigger(config);
      if (exitCleanup) cleanupFunctions.push(exitCleanup);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [location.pathname, getCurrentConfig, setupTimeBasedTrigger, setupScrollBasedTrigger, setupExitIntentTrigger]);

  // Manual trigger for specific events
  const triggerPopup = useCallback((source: string, customPage?: string) => {
    const config = getCurrentConfig();
    if (!config && !customPage) return;

    const page = customPage || config?.page || 'manual';
    openPopup(source, page);
  }, [getCurrentConfig, openPopup]);

  // Trigger for viewing multiple trips
  const trackTripView = useCallback(() => {
    const viewCount = parseInt(sessionStorage.getItem('tripViewCount') || '0') + 1;
    sessionStorage.setItem('tripViewCount', viewCount.toString());

    // Trigger after viewing 3 trips
    if (viewCount >= 3 && !isOpen && !isSubmitted && triggerCount < 3) {
      triggerPopup('multiple_trip_views', 'destinations');
    }
  }, [isOpen, isSubmitted, triggerCount, triggerPopup]);

  return {
    triggerPopup,
    trackTripView,
    currentConfig: getCurrentConfig()
  };
};