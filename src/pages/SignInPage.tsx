import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPhone, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useAdventureStore } from '../store/adventureStore';

const SignInPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithOTP, sendOTP } = useContext(AuthContext)!;
  const { setUser } = useAdventureStore();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length > 10) {
      return '+' + cleaned.slice(0, 12);
    } else if (cleaned.startsWith('91')) {
      return '+' + cleaned;
    } else if (cleaned.length > 10) {
      return '+91' + cleaned.slice(-10);
    } else {
      return '+91' + cleaned;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError(null);
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 13) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendOTP(phoneNumber);
      setOtpSent(true);
      setCountdown(60);
    } catch (error: unknown) {
      console.error('Send OTP error:', error);
      let errorMessage = 'Failed to send OTP';

      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use backend API for authentication
      await loginWithOTP(phoneNumber, otp);

      console.log('OTP verification successful');

      // Set user in store (basic user data since we don't have full user object from backend)
      const userData = {
        id: `phone_${phoneNumber.replace('+', '')}`,
        name: 'User', // Backend should provide actual name
        email: '',
        phone: phoneNumber,
        avatar: '',
        adventurePoints: 0,
        completedTrips: 0,
        badges: [],
        preferences: {
          favoriteCategories: [],
          difficulty: [],
          budget: [0, 0] as [number, number],
          notifications: true
        },
        isAdmin: false
      };

      setUser(userData);

      console.log('User set in store, showing success state...');
      setSuccess(true);
      console.log('Redirecting to home in 1.5 seconds...');
      setTimeout(() => {
        console.log('Redirecting now...');
        navigate('/', { replace: true });
      }, 1500);

    } catch (error: unknown) {
      console.error('OTP verification error:', error);
      let errorMessage = 'Failed to verify OTP';

      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    setOtpSent(false);
    setCountdown(0);
    setError(null);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 pt-14 md:pt-0">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_30%,rgba(6,182,212,0.18),transparent_60%)]" />

      {/* Side Content - Hidden on Mobile, Shown on Large Screens */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-md">
            Sign in with your phone number to continue planning your next trek and track your journey.
          </p>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 70, ease: 'linear' }}
            className="mt-8 w-20 h-20 mx-auto lg:mx-0 rounded-full border-4 border-cyan-400/30 flex items-center justify-center text-cyan-500 font-semibold text-2xl"
          >
            ⛰️
          </motion.div>
        </motion.div>
      </div>

      {/* Form Container - Full width on mobile, half width on large screens */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10 w-full lg:w-1/2 min-h-auto lg:min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          className="w-full max-w-md backdrop-blur-xl bg-white/95 dark:bg-slate-900/90 border border-white/40 dark:border-slate-700/50 shadow-2xl rounded-2xl px-5 sm:px-8 py-7 sm:py-10 space-y-6"
        >
          {!success ? (
            <>
              <div className="space-y-2 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Sign In</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {otpSent ? 'Enter the OTP sent to your phone' : 'Enter your phone number to continue'}
                </p>
              </div>

              {!otpSent ? (
                <div className="space-y-4">
                  <div className="group relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaPhone className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-base sm:text-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:ring-offset-0 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold placeholder:text-slate-400 transition-all duration-200 min-h-[44px]"
                      maxLength={13}
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs sm:text-sm text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg p-3 sm:p-4"
                    >
                      ⚠️ {error}
                    </motion.div>
                  )}

                  <button
                    onClick={handleSendOTP}
                    disabled={isLoading || !phoneNumber || phoneNumber.length < 13}
                    className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <FaCheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold truncate">OTP sent to {phoneNumber}</span>
                  </div>

                  <div className="group relative">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 6) {
                          setOtp(value);
                          setError(null);
                        }
                      }}
                      placeholder="000000"
                      className="peer w-full text-center text-3xl sm:text-4xl font-bold tracking-widest px-4 py-4 sm:py-5 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 min-h-[56px]"
                      maxLength={6}
                      inputMode="numeric"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs sm:text-sm text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg p-3 sm:p-4"
                    >
                      ⚠️ {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleResendOTP}
                      disabled={countdown > 0}
                      className="flex-1 py-3 sm:py-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm sm:text-base hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    >
                      {countdown > 0 ? `${countdown}s` : 'Resend'}
                    </button>

                    <button
                      onClick={handleVerifyOTP}
                      disabled={isLoading || otp.length !== 6}
                      className="flex-1 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    >
                      {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>

                  <button
                    onClick={handleResendOTP}
                    className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    <FaArrowLeft className="h-4 w-4" />
                    Change phone number
                  </button>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Don't have an account?{' '}
                  <a href="/signup" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                    Sign up
                  </a>
                </p>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="text-5xl">🚀</div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">Welcome Back!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Redirecting to your dashboard...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SignInPage;
