import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAdventureStore } from '../store/adventureStore';
import { getBookings, getWishlist, removeWishlist, getRecommendations, getTripHistory } from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CalendarDays, Heart, LogOut, Trophy, MapPin, Clock, CheckCircle, AlertCircle, XCircle, ArrowRight, CreditCard, Compass, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LocalScene } from '../components/3d/LocalScene';
import { useToast } from '../components/ui/useToast';
import BookingFlow from '../components/dashboard/BookingFlow';
import type { Booking, WishlistItem, RecommendationItem, TripHistoryItem } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAdventureStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [history, setHistory] = useState<TripHistoryItem[]>([]);
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [loading, setLoading] = useState({ bookings: false, wishlist: false, recos: false, history: false });
  const [errors, setErrors] = useState<{ [k: string]: string | null }>({});
  const focusRefetchAttached = useRef(false);
  const { success, error: toastError } = useToast();
  
  // Booking flow state
  const [isBookingFlowOpen, setIsBookingFlowOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | undefined>(undefined);

  // Check if this is a first-time user
  const checkFirstTimeUser = useCallback(() => {
    const tourDone = localStorage.getItem('dash_tour_done');
    const lastVisit = localStorage.getItem('last_dashboard_visit');
    const userCreatedRecently = user?.id && !lastVisit;
    
    if (!tourDone || userCreatedRecently) {
      setIsFirstTime(true);
      setShowWelcomeModal(true);
      return true;
    }
    return false;
  }, [user]);

  const startWelcomeTour = useCallback(() => {
    setShowWelcomeModal(false);
    setRunTour(true);
  }, []);

  const skipWelcome = useCallback(() => {
    setShowWelcomeModal(false);
    localStorage.setItem('dash_tour_done', '1');
    localStorage.setItem('last_dashboard_visit', new Date().toISOString());
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
    try { setHistory(await getTripHistory()); setErrors(e => ({ ...e, history: null })); }
    catch (e) { 
      const message = e instanceof Error ? e.message : 'Failed to load history';
      setErrors(err => ({ ...err, history: message }));
    }
    finally { setLoading(l => ({ ...l, history: false })); }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true, state: { from: '/dashboard' } });
      return;
    }
    
    // Check if first-time user and set up welcome experience
    const isFirstTime = checkFirstTimeUser();
    
    // Fetch dashboard data
    fetchBookingsSafe(Number(user.id));
    fetchWishlistSafe();
    fetchRecosSafe();
    fetchHistorySafe();
    
    // Set up focus refetch
    if (!focusRefetchAttached.current) {
      const onFocus = () => {
        fetchBookingsSafe(Number(user.id));
        fetchWishlistSafe();
      };
      window.addEventListener('focus', onFocus);
      focusRefetchAttached.current = true;
    }
    
    // Update last visit timestamp for returning users
    if (!isFirstTime) {
      localStorage.setItem('last_dashboard_visit', new Date().toISOString());
    }
  }, [isAuthenticated, user, navigate, fetchBookingsSafe, fetchWishlistSafe, fetchRecosSafe, fetchHistorySafe, checkFirstTimeUser]);

  const tourSteps = useMemo<Step[]>(() => [
    { 
      target: '#dash-hero', 
      content: isFirstTime 
        ? '🎉 Welcome to your Adventure Dashboard! This is your personal mission control for all your travel dreams and bookings.'
        : 'Welcome back to your Dashboard! Here you can see your overview and quick links.',
      placement: 'bottom'
    },
    { 
      target: '#how-it-works', 
      content: isFirstTime 
        ? '📋 Here\'s how simple it is: 1️⃣ Explore curated trips, 2️⃣ Book your adventure, 3️⃣ Pay securely and get WhatsApp confirmation!'
        : 'Booking in 3 simple steps. Explore, Book, Pay & confirm on WhatsApp.',
      placement: 'bottom'
    },
    { 
      target: '#dash-stats', 
      content: isFirstTime 
        ? '📊 Your adventure stats! Track completed trips, earn adventure points, and grow your travel wishlist. Start your journey!'
        : 'Track your completed trips, points and wishlist here.',
      placement: 'bottom'
    },
    { 
      target: '#dash-bookings', 
      content: isFirstTime 
        ? '🎫 Your bookings hub! Once you book a trip, manage payments and track status here. Ready for your first adventure?'
        : 'Your active and past bookings appear here. Click Pay now to complete payment.',
      placement: 'top'
    },
    { 
      target: '#dash-recommendations', 
      content: isFirstTime 
        ? '🎯 AI Recommendations! Smart suggestions based on your preferences. Click "Book Now" to instantly start booking!'
        : 'AI-powered trip recommendations with instant booking. Click "Book Now" for quick checkout.',
      placement: 'top'
    },
    { 
      target: '#dash-wishlist', 
      content: isFirstTime 
        ? '❤️ Your Travel Wishlist! Save trips you love here. Use "Book" buttons for instant booking from your wishlist!'
        : 'Your Travel List with instant booking. Click "Book" to start the booking process.',
      placement: 'top'
    },
    ...(isFirstTime ? [{
      target: 'body',
      content: '🚀 You\'re all set! Ready to explore incredible destinations? Click "Explore Trips" to start your adventure!',
      placement: 'center' as const
    }] : [
      { target: '#dash-payment', content: 'When a booking is pending, hit Pay now to open the UPI payment page.' }
    ])
  ], [isFirstTime]);

  if (!user) return null;

  const onTourCallback = (data: CallBackProps) => {
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(data.status)) { 
      setRunTour(false); 
      localStorage.setItem('dash_tour_done', '1');
      localStorage.setItem('last_dashboard_visit', new Date().toISOString());
      
      // Show completion message for first-time users
      if (isFirstTime) {
        success({ 
          title: '🎉 Dashboard mastered!', 
          description: 'You can now instantly book trips from recommendations, wishlist, or use "Quick Book" button!' 
        });
      }
    }
  };

  // Welcome Modal Component
  const WelcomeModal = () => {
    if (!showWelcomeModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏔️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Trek & Stay!
            </h2>
            <p className="text-gray-600 mb-6">
              Hi {user?.name || 'Adventurer'}! 👋 Ready to discover your next great adventure? 
              Let's take a quick tour of your new dashboard.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1" 
                onClick={skipWelcome}
              >
                Skip Tour
              </Button>
              <Button 
                className="flex-1" 
                onClick={startWelcomeTour}
              >
                Start Tour ✨
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
    try { await removeWishlist(id); success({ title: 'Removed', description: 'Trip removed from Travel List.' }); }
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

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-stone-50 to-blue-50" aria-live="polite">
      <LocalScene variant="dust" size={200} />
      <WelcomeModal />
      <Joyride 
        steps={tourSteps} 
        run={runTour} 
        continuous 
        showProgress 
        showSkipButton 
        callback={onTourCallback} 
        styles={{ 
          options: { 
            primaryColor: '#2563eb', 
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
        <div id="dash-hero" className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/60 bg-white/70 backdrop-blur shadow-xl mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,.08),transparent_40%),radial-gradient(circle_at_80%_0,rgba(59,130,246,.08),transparent_40%)]" />
          <div className="relative px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-oswald font-bold tracking-tight text-forest-green">
                {isFirstTime ? `Welcome to your adventure, ${user?.name || 'Explorer'}! 🏔️` : `Welcome back, ${user?.name || 'Explorer'}!`}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-mountain-blue max-w-2xl">
                {isFirstTime 
                  ? "Your journey begins here! This dashboard is your command center for discovering, booking, and managing incredible adventures. Ready to explore?"
                  : "Track your adventures, manage bookings, and pick your next trail. We saved your wishlist and bookings here."
                }
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/destinations" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                  {isFirstTime ? 'Start Exploring' : 'Explore Trips'} <ArrowRight className="w-4 h-4" />
                </Link>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => openBookingFlow()}
                  className="inline-flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> Quick Book
                </Button>
                <Link to="/stories" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">Read Stories <ArrowRight className="w-4 h-4" /></Link>
                <Link to="/dashboard/ai" className="inline-flex items-center gap-2 text-purple-600 hover:underline text-sm font-medium">🤖 AI Dashboard <ArrowRight className="w-4 h-4" /></Link>
                <Button variant="secondary" size="sm" onClick={() => setRunTour(true)}>
                  {isFirstTime ? 'Take the tour' : 'Take a quick tour'}
                </Button>
              </div>
            </div>
            <div className="hidden sm:block self-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-100 to-blue-100 border border-white/70 shadow-inner flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-semibold text-forest-green">{(user?.name || 'U')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        <div id="how-it-works" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <Card className="p-4 sm:p-5 bg-white/80 backdrop-blur border-white/70">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0"><Compass className="w-4 h-4 sm:w-5 sm:h-5" /></div>
              <div className="min-w-0">
                <div className="font-semibold text-sm sm:text-base">Explore trips</div>
                <div className="text-xs text-gray-500">Find curated adventures for every level.</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-5 bg-white/80 backdrop-blur border-white/70">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0"><CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" /></div>
              <div className="min-w-0">
                <div className="font-semibold text-sm sm:text-base">Start booking</div>
                <div className="text-xs text-gray-500">Save a lead and reserve your spot.</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-5 bg-white/80 backdrop-blur border-white/70">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0"><CreditCard className="w-4 h-4 sm:w-5 sm:h-5" /></div>
              <div className="min-w-0">
                <div className="font-semibold text-sm sm:text-base">Pay & confirm</div>
                <div className="text-xs text-gray-500">Pay via UPI and get WhatsApp confirmation <MessageCircle className="inline w-3.5 h-3.5" />.</div>
              </div>
            </div>
          </Card>
        </div>

        <div id="dash-stats" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <Card className="p-4 sm:p-5 bg-white/80 backdrop-blur border-white/70 hover:shadow-xl transition-shadow">
            <div className="text-xs uppercase tracking-wide text-gray-500">Completed Trips</div>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-forest-green">{user.completedTrips}</div>
          </Card>
          <Card className="p-4 sm:p-5 bg-white/80 backdrop-blur border-white/70 hover:shadow-xl transition-shadow">
            <div className="text-xs uppercase tracking-wide text-gray-500">Adventure Points</div>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-forest-green flex items-center gap-2"><Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" /> {user.adventurePoints}</div>
          </Card>
          <Card className="p-4 sm:p-5 bg-white/80 backdrop-blur border-white/70 hover:shadow-xl transition-shadow">
            <div className="text-xs uppercase tracking-wide text-gray-500">Travel List</div>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-forest-green">{wishlist.length}</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div id="dash-bookings">
              <Card className="p-4 sm:p-6 bg-white/85 backdrop-blur border-white/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-semibold">Your Bookings</h2>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/destinations')}>Book more</Button>
                </div>
                {bookings.length === 0 && !loading.bookings && !errors.bookings && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
                      <CalendarDays className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isFirstTime ? 'Ready for your first adventure?' : 'No bookings yet'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {isFirstTime 
                        ? 'Discover incredible destinations and book your next unforgettable journey!'
                        : 'Start planning your next getaway.'
                      }
                    </p>
                    <Link to="/destinations" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
                      {isFirstTime ? '🏔️ Explore Adventures' : 'Explore trips'} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
                {loading.bookings && <div className="text-sm text-gray-400">Loading bookings...</div>}
                {errors.bookings && <div className="text-sm text-rose-600">{errors.bookings}</div>}
                {bookings.length > 0 && !loading.bookings && (
                  <ul className="divide-y" aria-label="Bookings list">
                    {bookings.map((b) => (
                      <li key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id={b.status === 'pending' ? 'dash-payment' : undefined}>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-2 sm:mb-0">
                            {statusBadge(b.status)}
                            <div className="truncate font-medium">{b.destination}</div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" /> Trip</span>
                            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> {b.date}</span>
                            <span>₹{b.amount}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          {b.status === 'pending' && (
                            <Button size="sm" onClick={() => navigate(`/payment?booking=${b.id}&amount=${b.amount}`)} className="inline-flex items-center gap-2"><CreditCard className="w-4 h-4" /> Pay now</Button>
                          )}
                          <Link to={`/trip/${b.trip || ''}`} className="text-primary underline text-sm">View</Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div id="dash-recos" className="p-0">
              <Card className="p-4 sm:p-6 bg-white/85 backdrop-blur border-white/70">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg sm:text-xl font-semibold">Next Adventures</h2>
                </div>
                {recommendations.length === 0 && !loading.recos && !errors.recos && (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
                      <Compass className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {isFirstTime ? 'Smart recommendations coming!' : 'No recommendations yet'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isFirstTime 
                        ? 'Once you explore some trips, we\'ll suggest perfect adventures for you!'
                        : 'Start exploring trips to get personalized suggestions.'
                      }
                    </p>
                  </div>
                )}
                {loading.recos && <div className="text-sm text-gray-400">Loading recommendations...</div>}
                {errors.recos && <div className="text-sm text-rose-600">{errors.recos}</div>}
                {recommendations.length > 0 && !loading.recos && (
                  <ul className="grid sm:grid-cols-2 gap-4">
                    {recommendations.map(r => (
                      <li key={r.id} className="group rounded-xl border bg-white/70 p-4 flex flex-col gap-3 hover:shadow-md transition">
                        <div className="font-medium text-sm truncate">{r.destination}</div>
                        <div className="text-xs text-gray-500">{r.reason}</div>
                        <div className="mt-auto flex items-center gap-2">
                          <Link to={`/trip/${r.trip || ''}`} className="text-primary text-xs inline-flex items-center gap-1 flex-1">
                            View Details <ArrowRight className="w-3 h-3" />
                          </Link>
                          <Button 
                            size="sm" 
                            variant="primary"
                            className="text-xs px-3 py-1.5"
                            onClick={() => handleBookTrip(typeof r.trip === 'string' ? parseInt(r.trip) : r.trip)}
                          >
                            Book Now
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div id="dash-history" className="p-0">
              <Card className="p-4 sm:p-6 bg-white/85 backdrop-blur border-white/70">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg sm:text-xl font-semibold">Trip History</h2>
                </div>
                {history.length === 0 && !loading.history && !errors.history && (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {isFirstTime ? 'Your adventure story starts here!' : 'No past trips recorded'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isFirstTime 
                        ? 'Complete your first booking to start building your adventure history.'
                        : 'Your completed trips will appear here.'
                      }
                    </p>
                  </div>
                )}
                {loading.history && <div className="text-sm text-gray-400">Loading history...</div>}
                {errors.history && <div className="text-sm text-rose-600">{errors.history}</div>}
                {history.length > 0 && !loading.history && (
                  <ul className="divide-y">
                    {history.map(h => (
                      <li key={h.id} className="py-3 text-sm flex items-center justify-between">
                        <div>
                          <div className="font-medium">{h.destination}</div>
                          <div className="text-xs text-gray-500">{h.date}</div>
                        </div>
                        {h.feedback && <span className="text-xs text-emerald-600">Reviewed</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>

          <div className="xl:col-span-1">
            <div id="dash-wishlist">
              <Card className="p-4 sm:p-6 bg-white/85 backdrop-blur border-white/70">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h2 className="text-lg sm:text-xl font-semibold">Travel List</h2>
                </div>
                {wishlist.length === 0 && !loading.wishlist && !errors.wishlist && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-rose-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isFirstTime ? 'Start building your wishlist!' : 'Your Travel List is empty'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {isFirstTime 
                        ? 'Found a trip you love? Save it to your wishlist for easy access later!'
                        : 'Save trips you want to explore later.'
                      }
                    </p>
                    <Link to="/destinations" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                      {isFirstTime ? '💝 Browse Trips' : 'Find trips to save'} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
                {loading.wishlist && <div className="text-sm text-gray-400">Loading wishlist...</div>}
                {errors.wishlist && <div className="text-sm text-rose-600">{errors.wishlist}</div>}
                {wishlist.length > 0 && !loading.wishlist && (
                  <ul className="space-y-3" aria-label="Wishlist items">
                    {wishlist.map((w) => (
                      <li key={w.id} className="rounded-xl border bg-gradient-to-br from-white to-stone-50 p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {w.trip_image && <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={w.trip_image} alt={w.trip_name} className="w-full h-full object-cover" />
                        </div>}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{w.trip_name || `Trip #${w.trip}`}</div>
                          <div className="text-xs text-gray-500 truncate">{w.notes || 'No notes'}</div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                            <span>Wishlist</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 self-end sm:self-center">
                          <Link to={`/trip/${w.trip}`} className="text-primary underline text-[11px] whitespace-nowrap">View</Link>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="text-xs px-2 py-1"
                            onClick={() => handleBookTrip(typeof w.trip === 'string' ? parseInt(w.trip) : w.trip)}
                          >
                            Book
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => removeWishlistOptimistic(w.id)} className="text-xs">Remove</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="mt-6">
              <Button variant="secondary" className="w-full" onClick={() => { logout(); localStorage.removeItem('auth_token'); navigate('/'); }}>
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </Button>
            </div>
          </div>
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

export default DashboardPage;
