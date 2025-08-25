import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { 
  fetchTrips, 
  acquireSeatLock, 
  createBooking,
  type Trip 
} from '../../services/api';

interface BookingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTripId?: number;
  onBookingComplete?: (bookingId: string) => void;
}

interface BookingData {
  trip: Trip | null;
  seats: number;
  travelerName: string;
  travelerPhone: string;
  travelerEmail: string;
  notes: string;
}

type BookingStep = 'select' | 'details' | 'payment' | 'confirmation';

const BookingFlow: React.FC<BookingFlowProps> = ({
  isOpen,
  onClose,
  selectedTripId,
  onBookingComplete
}) => {
  const [step, setStep] = useState<BookingStep>('select');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seatLockId, setSeatLockId] = useState<string | null>(null);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    trip: null,
    seats: 1,
    travelerName: '',
    travelerPhone: '',
    travelerEmail: '',
    notes: ''
  });

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await fetchTrips();
      setTrips(data);
    } catch {
      setError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const selectTrip = async (tripId: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      setBookingData(prev => ({ ...prev, trip }));
      setStep('details');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTrips();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleTripSelection = () => {
      if (selectedTripId && trips.length > 0) {
        const trip = trips.find(t => t.id === selectedTripId);
        if (trip) {
          setBookingData(prev => ({ ...prev, trip }));
          setStep('details');
        }
      }
    };
    
    handleTripSelection();
  }, [selectedTripId, trips]);

  const acquireSeats = async () => {
    if (!bookingData.trip) return;
    
    try {
      setLoading(true);
      const lockData = await acquireSeatLock(bookingData.trip.id, bookingData.seats);
      setSeatLockId(lockData.id);
      setStep('payment');
    } catch {
      setError('Failed to acquire seats. They may be taken by another user.');
    } finally {
      setLoading(false);
    }
  };

  const completeBooking = async () => {
    if (!bookingData.trip || !seatLockId) return;

    try {
      setLoading(true);
      const booking = await createBooking({
        trip: bookingData.trip.id,
        seats: bookingData.seats,
        traveler_name: bookingData.travelerName,
        traveler_phone: bookingData.travelerPhone,
        traveler_email: bookingData.travelerEmail,
        notes: bookingData.notes
      });
      
      setStep('confirmation');
      onBookingComplete?.(booking.id);
    } catch {
      setError('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingData = (field: keyof BookingData, value: string | number | Trip | null) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Book Your Adventure</h2>
            <p className="text-gray-600">
              Step {step === 'select' ? '1' : step === 'details' ? '2' : step === 'payment' ? '3' : '4'} of 4
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Step 1: Trip Selection */}
          {step === 'select' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Choose Your Adventure</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trips.map(trip => (
                  <motion.div
                    key={trip.id}
                    whileHover={{ scale: 1.02 }}
                    className="border rounded-lg p-4 cursor-pointer hover:shadow-md"
                    onClick={() => selectTrip(trip.id)}
                  >
                    {trip.image_url && (
                      <img 
                        src={trip.image_url} 
                        alt={trip.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h4 className="font-semibold text-gray-800">{trip.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <MapPin className="w-4 h-4" />
                      {trip.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4" />
                      {trip.duration_days} days
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-orange-600">₹{trip.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">{trip.spots_available} spots left</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Traveler Details */}
          {step === 'details' && bookingData.trip && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Traveler Details</h3>
              
              {/* Trip Summary */}
              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{bookingData.trip.name}</h4>
                    <p className="text-gray-600">{bookingData.trip.location} • {bookingData.trip.duration_days} days</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">₹{bookingData.trip.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">per person</div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Travelers</label>
                    <select
                      value={bookingData.seats}
                      onChange={(e) => updateBookingData('seats', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'traveler' : 'travelers'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={bookingData.travelerName}
                    onChange={(e) => updateBookingData('travelerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={bookingData.travelerPhone}
                      onChange={(e) => updateBookingData('travelerPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="+91 9902937730"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={bookingData.travelerEmail}
                      onChange={(e) => updateBookingData('travelerEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) => updateBookingData('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Dietary restrictions, accessibility needs, etc."
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep('select')}>
                  Back to Trip Selection
                </Button>
                <Button 
                  onClick={acquireSeats}
                  disabled={!bookingData.travelerName || !bookingData.travelerPhone || !bookingData.travelerEmail || loading}
                >
                  {loading ? 'Securing Seats...' : 'Continue to Payment'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Payment & Confirmation</h3>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Seats Reserved!</span>
                </div>
                <p className="text-sm text-green-600">
                  Your seats are temporarily reserved. Complete payment within 10 minutes to confirm your booking.
                </p>
              </div>

              {/* Booking Summary */}
              <div className="border rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3">Booking Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Trip:</span>
                    <span className="font-medium">{bookingData.trip?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Travelers:</span>
                    <span>{bookingData.seats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per person:</span>
                    <span>₹{bookingData.trip?.price.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-orange-600">₹{((bookingData.trip?.price || 0) * bookingData.seats).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Advance (30%):</span>
                      <span>₹{Math.round(((bookingData.trip?.price || 0) * bookingData.seats) * 0.3).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Balance (due before trip):</span>
                      <span>₹{Math.round(((bookingData.trip?.price || 0) * bookingData.seats) * 0.7).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep('details')}>
                  Back to Details
                </Button>
                <Button onClick={completeBooking} disabled={loading}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirmation' && (
            <div className="text-center">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600">
                  Your adventure is booked! You'll receive a confirmation email shortly with all the details.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-800 mb-2">What's Next?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Check your email for detailed itinerary</li>
                  <li>• Our team will contact you with pre-trip instructions</li>
                  <li>• Complete balance payment before the trip</li>
                  <li>• Get ready for an amazing adventure!</li>
                </ul>
              </div>

              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingFlow;
