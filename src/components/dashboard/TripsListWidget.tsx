import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Star, ArrowRight, Calendar, Heart, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { getDashboardSummary } from '../../services/api';
import { useAdventureStore } from '../../store/adventureStore';
import { collection, getDocs } from 'firebase/firestore';
import { db, waitForFirestore, getDbOrThrow } from '../../firebase';

interface Trip {
  id: number;
  title: string;
  destination: string;
  duration: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  groupSize: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
}

interface UserBooking {
  id: number;
  destination: string;
  trip?: number;
  status: string;
  amount: number;
  date: string;
  created_at?: string;
  trip_name?: string;
}

interface UserTrip {
  id: number;
  name: string;
  location: string;
  price: number;
  images?: string[];
  duration?: string;
  difficulty?: string;
}

interface FirestoreTrip {
  id: string;
  name: string;
  location: string;
  duration?: string;
  difficulty?: string;
  price?: number;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  category?: string;
  tags?: string[];
  description?: string;
  highlights?: string[];
}

const fallbackTrips: Trip[] = [
  {
    id: 1,
    title: "Goa Beach Paradise",
    destination: "Goa",
    duration: "3 Days 2 Nights",
    price: 8999,
    rating: 4.8,
    image: "/api/placeholder/300/200",
    category: "Beach",
    groupSize: "2-8 people",
    difficulty: "Easy"
  },
  {
    id: 2,
    title: "Himalayan Adventure Trek",
    destination: "Himachal Pradesh",
    duration: "5 Days 4 Nights",
    price: 15999,
    rating: 4.9,
    image: "/api/placeholder/300/200",
    category: "Adventure",
    groupSize: "4-12 people",
    difficulty: "Challenging"
  },
  {
    id: 3,
    title: "Kerala Backwaters Cruise",
    destination: "Kerala",
    duration: "4 Days 3 Nights",
    price: 12499,
    rating: 4.7,
    image: "/api/placeholder/300/200",
    category: "Nature",
    groupSize: "2-6 people",
    difficulty: "Easy"
  },
  {
    id: 4,
    title: "Rajasthan Cultural Tour",
    destination: "Rajasthan",
    duration: "6 Days 5 Nights",
    price: 18999,
    rating: 4.6,
    image: "/api/placeholder/300/200",
    category: "Culture",
    groupSize: "4-15 people",
    difficulty: "Moderate"
  }
];

interface TripsListWidgetProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export function TripsListWidget({ limit = 4, showHeader = true, className = "" }: TripsListWidgetProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [allTrips, setAllTrips] = useState<FirestoreTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistedTrips, setWishlistedTrips] = useState<Set<number>>(new Set());
  const [showUserTrips, setShowUserTrips] = useState(true);
  const { user } = useAdventureStore();

  useEffect(() => {
    fetchUserData();
  }, [limit, user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      if (user?.name) {
        // Fetch user's dashboard data including bookings
        try {
          const dashboardData = await getDashboardSummary();
          const bookings = dashboardData?.recentActivity?.bookings || [];
          setUserBookings(bookings);
          
          // Fetch all available trips from Firestore instead of Django API
          const firestoreTrips = await fetchTripsFromFirestore();
          setAllTrips(firestoreTrips);
          
          // If user has bookings, show their trips; otherwise show featured trips
          if (bookings.length > 0) {
            const userTripsData = await createUserTripsFromBookings(bookings, firestoreTrips);
            setTrips(userTripsData.slice(0, limit));
            setShowUserTrips(true);
          } else {
            // Show actual trips from Firestore for new users instead of fallback
            const featuredTrips = convertFirestoreTripsToTripFormat(firestoreTrips.slice(0, limit));
            setTrips(featuredTrips);
            setShowUserTrips(false);
          }
        } catch (error) {
          console.log('Dashboard API not available, showing Firestore trips:', error);
          // Fallback to showing Firestore trips directly
          const firestoreTrips = await fetchTripsFromFirestore();
          const featuredTrips = convertFirestoreTripsToTripFormat(firestoreTrips.slice(0, limit));
          setTrips(featuredTrips);
          setShowUserTrips(false);
        }
      } else {
        // User not logged in, show trips from Firestore
        const firestoreTrips = await fetchTripsFromFirestore();
        const featuredTrips = convertFirestoreTripsToTripFormat(firestoreTrips.slice(0, limit));
        setTrips(featuredTrips);
        setShowUserTrips(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Last resort: try to fetch from Firestore
      try {
        const firestoreTrips = await fetchTripsFromFirestore();
        const featuredTrips = convertFirestoreTripsToTripFormat(firestoreTrips.slice(0, limit));
        setTrips(featuredTrips);
      } catch (firestoreError) {
        console.error('Error fetching from Firestore:', firestoreError);
        setTrips(fallbackTrips.slice(0, limit));
      }
      setShowUserTrips(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripsFromFirestore = async (): Promise<FirestoreTrip[]> => {
    try {
      let activeDb = db;
      if (!activeDb) {
        try {
          activeDb = await waitForFirestore(3000);
        } catch {
          try {
            activeDb = getDbOrThrow();
          } catch (err) {
            console.warn('Firestore unavailable after wait:', err);
            return [];
          }
        }
      }
      
      const snap = await getDocs(collection(activeDb, 'trips'));
      const trips: FirestoreTrip[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<FirestoreTrip, 'id'>)
      }));
      
      console.log(`Fetched ${trips.length} trips from Firestore:`, trips.map(t => t.name));
      return trips;
    } catch (error) {
      console.error('Error fetching trips from Firestore:', error);
      return [];
    }
  };

  const convertFirestoreTripsToTripFormat = (firestoreTrips: FirestoreTrip[]): Trip[] => {
    return firestoreTrips.map((trip, index) => ({
      id: parseInt(trip.id) || index + 1,
      title: trip.name,
      destination: trip.location || 'Adventure Destination',
      duration: trip.duration || '3 Days 2 Nights',
      price: trip.price || 5999,
      rating: trip.rating || 4.5,
      image: (trip.images && trip.images[0]) || "/api/placeholder/300/200",
      category: trip.category || getCategory(trip),
      groupSize: "2-8 people",
      difficulty: normalizeDifficulty(trip.difficulty)
    }));
  };

  const getCategory = (trip: FirestoreTrip): string => {
    if (trip.category) return trip.category;
    const tags = (trip.tags || []).map(s => s.toLowerCase());
    const name = trip.name.toLowerCase();
    if (tags.includes('waterfalls') || tags.includes('waterfall') || name.includes('falls') || name.includes('waterfall')) return 'Waterfall';
    if (tags.includes('fort') || name.includes('fort')) return 'Heritage';
    if (tags.includes('beach') || name.includes('beach')) return 'Beach';
    if (tags.includes('mountain') || tags.includes('trek') || name.includes('trek') || name.includes('mountain')) return 'Adventure';
    return 'Adventure';
  };

  const normalizeDifficulty = (difficulty?: string): 'Easy' | 'Moderate' | 'Challenging' => {
    if (!difficulty) return 'Moderate';
    const diff = difficulty.toLowerCase();
    if (diff.includes('easy') || diff.includes('beginner')) return 'Easy';
    if (diff.includes('hard') || diff.includes('difficult') || diff.includes('challenging') || diff.includes('expert')) return 'Challenging';
    return 'Moderate';
  };

  const createUserTripsFromBookings = async (bookings: UserBooking[], allTrips: FirestoreTrip[]): Promise<Trip[]> => {
    return bookings.map((booking, index) => {
      // Try to find the actual trip data from Firestore
      const tripData = allTrips.find(trip => trip.id === booking.trip?.toString());
      
      return {
        id: booking.trip || booking.id,
        title: booking.trip_name || tripData?.name || booking.destination,
        destination: tripData?.location || booking.destination,
        duration: tripData?.duration || "3 Days 2 Nights",
        price: booking.amount || tripData?.price || 0,
        rating: tripData?.rating || (4.5 + (index * 0.1)), // Dynamic rating based on user data
        image: (tripData?.images && tripData.images[0]) || "/api/placeholder/300/200",
        category: getStatusBadge(booking.status),
        groupSize: "2-8 people",
        difficulty: normalizeDifficulty(tripData?.difficulty),
        bookingStatus: booking.status,
        bookingDate: booking.date
      } as Trip & { bookingStatus?: string; bookingDate?: string };
    });
  };

  const getStatusBadge = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return 'Booked';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const toggleWishlist = (tripId: number) => {
    setWishlistedTrips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tripId)) {
        newSet.delete(tripId);
      } else {
        newSet.add(tripId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl p-6 ${className}`}>
        {showHeader && (
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-48 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl p-6 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {showUserTrips ? 'Your Adventures' : 'Featured Trips'}
              </h3>
              <p className="text-sm text-gray-600">
                {showUserTrips 
                  ? `Your ${userBookings.length} booked trip${userBookings.length !== 1 ? 's' : ''}`
                  : 'Discover amazing destinations'
                }
              </p>
            </div>
          </div>
          <Link to={showUserTrips ? "/bookings" : "/destinations"}>
            <Button size="sm" variant="secondary">
              {showUserTrips ? 'View All Bookings' : 'View All'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trips.map((trip, index) => {
          const tripWithStatus = trip as Trip & { bookingStatus?: string; bookingDate?: string };
          return (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                
                {/* Status Badge for User Trips */}
                {showUserTrips && tripWithStatus.bookingStatus && (
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(tripWithStatus.bookingStatus)
                    }`}>
                      {getStatusBadge(tripWithStatus.bookingStatus)}
                    </span>
                  </div>
                )}
                
                {/* Category/Difficulty Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                    {showUserTrips ? trip.difficulty : trip.category}
                  </span>
                </div>
                
                {/* Wishlist Heart */}
                <div className="absolute bottom-3 right-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const newWishlisted = new Set(wishlistedTrips);
                      if (wishlistedTrips.has(trip.id)) {
                        newWishlisted.delete(trip.id);
                      } else {
                        newWishlisted.add(trip.id);
                      }
                      setWishlistedTrips(newWishlisted);
                    }}
                    className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors ${
                        wishlistedTrips.has(trip.id) 
                          ? 'text-red-500 fill-current' 
                          : 'text-gray-600'
                      }`} 
                    />
                  </motion.button>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-5">
                <h4 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {trip.title}
                </h4>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{trip.destination}</span>
                </div>
                
                {/* Booking Date for User Trips */}
                {showUserTrips && tripWithStatus.bookingDate && (
                  <div className="flex items-center text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-xs">Booked on {new Date(tripWithStatus.bookingDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {/* Trip Details */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{trip.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{trip.groupSize}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400" />
                    <span>{trip.rating}</span>
                  </div>
                </div>
                
                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-gray-900">₹{trip.price.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 ml-1">{showUserTrips ? 'total' : 'per person'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {showUserTrips && tripWithStatus.bookingStatus === 'pending' && (
                      <Button size="sm" variant="primary" className="text-xs">
                        Complete Payment
                      </Button>
                    )}
                    <Link to={`/trip/${trip.id}`}>
                      <Button size="sm" variant={showUserTrips ? "secondary" : "primary"}>
                        {showUserTrips ? 'View Details' : 'Book Now'}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Empty State for New Users */}
      {!loading && trips.length === 0 && showUserTrips && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Adventures Yet</h3>
          <p className="text-gray-500 mb-4">Start your journey by booking your first adventure!</p>
          <Link to="/destinations">
            <Button variant="primary">
              Explore Destinations
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default TripsListWidget;
