import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Phone, 
  Clock, 
  Mountain, 
  Gift,
  CheckCircle,
  XCircle,
  QrCode,
  CreditCard,
  Smartphone,
  Zap,
  Heart,
  Send,
  Timer,
  AlertCircle,
  Eye,
  TrendingUp,
  Copy,
  Bell,
  CheckSquare,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Lock
} from 'lucide-react';
import { adminAPI } from '../services/adminAPI';
import { fetchTripBySlug } from '../services/api';
import { analytics, trackBookingStep, trackLeadStep, trackConversion } from '../services/analyticsTracker';

// Import Interactive Components
import {
  ParallaxBackground,
  TrekDiscoveryWidget,
  FloatingActionBubbles,
  LiveWeatherWidget,
  AnimatedCTAButton,
  AdventurePointsSystem,
  AchievementBadgeSystem,
  ProgressTrackingDashboard,
  InteractiveChallenges,
  UserEngagementAnalytics,
  useAdventurePoints
} from '../../landing/components/interactive';

interface Day {
  day?: number | string;
  title?: string;
  content?: string | string[];
  description?: string;
  activities?: string | string[];
  meals?: string;
  accommodation?: string;
  transport?: string;
  [key: string]: unknown;
}

interface Trip {
  id: string;
  name: string;
  slug: string;
  location: string;
  price: number;
  bookingAdvance: number;
  contactNumber: string;
  duration: string;
  spotsAvailable: number;
  difficulty: string;
  category: string;
  tags: string[];
  highlights: string[];
  itinerary: Day[];
  inclusions: string[];
  exclusions: string[];
  equipmentList: string[];
  safetyMeasures: string[];
  batchDates: string[];
}

const TripLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadCaptureStep, setLeadCaptureStep] = useState<'interest' | 'details' | 'success'>('interest');
  const [bookingStep, setBookingStep] = useState<'details' | 'seats' | 'payment' | 'confirmation'>('details');
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    seats: 1,
    selectedBatch: '',
    selectedSeats: [] as number[],
    emergencyContact: '',
    dietaryRequirements: '',
    medicalConditions: ''
  });
  const [leadData, setLeadData] = useState({
    name: '',
    phone: '',
    email: '',
    interest: ''
  });
  const [paymentStep, setPaymentStep] = useState<'details' | 'upi' | 'success'>('details');
  const [userInteraction, setUserInteraction] = useState(0);
  const [seatAvailability, setSeatAvailability] = useState<Record<string, boolean>>({});
  const [realTimeData, setRealTimeData] = useState({
    currentViewers: Math.floor(Math.random() * 15) + 5,
    recentBookings: Math.floor(Math.random() * 3) + 1,
    lastBooked: Date.now() - Math.floor(Math.random() * 300000)
  });
  const [countdownTimer, setCountdownTimer] = useState(600); // 10 minutes
  const [showUrgencyBanner, setShowUrgencyBanner] = useState(false);
  const [showGamificationDashboard, setShowGamificationDashboard] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const pageLoadTime = useRef<number>(Date.now());
  const { awardPoints } = useAdventurePoints();

  // Helper function to normalize itinerary data
  const normalizeItinerary = (itinerary: unknown): Day[] => {
    if (!itinerary || !Array.isArray(itinerary)) {
      return [];
    }
    
    return itinerary.map((item, index) => {
      // If item is already a Day object, return it
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        return {
          day: item.day || index + 1,
          title: item.title || `Day ${index + 1}`,
          content: item.content,
          description: item.description,
          activities: item.activities,
          meals: item.meals,
          accommodation: item.accommodation,
          transport: item.transport,
          ...item
        } as Day;
      }
      
      // If item is a string, convert it to Day object
      if (typeof item === 'string') {
        // Extract day number from string if present
        const dayMatch = item.match(/Day\s*(\d+)/i);
        const dayNumber = dayMatch ? parseInt(dayMatch[1]) : index + 1;
        
        // Extract title (everything before the first colon or first sentence)
        const titleMatch = item.match(/^([^:]+?)(?::|\.|$)/);
        const title = titleMatch ? titleMatch[1].trim() : `Day ${dayNumber}`;
        
        return {
          day: dayNumber,
          title: title,
          description: item,
          content: [item]
        } as Day;
      }
      
      // Fallback for any other format
      return {
        day: index + 1,
        title: `Day ${index + 1}`,
        description: String(item),
        content: [String(item)]
      } as Day;
    });
  };

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        // Fetch from Django backend
        const data = await fetchTripBySlug(slug || '');
        
        // Normalize the itinerary data
        const normalizedItinerary = normalizeItinerary(data.itinerary);
        
        setTrip({
          ...data,
          itinerary: normalizedItinerary
        } as Trip);
        
        // Initialize seat availability
        const totalSeats = data.spotsAvailable || data.available_seats || 20;
        const availability: Record<string, boolean> = {};
        for (let i = 1; i <= totalSeats; i++) {
          // Randomly make some seats unavailable for demo
          availability[i] = Math.random() > 0.2; // 80% availability
        }
        setSeatAvailability(availability);
        
        // Track gamification event: trip_view
        analytics.trackGamificationEvent('trip_view', {
          trip_id: data.id,
          trip_name: data.name,
          trip_slug: slug
        }).catch(err => console.error('Failed to track trip view:', err));
        
        // Award points for page load
        setTimeout(() => awardPoints('page_load'), 1000);
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTrip();
    }
  }, [slug, awardPoints]);

  // Real-time data simulation with seat updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        currentViewers: Math.max(3, prev.currentViewers + Math.floor(Math.random() * 3) - 1),
        recentBookings: Math.floor(Math.random() * 5) + 1,
        lastBooked: Date.now() - Math.floor(Math.random() * 600000)
      }));
      
      // Simulate seat availability changes
      setSeatAvailability(prev => {
        const updated = { ...prev };
        // Randomly make 1-2 seats unavailable occasionally
        if (Math.random() < 0.1) {
          const availableSeats = Object.keys(updated).filter(seat => updated[seat] === true);
          if (availableSeats.length > 5) {
            const seatToBlock = availableSeats[Math.floor(Math.random() * availableSeats.length)];
            updated[seatToBlock] = false;
          }
        }
        return updated;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [trip?.spotsAvailable]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Lead capture triggers
  useEffect(() => {
    let scrollHandler: (() => void) | null = null;
    const cleanupFunctions: (() => void)[] = [];
    let lastScrollMilestone = 0;
    
    // Time-based trigger
    const timeoutId = setTimeout(() => {
      if (userInteraction > 3 && !showLeadCapture && !showBookingModal) {
        setShowLeadCapture(true);
      }
    }, 30000); // 30 seconds
    
    cleanupFunctions.push(() => clearTimeout(timeoutId));
    
    // Scroll trigger setup with point tracking
    scrollHandler = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
      // Award points for scroll milestones
      if (scrollPercent > 25 && lastScrollMilestone < 25) {
        awardPoints('scroll_milestone', 10);
        lastScrollMilestone = 25;
      } else if (scrollPercent > 50 && lastScrollMilestone < 50) {
        awardPoints('scroll_milestone', 15);
        lastScrollMilestone = 50;
      } else if (scrollPercent > 75 && lastScrollMilestone < 75) {
        awardPoints('scroll_milestone', 20);
        lastScrollMilestone = 75;
      } else if (scrollPercent > 90 && lastScrollMilestone < 90) {
        awardPoints('scroll_milestone', 25);
        lastScrollMilestone = 90;
      }
      
      if (scrollPercent > 60 && userInteraction > 2 && !showLeadCapture && !showBookingModal) {
        setShowLeadCapture(true);
      }
    };
    
    window.addEventListener('scroll', scrollHandler);
    cleanupFunctions.push(() => {
      if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
      }
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [userInteraction, showLeadCapture, showBookingModal, awardPoints]);

  const handleBookNow = () => {
    setUserInteraction(prev => prev + 1);
    setShowBookingModal(true);
    
    // Award points for booking action
    awardPoints('booking_start', 75);
    
    // Track gamification event: booking_started
    analytics.trackGamificationEvent('booking_started', {
      trip_id: trip?.id,
      trip_name: trip?.name
    }).catch(err => console.error('Failed to track booking start:', err));
    
    // Analytics tracking
    analytics.trackInteraction('hero_book_button', 'click', {
      trip_id: trip?.id,
      trip_name: trip?.name,
      user_interactions: userInteraction
    });
    trackBookingStep('booking_modal_opened', {
      trip_price: trip?.price,
      available_seats: trip?.spotsAvailable
    });
  };

  const handleBookingNext = () => {
    if (bookingStep === 'details') {
      setBookingStep('seats');
      startUrgencyTimer();
      trackBookingStep('details_completed', {
        seats_selected: bookingData.seats,
        batch_selected: bookingData.selectedBatch
      });
    } else if (bookingStep === 'seats') {
      setBookingStep('payment');
      trackBookingStep('seats_selected', {
        selected_seats: bookingData.selectedSeats,
        seats_count: bookingData.seats
      });
    }
  };

  const handleBookingPrev = () => {
    if (bookingStep === 'seats') {
      setBookingStep('details');
      trackBookingStep('back_to_details');
    } else if (bookingStep === 'payment') {
      setBookingStep('seats');
      trackBookingStep('back_to_seats');
    }
  };

  const startUrgencyTimer = () => {
    setShowUrgencyBanner(true);
    timerRef.current = setInterval(() => {
      setCountdownTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setShowUrgencyBanner(false);
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSeatSelection = (seatNumber: number, event?: React.TouchEvent | React.MouseEvent) => {
    const isSelected = bookingData.selectedSeats.includes(seatNumber);
    const isAvailable = seatAvailability[seatNumber] !== false;
    
    if (!isAvailable) return;
    
    // Award points for seat selection
    if (!isSelected && bookingData.selectedSeats.length < bookingData.seats) {
      awardPoints('seat_selection', 50);
    }
    
    // Track analytics for seat selection
    analytics.trackInteraction('seat_selection', 'click', {
      seat_number: seatNumber,
      action: isSelected ? 'deselect' : 'select',
      total_selected: bookingData.selectedSeats.length
    });
    
    // Handle touch coordinates for mobile analytics
    if (event && 'touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      analytics.trackClick(touch.clientX, touch.clientY, `seat_${seatNumber}`);
    }
    
    if (isSelected) {
      setBookingData({
        ...bookingData,
        selectedSeats: bookingData.selectedSeats.filter(s => s !== seatNumber)
      });
    } else if (bookingData.selectedSeats.length < bookingData.seats) {
      setBookingData({
        ...bookingData,
        selectedSeats: [...bookingData.selectedSeats, seatNumber]
      });
    }
  };

 

  const handlePaymentComplete = async () => {
    try {
      // First create the booking
      const bookingPayload = {
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        seats: bookingData.seats,
        selectedSeats: bookingData.selectedSeats,
        selectedBatch: bookingData.selectedBatch,
        tripId: trip?.id,
        tripName: trip?.name,
        amount: (trip?.bookingAdvance || 0) * bookingData.seats,
        emergencyContact: bookingData.emergencyContact,
        dietaryRequirements: bookingData.dietaryRequirements,
        medicalConditions: bookingData.medicalConditions,
        status: 'confirmed'
      };

      // Create booking in admin dashboard
      await adminAPI.createBooking(bookingPayload);
      
      // Track gamification event: booking_completed
      analytics.trackGamificationEvent('booking_completed', {
        trip_id: trip?.id,
        trip_name: trip?.name,
        booking_amount: (trip?.bookingAdvance || 0) * bookingData.seats,
        seats: bookingData.seats
      }).catch(err => console.error('Failed to track booking completion:', err));
      
      // Analytics tracking for conversion
      trackConversion('booking', (trip?.bookingAdvance || 0) * bookingData.seats);
      trackBookingStep('booking_completed', {
        final_amount: (trip?.bookingAdvance || 0) * bookingData.seats,
        conversion_time: Date.now() - pageLoadTime.current
      });
      
      // Send WhatsApp confirmation
      const message = `🎉 Booking Confirmed! 

Trip: ${trip?.name}
Seats: ${bookingData.seats}
Batch: ${bookingData.selectedBatch}
Amount Paid: ₹${(trip?.bookingAdvance || 0) * bookingData.seats}

Thank you for choosing Trek & Stay Adventures!`;
      
      try {
        await fetch('/api/whatsapp/send-message/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: bookingData.phone,
            message,
            session_id: 'booking_confirmation'
          })
        });
      } catch (whatsappError) {
        console.warn('WhatsApp message failed:', whatsappError);
        // Don't fail the booking if WhatsApp fails
      }
      
      // Move to confirmation step instead of setting paymentStep
      setBookingStep('confirmation');
    } catch (error) {
      console.error('Payment completion error:', error);
      analytics.trackError('payment_completion_failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      // Show user-friendly error
      alert('Booking confirmation failed. Please contact us at ' + (trip?.contactNumber || '9902937730'));
    }
  };

  const handleLeadSubmit = async () => {
    try {
      // Enhanced lead data with detailed tracking
      const enhancedLeadData = {
        ...leadData,
        source: 'trip_landing_page',
        trip_interest: trip?.name,
        current_page: `/land/${slug}`,
        user_interactions: userInteraction,
        time_spent: Date.now() - pageLoadTime.current,
        device_info: {
          user_agent: navigator.userAgent,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          viewport_size: `${window.innerWidth}x${window.innerHeight}`
        },
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      };

      // Send to lead capture store (existing functionality)
      console.log('Lead captured:', enhancedLeadData);
      
      // Analytics tracking for lead conversion
      trackConversion('lead');
      trackLeadStep('lead_submitted', {
        lead_source: 'trip_landing_page',
        trip_interest: trip?.name,
        conversion_time: Date.now() - pageLoadTime.current,
        user_interactions: userInteraction
      });
      
      // Send to admin dashboard API
      await adminAPI.createLead(enhancedLeadData);
      
      // Send WhatsApp welcome message with trip-specific content
      if (leadData.phone) {
        const welcomeMessage = `Hi ${leadData.name}! 👋\n\nThank you for your interest in ${trip?.name}!\n\n🏔️ We'll send you:\n• Detailed itinerary\n• Packing list\n• Best deals & offers\n\nOur adventure expert will connect with you soon to help plan your perfect trip!\n\n- Trek & Stay Adventures Team`;
        
        try {
          await fetch('/api/whatsapp/send-message/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: leadData.phone,
              message: welcomeMessage,
              session_id: 'lead_capture_trip_specific',
              lead_data: enhancedLeadData
            })
          });
        } catch (error) {
          console.warn('WhatsApp message failed:', error);
          // Don't fail lead capture if WhatsApp fails
        }
      }
      
      setLeadCaptureStep('success');
      
      // Auto close after success
      setTimeout(() => {
        setShowLeadCapture(false);
        setLeadCaptureStep('interest');
      }, 4000);
      
    } catch (error) {
      console.error('Lead submission error:', error);
      // Still show success to user, but log error for admin
      setLeadCaptureStep('success');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const generateBookingReference = () => {
    return `TAS${Date.now().toString().slice(-6)}`;
  };

  const getSeatStatus = (seatNumber: number) => {
    if (bookingData.selectedSeats.includes(seatNumber)) return 'selected';
    if (seatAvailability[seatNumber] === false) return 'occupied';
    return 'available';
  };

  const getTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const trackInteraction = (action: string) => {
    setUserInteraction(prev => prev + 1);
    console.log('User interaction:', action);
    
    // Enhanced analytics tracking
    analytics.trackInteraction(action, 'click', {
      trip_id: trip?.id,
      trip_name: trip?.name,
      user_session_interactions: userInteraction + 1,
      page_path: window.location.pathname
    });
  };

  // Format price helper (consistent INR formatting)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const generateUPILink = () => {
    const amount = (trip?.bookingAdvance || 0) * bookingData.seats;
    const merchantVPA = 'trekandstay@ybl';
    const merchantName = 'Trek and Stay Adventures';
    const transactionRef = `TAS${Date.now()}`;
    const note = `Advance booking for ${trip?.name}`;
    
    return `upi://pay?pa=${merchantVPA}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}&tr=${transactionRef}`;
  };

  const copyUPIDetails = () => {
    const amount = (trip?.bookingAdvance || 0) * bookingData.seats;
    const upiDetails = `UPI ID: trekandstay@ybl\nAmount: ₹${amount.toLocaleString()}\nReference: TAS${Date.now()}`;
    navigator.clipboard.writeText(upiDetails);
    // Show feedback to user
    alert('UPI details copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Trip Not Found</h1>
          <p>The trip you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
      {/* Header with Logo */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Trek and Stay Adventures" 
                className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Trek & Stay</h1>
                <p className="text-xs text-emerald-300 font-medium">Adventures</p>
              </div>
            </a>
            
            <div className="flex items-center space-x-4">
              <a 
                href="tel:9902937730" 
                className="flex items-center space-x-2 text-emerald-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">9902937730</span>
              </a>
              
              <button
                onClick={() => {
                  trackInteraction('header_book_now');
                  handleBookNow();
                }}
                className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Real-time Activity Banner */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-6 text-center relative overflow-hidden"
      >
        <motion.div
          animate={{ x: [-100, window.innerWidth] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-32"
        />
        <div className="relative z-10 flex flex-wrap justify-center items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{realTimeData.currentViewers} people viewing</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>{realTimeData.recentBookings} booked {getTimeAgo(realTimeData.lastBooked)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <span>Limited spots available</span>
          </div>
        </div>
      </motion.div>

      {/* Urgency Banner */}
      <AnimatePresence>
        {showUrgencyBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-6 text-center"
          >
            <div className="flex justify-center items-center gap-3 text-sm font-semibold">
              <AlertCircle className="w-5 h-5 animate-pulse" />
              <span>⏰ Complete your booking in {formatTime(countdownTimer)} to secure your seats!</span>
              <Timer className="w-5 h-5 animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hero Section with Interactive Enhancements */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Interactive Parallax Background */}
        <ParallaxBackground />
        
        {/* Top Navigation Area - Better organized positioning */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 lg:p-6">
          <div className="flex justify-between items-start">
            {/* Live Weather Widget - Compact and responsive */}
            <LiveWeatherWidget 
              location={trip?.location || 'Maharashtra'}
              compact={true}
              className=""
            />
            
            {/* Trek Discovery Widget - Full component on XL screens, button on smaller */}
            <div className="hidden xl:block">
              <TrekDiscoveryWidget 
                onTripSelect={(selectedTrip) => {
                  console.log('Selected trip:', selectedTrip);
                  trackInteraction('trek_discovery_select');
                }}
              />
            </div>
            
            {/* Mobile Trek Discovery Trigger */}
            <div className="xl:hidden">
              <motion.button
                onClick={() => {
                  // Will be handled by TrekDiscoveryWidget's modal
                  document.dispatchEvent(new CustomEvent('openTrekDiscovery'));
                }}
                className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300 mr-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MapPin className="w-5 h-5 text-white" />
              </motion.button>
            </div>
            
            {/* Gamification Dashboard Trigger */}
            <motion.button
              onClick={() => setShowGamificationDashboard(true)}
              className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="View Progress & Achievements"
            >
              <Trophy className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center text-white pt-20 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="inline-block px-4 py-2 bg-forest-green/20 rounded-full mb-6">
              <span className="text-emerald-300 font-semibold">{(trip?.category || 'ADVENTURE').toUpperCase()}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
              {trip?.name || 'Amazing Adventure'}
            </h1>
            
            <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>{trip?.location || 'Beautiful Destination'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>{trip?.duration || '3 Days'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mountain className="w-5 h-5 text-emerald-400" />
                <span>{trip?.difficulty || 'Moderate'}</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-4xl font-extrabold text-emerald-400 mb-2 tracking-tight">
                {trip?.price ? formatPrice(trip.price) : '₹5,000'}
                <span className="text-lg text-white/80 ml-2">/ person</span>
              </div>
              <p className="text-emerald-200">Reserve your spot with an advance of {trip?.bookingAdvance ? formatPrice(trip.bookingAdvance) : '₹2,000'}</p>
            </div>

            <AnimatedCTAButton
              primaryText="🏔️ Book Your Adventure Now"
              secondaryText="⚡ Limited Time Special Offer - Seats Filling Fast!"
              onClick={() => {
                trackInteraction('hero_animated_cta');
                handleBookNow();
              }}
              variant="premium"
              size="xl"
              showCountdown={true}
              className="mb-6"
            />

            <div className="flex justify-center items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-emerald-300">
                <Users className="w-5 h-5" />
                <span>{Math.max(1, (trip?.spotsAvailable || 10) - Object.values(seatAvailability).filter(available => !available).length)} spots left</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <Phone className="w-5 h-5" />
                <span>{trip?.contactNumber || '9902937730'}</span>
              </div>
            </div>

            {/* Urgency Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="mt-8 bg-red-500/90 backdrop-blur-sm rounded-full px-6 py-3 inline-block"
            >
              <div className="flex items-center gap-3 text-white">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <AlertCircle className="w-5 h-5" />
                </motion.div>
                <span className="font-semibold text-sm">
                  ⚡ {realTimeData.recentBookings} people booked in last hour! Limited availability
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/4 left-10 w-20 h-20 bg-forest-green/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [20, -20, 20] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-1/4 right-10 w-32 h-32 bg-teal-500/20 rounded-full blur-xl"
        />
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center text-white mb-12"
          >
            🌟 Adventure Highlights
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {(trip?.highlights || []).map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  onComplete: () => {
                    // Award points for reading highlights
                    if (index === 0) awardPoints('highlights_read', 20);
                  }
                }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-start gap-3">
                  <Star className="w-6 h-6 text-emerald-400 mt-1 flex-shrink-0" />
                  <p className="text-white">{highlight}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Interactive Challenges Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-6">🎮 Test Your Adventure Knowledge</h3>
            <InteractiveChallenges 
              showCompact={true}
              onChallengeComplete={(result) => {
                console.log('Challenge completed:', result);
                awardPoints('challenge_completed', result.totalPoints);
              }}
              onPointsEarned={(points, source) => {
                console.log(`Challenge points: ${points} from ${source}`);
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Itinerary Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center text-white mb-12"
          >
            📅 Day-by-Day Itinerary
          </motion.h2>
          
          {trip?.itinerary && Array.isArray(trip.itinerary) && trip.itinerary.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {trip.itinerary.map((day: Day, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ 
                    opacity: 1, 
                    x: 0
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1,
                    onComplete: () => {
                      // Award points for viewing itinerary details
                      if (index === 0) awardPoints('itinerary_view', 30);
                    }
                  }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    // Award points for detailed itinerary interaction
                    awardPoints('itinerary_interaction', 15);
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-forest-green rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {String(day?.day || index + 1)}
                    </div>
                    <h3 className="text-xl font-bold text-white">{String(day?.title || `Day ${index + 1}`)}</h3>
                  </div>
                  
                  {/* Handle different content formats */}
                  {day?.content ? (
                    <div className="text-white/80 mb-4">
                      {Array.isArray(day.content) ? (
                        <ul className="space-y-2">
                          {(day.content || []).map((item: string, itemIndex: number) => (
                            <li key={itemIndex} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                          <p>{String(day.content)}</p>
                        </div>
                      )}
                    </div>
                  ) : day?.description ? (
                    <div className="text-white/80 mb-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                        <p>{String(day.description)}</p>
                      </div>
                    </div>
                  ) : day?.activities ? (
                    <div className="text-white/80 mb-4">
                      {Array.isArray(day.activities) ? (
                        <ul className="space-y-2">
                          {(day.activities || []).map((activity: string, actIndex: number) => (
                            <li key={actIndex} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                          <span>{String(day.activities)}</span>
                        </div>
                      )}
                    </div>
                  ) : null}
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    {day?.meals && (
                      <div className="bg-emerald-500/20 px-3 py-1 rounded-full">
                        <span className="text-forest-green font-semibold">🍽️ Meals: {String(day.meals)}</span>
                      </div>
                    )}
                    {day?.accommodation && (
                      <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                        <span className="text-waterfall-blue font-semibold">🏨 Stay: {String(day.accommodation)}</span>
                      </div>
                    )}
                    {day?.transport && (
                      <div className="bg-purple-500/20 px-3 py-1 rounded-full">
                        <span className="text-purple-300 font-semibold">🚗 Transport: {String(day.transport)}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <Calendar className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Detailed Itinerary Coming Soon!</h3>
                <p className="text-white/70 mb-4">
                  Our adventure experts are crafting the perfect day-by-day experience for you.
                </p>
                <p className="text-emerald-300 font-semibold">
                  Call us at {trip?.contactNumber || '9902937730'} for detailed information!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready for Your Adventure?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Join us for an unforgettable journey. Limited spots available!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {(trip?.batchDates || []).map((date, index) => (
                <div key={index} className="bg-white/20 rounded-lg px-4 py-2">
                  <Calendar className="w-5 h-5 inline mr-2" />
                  <span className="text-white font-semibold">{date}</span>
                </div>
              ))}
            </div>

                  {/* Enhanced CTA Button in highlights */}
                  <AnimatedCTAButton
                    primaryText="🚀 Secure Your Spot Now"
                    secondaryText="⚡ Join 500+ Happy Adventurers - Limited Seats!"
                    onClick={() => {
                      trackInteraction('cta_secure_spot_animated');
                      handleBookNow();
                    }}
                    variant="premium"
                    size="lg"
                    showCountdown={true}
                  />
          </motion.div>
        </div>
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              {/* Progress Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {bookingStep === 'details' && '1. Booking Details'}
                    {bookingStep === 'seats' && '2. Select Seats'}
                    {bookingStep === 'payment' && '3. Payment'}
                    {bookingStep === 'confirmation' && '4. Confirmed!'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setBookingStep('details');
                      if (timerRef.current) clearInterval(timerRef.current);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex space-x-4">
                  {['details', 'seats', 'payment', 'confirmation'].map((step, index) => (
                    <div key={step} className="flex-1">
                      <div className={`h-2 rounded-full transition-all duration-300 ${
                        bookingStep === step ? 'bg-forest-green' :
                        ['details', 'seats', 'payment', 'confirmation'].indexOf(bookingStep) > index ? 'bg-emerald-300' :
                        'bg-gray-200'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Step 1: Booking Details */}
                {bookingStep === 'details' && (
                  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={bookingData.name}
                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="Full Name *"
                      />
                      <input
                        type="email"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="Email Address *"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="tel"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="WhatsApp Number *"
                      />
                      <select
                        value={bookingData.seats}
                        onChange={(e) => setBookingData({ ...bookingData, seats: parseInt(e.target.value), selectedSeats: [] })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num} People</option>)}
                      </select>
                    </div>
                    <select
                      value={bookingData.selectedBatch}
                      onChange={(e) => setBookingData({ ...bookingData, selectedBatch: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Batch *</option>
                      {(trip?.batchDates || []).map((batch, i) => <option key={i} value={batch}>{batch}</option>)}
                    </select>
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Advance Payment:</span>
                        <span className="text-xl font-bold text-emerald-600">₹{((trip?.bookingAdvance || 0) * bookingData.seats).toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleBookingNext}
                      disabled={!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.selectedBatch}
                      className="w-full bg-gradient-to-r from-forest-green to-waterfall-blue text-white py-4 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.selectedBatch 
                        ? 'Please fill all required fields' 
                        : 'Continue to Seat Selection'
                      }
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Seat Selection */}
                {bookingStep === 'seats' && (
                  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold mb-2">Select {bookingData.seats} seat{bookingData.seats > 1 ? 's' : ''}</h4>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
                          <div className="text-center mb-4">
                            <div className="inline-block bg-gray-800 text-white px-3 py-1 rounded text-sm">Driver</div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {Array.from({ length: trip?.spotsAvailable || 20 }, (_, i) => i + 1).map(seatNumber => (
                              <motion.button
                                key={seatNumber}
                                onClick={(e) => handleSeatSelection(seatNumber, e)}
                                onTouchEnd={(e) => handleSeatSelection(seatNumber, e)}
                                disabled={getSeatStatus(seatNumber) === 'occupied'}
                                whileHover={{ scale: getSeatStatus(seatNumber) !== 'occupied' ? 1.1 : 1 }}
                                whileTap={{ scale: getSeatStatus(seatNumber) !== 'occupied' ? 0.9 : 1 }}
                                className={'aspect-square rounded text-sm font-bold transition-all duration-200 min-h-[44px] touch-manipulation ' +
                                  (getSeatStatus(seatNumber) === 'selected' ? 'bg-forest-green text-white shadow-lg' :
                                  getSeatStatus(seatNumber) === 'occupied' ? 'bg-red-200 text-red-800 cursor-not-allowed' :
                                  'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400')}
                              >
                                {seatNumber}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          <button
                            onClick={handleBookingPrev}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all duration-300"
                          >
                            Back
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleBookingNext}
                            disabled={bookingData.selectedSeats.length !== bookingData.seats}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-all duration-300"
                          >
                            {!bookingData.selectedSeats.length ? 'Please select seats' : 'Continue to Payment'}
                          </button>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {bookingStep === 'payment' && (
                  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold mb-2">Payment Details</h4>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
                          <div className="text-center mb-4">
                            <div className="inline-block bg-gray-800 text-white px-3 py-1 rounded text-sm">Payment</div>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-emerald-400" />
                              <span className="font-semibold">UPI Payment</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-5 h-5 text-emerald-400" />
                              <span className="font-semibold">Scan QR Code</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Zap className="w-5 h-5 text-emerald-400" />
                              <span className="font-semibold">Pay via UPI ID</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          <button
                            onClick={handleBookingPrev}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all duration-300"
                          >
                            Back
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handlePaymentComplete}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all duration-300"
                          >
                            Complete Payment
                          </button>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Confirmation */}
                {bookingStep === 'confirmation' && (
                  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold mb-2">Booking Confirmed!</h4>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
                          <div className="text-center mb-4">
                            <div className="inline-block bg-gray-800 text-white px-3 py-1 rounded text-sm">Confirmation</div>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                              <span className="font-semibold">Booking Reference: {generateBookingReference()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Heart className="w-5 h-5 text-emerald-400" />
                              <span className="font-semibold">Thank you for choosing Trek & Stay Adventures!</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          <button
                            onClick={() => setShowBookingModal(false)}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all duration-300"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead Capture Modal */}
      <AnimatePresence>
        {showLeadCapture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              {/* Progress Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {leadCaptureStep === 'interest' && '1. Show Interest'}
                    {leadCaptureStep === 'details' && '2. Provide Details'}
                    {leadCaptureStep === 'success' && '3. Success!'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowLeadCapture(false);
                      setLeadCaptureStep('interest');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex space-x-4">
                  {['interest', 'details', 'success'].map((step, index) => (
                    <div key={step} className="flex-1">
                      <div className={`h-2 rounded-full transition-all duration-300 ${
                        leadCaptureStep === step ? 'bg-emerald-500' :
                        ['interest', 'details', 'success'].indexOf(leadCaptureStep) > index ? 'bg-emerald-300' :
                        'bg-gray-200'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Step 1: Show Interest */}
                {leadCaptureStep === 'interest' && (
                  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold mb-2">Show Interest in {trip?.name}</h4>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
                          <div className="text-center mb-4">
                            <div className="inline-block bg-gray-800 text-white px-3 py-1 rounded text-sm">Interest</div>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center gap-2">
                              <Heart className="w-5 h-5 text-emerald-400" />
                              <span className="font-semibold">I'm interested in {trip?.name}!</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          <button
                            onClick={() => setShowLeadCapture(false)}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all duration-300"
                          >
                            Close
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setLeadCaptureStep('details')}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all duration-300"
                          >
                            Provide Details
                          </button>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Provide Details */}
                {leadCaptureStep === 'details' && (
                  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold mb-2">Provide Your Details</h4>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
                          <div className="text-center mb-4">
                            <div className="inline-block bg-gray-800 text-white px-3 py-1 rounded text-sm">Details</div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              value={leadData.name}
                              onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              placeholder="Full Name *"
                            />
                            <input
                              type="tel"
                              value={leadData.phone}
                              onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              placeholder="WhatsApp Number *"
                            />
                            <input
                              type="email"
                              value={leadData.email}
                              onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              placeholder="Email Address *"
                            />
                            <textarea
                              value={leadData.interest}
                              onChange={(e) => setLeadData({ ...leadData, interest: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              placeholder="Tell us more about your interest..."
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          <button
                            onClick={() => setLeadCaptureStep('interest')}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all duration-300"
                          >
                            Back
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleLeadSubmit}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all duration-300"
                          >
                            Submit
                          </button>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Success */}
                {leadCaptureStep === 'success' && (
                  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold mb-2">Thank you for your interest!</h4>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
                          <div className="text-center mb-4">
                            <div className="inline-block bg-gray-800 text-white px-3 py-1 rounded text-sm">Success</div>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                              <span className="font-semibold">We'll be in touch soon!</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-200 rounded"></div>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                          <span>Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-200 rounded"></div>
                          <span>Occupied</span>
                        </div>
                      </div>
                    </div>
                    {bookingData.selectedSeats.length > 0 && (
                      <div className="bg-emerald-50 p-4 rounded-lg">
                        <p className="text-emerald-800 font-semibold">Selected: {bookingData.selectedSeats.sort().join(', ')}</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={handleBookingPrev} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 flex items-center justify-center gap-2">
                        <ArrowLeft className="w-5 h-5" /> Back
                      </button>
                      <button
                        onClick={handleBookingNext}
                        disabled={bookingData.selectedSeats.length !== bookingData.seats}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-lg font-bold disabled:opacity-50 hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        Proceed to Payment <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {bookingStep === 'payment' && (
                  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl flex items-center gap-3 shadow-lg">
                      <Lock className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <p className="font-bold">✅ Seats Secured!</p>
                        <p className="text-sm opacity-90">Your seats are confirmed. Complete payment to finalize your booking.</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h5 className="font-semibold mb-4">Booking Summary</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Trip:</span><span className="font-medium">{trip?.name}</span></div>
                        <div className="flex justify-between"><span>Seats:</span><span className="font-medium">{bookingData.selectedSeats.sort().join(', ')}</span></div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Advance Payment:</span>
                          <span className="text-emerald-600">₹{((trip?.bookingAdvance || 0) * bookingData.seats).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl">
                      <div className="text-center mb-4">
                        <QrCode className="w-16 h-16 mx-auto text-purple-600 mb-2" />
                        <p className="font-medium">Pay with UPI</p>
                      </div>
                      <div className="flex justify-center mb-4">
                        <img src="/upi.jpeg" alt="UPI Payment" className="w-48 h-auto rounded-lg shadow-md" />
                      </div>
                      <div className="bg-white p-4 rounded-lg border-dashed border-2 border-purple-300 mb-4">
                        <div className="text-sm space-y-1">
                          <div><strong>UPI ID:</strong> trekandstay@ybl</div>
                          <div><strong>Amount:</strong> ₹{((trip?.bookingAdvance || 0) * bookingData.seats).toLocaleString()}</div>
                          <div><strong>Ref:</strong> {generateBookingReference()}</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <a href={generateUPILink()} className="w-full bg-green-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                          <Smartphone className="w-5 h-5" /> Pay with UPI
                        </a>
                        <button onClick={() => copyToClipboard('UPI: trekandstay@ybl\nAmount: ₹' + ((trip?.bookingAdvance || 0) * bookingData.seats).toLocaleString())} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                          <Copy className="w-5 h-5" /> Copy Details
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleBookingPrev} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                        <ArrowLeft className="w-5 h-5" /> Back
                      </button>
                      <button
                        onClick={handlePaymentComplete}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
                      >
                        <CheckSquare className="w-5 h-5" /> Booking Confirmed - Seats Secured!
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Confirmation */}
                {bookingStep === 'confirmation' && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                    <motion.div animate={{ scale: [0, 1.2, 1] }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 Booking Confirmed!</h3>
                      <p className="text-gray-600">Thank you {bookingData.name}! Your adventure awaits.</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-xl text-left">
                      <h4 className="font-semibold text-emerald-800 mb-3">Booking Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Reference:</span><span className="font-bold">{generateBookingReference()}</span></div>
                        <div className="flex justify-between"><span>Seats:</span><span>{bookingData.selectedSeats.sort().join(', ')}</span></div>
                        <div className="flex justify-between"><span>Paid:</span><span className="font-bold text-emerald-600">₹{((trip?.bookingAdvance || 0) * bookingData.seats).toLocaleString()}</span></div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <div className="text-left text-blue-800">
                        <p className="font-semibold text-sm">WhatsApp confirmation sent to {bookingData.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowBookingModal(false);
                        setBookingStep('details');
                        if (timerRef.current) clearInterval(timerRef.current);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-lg font-bold"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Payment - ₹{(trip.bookingAdvance * bookingData.seats).toLocaleString()}
                </h3>

                {paymentStep === 'upi' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl">
                      <QrCode className="w-24 h-24 mx-auto text-purple-600 mb-4" />
                      <p className="text-gray-700 mb-4">Scan QR code with any UPI app</p>
                      <div className="flex justify-center mb-4">
                        <img src="/upi.jpeg" alt="UPI Payment" className="w-48 h-auto rounded-lg shadow-md" />
                      </div>
                      <div className="bg-white p-4 rounded-lg border-2 border-dashed border-purple-300">
                        <p className="text-sm text-gray-600">UPI ID: <span className="font-bold">trekandstay@ybl</span></p>
                        <p className="text-sm text-gray-600">Amount: <span className="font-bold">₹{(trip.bookingAdvance * bookingData.seats).toLocaleString()}</span></p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <a
                        href={generateUPILink()}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
                      >
                        <Smartphone className="w-5 h-5" />
                        Pay with UPI App
                      </a>

                      <button
                        onClick={copyUPIDetails}
                        className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all duration-300"
                      >
                        <CreditCard className="w-5 h-5" />
                        Copy UPI Details
                      </button>

                      <button
                        onClick={() => setPaymentStep('success')}
                        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-600 transition-all duration-300"
                      >
                        I have completed the payment
                      </button>
                    </div>
                  </div>
                )}

                {paymentStep === 'success' && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 mb-2">Booking Confirmed! 🎉</h4>
                      <p className="text-gray-600">
                        Thank you for booking with us. You'll receive a confirmation on WhatsApp shortly.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-700">
                        📱 WhatsApp updates will be sent to: <span className="font-bold">{bookingData.phone}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPaymentStep('details');
                      }}
                      className="bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-600 transition-all duration-300"
                    >
                      Done
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Lead Capture Modal */}
      <AnimatePresence>
        {showLeadCapture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
            >
              {/* Animated background elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20"
              />

              <div className="relative z-10">
                {leadCaptureStep === 'interest' && (
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Heart className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">🏔️ Love This Adventure?</h3>
                    <p className="text-gray-600 mb-6">Get exclusive deals and early access to new trips!</p>
                    
                    <div className="space-y-4">
                      <button
                        onClick={() => setLeadCaptureStep('details')}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        ✨ Yes, Keep Me Updated!
                      </button>
                      <button
                        onClick={() => setShowLeadCapture(false)}
                        className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
                      >
                        Maybe Later
                      </button>
                    </div>
                  </div>
                )}

                {leadCaptureStep === 'details' && (
                  <div>
                    <div className="text-center mb-6">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: 3 }}
                        className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <Gift className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-800">🎁 Claim Your Benefits</h3>
                      <p className="text-gray-600">Join 500+ adventure enthusiasts!</p>
                    </div>

                    <form className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={leadData.name}
                          onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Your Name"
                        />
                      </div>
                      
                      <div>
                        <input
                          type="tel"
                          value={leadData.phone}
                          onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="WhatsApp Number"
                        />
                      </div>

                      <div>
                        <input
                          type="email"
                          value={leadData.email}
                          onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Email (Optional)"
                        />
                      </div>

                      <div>
                        <select
                          value={leadData.interest}
                          onChange={(e) => setLeadData({ ...leadData, interest: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">What interests you most?</option>
                          <option value="adventure">Adventure Activities</option>
                          <option value="trekking">Trekking & Hiking</option>
                          <option value="camping">Camping Experiences</option>
                          <option value="photography">Photography Tours</option>
                          <option value="wellness">Wellness Retreats</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleLeadSubmit}
                        disabled={!leadData.name || !leadData.phone}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <Send className="w-5 h-5 inline mr-2" />
                        Get My Benefits!
                      </button>
                    </form>
                  </div>
                )}

                {leadCaptureStep === 'success' && (
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.6 }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">🎉 Welcome Aboard!</h3>
                    <p className="text-gray-600 mb-4">
                      You'll receive exclusive deals and trip updates on WhatsApp!
                    </p>
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <p className="text-sm text-emerald-700">
                        💚 Thank you {leadData.name}! Check your WhatsApp for a special welcome offer.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowLeadCapture(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Floating Action Bubbles - Better mobile positioning */}
      <div className="fixed bottom-20 right-6 z-40 md:bottom-6">
        <FloatingActionBubbles 
          tripData={trip}
          onActionClick={(action, data) => {
            trackInteraction(`floating_action_${action}`);
            console.log('Action clicked:', action, data);
          }}
        />
      </div>

      {/* Hidden TrekDiscoveryWidget for mobile access */}
      <div className="xl:hidden">
        <TrekDiscoveryWidget 
          onTripSelect={(selectedTrip) => {
            console.log('Selected trip:', selectedTrip);
            trackInteraction('trek_discovery_select_mobile');
            awardPoints('trip_discovery', 25);
          }}
        />
      </div>

      {/* Adventure Points System - Always Active */}
      <AdventurePointsSystem 
        onPointsEarned={(points, action) => {
          console.log(`Earned ${points} points for ${action}`);
        }}
        onAchievementUnlocked={(achievement) => {
          console.log('Achievement unlocked:', achievement.name);
        }}
        onLevelUp={(newLevel) => {
          console.log(`Level up! Now level ${newLevel}`);
        }}
      />

      {/* User Engagement Analytics - Compact Mode */}
      <UserEngagementAnalytics 
        tripData={trip}
        showRealTimeAnalytics={false}
        className="fixed top-4 left-4 z-30 hidden lg:block"
        onLeadScoreUpdate={(score) => {
          console.log('Lead score updated:', score);
        }}
        onHighValueAction={(action, scoreChange) => {
          console.log(`High value action: ${action} (${scoreChange})`);
        }}
      />

      {/* Sticky Bottom CTA Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-500 p-4 z-30 md:hidden">
        <div className="flex items-center justify-between text-white">
          <div>
            <div className="font-bold">₹{trip?.price.toLocaleString()}</div>
            <div className="text-sm opacity-90">per person</div>
          </div>
          <button
            onClick={() => {
              trackInteraction('sticky_book_now');
              handleBookNow();
            }}
            className="bg-white text-emerald-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-all duration-300"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Gamification Dashboard Modal */}
      <AnimatePresence>
        {showGamificationDashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">🏆 Adventure Progress Dashboard</h2>
                  <button
                    onClick={() => setShowGamificationDashboard(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Progress Tracking Dashboard */}
                <div className="mb-8">
                  <ProgressTrackingDashboard 
                    showDetailed={true}
                    onJourneyStepComplete={(step) => {
                      console.log('Journey step completed:', step.name);
                      awardPoints('journey_step', step.points);
                    }}
                  />
                </div>

                {/* Achievement Badge System */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">🏅 Achievements & Badges</h3>
                  <AchievementBadgeSystem 
                    showDetailed={true}
                    onBadgeUnlocked={(badge) => {
                      console.log('Badge unlocked:', badge.name);
                    }}
                  />
                </div>

                {/* Interactive Challenges */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">🎯 Adventure Challenges</h3>
                  <InteractiveChallenges 
                    showCompact={false}
                    onChallengeComplete={(result) => {
                      console.log('Challenge completed in dashboard:', result);
                      awardPoints('dashboard_challenge', result.totalPoints);
                    }}
                    onPointsEarned={(points, source) => {
                      console.log(`Dashboard challenge points: ${points} from ${source}`);
                    }}
                  />
                </div>

                {/* Real-time Analytics */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">📊 Live Analytics</h3>
                  <UserEngagementAnalytics 
                    tripData={trip}
                    showRealTimeAnalytics={true}
                    onLeadScoreUpdate={(score) => {
                      console.log('Dashboard lead score updated:', score);
                    }}
                    onHighValueAction={(action, scoreChange) => {
                      console.log(`Dashboard high value action: ${action} (${scoreChange})`);
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripLandingPage;