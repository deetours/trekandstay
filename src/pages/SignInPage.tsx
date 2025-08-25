import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdventureStore } from '../store/adventureStore';
import { auth, googleProvider, db } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Inline admin email check to avoid import issues
const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',')
    .map((e: string) => e.trim().toLowerCase()) || [];
  return adminEmails.includes(email.toLowerCase());
};

export const SignInPage: React.FC = () => {
  const { setUser, setLoading, isLoading } = useAdventureStore(s => ({ 
    setUser: s.setUser, 
    setLoading: s.setLoading, 
    isLoading: s.isLoading 
  }));
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    console.log('🔄 Starting email sign-in process...');
    
    if (!email || !password) {
      return setError('Email and password are required');
    }

    if (!auth) {
      console.error('❌ Firebase Auth not available');
      return setError('Authentication service is not available');
    }

    console.log('🔥 Firebase Auth available, attempting sign-in...');
    setLoading(true);
    try {
      console.log('🔐 Attempting Firebase signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase sign-in successful:', user.email);
      
      // Check if user profile exists in Firestore
      if (db) {
        console.log('📄 Checking Firestore for user profile...');
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          console.log('👤 User data from Firestore:', userData);
          
          setUser({
            id: user.uid,
            name: user.displayName || userData.name || email.split('@')[0],
            email: user.email || email,
            avatar: user.photoURL || userData.avatar || '',
            adventurePoints: userData.adventurePoints || 0,
            completedTrips: userData.completedTrips || 0,
            badges: userData.badges || [],
            preferences: userData.preferences || {
              favoriteCategories: [],
              difficulty: [],
              budget: [0, 0],
              notifications: true
            },
            isAdmin: userData.role === 'admin' || isAdminEmail(user.email)
          });
        } catch (firestoreError) {
          console.warn('⚠️ Firestore permission error, using fallback data:', firestoreError);
          // Continue with basic user data even if Firestore fails
          setUser({
            id: user.uid,
            name: user.displayName || email.split('@')[0],
            email: user.email || email,
            avatar: user.photoURL || '',
            adventurePoints: 0,
            completedTrips: 0,
            badges: [],
            preferences: {
              favoriteCategories: [],
              difficulty: [],
              budget: [0, 0],
              notifications: true
            },
            isAdmin: isAdminEmail(user.email)
          });
        }
      } else {
        console.log('⚠️ Firestore not available, using fallback user data');
        // Fallback if Firestore is not available
        setUser({
          id: user.uid,
          name: user.displayName || email.split('@')[0],
          email: user.email || email,
          avatar: user.photoURL || '',
          adventurePoints: 0,
          completedTrips: 0,
          badges: [],
          preferences: {
            favoriteCategories: [],
            difficulty: [],
            budget: [0, 0],
            notifications: true
          },
          isAdmin: false
        });
      }
      
      console.log('🎯 User set in store, showing success state...');
      setSuccess(true);
      console.log('🚀 Redirecting to dashboard in 1.5 seconds...');
      setTimeout(() => {
        console.log('🔄 Redirecting now...');
        navigate('/dashboard', { replace: true });
      }, 1500);
      
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        switch (firebaseError.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
          default:
            errorMessage = firebaseError.message || 'Failed to sign in';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    
    if (!auth || !googleProvider) {
      return setError('Google sign-in is not available');
    }

    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('Google sign-in successful:', user.email);
      
      // Set user in store with basic info first
      const basicUserData = {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: user.photoURL || '',
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
      
      // Try to create/update user profile in Firestore (but don't block on it)
      if (db) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            // Try to create new user profile
            await setDoc(userRef, {
              email: user.email,
              name: user.displayName,
              avatar: user.photoURL,
              role: 'user',
              createdAt: Date.now(),
              adventurePoints: 0,
              completedTrips: 0,
              badges: [],
              preferences: {
                favoriteCategories: [],
                difficulty: [],
                budget: [0, 0],
                notifications: true
              }
            });
            console.log('Created new user profile in Firestore');
          } else {
            // Update user data with Firestore data
            const userData = userDoc.data();
            basicUserData.adventurePoints = userData.adventurePoints || 0;
            basicUserData.completedTrips = userData.completedTrips || 0;
            basicUserData.badges = userData.badges || [];
            basicUserData.preferences = userData.preferences || basicUserData.preferences;
            basicUserData.isAdmin = userData.role === 'admin';
            console.log('Loaded existing user profile from Firestore');
          }
        } catch (firestoreError) {
          console.warn('Firestore operation failed, continuing with basic user data:', firestoreError);
          // Continue with basic user data even if Firestore fails
        }
      }
      
      // Set user in store
      setUser(basicUserData);
      
      setSuccess(true);
      console.log('Google sign-in complete, redirecting to dashboard...');
      
      // Navigate to dashboard immediately
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
      
    } catch (error: unknown) {
      console.error('Google sign in error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        switch (firebaseError.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in popup was closed';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Sign-in popup was blocked by browser';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Sign-in was cancelled';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection';
            break;
          default:
            errorMessage = firebaseError.message || 'Failed to sign in with Google';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_30%,rgba(6,182,212,0.18),transparent_60%)]" />
      
      <div className="md:w-1/2 flex items-center justify-center p-10 order-2 md:order-1">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-md">
            Sign in to continue planning your next trek and track your journey.
          </p>
          <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ repeat: Infinity, duration: 70, ease: 'linear' }} 
            className="mt-8 w-20 h-20 mx-auto md:mx-0 rounded-full border-4 border-cyan-400/30 flex items-center justify-center text-cyan-500 font-semibold text-2xl"
          >
            ⛰️
          </motion.div>
        </motion.div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 order-1 md:order-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          className="w-full max-w-md backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/30 dark:border-slate-700/50 shadow-xl rounded-2xl px-8 py-8 space-y-6"
        >
          {!success ? (
            <>
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">Sign In</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Access your account</p>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Continue with Google
                </span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/70 dark:bg-slate-900/70 text-slate-500 dark:text-slate-400">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="peer w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="peer w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                  >
                    {error}
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading} 
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-medium shadow hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

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
