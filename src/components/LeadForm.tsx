import React, { useState, useEffect } from 'react';
import { fetchTrips } from '../utils/api';
import api from '../services/api';
import { X, Check, Send } from 'lucide-react';

interface Trip {
  id: number;
  name: string;
  location: string;
  price: number;
}

interface LeadFormProps {
  onClose?: () => void;
  defaultTripId?: number;
  inline?: boolean;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onClose, defaultTripId, inline = false }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    trip_id: defaultTripId || 0,
    budget: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const data = await fetchTrips();
        setTrips(data.results || data || []);
      } catch (err) {
        console.error('Failed to load trips:', err);
      }
    };

    if (!defaultTripId) {
      loadTrips();
    }
  }, [defaultTripId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validation
    if (!formData.name || !formData.phone_number || !formData.email) {
      setError('Please fill all required fields');
      setIsLoading(false);
      return;
    }

    if (formData.trip_id === 0) {
      setError('Please select a trip');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/leads/', {
        name: formData.name,
        phone_number: formData.phone_number,
        email: formData.email,
        trip_id: formData.trip_id,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
      });

      setSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          phone_number: '',
          email: '',
          trip_id: defaultTripId || 0,
          budget: '',
        });
        setSuccess(false);
        if (onClose) {
          onClose();
        }
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to submit lead. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>Thank you! We'll contact you soon via WhatsApp.</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="John Doe"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="919876543210"
        />
        <p className="text-xs text-gray-500 mt-1">Include country code (e.g., 91 for India)</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      {/* Trip Selection (only if not defaultTripId) */}
      {!defaultTripId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interested Trip <span className="text-red-500">*</span>
          </label>
          <select
            name="trip_id"
            value={formData.trip_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value={0}>Select a trip</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name} - {trip.location} (₹{trip.price.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Budget (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Budget (Optional)
        </label>
        <input
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="10000"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || success}
        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Submitting...
          </>
        ) : success ? (
          <>
            <Check className="w-5 h-5" />
            Submitted!
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Get Free Consultation
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By submitting, you agree to receive WhatsApp messages from Trek & Stay
      </p>
    </form>
  );

  if (inline) {
    return <div className="bg-white rounded-lg p-6">{formContent}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Get Free Consultation</h2>
              <p className="text-gray-600 mt-1">We'll contact you on WhatsApp within 10 minutes</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {formContent}
        </div>
      </div>
    </div>
  );
};
