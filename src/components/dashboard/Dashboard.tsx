
import React from 'react';
import { RewardPoints } from './RewardPoints.tsx';
import { StoriesWidget } from './StoriesWidgetNew.tsx';
import { RecommendationsWidget } from './RecommendationsWidgetNew.tsx';
import { TripHistoryWidget } from './TripHistoryWidget.tsx';
import { ProfileWidget } from './ProfileWidget.tsx';
import { TripsListWidget } from './TripsListWidget.tsx';
import { DashboardNavigation } from './DashboardNavigation.tsx';
import { motion } from 'framer-motion';
import { useAdventureStore } from '../../store/adventureStore';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  ArrowRight, 
  Sparkles, 
  TrendingUp,
  MapPin,
  Calendar,
  Zap,
  Award,
  Compass,
  Mountain,
  Camera,
  Users,
  Heart,
  Globe,
  Trophy,
  Target
} from 'lucide-react';

export function Dashboard() {
  const { user } = useAdventureStore();
  const userPoints = user?.adventurePoints || 1200;
  const completedTrips = user?.completedTrips || 0;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Dashboard Navigation */}
      <DashboardNavigation />
      
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
        />
        
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 rounded-full blur-3xl"
        />
        
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl"
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
            className={`absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm`}
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
            }}
          />
        ))}
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12"
      >
        {/* Hero Section */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl mb-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,.12),transparent_50%),radial-gradient(circle_at_80%_0,rgba(59,130,246,.12),transparent_50%)]" />
          
          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl text-white shadow-lg"
                  >
                    <Globe className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                      Welcome back, {user?.name || 'Explorer'}! 
                    </h1>
                    <p className="text-xl text-gray-600 mt-2">
                      Your adventure continues with endless possibilities ✨
                    </p>
                  </div>
                </div>
                
                {/* Enhanced Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-200 shadow-sm"
                  >
                    <div className="p-2 bg-emerald-500 rounded-xl">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-700">{completedTrips}</p>
                      <p className="text-sm text-emerald-600">Adventures Completed</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-100 p-4 rounded-2xl border border-amber-200 shadow-sm"
                  >
                    <div className="p-2 bg-amber-500 rounded-xl">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-700">{userPoints}</p>
                      <p className="text-sm text-amber-600">Adventure Points</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-100 p-4 rounded-2xl border border-purple-200 shadow-sm"
                  >
                    <div className="p-2 bg-purple-500 rounded-xl">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">5</p>
                      <p className="text-sm text-purple-600">Dream Destinations</p>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <Link to="/dashboard/ai">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white shadow-xl px-6 py-3 text-lg">
                      <Brain className="w-6 h-6 mr-3" />
                      Unlock AI Magic
                      <Sparkles className="w-5 h-5 ml-3 animate-pulse" />
                    </Button>
                  </motion.div>
                </Link>
                
                <Link to="/destinations">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="secondary" className="border-2 border-gray-200 hover:border-gray-300 px-6 py-3 text-lg">
                      <Compass className="w-5 h-5 mr-3" />
                      Explore Destinations
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Reward Points Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative p-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
                  >
                    <Award className="w-8 h-8" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold">Adventure Points</h3>
                    <p className="text-blue-100">Your journey rewards</p>
                  </div>
                </div>
                <RewardPoints points={userPoints} />
              </div>
            </motion.div>

            {/* Featured Trips Section */}
            <motion.div
              variants={itemVariants}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl text-white shadow-lg">
                    <Mountain className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Your Adventures</h2>
                    <p className="text-gray-600">Your booked trips and experiences</p>
                  </div>
                </div>
                <Link to="/destinations">
                  <Button variant="secondary" size="sm">
                    <Target className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
              <TripsListWidget limit={6} />
            </motion.div>

            {/* Stories Widget */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl text-white shadow-lg">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Travel Stories</h3>
                    <p className="text-gray-600">Adventures shared by our community</p>
                  </div>
                </div>
                <StoriesWidget />
              </div>
            </motion.div>

            {/* Recommendations Widget */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl text-white shadow-lg">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Smart Recommendations</h3>
                      <p className="text-gray-600">Personalized just for your taste</p>
                    </div>
                  </div>
                  <Link to="/dashboard/ai">
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      <Zap className="w-4 h-4 mr-2" />
                      AI Boost
                    </Button>
                  </Link>
                </div>
                <RecommendationsWidget />
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Profile Widget */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your Profile</h3>
                </div>
                <ProfileWidget />
              </div>
            </motion.div>

            {/* Trip History Widget */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Adventures</h3>
                </div>
                <TripHistoryWidget />
              </div>
            </motion.div>

            {/* AI Dashboard Promotion */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="relative p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatDelay: 3 
                    }}
                    className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
                  >
                    <Brain className="w-8 h-8" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold">AI Travel Magic</h3>
                    <p className="text-purple-100">Unlock the future of travel</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm">Smart Planning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm">AI Assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm">Budget Optimizer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm">Analytics</span>
                  </div>
                </div>
                
                <Link to="/dashboard/ai">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="w-full bg-white text-purple-600 hover:bg-gray-50 shadow-lg">
                      Experience AI Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
