import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FaSignInAlt, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAdventureStore } from '../../store/adventureStore';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setUser } = useAdventureStore();
  const { login, error: authError } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);

      // Set user in adventure store for compatibility
      // The AuthContext handles the actual authentication
      setUser({
        id: 0, // Will be updated by context
        name: email.split('@')[0],
        email: email,
        avatar: '',
        adventurePoints: 0,
        completedTrips: 0,
        badges: [],
        preferences: {
          favoriteCategories: [],
          difficulty: [],
          budget: [0, 0],
          notifications: true
        },
        isAdmin: true // Admin login
      });

      // Navigate to admin dashboard
      navigate('/admin/portal', { replace: true });
    } catch (err: unknown) {
      // Error is handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black overflow-hidden pt-14 md:pt-0">
      {/* Animated background blobs */}
      <motion.div
        className="absolute w-96 h-96 bg-blue-500 rounded-full opacity-30 blur-3xl top-0 left-0"
        animate={{ y: [0, 40, 0], x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-80 h-80 bg-pink-500 rounded-full opacity-20 blur-2xl bottom-0 right-0"
        animate={{ y: [0, -30, 0], x: [0, -40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md px-3 sm:px-4 md:px-6 lg:px-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 font-oswald tracking-wide">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="text-white/80 text-center mb-4 text-xs sm:text-sm">
            Enter your admin credentials to access the dashboard
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/20 text-white px-3 py-2 rounded-lg font-semibold">
              <Mail className="w-4 h-4 inline mr-1" />
            </div>
            <input
              type="email"
              className="flex-1 rounded-lg px-4 py-3 sm:py-3 bg-white/90 dark:bg-[var(--surface)]/70 text-[var(--text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 border border-transparent dark:border-[var(--border)] font-medium min-h-[44px]"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/20 text-white px-3 py-2 rounded-lg font-semibold">
              <Lock className="w-4 h-4 inline mr-1" />
            </div>
            <div className="flex-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg px-4 py-3 sm:py-3 bg-white/90 dark:bg-[var(--surface)]/70 text-[var(--text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 border border-transparent dark:border-[var(--border)] font-medium min-h-[44px]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 sm:py-4 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 min-h-[44px] text-base sm:text-lg"
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            <FaSignInAlt size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        {error || authError && (
          <motion.div
            className="mt-4 text-red-400 font-semibold text-center bg-red-500/20 p-3 rounded-lg text-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ⚠️ {error || authError}
          </motion.div>
        )}

        <div className="mt-6 text-center">
          <p className="text-white/60 text-xs sm:text-sm">
            For user sign-in with WhatsApp OTP,{' '}
            <button
              onClick={() => navigate('/signin')}
              className="text-green-400 hover:text-green-300 underline font-semibold"
            >
              click here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
