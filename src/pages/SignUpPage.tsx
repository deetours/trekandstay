import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdventureStore } from '../store/adventureStore';
import { auth, db, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

export const SignUpPage: React.FC = () => {
  const { setUser, setLoading, isLoading } = useAdventureStore(s => ({
    setUser: s.setUser,
    setLoading: s.setLoading,
    isLoading: s.isLoading,
  }));
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pwStrength, setPwStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'password') {
      // basic strength heuristic
      let score = 0;
      if (value.length >= 8) score += 1;
      if (/[A-Z]/.test(value)) score += 1;
      if (/[0-9]/.test(value)) score += 1;
      if (/[^A-Za-z0-9]/.test(value)) score += 1;
      setPwStrength(score);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!form.name || !form.email || !form.password) {
      return setError('All fields are required');
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    if (!auth) {
      return setError('Authentication service is not available');
    }

    setLoading(true);
    try {
      // Try create account
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      
      // Create Firestore profile
      if (db) {
        const profileRef = doc(db, 'users', cred.user.uid);
        const snap = await getDoc(profileRef);
        
        if (!snap.exists()) {
          await setDoc(profileRef, { 
            email: cred.user.email, 
            name: form.name,
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
        }
      }

      setUser({ 
        id: cred.user.uid, 
        name: form.name || cred.user.email?.split('@')[0] || 'User', 
        email: cred.user.email || form.email, 
        avatar: cred.user.photoURL || '', 
        adventurePoints: 0, 
        completedTrips: 0, 
        badges: [], 
        preferences: { 
          favoriteCategories: [], 
          difficulty: [], 
          budget: [0,0], 
          notifications: true 
        }, 
        isAdmin: false 
      });
      
      setSuccess(true);
      setTimeout(() => { 
        console.log('🚀 Navigating to User Dashboard');
        navigate('/dashboard'); 
      }, 1500);
      
    } catch (error: unknown) {
      // If email exists, treat as sign in attempt
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        
        if (firebaseError.code === 'auth/email-already-in-use') {
          try {
            if (!auth) throw new Error('Authentication not available');
            const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
            setUser({ 
              id: cred.user.uid, 
              name: cred.user.displayName || form.name || cred.user.email?.split('@')[0] || 'User', 
              email: cred.user.email || form.email, 
              avatar: cred.user.photoURL || '', 
              adventurePoints: 0, 
              completedTrips: 0, 
              badges: [], 
              preferences: { 
                favoriteCategories: [], 
                difficulty: [], 
                budget: [0,0], 
                notifications: true 
              }, 
              isAdmin: false 
            });
            setSuccess(true);
            setTimeout(() => { 
              console.log('🚀 Navigating to User Dashboard (email already exists)');
              navigate('/dashboard'); 
            }, 1500);
          } catch (e2) {
            const msg = e2 instanceof Error ? e2.message : 'Sign in failed - email exists but password incorrect';
            setError(msg);
          }
        } else {
          // Handle other Firebase errors
          let errorMessage = 'Failed to create account';
          switch (firebaseError.code) {
            case 'auth/weak-password':
              errorMessage = 'Password is too weak';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Invalid email address';
              break;
            default:
              errorMessage = firebaseError.message || 'Failed to create account';
          }
          setError(errorMessage);
        }
      } else {
        const message = error instanceof Error ? error.message : 'Signup failed';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    
    if (!auth || !googleProvider) {
      return setError('Google sign-up is not available');
    }

    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Create or update user profile in Firestore
      if (db) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // Create new user profile
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
        }
        
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        setUser({
          id: user.uid,
          name: user.displayName || userData.name || 'User',
          email: user.email || '',
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
          isAdmin: userData.role === 'admin'
        });
      } else {
        // Fallback if Firestore is not available
        setUser({
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
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
      
      setSuccess(true);
      setTimeout(() => {
        console.log('🚀 Navigating to User Dashboard (Google sign-up)');
        navigate('/dashboard');
      }, 1500);
      
    } catch (error: unknown) {
      console.error('Google sign up error:', error);
      let errorMessage = 'Failed to sign up with Google';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        switch (firebaseError.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-up popup was closed';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Sign-up popup was blocked by browser';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Sign-up was cancelled';
            break;
          default:
            errorMessage = firebaseError.message || 'Failed to sign up with Google';
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
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_60%)]" />
      
      <div className="md:w-1/2 flex items-center justify-center p-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
            Begin Your Adventure
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-md">
            Create an account to track bookings, manage wishlists and get smart trek recommendations.
          </p>
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 60, ease: 'linear' }} 
            className="mt-8 w-20 h-20 mx-auto md:mx-0 rounded-full border-4 border-emerald-400/30 flex items-center justify-center text-emerald-500 font-semibold text-2xl"
          >
            🧭
          </motion.div>
        </motion.div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <AnimatePresence>
          <motion.div
            key={success ? 'success' : 'form'}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            className="w-full max-w-md relative backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/30 dark:border-slate-700/50 shadow-xl rounded-2xl px-8 py-8 space-y-6"
          >
            {!success ? (
              <>
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">Create Account</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Join trekkers & explorers</p>
                </div>

                {/* Google Sign Up Button */}
                <button
                  onClick={handleGoogleSignUp}
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
                      Or sign up with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="group relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={onChange}
                      required
                      className="peer w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="group relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      className="peer w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="group relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={onChange}
                      required
                      className="peer w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
                      placeholder="Create a password"
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
                    
                    {/* Password strength indicator */}
                    <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(pwStrength/4)*100}%` }} 
                        className={`h-full transition-colors ${
                          pwStrength <= 1 ? 'bg-red-400' : 
                          pwStrength === 2 ? 'bg-amber-400' : 
                          pwStrength === 3 ? 'bg-emerald-400' : 
                          'bg-emerald-600'
                        }`} 
                      />
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="confirm"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirm}
                      onChange={onChange}
                      required
                      className="peer w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirm ? (
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
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium shadow hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating...' : 'Sign Up'}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <a href="/signin" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                      Sign in
                    </a>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    Admin?{' '}
                    <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                      Use admin login
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
                <div className="text-5xl">🎉</div>
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">Welcome aboard!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Your account is ready. Redirecting...</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignUpPage;
