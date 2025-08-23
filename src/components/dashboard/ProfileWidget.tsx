import { useEffect, useState } from 'react';
import { mockApi, UserProfile } from '../../services/mockApi';
import { motion } from 'framer-motion';
import { User, Trophy, Settings } from 'lucide-react';

export function ProfileWidget() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await mockApi.getUserProfile();
        setProfile(data);
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-lg mb-4 text-red-600">Error</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-gray-800">Profile</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-gray-600 hover:text-gray-800"
        >
          <Settings className="w-5 h-5" />
        </motion.button>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 text-lg">Adventure Explorer</h4>
          <p className="text-gray-600">Level 3 Traveler</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold text-gray-800">Reward Points</span>
        </div>
        <div className="text-2xl font-bold text-yellow-600">
          {profile.reward_points.toLocaleString()}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Preferences</h5>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(profile.preferences.preferred_activities) &&
              profile.preferences.preferred_activities.map((activity: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {activity}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
