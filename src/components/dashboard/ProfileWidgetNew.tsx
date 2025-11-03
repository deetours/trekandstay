import { User, Trophy, Calendar } from 'lucide-react';
import { useAdventureStore } from '../../store/adventureStore';
import { fetchBookings } from '../../services/api';
import { useState, useEffect } from 'react';

export function ProfileWidget() {
  const { user } = useAdventureStore();
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) return;
      try {
        const bookings = await fetchBookings().catch(() => []);
        setBookingCount(bookings.length);
      } catch (err) {
        console.error('Error loading bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [user]);

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Please log in to view profile</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate user level based on bookings
  const getLevel = (count: number) => {
    if (count === 0) return 'New Explorer';
    if (count <= 2) return 'Adventurer';
    if (count <= 5) return 'Explorer';
    if (count <= 10) return 'Master Traveler';
    return 'Legend';
  };

  const level = getLevel(bookingCount);
  const rewardPoints = bookingCount * 150; // 150 points per trip

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-gray-800">Profile</h3>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 text-lg">
            {user.name || 'Adventure Explorer'}
          </h4>
          <p className="text-gray-600">{level}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Trips</span>
          </div>
          <div className="text-xl font-bold text-blue-600">{bookingCount}</div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-gray-600">Points</span>
          </div>
          <div className="text-xl font-bold text-yellow-600">{rewardPoints}</div>
        </div>
      </div>

      {/* Contact Info if available */}
      {user.email && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600 mb-1">Email</div>
          <div className="text-sm font-medium text-gray-800">{user.email}</div>
        </div>
      )}

      {/* Achievement Message */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
        <div className="text-sm text-gray-700">
          {bookingCount === 0 && "🌟 Book your first adventure to start earning rewards!"}
          {bookingCount === 1 && "🎉 Great start! Your adventure journey has begun!"}
          {bookingCount >= 2 && bookingCount < 5 && "🔥 You're on a roll! Keep exploring!"}
          {bookingCount >= 5 && bookingCount < 10 && "🏆 Impressive! You're becoming a travel pro!"}
          {bookingCount >= 10 && "👑 Legendary traveler! You're an inspiration!"}
        </div>
      </div>
    </div>
  );
}
