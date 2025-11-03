import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  MapPin,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { useAdventureStore } from '../../store/adventureStore';
import { fetchBookings, fetchWishlist } from '../../services/api';

interface TravelAnalytics {
  totalTrips: number;
  totalSpent: number;
  favoriteDestination: string;
  averageTripCost: number;
  wishlistCount: number;
  upcomingTrips: number;
}

interface PersonalInsight {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const TravelAnalyticsWidget: React.FC = () => {
  const { user } = useAdventureStore();
  const [analytics, setAnalytics] = useState<TravelAnalytics | null>(null);
  const [insights, setInsights] = useState<PersonalInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch real data from Django
        const [bookings, wishlist] = await Promise.all([
          fetchBookings().catch(() => []),
          fetchWishlist().catch(() => [])
        ]);

        // Calculate real analytics
        const totalTrips = bookings.length;
        const totalSpent = bookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
        const avgCost = totalTrips > 0 ? totalSpent / totalTrips : 0;
        
        // Find favorite destination (most booked location)
        const destinations: Record<string, number> = {};
        bookings.forEach((b: any) => {
          const dest = b.destination || 'Unknown';
          destinations[dest] = (destinations[dest] || 0) + 1;
        });
        const favoriteDestination = Object.entries(destinations)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Explore Now';

        // Count upcoming trips (future travel dates)
        const upcomingTrips = bookings.filter((b: any) => {
          if (!b.travel_date) return false;
          const travelDate = new Date(b.travel_date);
          return travelDate > new Date();
        }).length;

        setAnalytics({
          totalTrips,
          totalSpent,
          favoriteDestination,
          averageTripCost: avgCost,
          wishlistCount: wishlist.length,
          upcomingTrips
        });

        // Generate insights based on real data
        const newInsights: PersonalInsight[] = [];
        
        if (totalTrips >= 3) {
          newInsights.push({
            id: '1',
            icon: '🏆',
            title: 'Seasoned Traveler',
            description: `You've completed ${totalTrips} adventures! You're becoming an expert explorer.`
          });
        }

        if (totalSpent > 50000) {
          newInsights.push({
            id: '2',
            icon: '💰',
            title: 'Investment in Memories',
            description: `₹${totalSpent.toLocaleString()} invested in unforgettable experiences!`
          });
        }

        if (wishlist.length > 0) {
          newInsights.push({
            id: '3',
            icon: '⭐',
            title: 'Dream Destinations',
            description: `${wishlist.length} trips on your wishlist waiting to be explored!`
          });
        }

        if (favoriteDestination !== 'Explore Now') {
          newInsights.push({
            id: '4',
            icon: '🗺️',
            title: 'Favorite Spot',
            description: `${favoriteDestination} seems to be your go-to destination!`
          });
        }

        setInsights(newInsights);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Your Travel Analytics
          </h3>
          <p className="text-sm text-gray-600 mt-1">Insights from your travel journey</p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-800">
          Real Data
        </Badge>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-3 text-center animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-emerald-600">
                {analytics.totalTrips}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Trips</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                ₹{(analytics.totalSpent / 1000).toFixed(0)}k
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Spent</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-purple-600">
                {analytics.wishlistCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">Wishlist</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-orange-600">
                ₹{(analytics.averageTripCost / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-gray-600 mt-1">Avg Cost/Trip</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm col-span-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MapPin className="w-5 h-5 text-red-500" />
                <div className="text-lg font-bold text-gray-800">
                  {analytics.favoriteDestination}
                </div>
              </div>
              <div className="text-sm text-gray-600">Favorite Destination</div>
            </div>
          </div>

          {/* Personal Insights */}
          {insights.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Personal Insights
              </h4>
              {insights.map((insight) => (
                <motion.div
                  key={insight.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{insight.icon}</div>
                    <div>
                      <h5 className="font-semibold text-gray-800">{insight.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {analytics.totalTrips === 0 && (
            <div className="bg-white rounded-lg p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800 mb-2">Start Your Journey</h4>
              <p className="text-sm text-gray-600">
                Book your first adventure to see personalized analytics and insights!
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default TravelAnalyticsWidget;
