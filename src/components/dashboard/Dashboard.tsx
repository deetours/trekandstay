
import { RewardPoints } from './RewardPoints.tsx';
import { StoriesWidget } from './StoriesWidget.tsx';
import { RecommendationsWidget } from './RecommendationsWidget.tsx';
import { TripHistoryWidget } from './TripHistoryWidget.tsx';
import { ProfileWidget } from './ProfileWidget.tsx';
import { motion } from 'framer-motion';

export function Dashboard() {
  const userPoints = 1200;
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your travel overview.</p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reward Points */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white"
            >
              <RewardPoints points={userPoints} />
            </motion.div>

            {/* Stories */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StoriesWidget />
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RecommendationsWidget />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ProfileWidget />
            </motion.div>

            {/* Trip History */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TripHistoryWidget />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
