// Enhanced Analytics Tracking Service for Trek & Stay Landing Pages
export interface AnalyticsEvent {
  event_type: string;
  page: string;
  timestamp: number;
  user_id?: string;
  session_id: string;
  properties: Record<string, any>;
  user_agent: string;
  screen_resolution: string;
  viewport_size: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface ConversionFunnel {
  page_view: number;
  hero_interaction: number;
  booking_modal_open: number;
  lead_capture_open: number;
  seat_selection: number;
  payment_initiated: number;
  booking_completed: number;
  lead_submitted: number;
}

class AnalyticsTracker {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private startTime: number;
  private conversionFunnel: ConversionFunnel;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.conversionFunnel = {
      page_view: 0,
      hero_interaction: 0,
      booking_modal_open: 0,
      lead_capture_open: 0,
      seat_selection: 0,
      payment_initiated: 0,
      booking_completed: 0,
      lead_submitted: 0
    };
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `tas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUtmParameters(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || ''
    };
  }

  private initializeTracking() {
    // Track page view
    this.track('page_view', {
      page_title: document.title,
      page_url: window.location.href,
      ...this.getUtmParameters()
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        if (scrollPercent >= 25 && scrollPercent % 25 === 0) {
          this.track('scroll_depth', { depth_percent: scrollPercent });
        }
      }
    };
    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    // Track time on page milestones
    [30, 60, 120, 300].forEach(seconds => {
      setTimeout(() => {
        this.track('time_on_page_milestone', { seconds_spent: seconds });
      }, seconds * 1000);
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      this.track('visibility_change', { 
        hidden: document.hidden,
        time_spent: Date.now() - this.startTime
      });
    });

    // Track before unload
    window.addEventListener('beforeunload', () => {
      this.track('page_exit', { 
        total_time_spent: Date.now() - this.startTime,
        final_scroll_depth: maxScrollDepth
      });
      this.flush();
    });
  }

  public track(eventType: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      event_type: eventType,
      page: window.location.pathname,
      timestamp: Date.now(),
      session_id: this.sessionId,
      properties: {
        ...properties,
        time_since_page_load: Date.now() - this.startTime
      },
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      referrer: document.referrer,
      ...this.getUtmParameters()
    };

    this.events.push(event);
    
    // Update conversion funnel
    if (eventType in this.conversionFunnel) {
      this.conversionFunnel[eventType as keyof ConversionFunnel]++;
    }

    // Send to backend every 10 events or immediately for important events
    const immediateEvents = ['booking_completed', 'lead_submitted', 'payment_initiated'];
    if (this.events.length >= 10 || immediateEvents.includes(eventType)) {
      this.flush();
    }

    console.log('Analytics Event:', event);
  }

  public trackInteraction(element: string, action: string, properties: Record<string, any> = {}) {
    this.track('user_interaction', {
      element,
      action,
      ...properties
    });
  }

  public trackBookingFlow(step: string, properties: Record<string, any> = {}) {
    this.track('booking_flow', {
      step,
      funnel_position: step,
      ...properties
    });
  }

  public trackLeadCapture(step: string, properties: Record<string, any> = {}) {
    this.track('lead_capture_flow', {
      step,
      ...properties
    });
  }

  public trackTripInterest(tripId: string, tripName: string, action: string) {
    this.track('trip_interest', {
      trip_id: tripId,
      trip_name: tripName,
      action,
      interested_in: tripName
    });
  }

  public trackConversion(type: 'booking' | 'lead', amount?: number) {
    this.track('conversion', {
      conversion_type: type,
      amount,
      conversion_value: amount || 0,
      funnel_completion: this.conversionFunnel
    });
  }

  public trackError(error: string, context: Record<string, any> = {}) {
    this.track('error', {
      error_message: error,
      ...context
    });
  }

  public getConversionFunnel(): ConversionFunnel {
    return { ...this.conversionFunnel };
  }

  public getSessionData() {
    return {
      session_id: this.sessionId,
      events_count: this.events.length,
      session_duration: Date.now() - this.startTime,
      conversion_funnel: this.conversionFunnel
    };
  }

  private async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch('/api/analytics/track/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          session_data: this.getSessionData()
        })
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
      // Re-add events to queue on failure
      this.events.unshift(...eventsToSend);
    }
  }

  // A/B Testing Support
  public trackExperiment(experimentName: string, variant: string) {
    this.track('ab_test', {
      experiment_name: experimentName,
      variant,
      experiment_id: `${experimentName}_${variant}`
    });
  }

  // Heatmap data collection
  public trackClick(x: number, y: number, element: string) {
    this.track('click_heatmap', {
      click_x: x,
      click_y: y,
      element,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    });
  }

  public trackHover(element: string, duration: number) {
    this.track('hover_data', {
      element,
      hover_duration: duration
    });
  }

  // Gamification event tracking
  public async trackGamificationEvent(
    eventType: string,
    metadata: {
      trip_id?: string;
      booking_id?: string;
      user_id?: string;
      guest_id?: string;
      [key: string]: any;
    } = {}
  ) {
    try {
      const response = await fetch('/api/gamification/track-event/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          event_type: eventType,
          trip_id: metadata.trip_id,
          booking_id: metadata.booking_id,
          metadata: {
            session_id: this.sessionId,
            timestamp: Date.now(),
            ...metadata
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Gamification event tracked: ${eventType}`, data);
        return data;
      } else {
        console.error(`Failed to track gamification event: ${eventType}`, response.status);
      }
    } catch (error) {
      console.error('Gamification tracking failed:', error);
    }
  }
}

// Global analytics instance
export const analytics = new AnalyticsTracker();

// Convenience functions
export const trackEvent = (eventType: string, properties: Record<string, any> = {}) => {
  analytics.track(eventType, properties);
};

export const trackInteraction = (element: string, action: string, properties: Record<string, any> = {}) => {
  analytics.trackInteraction(element, action, properties);
};

export const trackBookingStep = (step: string, properties: Record<string, any> = {}) => {
  analytics.trackBookingFlow(step, properties);
};

export const trackLeadStep = (step: string, properties: Record<string, any> = {}) => {
  analytics.trackLeadCapture(step, properties);
};

export const trackConversion = (type: 'booking' | 'lead', amount?: number) => {
  analytics.trackConversion(type, amount);
};

export default analytics;