import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FaPhone, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAdventureStore } from '../../store/adventureStore';
import { AuthContext } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { setUser } = useAdventureStore();
  const { loginWithOTP, sendOTP: contextSendOTP, error: authError, isAdmin } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as +91 XXXXX XXXXX
    if (digits.length <= 10) {
      return digits;
    } else if (digits.length <= 12 && digits.startsWith('91')) {
      return digits.slice(2);
    }
    return digits.slice(0, 10);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      await contextSendOTP(fullPhoneNumber);

      setOtpSent(true);
      setCountdown(300); // 5 minutes

      // Start countdown timer
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      // Error is handled by context
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      await loginWithOTP(fullPhoneNumber, otpCode);

      // Set user in adventure store for compatibility
      // The AuthContext handles the actual authentication
      setUser({
        id: 0, // Will be updated by context
        name: `User ${phoneNumber}`,
        email: `${phoneNumber}@whatsapp.local`,
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
        isAdmin: isAdmin
      });

      // Navigate to appropriate page
      if (isAdmin) {
        navigate('/admin/portal', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      // Error is handled by context
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setOtpCode('');
    await sendOTP();
  };

  const resetForm = () => {
    setOtpSent(false);
    setOtpCode('');
    setCountdown(0);
    setError('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black relative overflow-hidden">
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
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 flex flex-col items-center"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h2 className="text-3xl font-bold text-white mb-6 font-oswald tracking-wide">
          {otpSent ? 'Enter OTP' : 'Sign In with WhatsApp'}
        </h2>

        {!otpSent ? (
          // Phone number input
          <div className="w-full flex flex-col gap-4">
            <div className="text-white/80 text-center mb-4">
              Enter your phone number to receive a verification code via WhatsApp
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-white/20 text-white px-3 py-2 rounded-lg font-semibold">
                +91
              </div>
              <input
                type="tel"
                className="flex-1 rounded-lg px-4 py-2 bg-white/80 dark:bg-[var(--surface)]/70 text-[var(--text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-transparent dark:border-[var(--border)]"
                placeholder="Enter 10-digit phone number"
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={10}
                autoFocus
              />
            </div>

            <motion.button
              onClick={sendOTP}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
              whileTap={{ scale: 0.95 }}
              disabled={loading || phoneNumber.length !== 10}
            >
              <FaPhone size={18} />
              {loading ? 'Sending...' : 'Send OTP via WhatsApp'}
            </motion.button>
          </div>
        ) : (
          // OTP input
          <div className="w-full flex flex-col gap-4">
            <div className="text-white/80 text-center mb-4">
              We've sent a 6-digit code to <strong>+91{phoneNumber}</strong>
            </div>

            <input
              type="text"
              className="rounded-lg px-4 py-3 text-center text-2xl font-bold bg-white/80 dark:bg-[var(--surface)]/70 text-[var(--text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-transparent dark:border-[var(--border)]"
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              autoFocus
            />

            <motion.button
              onClick={verifyOTP}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
              whileTap={{ scale: 0.95 }}
              disabled={loading || otpCode.length !== 6}
            >
              <FaCheckCircle size={18} />
              {loading ? 'Verifying...' : 'Verify OTP'}
            </motion.button>

            <div className="text-center">
              {countdown > 0 ? (
                <div className="text-white/60">
                  Resend OTP in {formatTime(countdown)}
                </div>
              ) : (
                <button
                  onClick={resendOTP}
                  className="text-green-400 hover:text-green-300 font-semibold"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={resetForm}
              className="text-white/60 hover:text-white flex items-center justify-center gap-2 mt-2"
            >
              <FaArrowLeft size={14} />
              Change phone number
            </button>
          </div>
        )}

        {error || authError && (
          <motion.div
            className="mt-4 text-red-400 font-semibold text-center bg-red-500/20 p-3 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error || authError}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
