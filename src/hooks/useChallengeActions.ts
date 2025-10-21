/**
 * Challenge Action Handlers for Gamification System
 * Manages referral flows, review flows, and event tracking
 */

import { useState, useCallback } from 'react';

interface ReferralData {
  referrerName: string;
  referrerEmail: string;
  refereeName?: string;
  refereeEmail?: string;
  customMessage?: string;
}

interface ReviewData {
  tripId: string;
  rating: number;
  title: string;
  content: string;
  photos?: string[];
}

/**
 * Hook for handling referral flow
 */
export const useReferralFlow = () => {
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralInProgress, setReferralInProgress] = useState(false);

  const handleReferralStart = useCallback(() => {
    setShowReferralModal(true);
    trackEvent('referral_flow_started', {
      timestamp: new Date().toISOString(),
      source: 'challenge'
    });
  }, []);

  const handleReferralSubmit = useCallback(async (referralData: ReferralData) => {
    try {
      setReferralInProgress(true);
      
      // Track referral attempt
      trackEvent('referral_submitted', {
        referrer_name: referralData.referrerName,
        referee_count: referralData.refereeName ? 1 : 0,
        timestamp: new Date().toISOString()
      });

      // Send referral invitation
      const response = await fetch('/api/referrals/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          referrer_name: referralData.referrerName,
          referrer_email: referralData.referrerEmail,
          referee_name: referralData.refereeName || '',
          referee_email: referralData.refereeEmail || '',
          message: referralData.customMessage || '',
          source: 'challenge'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit referral');
      }

      const result = await response.json();

      // Track successful referral
      trackEvent('referral_completed', {
        referral_id: result.referral_id,
        reward_points: result.reward_points,
        timestamp: new Date().toISOString()
      });

      // Award points immediately
      if (result.reward_points) {
        awardChallengePoints(result.reward_points, 'referral_reward');
      }

      setShowReferralModal(false);
      return result;

    } catch (error) {
      console.error('Referral error:', error);
      trackEvent('referral_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    } finally {
      setReferralInProgress(false);
    }
  }, []);

  const handleReferralCancel = useCallback(() => {
    setShowReferralModal(false);
    trackEvent('referral_cancelled', {
      timestamp: new Date().toISOString()
    });
  }, []);

  return {
    showReferralModal,
    referralInProgress,
    handleReferralStart,
    handleReferralSubmit,
    handleReferralCancel
  };
};

/**
 * Hook for handling review flow
 */
export const useReviewFlow = () => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewInProgress, setReviewInProgress] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const handleReviewStart = useCallback((tripId: string) => {
    setSelectedTripId(tripId);
    setShowReviewModal(true);
    trackEvent('review_flow_started', {
      trip_id: tripId,
      timestamp: new Date().toISOString(),
      source: 'challenge'
    });
  }, []);

  const handleReviewSubmit = useCallback(async (reviewData: ReviewData) => {
    try {
      setReviewInProgress(true);

      // Track review attempt
      trackEvent('review_submitted', {
        trip_id: reviewData.tripId,
        rating: reviewData.rating,
        has_photos: reviewData.photos && reviewData.photos.length > 0,
        timestamp: new Date().toISOString()
      });

      // Submit review
      const response = await fetch(`/api/trips/${reviewData.tripId}/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          rating: reviewData.rating,
          title: reviewData.title,
          content: reviewData.content,
          photos: reviewData.photos || [],
          from_challenge: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const result = await response.json();

      // Track successful review
      trackEvent('review_completed', {
        review_id: result.review_id,
        rating: reviewData.rating,
        reward_points: result.reward_points,
        timestamp: new Date().toISOString()
      });

      // Award points
      if (result.reward_points) {
        awardChallengePoints(result.reward_points, 'review_reward');
      }

      setShowReviewModal(false);
      return result;

    } catch (error) {
      console.error('Review error:', error);
      trackEvent('review_error', {
        trip_id: reviewData.tripId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    } finally {
      setReviewInProgress(false);
    }
  }, []);

  const handleReviewCancel = useCallback(() => {
    setShowReviewModal(false);
    trackEvent('review_cancelled', {
      trip_id: selectedTripId,
      timestamp: new Date().toISOString()
    });
  }, [selectedTripId]);

  return {
    showReviewModal,
    reviewInProgress,
    selectedTripId,
    handleReviewStart,
    handleReviewSubmit,
    handleReviewCancel
  };
};

/**
 * Challenge action router - maps challenge actions to handlers
 */
export const useChallengeActionHandler = () => {
  const referralFlow = useReferralFlow();
  const reviewFlow = useReviewFlow();

  const handleChallengeAction = useCallback((challengeId: string, tripId?: string) => {
    switch (challengeId) {
      case 'referral-master':
        referralFlow.handleReferralStart();
        break;
      
      case 'review-writer':
        if (tripId) {
          reviewFlow.handleReviewStart(tripId);
        } else {
          // Show trip selection modal
          trackEvent('review_trip_selection_required', {
            challenge_id: challengeId,
            timestamp: new Date().toISOString()
          });
        }
        break;
      
      case 'weekend-warrior':
        // Navigate to booking page with weekend filter
        window.location.href = '/trips?filter=weekend';
        trackEvent('weekend_warrior_initiated', {
          timestamp: new Date().toISOString()
        });
        break;
      
      default:
        console.warn(`No handler for challenge: ${challengeId}`);
        trackEvent('challenge_action_unmapped', {
          challenge_id: challengeId,
          timestamp: new Date().toISOString()
        });
    }
  }, [referralFlow, reviewFlow]);

  return {
    handleChallengeAction,
    referralFlow,
    reviewFlow
  };
};

/**
 * Track challenge-related events
 */
export const trackEvent = (eventName: string, eventData: Record<string, unknown> = {}) => {
  try {
    // Send to analytics service
    const analyticsData = {
      event: eventName,
      data: {
        ...eventData,
        userAgent: navigator.userAgent,
        url: window.location.pathname
      },
      timestamp: new Date().toISOString()
    };

    // Log locally
    console.log('[Challenge Event]', eventName, eventData);

    // Send to backend analytics
    fetch('/api/analytics/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(analyticsData),
      keepalive: true // Ensure request completes even if page unloads
    }).catch(err => console.error('Analytics error:', err));

    // Send to external analytics if configured
    if ((window as unknown as Record<string, unknown>).gtag) {
      const gtag = (window as unknown as Record<string, unknown>).gtag as (event: string, name: string, data: Record<string, unknown>) => void;
      gtag('event', eventName, eventData);
    }

  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

/**
 * Award challenge points to user
 */
export const awardChallengePoints = async (
  points: number,
  source: string,
  metadata: Record<string, unknown> = {}
) => {
  try {
    const response = await fetch('/api/gamification/award-points/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        points,
        source,
        metadata,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to award points');
    }

    const result = await response.json();

    // Track points awarded
    trackEvent('challenge_points_awarded', {
      points,
      source,
      new_total: result.total_points,
      level_up: result.level_changed
    });

    return result;

  } catch (error) {
    console.error('Error awarding points:', error);
    trackEvent('points_award_error', {
      points,
      source,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Track challenge progress
 */
export const updateChallengeProgress = async (
  challengeId: string,
  progressIncrement: number
) => {
  try {
    const response = await fetch('/api/gamification/challenge-progress/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        challenge_id: challengeId,
        progress_increment: progressIncrement
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update challenge progress');
    }

    const result = await response.json();

    // Track progress update
    trackEvent('challenge_progress_updated', {
      challenge_id: challengeId,
      new_progress: result.current_progress,
      completed: result.completed
    });

    return result;

  } catch (error) {
    console.error('Error updating challenge progress:', error);
    trackEvent('challenge_progress_error', {
      challenge_id: challengeId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};
