import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase'; // Make sure 'auth' is exported from src/firebase.ts

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
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
            className="rounded-lg px-4 py-2 bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            className="rounded-lg px-4 py-2 bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg shadow hover:bg-gray-100 font-semibold"
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
