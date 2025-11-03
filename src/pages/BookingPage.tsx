import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchTrips, createBooking } from '../services/api';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Trip {
  id: number;
  name: string;
  price: number;
  location: string;
  duration_days: number;
  spots_available: number;
  image_url?: string;
}

export const BookingPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) return;

      try {
        const trips = await fetchTrips();
        const data = trips.find((t: Trip) => t.id === parseInt(tripId));
        if (data) {
          setTrip(data);
        } else {
          setError('Trip not found');
        }
      } catch (err) {
        setError('Failed to load trip details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  const totalPrice = trip ? trip.price * numberOfPeople : 0;
  const discount = numberOfPeople >= 3 ? Math.floor(totalPrice * 0.1) : 0;
  const finalPrice = totalPrice - discount;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!trip || !user) {
      setError('Trip or user information missing');
      return;
    }

    if (numberOfPeople > trip.spots_available) {
      setError(`Only ${trip.spots_available} spots available`);
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = await createBooking({
        trip: trip.id,
        seats: numberOfPeople,
        traveler_name: user.username || 'Guest',
        traveler_phone: user.phone || '',
        traveler_email: user.email,
        notes: specialRequests || undefined,
      });

      setSuccess(`Booking successful! Booking ID: ${booking.id}`);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create booking';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Trip not found</p>
          <button
            onClick={() => navigate('/trips')}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
          >
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-emerald-600 hover:text-emerald-700 mb-4 font-medium"
          >
             Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
          <p className="text-gray-600 mt-2">Secure your spot on this amazing trek</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
             {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmitBooking} className="space-y-8">
              {/* Trip Summary */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Summary</h2>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Trip:</strong> {trip.name}</p>
                  <p><strong>Location:</strong> {trip.location}</p>
                  <p><strong>Duration:</strong> {trip.duration_days} days</p>
                  <p><strong>Price per person:</strong> ₹{trip.price.toLocaleString()}</p>
                </div>
              </div>

              {/* Number of People */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  How many people are joining?
                </label>
                <div className="space-y-4">
                  {/* Number Selection */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <ChevronDown size={20} />
                    </button>
                    <input
                      type="number"
                      value={numberOfPeople}
                      onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max={trip.spots_available}
                      className="w-20 text-center border border-gray-300 rounded-lg px-4 py-2 text-xl font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setNumberOfPeople(Math.min(trip.spots_available, numberOfPeople + 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <ChevronUp size={20} />
                    </button>
                    <span className="text-gray-600">
                      (Max: {trip.spots_available} people)
                    </span>
                  </div>

                  {/* Discount Alert */}
                  {numberOfPeople >= 3 && discount > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                       Group discount! Save ₹{discount.toLocaleString()} (10% off)
                    </div>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any dietary restrictions, allergies, or special needs?"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Traveler Info (Pre-filled if logged in) */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Traveler Information</h3>
                {user ? (
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Name:</strong> {user.username || 'N/A'}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                  </div>
                ) : (
                  <p className="text-gray-600">Please log in to continue booking</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !user}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Price Summary</h3>

              <div className="space-y-4 mb-6 border-b pb-6">
                <div className="flex justify-between text-gray-600">
                  <span>₹{trip.price.toLocaleString()}  {numberOfPeople} people</span>
                  <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Group Discount (10%)</span>
                    <span className="font-semibold">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Final Price */}
              <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Total Price</p>
                <p className="text-3xl font-bold text-emerald-600">₹{finalPrice.toLocaleString()}</p>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3">Payment Methods</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p> Credit/Debit Card</p>
                  <p> UPI (Google Pay, PhonePe)</p>
                  <p> Net Banking</p>
                  <p> Wallet</p>
                </div>
              </div>

              {/* Policy */}
              <div className="text-xs text-gray-500">
                <p> Free cancellation up to 7 days before</p>
                <p> Instant confirmation</p>
                <p> Secure payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
