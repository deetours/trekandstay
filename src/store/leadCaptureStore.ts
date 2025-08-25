import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TripPreference {
  id: string;
  name: string;
  image: string;
  price: number;
  duration: string;
  difficulty: string;
  interested: boolean;
}

export interface LeadData {
  name: string;
  email: string;
  whatsapp: string;
  budget: [number, number];
  preferredDates: {
    startDate: string;
    endDate: string;
  };
  tripPreferences: TripPreference[];
  leadSource: string;
  currentPage: string;
  timeSpent: number;
}

export interface LeadCaptureState {
  // Popup state
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  
  // Form data
  formData: LeadData;
  
  // UI state
  isLoading: boolean;
  errors: Record<string, string>;
  isSubmitted: boolean;
  
  // Behavior tracking
  triggerCount: number;
  lastShown: number;
  dismissedCount: number;
  
  // Available trips for selection
  availableTrips: TripPreference[];
  
  // Actions
  openPopup: (source: string, page: string) => void;
  closePopup: () => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<LeadData>) => void;
  updateTripPreference: (tripId: string, interested: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  setLoading: (loading: boolean) => void;
  submitLead: () => Promise<void>;
  resetForm: () => void;
  dismissPopup: () => void;
  loadTripsForSelection: (trips: TripPreference[]) => void;
}

const initialFormData: LeadData = {
  name: '',
  email: '',
  whatsapp: '',
  budget: [5000, 50000],
  preferredDates: {
    startDate: '',
    endDate: ''
  },
  tripPreferences: [],
  leadSource: '',
  currentPage: '',
  timeSpent: 0
};

export const useLeadCaptureStore = create<LeadCaptureState>()(
  persist(
    (set, get) => ({
      // Initial state
      isOpen: false,
      currentStep: 1,
      totalSteps: 3,
      formData: initialFormData,
      isLoading: false,
      errors: {},
      isSubmitted: false,
      triggerCount: 0,
      lastShown: 0,
      dismissedCount: 0,
      availableTrips: [],

      // Actions
      openPopup: (source: string, page: string) => {
        const now = Date.now();
        const lastShown = get().lastShown;
        
        // Don't show if dismissed recently (within 1 hour) or shown more than 3 times
        if (
          (now - lastShown < 3600000 && get().dismissedCount > 0) ||
          get().triggerCount >= 3 ||
          get().isSubmitted
        ) {
          return;
        }

        set(state => ({
          isOpen: true,
          currentStep: 1,
          triggerCount: state.triggerCount + 1,
          lastShown: now,
          formData: {
            ...state.formData,
            leadSource: source,
            currentPage: page,
            timeSpent: 0
          },
          errors: {}
        }));
      },

      closePopup: () => {
        set({ isOpen: false, currentStep: 1 });
      },

      nextStep: () => {
        set(state => ({
          currentStep: Math.min(state.currentStep + 1, state.totalSteps)
        }));
      },

      prevStep: () => {
        set(state => ({
          currentStep: Math.max(state.currentStep - 1, 1)
        }));
      },

      updateFormData: (data: Partial<LeadData>) => {
        set(state => ({
          formData: { ...state.formData, ...data }
        }));
      },

      updateTripPreference: (tripId: string, interested: boolean) => {
        set(state => ({
          formData: {
            ...state.formData,
            tripPreferences: state.formData.tripPreferences.map(trip =>
              trip.id === tripId ? { ...trip, interested } : trip
            )
          }
        }));
      },

      setErrors: (errors: Record<string, string>) => {
        set({ errors });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      submitLead: async () => {
        const { formData, setLoading, setErrors, closePopup } = get();
        setLoading(true);
        setErrors({});

        try {
          // Validate form data
          const errors: Record<string, string> = {};
          
          if (!formData.name.trim()) errors.name = 'Name is required';
          if (!formData.email.trim()) errors.email = 'Email is required';
          if (!formData.whatsapp.trim()) errors.whatsapp = 'WhatsApp number is required';
          
          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (formData.email && !emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
          }
          
          // WhatsApp validation (Indian mobile format)
          const whatsappRegex = /^[6-9]\d{9}$/;
          if (formData.whatsapp && !whatsappRegex.test(formData.whatsapp.replace(/\D/g, ''))) {
            errors.whatsapp = 'Please enter a valid 10-digit mobile number';
          }

          if (Object.keys(errors).length > 0) {
            setErrors(errors);
            setLoading(false);
            return;
          }

          // Submit to backend
          const response = await fetch('/api/leads/capture/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...formData,
              interested_trips: formData.tripPreferences
                .filter(trip => trip.interested)
                .map(trip => trip.id),
              submission_timestamp: new Date().toISOString()
            })
          });

          if (!response.ok) {
            throw new Error('Failed to submit lead');
          }

          // Mark as submitted and close
          set({ isSubmitted: true });
          closePopup();

          // Optional: Trigger WhatsApp welcome message
          if (formData.whatsapp) {
            try {
              await fetch('/api/whatsapp/send-message/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  phone: formData.whatsapp,
                  message: `Hi ${formData.name}! 👋 Thanks for your interest in Trek and Stay adventures. Our team will connect with you soon to help plan your perfect trip!`,
                  session_id: 'lead_capture'
                })
              });
            } catch (error) {
              console.warn('WhatsApp message failed:', error);
            }
          }

        } catch (error) {
          console.error('Lead submission error:', error);
          setErrors({ submit: 'Something went wrong. Please try again.' });
        } finally {
          setLoading(false);
        }
      },

      resetForm: () => {
        set({
          formData: initialFormData,
          currentStep: 1,
          errors: {},
          isLoading: false
        });
      },

      dismissPopup: () => {
        set(state => ({
          isOpen: false,
          dismissedCount: state.dismissedCount + 1,
          lastShown: Date.now()
        }));
      },

      loadTripsForSelection: (trips: TripPreference[]) => {
        set(state => ({
          availableTrips: trips,
          formData: {
            ...state.formData,
            tripPreferences: trips.map(trip => ({ ...trip, interested: false }))
          }
        }));
      }
    }),
    {
      name: 'lead-capture-storage',
      partialize: (state) => ({
        triggerCount: state.triggerCount,
        lastShown: state.lastShown,
        dismissedCount: state.dismissedCount,
        isSubmitted: state.isSubmitted
      })
    }
  )
);