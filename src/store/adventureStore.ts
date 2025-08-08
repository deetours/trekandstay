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
  setDestinations: (destinations: Destination[]) => void;
  setSelectedDestination: (destination: Destination | null) => void;
  updateFilters: (filters: Partial<AdventureStore['filters']>) => void;
  updateBooking: (booking: Partial<BookingData>) => void;
  setBookingStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  toggleTheme: () => void;
}

export const useAdventureStore = create<AdventureStore>((set, get) => ({
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
  theme: 'light',
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
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
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
}));