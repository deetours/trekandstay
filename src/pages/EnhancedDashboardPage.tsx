import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAdventureStore } from '../store/adventureStore';
import { getBookings, getWishlist, removeWishlist, getRecommendations, getTripHistory } from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  CalendarDays, Heart, LogOut, Trophy, MapPin, Clock, CheckCircle, AlertCircle, 
  XCircle, ArrowRight, CreditCard, Compass, Brain, Zap, Target,
  TrendingUp, BarChart3, Settings, Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LocalScene } from '../components/3d/LocalScene';
import { useToast } from '../components/ui/useToast';
import type { Booking, WishlistItem, RecommendationItem } from '../types';
import { DashboardNavigation } from '../components/dashboard/DashboardNavigation';

// AI-Enhanced Components
import AITravelAssistant from '../components/dashboard/AITravelAssistant';
import SmartRecommendationsWidget from '../components/dashboard/SmartRecommendationsWidget';
import SmartBudgetManager from '../components/dashboard/SmartBudgetManager';
import PredictiveTravelPlanner from '../components/dashboard/PredictiveTravelPlanner';
import TravelAnalyticsWidget from '../components/dashboard/TravelAnalyticsWidget';
import SocialTravelHub from '../components/dashboard/SocialTravelHub';
import UserVoiceAI from '../components/dashboard/UserVoiceAI';
import BookingFlow from '../components/dashboard/BookingFlow';
// ...existing code...
import SafeAnalytics from '../components/SafeAnalytics';

export const EnhancedDashboardPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAdventureStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  // Removed unused history state
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [loading, setLoading] = useState({ bookings: false, wishlist: false, recos: false, history: false });
  const [errors, setErrors] = useState<{ [k: string]: string | null }>({});
  const focusRefetchAttached = useRef(false);
  const { success, error: toastError } = useToast();
  const [activeView, setActiveView] = useState<'overview' | 'ai-assistant' | 'planner' | 'budget' | 'analytics' | 'social' | 'voice'>('overview');
  
  // Booking flow state
  const [isBookingFlowOpen, setIsBookingFlowOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | undefined>(undefined);

  // Check if this is a first-time AI dashboard user
  const checkFirstTimeAIUser = useCallback(() => {
    const aiTourDone = localStorage.getItem('enhanced_dash_tour_done');
    const lastAIVisit = localStorage.getItem('last_ai_dashboard_visit');
    const userNewToAI = user?.id && !lastAIVisit;
    
    if (!aiTourDone || userNewToAI) {
      setIsFirstTime(true);
      setShowWelcomeModal(true);
      return true;
    }
    return false;
  }, [user]);

  const startAIWelcomeTour = useCallback(() => {
    setShowWelcomeModal(false);
    setRunTour(true);
  }, []);

  const skipAIWelcome = useCallback(() => {
    setShowWelcomeModal(false);
    localStorage.setItem('enhanced_dash_tour_done', '1');
    localStorage.setItem('last_ai_dashboard_visit', new Date().toISOString());
  }, []);

  // Booking flow handlers
  const openBookingFlow = useCallback((tripId?: number) => {
    setSelectedTripId(tripId);
    setIsBookingFlowOpen(true);
  }, []);

  const handleBookTrip = useCallback((tripId?: number) => {
    openBookingFlow(tripId);
  }, [openBookingFlow]);

  const fetchBookingsSafe = useCallback(async (userId?: number) => {
    setLoading(l => ({ ...l, bookings: true }));
    try { setBookings(await getBookings(userId)); setErrors(e => ({ ...e, bookings: null })); }
    catch (e) { 
      const message = e instanceof Error ? e.message : 'Failed to load bookings';
      setErrors(err => ({ ...err, bookings: message }));
    }
    finally { setLoading(l => ({ ...l, bookings: false })); }
  }, []);

  const fetchWishlistSafe = useCallback(async () => {
    setLoading(l => ({ ...l, wishlist: true }));
    try { setWishlist(await getWishlist()); setErrors(e => ({ ...e, wishlist: null })); }
    catch (e) { 
      const message = e instanceof Error ? e.message : 'Failed to load wishlist';
      setErrors(err => ({ ...err, wishlist: message }));
    }
    finally { setLoading(l => ({ ...l, wishlist: false })); }
  }, []);

  const fetchRecosSafe = useCallback(async () => {
    setLoading(l => ({ ...l, recos: true }));
    try { setRecommendations(await getRecommendations()); setErrors(e => ({ ...e, recos: null })); }
    catch (e) { 
      const message = e instanceof Error ? e.message : 'Failed to load recommendations';
      setErrors(err => ({ ...err, recos: message }));
    }
    finally { setLoading(l => ({ ...l, recos: false })); }
  }, []);

  const fetchHistorySafe = useCallback(async () => {
    setLoading(l => ({ ...l, history: true }));
  try { await getTripHistory(); setErrors(e => ({ ...e, history: null })); }
    catch (e) { 
      const message = e instanceof Error ? e.message : 'Failed to load history';
      setErrors(err => ({ ...err, history: message }));
    }
    finally { setLoading(l => ({ ...l, history: false })); }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true, state: { from: '/dashboard/ai' } });
      return;
    }
    
    // Check if first-time AI dashboard user
    const isFirstTimeAI = checkFirstTimeAIUser();
    
    fetchBookingsSafe(Number(user.id));
    fetchWishlistSafe();
    fetchRecosSafe();
    fetchHistorySafe();
    
    if (!focusRefetchAttached.current) {
      const onFocus = () => {
        fetchBookingsSafe(Number(user.id));
        fetchWishlistSafe();
      };
      window.addEventListener('focus', onFocus);
      focusRefetchAttached.current = true;
    }
    
    // Update last visit timestamp for returning users
    if (!isFirstTimeAI) {
      localStorage.setItem('last_ai_dashboard_visit', new Date().toISOString());
    }
  }, [isAuthenticated, user, navigate, fetchBookingsSafe, fetchWishlistSafe, fetchRecosSafe, fetchHistorySafe, checkFirstTimeAIUser]);

  const tourSteps = useMemo<Step[]>(() => [
    { 
      target: '#enhanced-dash-hero', 
      content: isFirstTime 
        ? '🤖 Welcome to AI-Powered Travel Intelligence! This is where machine learning meets wanderlust - your personal travel genius awaits!'
        : 'Welcome to your AI-powered Dashboard! Experience next-level travel planning.',
      placement: 'bottom'
    },
    { 
      target: '#ai-nav-tabs', 
      content: isFirstTime 
        ? '🧭 Navigate through AI superpowers! Each tab unlocks different intelligent features: Chat with AI, Smart Planning, Budget Optimization, and Deep Analytics!'
        : 'Switch between different AI-powered views: Overview, AI Assistant, Smart Planner, and Budget Manager.',
      placement: 'bottom'
    },
    { 
      target: '#smart-recommendations', 
      content: isFirstTime 
        ? '🎯 Smart Recommendations powered by AI! These aren\'t random suggestions - they\'re personalized based on your behavior, preferences, and travel DNA!'
        : 'Get personalized AI recommendations based on your travel behavior and preferences.',
      placement: 'top'
    },
    { 
      target: '#ai-travel-assistant', 
      content: isFirstTime 
        ? '💬 Meet your AI Travel Companion! Ask anything: "Plan a ₹20k weekend", "Best time for Goa?", "Budget destinations like me" - it understands context!'
        : 'Chat with your AI travel companion for instant help and insights.',
      placement: 'center'
    },
    { 
      target: '#predictive-planner', 
      content: isFirstTime 
        ? '🔮 Predictive Travel Planning! AI analyzes weather patterns, pricing trends, and crowd data to suggest optimal travel dates and costs!'
        : 'Let AI predict optimal travel dates, costs, and conditions for your next trip.',
      placement: 'top'
    },
    { 
      target: '#budget-manager', 
      content: isFirstTime 
        ? '💰 Smart Budget Optimization! AI finds hidden savings, predicts price drops, and suggests cost-effective alternatives you never knew existed!'
        : 'AI-powered budget optimization with smart savings opportunities.',
      placement: 'top'
    },
    ...(isFirstTime ? [{
      target: 'body',
      content: '🚀 You\'re now equipped with AI superpowers! Ready to let artificial intelligence revolutionize your travel planning? The future of travel starts now!',
      placement: 'center' as const
    }] : [
      { target: '#enhanced-stats', content: 'Advanced analytics showing your travel patterns and AI insights.' }
    ])
  ], [isFirstTime]);

  if (!user) return null;

  const onTourCallback = (data: CallBackProps) => {
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(data.status)) { 
      setRunTour(false); 
      localStorage.setItem('enhanced_dash_tour_done', '1');
      localStorage.setItem('last_ai_dashboard_visit', new Date().toISOString());
      
      // Show completion message for first-time AI users
      if (isFirstTime) {
        success({ 
          title: '🤖 AI Dashboard Mastered!', 
          description: 'You\'re now ready to harness the power of AI for smarter travel planning!' 
        });
      }
    }
  };

  // AI Welcome Modal Component
  const AIWelcomeModal = () => {
    if (!showWelcomeModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-purple-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-200">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to AI-Powered Travel! 🤖
            </h2>
            <p className="text-gray-600 mb-6">
              Hi {user?.name || 'Explorer'}! 🚀 Ready to experience travel planning powered by artificial intelligence? 
              Let's explore your new AI superpowers together!
            </p>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1" 
                onClick={skipAIWelcome}
              >
                Skip AI Tour
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                onClick={startAIWelcomeTour}
              >
                Discover AI Magic ✨
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const removeWishlistOptimistic = async (id: number) => {
    const prev = wishlist;
    setWishlist(w => w.filter(x => x.id !== id));
    try { 
      await removeWishlist(id); 
      success({ title: 'Removed', description: 'Trip removed from Travel List.' }); 
    }
    catch (e) { 
      setWishlist(prev); 
      const message = e instanceof Error ? e.message : 'Could not remove';
      toastError({ title: 'Failed', description: message });
    }
  };

  const statusBadge = (status: string) => {
    const cfg = {
      confirmed: { icon: CheckCircle, classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Confirmed' },
      pending: { icon: AlertCircle, classes: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
      cancelled: { icon: XCircle, classes: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Cancelled' },
    } as const;
  const c = (cfg as Record<string, typeof cfg[keyof typeof cfg]>)[status] || cfg.pending;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${c.classes}`}>
        <Icon className="w-3.5 h-3.5" /> {c.label}
      </span>
    );
  };

  const navigationTabs = [
    { id: 'overview', label: 'Smart Overview', icon: <BarChart3 className="w-4 h-4" />, description: 'AI-enhanced dashboard overview' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <Brain className="w-4 h-4" />, description: 'Your personal travel companion' },
    { id: 'planner', label: 'Smart Planner', icon: <Target className="w-4 h-4" />, description: 'Predictive travel planning' },
    { id: 'budget', label: 'Budget Manager', icon: <TrendingUp className="w-4 h-4" />, description: 'AI-powered budget optimization' },
    { id: 'analytics', label: 'Travel Analytics', icon: <BarChart3 className="w-4 h-4" />, description: 'Personal travel insights' },
    { id: 'social', label: 'Social Hub', icon: <Settings className="w-4 h-4" />, description: 'Connect with travelers' },
    { id: 'voice', label: 'Voice AI', icon: <Zap className="w-4 h-4" />, description: 'Voice-powered assistant' }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-stone-50 to-blue-50" aria-live="polite">
      <DashboardNavigation />
      <LocalScene variant="dust" size={200} />
      <AIWelcomeModal />
      <Joyride 
        steps={tourSteps} 
        run={runTour} 
        continuous 
        showProgress 
        showSkipButton 
        callback={onTourCallback} 
        styles={{ 
          options: { 
            primaryColor: '#7c3aed', 
            zIndex: 10000,
            textColor: '#374151',
            backgroundColor: '#ffffff',
            arrowColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.4)'
          },
          spotlight: {
            borderRadius: 8
          }
        }} 
      />
      <div className="pointer-events-none absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-emerald-200/50 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-indigo-200/50 blur-[110px]" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-24 sm:pt-28 pb-12 sm:pb-16">
        {/* Enhanced Hero Section */}
        <div id="enhanced-dash-hero" className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/60 bg-white/70 backdrop-blur shadow-xl mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,.08),transparent_40%),radial-gradient(circle_at_80%_0,rgba(59,130,246,.08),transparent_40%)]" />
          <div className="relative px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-oswald font-bold tracking-tight text-forest-green">
                    {isFirstTime ? `Welcome to AI Travel Magic, ${user?.name || 'Explorer'}! 🤖` : `Welcome back, ${user?.name || 'Explorer'}!`}
                  </h1>
                  <div className="px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200 self-start">
                    <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      AI-POWERED
                    </span>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-mountain-blue max-w-3xl mb-4">
                  {isFirstTime 
                    ? "🚀 Step into the future of travel planning! Our AI analyzes millions of data points to craft perfect journeys, predict optimal timing, and unlock hidden savings. Your intelligent travel companion awaits!"
                    : "Experience next-generation travel planning with AI-powered recommendations, predictive insights, and smart budget optimization. Your personal travel intelligence hub."
                  }
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Link to="/destinations" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                    Explore Trips <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Button variant="primary" size="sm" onClick={() => handleBookTrip()} className="inline-flex items-center gap-2">
                    <CreditCard className="w-3 h-3" />
                    Quick Book
                  </Button>
                  <Link to="/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:underline text-sm font-medium">
                    📊 Simple Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Button variant="secondary" size="sm" onClick={() => setRunTour(true)} className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Take AI Tour
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setActiveView('ai-assistant')} className="text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    Ask AI
                  </Button>
                </div>
              </div>
              <div className="hidden sm:block self-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-100 via-blue-100 to-purple-100 border-2 border-white/70 shadow-inner flex items-center justify-center relative">
                  <span className="text-xl sm:text-2xl font-bold text-forest-green">{(user.name || 'U')[0]}</span>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Brain className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Row */}
            <div id="enhanced-stats" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
              <div className="bg-white/60 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/50">
                <div className="text-xs text-gray-500 mb-1">Completed</div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-600">{user.completedTrips || 0}</div>
                <div className="text-xs text-emerald-600">trips</div>
              </div>
              <div className="bg-white/60 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/50">
                <div className="text-xs text-gray-500 mb-1">Points</div>
                <div className="text-xl sm:text-2xl font-bold text-amber-600 flex items-center gap-1">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                  {user.adventurePoints || 0}
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/50">
                <div className="text-xs text-gray-500 mb-1">Wishlist</div>
                <div className="text-xl sm:text-2xl font-bold text-rose-600">{wishlist.length}</div>
                <div className="text-xs text-rose-600">saved</div>
              </div>
              <div className="bg-white/60 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/50">
                <div className="text-xs text-gray-500 mb-1">AI Score</div>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">92%</div>
                <div className="text-xs text-purple-600">optimized</div>
              </div>
              <div className="bg-white/60 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/50 col-span-2 sm:col-span-1">
                <div className="text-xs text-gray-500 mb-1">Savings</div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">₹{(15420).toLocaleString()}</div>
                <div className="text-xs text-green-600">this year</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Navigation Tabs */}
        <div id="ai-nav-tabs" className="mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur rounded-xl sm:rounded-2xl border border-white/60 shadow-lg p-1.5 sm:p-2">
            <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0">
              {navigationTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as typeof activeView)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                    activeView === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-white/70 hover:text-gray-800'
                  }`}
                >
                  {tab.icon}
                  <div className="text-left">
                    <div className="hidden sm:block">{tab.label}</div>
                    <div className="sm:hidden">{tab.label.split(' ')[0]}</div>
                    <div className={`text-xs hidden sm:block ${activeView === tab.id ? 'text-indigo-100' : 'text-gray-400'}`}>
                      {tab.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dynamic Content Based on Active View */}
        <div className="space-y-8">
          {activeView === 'overview' && (
            <div className="space-y-8">
              {/* Smart Recommendations Widget */}
              <div id="smart-recommendations">
                <SmartRecommendationsWidget className="shadow-xl" limit={4} />
              </div>

              {/* Traditional Dashboard Content Enhanced */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
                <div className="xl:col-span-2 space-y-6">
                  {/* Enhanced Bookings */}
                  <Card className="p-4 sm:p-6 bg-white/85 backdrop-blur border-white/70 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold">Smart Bookings</h2>
                          <p className="text-xs sm:text-sm text-gray-500">AI-optimized travel management</p>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => navigate('/destinations')}>
                        <Zap className="w-4 h-4 mr-2" />
                        Book Smart
                      </Button>
                    </div>
                    
                    {bookings.length === 0 && !loading.bookings && !errors.bookings && (
                      <div className="text-center py-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                        <CalendarDays className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                        <div className="text-sm font-medium text-gray-700 mb-2">No bookings yet</div>
                        <div className="text-xs text-gray-500 mb-4">Let AI help you find the perfect trip</div>
                        <Link to="/destinations" className="text-indigo-600 underline font-medium text-sm">
                          Explore AI Recommendations
                        </Link>
                      </div>
                    )}
                    
                    {loading.bookings && (
                      <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {errors.bookings && (
                      <div className="text-center py-8 bg-red-50 rounded-xl border border-red-100">
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <div className="text-sm text-red-600">{errors.bookings}</div>
                      </div>
                    )}
                    
                    {bookings.length > 0 && !loading.bookings && (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                                </div>
                                <div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                                    {statusBadge(booking.status)}
                                    <h3 className="font-semibold text-gray-900">{booking.destination}</h3>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {booking.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <CreditCard className="w-3 h-3" />
                                      ₹{booking.amount.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {booking.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => navigate(`/payment?booking=${booking.id}&amount=${booking.amount}`)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CreditCard className="w-4 h-4 mr-1" />
                                    Pay Now
                                  </Button>
                                )}
                                <Button variant="secondary" size="sm">
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Enhanced Recommendations */}
                  <Card className="p-4 sm:p-6 bg-white/85 backdrop-blur border-white/70 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold">AI Recommendations</h2>
                        <p className="text-xs sm:text-sm text-gray-500">Personalized for your travel style</p>
                      </div>
                    </div>
                    
                    {recommendations.length === 0 && !loading.recos && !errors.recos && (
                      <div className="text-center py-8 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-emerald-100">
                        <Brain className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                        <div className="text-sm font-medium text-gray-700 mb-2">AI is learning your preferences</div>
                        <div className="text-xs text-gray-500">Recommendations will appear as you explore</div>
                      </div>
                    )}
                    
                    {loading.recos && <div className="text-sm text-gray-400">AI is analyzing your preferences...</div>}
                    {errors.recos && <div className="text-sm text-rose-600">{errors.recos}</div>}
                    
                    {recommendations.length > 0 && !loading.recos && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recommendations.map(rec => (
                          <div key={rec.id} className="group bg-gradient-to-br from-white to-emerald-50 rounded-xl border border-emerald-100 p-4 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">AI PICK</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{rec.destination}</h3>
                            <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                            <Link 
                              to={`/trip/${rec.trip || ''}`} 
                              className="inline-flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium group-hover:underline"
                            >
                              Explore Trip <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                {/* Enhanced Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                  {/* Enhanced Wishlist */}
                  <Card className="p-4 sm:p-6 bg-white/85 backdrop-blur border-white/70 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold">Smart Wishlist</h2>
                        <p className="text-xs sm:text-sm text-gray-500">AI-optimized travel dreams</p>
                      </div>
                    </div>
                    
                    {wishlist.length === 0 && !loading.wishlist && !errors.wishlist && (
                      <div className="text-center py-8 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                        <Heart className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                        <div className="text-sm text-rose-600">Your dream trips await</div>
                      </div>
                    )}
                    
                    {loading.wishlist && <div className="text-sm text-gray-400">Loading wishlist...</div>}
                    {errors.wishlist && <div className="text-sm text-rose-600">{errors.wishlist}</div>}
                    
                    {wishlist.length > 0 && !loading.wishlist && (
                      <div className="space-y-3">
                        {wishlist.map((item) => (
                          <div key={item.id} className="bg-gradient-to-r from-white to-rose-50 rounded-xl border border-rose-100 p-3 hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              {item.trip_image && (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img src={item.trip_image} alt={item.trip_name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">{item.trip_name || `Trip #${item.trip}`}</h3>
                                <p className="text-xs text-gray-500 truncate">{item.notes || 'No notes'}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <Link to={`/trip/${item.trip}`} className="text-rose-600 hover:underline text-xs">
                                    View Details
                                  </Link>
                                  <button 
                                    onClick={() => removeWishlistOptimistic(item.id)}
                                    className="text-gray-400 hover:text-rose-500 text-xs"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Quick Actions */}
                  <Card className="p-4 sm:p-6 bg-white/85 backdrop-blur border-white/70 shadow-lg">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Quick Actions
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <Button 
                        variant="secondary" 
                        className="w-full justify-start text-sm" 
                        onClick={() => setActiveView('ai-assistant')}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Ask AI Assistant
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="w-full justify-start text-sm"
                        onClick={() => setActiveView('planner')}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Plan Smart Trip
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="w-full justify-start text-sm"
                        onClick={() => setActiveView('budget')}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Optimize Budget
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="w-full justify-start text-sm mt-4" 
                        onClick={() => { 
                          logout(); 
                          localStorage.removeItem('auth_token'); 
                          navigate('/'); 
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeView === 'ai-assistant' && (
            <div id="ai-travel-assistant" className="max-w-4xl mx-auto">
              <AITravelAssistant />
            </div>
          )}

          {activeView === 'planner' && (
            <div id="predictive-planner" className="space-y-8">
              <PredictiveTravelPlanner />
            </div>
          )}

          {activeView === 'budget' && (
            <div id="budget-manager" className="space-y-8">
              <SmartBudgetManager />
            </div>
          )}

          {activeView === 'analytics' && (
            <div id="travel-analytics" className="space-y-8">
              <SafeAnalytics>
                <TravelAnalyticsWidget />
              </SafeAnalytics>
            </div>
          )}

          {activeView === 'social' && (
            <div id="social-hub" className="space-y-8">
              <SafeAnalytics>
                <SocialTravelHub />
              </SafeAnalytics>
            </div>
          )}

          {activeView === 'voice' && (
            <div id="voice-ai" className="space-y-8">
              <SafeAnalytics>
                <UserVoiceAI />
              </SafeAnalytics>
            </div>
          )}
        </div>
      </div>

      {/* Booking Flow Modal */}
      <BookingFlow
        isOpen={isBookingFlowOpen}
        onClose={() => {
          setIsBookingFlowOpen(false);
          setSelectedTripId(undefined);
        }}
        selectedTripId={selectedTripId}
        onBookingComplete={(bookingId) => {
          console.log('Booking completed:', bookingId);
          setIsBookingFlowOpen(false);
          setSelectedTripId(undefined);
          // Refresh bookings data
          if (user?.id) {
            fetchBookingsSafe(parseInt(user.id.toString()));
          }
          success({ title: 'Booking Confirmed!', description: 'Check your email for details.' });
        }}
      />
    </div>
  );
};

export default EnhancedDashboardPage;
