import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAdventureStore } from '../../store/adventureStore';

export const LoginPage: React.FC = () => {
  const { setUser } = useAdventureStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Support both the intended and the typo variant the user supplied
  const ADMIN_EMAILS = ['trekandstay@gmail.com', 'trekandsaty@gmail.com'];
  const SHOW_ADMIN_DEBUG = true;

  const normalizeEmail = (raw: string) => {
    if (!raw) return '';
    let e = raw.trim().toLowerCase();
    // Gmail ignores dots in local part; strip them for matching purposes only
    if (e.endsWith('@gmail.com')) {
      const [local, domain] = e.split('@');
      e = local.replace(/\./g,'') + '@' + domain;
    }
    return e;
  };
  const normalizedAdminSet = new Set(ADMIN_EMAILS.map(normalizeEmail));

  const isAdminEmail = (raw:string) => {
    const norm = normalizeEmail(raw);
    return normalizedAdminSet.has(norm) || norm.includes('trekandstay') || norm.includes('trekandsaty');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!auth) {
        setError('Authentication service unavailable. Please retry later.');
        setLoading(false);
        return;
      }
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (err) {
        // If the user does not exist yet but the email is an approved admin email, create it on the fly
  if (typeof err === 'object' && err !== null && 'code' in err && typeof (err as { code?: unknown }).code === 'string' && (err as { code: string }).code === 'auth/user-not-found') {
          const candidate = normalizeEmail(email);
            if (normalizedAdminSet.has(candidate) || candidate.startsWith('trekandsta')) {
              try {
                cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
              } catch (createErr) {
                setError(createErr instanceof Error ? createErr.message : 'Failed to create admin user');
                setLoading(false);
                return;
              }
            } else {
              setError('Account not found. Please use Sign Up or contact support.');
              setLoading(false);
              return;
            }
        } else {
          setError(err instanceof Error ? err.message : 'Login failed');
          setLoading(false);
          return;
        }
      }
      const candidateEmailRaw = (cred.user.email || email).trim();
      const candidateEmailNorm = normalizeEmail(candidateEmailRaw);
  const rawAdminList = (import.meta as ImportMeta).env?.VITE_ADMIN_EMAILS || '';
      const adminEmailList = rawAdminList.split(',').map((s: string)=>s.trim()).filter(Boolean);
      const autoAdmin = isAdminEmail(candidateEmailNorm) || adminEmailList.map(normalizeEmail).includes(candidateEmailNorm);
      // Firestore doc creation attempt (non-blocking)
      try {
        if (db) {
          const userDocRef = doc(db,'users', cred.user.uid);
          await setDoc(userDocRef, { email: candidateEmailNorm, role: autoAdmin ? 'admin':'user', updatedAt: Date.now() }, { merge: true });
        }
  } catch (writeErr) {
        if (SHOW_ADMIN_DEBUG) console.warn('[ADMIN DEBUG] Firestore write failed (non-fatal)', writeErr);
      }
      if (!autoAdmin) {
        setError('Admin access denied for this account. Use regular Sign In.');
        if (SHOW_ADMIN_DEBUG) console.debug('[ADMIN DEBUG]', { candidateEmailRaw, candidateEmailNorm, adminEmailList, normalizedAdminSet: Array.from(normalizedAdminSet), autoAdmin });
        if (auth) await auth.signOut();
        return;
      }
      setUser({
        id: cred.user.uid,
        name: cred.user.displayName || email.split('@')[0],
        email: cred.user.email || email,
        avatar: cred.user.photoURL || '',
        adventurePoints: 0,
        completedTrips: 0,
        badges: [],
        preferences: { favoriteCategories: [], difficulty: [], budget: [0,0], notifications: true },
        isAdmin: true
      });
  navigate('/admin/portal', { replace: true });
  } catch (err) {
  setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      if (!auth) {
        setError('Authentication service unavailable. Please retry later.');
        setLoading(false);
        return;
      }
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const candidateEmailRaw = (cred.user.email || '').trim();
      const candidateEmailNorm = normalizeEmail(candidateEmailRaw);
  const rawAdminList = (import.meta as ImportMeta).env?.VITE_ADMIN_EMAILS || '';
      const adminEmailList = rawAdminList.split(',').map((s: string)=>s.trim()).filter(Boolean);
      const autoAdmin = isAdminEmail(candidateEmailNorm) || adminEmailList.map(normalizeEmail).includes(candidateEmailNorm);
      try {
        if (db) {
          const userDocRef = doc(db,'users', cred.user.uid);
          await setDoc(userDocRef, { email: candidateEmailNorm, role: autoAdmin ? 'admin':'user', updatedAt: Date.now() }, { merge: true });
        }
  } catch (writeErr) {
        if (SHOW_ADMIN_DEBUG) console.warn('[ADMIN DEBUG] Firestore write failed (non-fatal)', writeErr);
      }
      if (!autoAdmin) {
        setError('Admin access denied for this account. Use regular Sign In.');
        if (SHOW_ADMIN_DEBUG) console.debug('[ADMIN DEBUG]', { candidateEmailRaw, candidateEmailNorm, adminEmailList, normalizedAdminSet: Array.from(normalizedAdminSet), autoAdmin });
        if (auth) await auth.signOut();
        return;
      }
      setUser({
        id: cred.user.uid,
        name: cred.user.displayName || (cred.user.email?.split('@')[0] || 'User'),
        email: cred.user.email || '',
        avatar: cred.user.photoURL || '',
        adventurePoints: 0,
        completedTrips: 0,
        badges: [],
        preferences: { favoriteCategories: [], difficulty: [], budget: [0,0], notifications: true },
        isAdmin: true
      });
  navigate('/admin/portal', { replace: true });
  } catch (err) {
  setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-3xl font-bold text-white mb-6 font-oswald tracking-wide">Sign In to Adventure</h2>
        <form className="w-full flex flex-col gap-4" onSubmit={handleEmailLogin}>
          <input
            type="email"
            className="rounded-lg px-4 py-2 bg-white/80 dark:bg-[var(--surface)]/70 text-[var(--text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-transparent dark:border-[var(--border)]"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            className="rounded-lg px-4 py-2 bg-white/80 dark:bg-[var(--surface)]/70 text-[var(--text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-transparent dark:border-[var(--border)]"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <motion.button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 rounded-lg shadow-lg hover:scale-105 transition-transform"
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>
        <div className="my-4 text-white/80">or</div>
        <motion.button
          onClick={handleGoogleLogin}
          className="flex items-center gap-2 bg-white dark:bg-[var(--surface)] text-[var(--text)] px-4 py-2 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-[var(--surface-alt)] font-semibold border border-transparent dark:border-[var(--border)]"
          whileTap={{ scale: 0.97 }}
          disabled={loading}
        >
          <FcGoogle size={24} /> Sign in with Google
        </motion.button>
        {error && <div className="mt-4 text-red-400 font-semibold">{error}</div>}
      </motion.div>
    </div>
  );
};
