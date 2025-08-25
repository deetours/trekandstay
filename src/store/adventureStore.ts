import { create } from 'zustand';
import { User, Destination, BookingData } from '../types';

interface AdventureStore {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Destinations state
  destinations: Destination[];
  selectedDestination: Destination | null;
  filters: {
    category: string[];
    difficulty: string[];
    priceRange: [number, number];
    duration: string[];
    location: string[];
  };
  
  // Booking state
  currentBooking: Partial<BookingData> | null;
  bookingStep: number;
  
  // UI state
  isLoading: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark';
  
  // Actions
  setUser: (user: User | null) => void;
  logout: () => void;
  setDestinations: (destinations: Destination[]) => void;
  setSelectedDestination: (destination: Destination | null) => void;
  updateFilters: (filters: Partial<AdventureStore['filters']>) => void;
  updateBooking: (booking: Partial<BookingData>) => void;
  setBookingStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const THEME_KEY = 'theme-preference';
function detectInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
  if (stored) return stored;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)');
  return prefersDark ? 'dark' : 'light';
}

export const useAdventureStore = create<AdventureStore>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  destinations: [],
  selectedDestination: null,
  filters: {
    category: [],
    difficulty: [],
    priceRange: [0, 10000],
    duration: [],
    location: [],
  },
  currentBooking: null,
  bookingStep: 0,
  isLoading: false,
  activeModal: null,
  theme: detectInitialTheme(),
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    // Clear user from store
    set({ user: null, isAuthenticated: false, currentBooking: null, bookingStep: 0 });
    
    // Sign out from Firebase Auth
    import('../firebase').then(({ auth }) => {
      if (auth?.currentUser) {
        import('firebase/auth').then(({ signOut }) => {
          signOut(auth).catch((error) => {
            console.error('Error signing out:', error);
          });
        });
      }
    });
    
    // Clear any persisted data
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
    }
  },
  setDestinations: (destinations) => set({ destinations }),
  setSelectedDestination: (destination) => set({ selectedDestination: destination }),
  updateFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  updateBooking: (booking) => set((state) => ({
    currentBooking: { ...state.currentBooking, ...booking }
  })),
  setBookingStep: (step) => set({ bookingStep: step }),
  setLoading: (loading) => set({ isLoading: loading }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  toggleTheme: () => set((state) => {
    const next = state.theme === 'light' ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next === 'dark');
    }
    localStorage.setItem(THEME_KEY, next);
    return { theme: next };
  }),
  setTheme: (theme) => set(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    localStorage.setItem(THEME_KEY, theme);
    return { theme };
  })
}));