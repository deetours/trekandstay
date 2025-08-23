// Mock API service to simulate Django backend endpoints
// This can be replaced with real Django API calls later

export interface UserPreferences {
  preferred_activities: string[];
}

export interface UserProfile {
  id: number;
  user: number;
  reward_points: number;
  preferences: UserPreferences;
}

export interface Booking {
  id: number;
  user: number;
  destination: string;
  date: string;
  status: string;
  amount: number;
  created_at: string;
}

export interface TripHistory {
  id: number;
  user: number;
  destination: string;
  date: string;
  feedback: string;
}

export interface TripRecommendation {
  id: number;
  user: number;
  destination: string;
  reason: string;
}

// Mock data
const mockUserProfile: UserProfile = {
  id: 1,
  user: 1,
  reward_points: 1200,
  preferences: { preferred_activities: ['trekking', 'photography'] }
};

const mockBookings: Booking[] = [
  {
    id: 1,
    user: 1,
    destination: 'Hampi',
    date: '2025-03-15',
    status: 'confirmed',
    amount: 5000.00,
    created_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 2,
    user: 1,
    destination: 'Coorg',
    date: '2025-04-20',
    status: 'pending',
    amount: 3500.00,
    created_at: '2025-01-20T14:30:00Z'
  }
];

const mockTripHistory: TripHistory[] = [
  {
    id: 1,
    user: 1,
    destination: 'Gokarna',
    date: '2024-12-10',
    feedback: 'Amazing beach experience!'
  },
  {
    id: 2,
    user: 1,
    destination: 'Chikmagalur',
    date: '2024-11-05',
    feedback: 'Perfect coffee plantation tour'
  }
];

const mockRecommendations: TripRecommendation[] = [
  {
    id: 1,
    user: 1,
    destination: 'Munnar',
    reason: 'Based on your love for hill stations'
  },
  {
    id: 2,
    user: 1,
    destination: 'Kabini',
    reason: 'Wildlife photography opportunities'
  },
  {
    id: 3,
    user: 1,
    destination: 'Badami',
    reason: 'Historical sites similar to Hampi'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API endpoints
export const mockApi = {
  // User Profile
  getUserProfile: async (): Promise<UserProfile> => {
    await delay(500);
    return mockUserProfile;
  },

  updateUserProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    await delay(300);
    return { ...mockUserProfile, ...data };
  },

  // Bookings
  getBookings: async (): Promise<Booking[]> => {
    await delay(800);
    return mockBookings;
  },

  createBooking: async (booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> => {
    await delay(600);
    return {
      ...booking,
      id: mockBookings.length + 1,
      created_at: new Date().toISOString()
    };
  },

  updateBooking: async (id: number, data: Partial<Booking>): Promise<Booking> => {
    await delay(400);
    const booking = mockBookings.find(b => b.id === id);
    return { ...booking!, ...data };
  },

  deleteBooking: async (id: number): Promise<void> => {
    await delay(300);
    // In real implementation, remove from array using id
    const index = mockBookings.findIndex(b => b.id === id);
    if (index > -1) mockBookings.splice(index, 1);
  },

  // Trip History
  getTripHistory: async (): Promise<TripHistory[]> => {
    await delay(600);
    return mockTripHistory;
  },

  // Recommendations
  getRecommendations: async (): Promise<TripRecommendation[]> => {
    await delay(700);
    return mockRecommendations;
  }
};
