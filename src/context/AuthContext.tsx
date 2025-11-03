import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { api, setAuthToken } from '../services/api';

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  is_staff?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithOTP: (phoneNumber: string, otpCode: string) => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<void>;
  register: (username: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Token ${storedToken}`;
      } catch (err) {
        console.error('Failed to restore auth:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await api.post('/auth/token/', {
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;

      // Store in localStorage
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      // Update state and API headers
      setToken(newToken);
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Token ${newToken}`;

      return;
    } catch (err: unknown) {
      const errorMsg: string = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string; error?: string } } }).response?.data?.detail ||
          (err as { response?: { data?: { detail?: string; error?: string } } }).response?.data?.error ||
          'Login failed. Please check your credentials.'
        : 'Login failed. Please check your credentials.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const register = async (username: string, email: string, password: string, phone?: string) => {
    try {
      setError(null);
      const response = await api.post('/auth/register/', {
        username,
        email,
        password,
        phone,
      });

      const { token: newToken, user: userData } = response.data;

      // Store in localStorage
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      // Update state and API headers
      setToken(newToken);
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Token ${newToken}`;

      return;
    } catch (err: unknown) {
      const errorMsg: string = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string; error?: string } } }).response?.data?.detail ||
          (err as { response?: { data?: { detail?: string; error?: string } } }).response?.data?.error ||
          'Registration failed. Please try again.'
        : 'Registration failed. Please try again.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const sendOTP = async (phoneNumber: string) => {
    try {
      setError(null);
      const response = await api.post('/auth/send-otp/', {
        phone_number: phoneNumber,
      });
      return response.data;
    } catch (err: unknown) {
      const errorMsg: string = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
          'Failed to send OTP. Please try again.'
        : 'Failed to send OTP. Please try again.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const loginWithOTP = async (phoneNumber: string, otpCode: string) => {
    try {
      setError(null);
      const response = await api.post('/auth/verify-otp/', {
        phone_number: phoneNumber,
        otp_code: otpCode,
      });

      const { token: newToken, user: userData } = response.data;

      // Store in localStorage
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      // Update state and API headers
      setToken(newToken);
      setUser(userData);
      setAuthToken(newToken);

      return;
    } catch (err: unknown) {
      const errorMsg: string = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
          'OTP verification failed. Please try again.'
        : 'OTP verification failed. Please try again.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Reset state
    setToken(null);
    setUser(null);
    setError(null);

    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        loginWithOTP,
        sendOTP,
        register,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.is_staff ?? false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
