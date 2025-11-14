import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [seatLockCountdown, setSeatLockCountdown] = useState<number>(0);
  
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
      setError(null);
      // Automatically lock seats for 10 minutes
      try {
        setLoading(true);
        const lockData = await acquireSeatLock(tripId, 1); // Default 1 seat
        setSeatLockId(lockData.id);
        setSeatLockCountdown(600); // 10 minutes
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '';
        if (errorMessage.includes('not available') || errorMessage.includes('taken')) {
          setError('⚠️ Sorry, this trip is fully booked. Please try another trip.');
        } else {
          setError('❌ Failed to reserve seats. Please try again.');
        }
        return;
      } finally {
        setLoading(false);
      }
      setStep('details');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTrips();
    }
  }, [isOpen]);

  // Countdown timer for seat lock (10 minutes = 600 seconds)
  // Timer starts when seat lock is acquired and continues through all steps
  useEffect(() => {
    if (seatLockCountdown > 0) {
      const timer = setTimeout(() => {
        setSeatLockCountdown(seatLockCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (seatLockCountdown === 0 && seatLockId) {
      // Lock expired
      setError('⏰ Seat reservation expired. Please start over.');
      setSeatLockId(null);
      setStep('select');
    }
  }, [seatLockCountdown, seatLockId]);

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
      setError(null);
      setLoading(true);
      // Re-acquire lock with updated seat count if it changed
      if (bookingData.seats !== 1) {
        const lockData = await acquireSeatLock(bookingData.trip.id, bookingData.seats);
        setSeatLockId(lockData.id);
        setSeatLockCountdown(600); // 10 minutes
      }
      setStep('payment');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('not available') || errorMessage.includes('taken')) {
        setError('⚠️ Sorry, these seats are no longer available. Please select a different number or try another trip.');
      } else {
        setError('❌ Failed to reserve seats. Please check your details and try again.');
      }
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 md:p-6 rounded-t-xl sm:rounded-t-2xl z-10 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">Book Your Adventure</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Step {step === 'select' ? '1' : step === 'details' ? '2' : step === 'payment' ? '3' : '4'} of 4
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content - Compact layout */}
        <div className="p-3 sm:p-4 md:p-6 overflow-y-auto flex-1 max-h-[calc(95vh-80px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Step 1: Trip Selection */}
          {step === 'select' && (
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Choose Your Adventure</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {trips.slice(0, 3).map(trip => (
                  <motion.div
                    key={trip.id}
                    whileHover={{ scale: 1.02 }}
                    className="border-2 border-gray-300 rounded-lg p-2 sm:p-3 cursor-pointer hover:shadow-md hover:border-orange-500 transition-all"
                    onClick={() => selectTrip(trip.id)}
                  >
                    {trip.image_url && (
                      <img 
                        src={trip.image_url} 
                        alt={trip.name}
                        className="w-full h-24 sm:h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <h4 className="font-semibold text-gray-800 text-xs sm:text-sm">{trip.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{trip.location}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="font-bold text-orange-600">₹{trip.price.toLocaleString()}</span>
                      <span className="text-gray-500">{trip.spots_available} left</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              {trips.length > 3 && (
                <p className="text-xs text-gray-500 mt-3 text-center">Showing 3 popular trips • Visit our full catalog for more options</p>
              )}
            </div>
          )}

          {/* Step 2: Traveler Details */}
          {step === 'details' && bookingData.trip && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Traveler Details</h3>
              
              {/* Seat Lock Status - Important! */}
              {seatLockId && seatLockCountdown > 0 && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 sm:p-4 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🔒</div>
                    <div>
                      <p className="font-semibold text-green-700">Seats Reserved!</p>
                      <p className="text-xs text-green-600">Your seats are locked for</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {String(Math.floor(seatLockCountdown / 60)).padStart(2, '0')}:{String(seatLockCountdown % 60).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-green-600">minutes</p>
                  </div>
                </div>
              )}
              
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Number of Travelers</label>
                    <select
                      value={bookingData.seats}
                      onChange={(e) => updateBookingData('seats', parseInt(e.target.value))}
                      className="w-full px-3 sm:px-4 py-3 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium min-h-[44px] text-sm sm:text-base"
                    >
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'traveler' : 'travelers'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={bookingData.travelerName}
                    onChange={(e) => updateBookingData('travelerName', e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium min-h-[44px] text-sm sm:text-base"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={bookingData.travelerPhone}
                      onChange={(e) => updateBookingData('travelerPhone', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium min-h-[44px] text-sm sm:text-base"
                      placeholder="+91 9902937730"
                      inputMode="tel"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={bookingData.travelerEmail}
                      onChange={(e) => updateBookingData('travelerEmail', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium min-h-[44px] text-sm sm:text-base"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) => updateBookingData('notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-xs sm:text-sm"
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
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Payment & Confirmation</h3>
              
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 mb-6">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium text-sm sm:text-base">Seats Reserved!</span>
                </div>
                <p className="text-xs sm:text-sm text-green-600">
                  Your seats are temporarily reserved. Complete payment within 10 minutes to confirm your booking.
                </p>
              </div>

              {/* Countdown Timer - Visual indicator */}
              {seatLockCountdown > 0 && (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 sm:p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl sm:text-3xl font-bold text-orange-600">
                          {String(Math.floor(seatLockCountdown / 60)).padStart(2, '0')}:{String(seatLockCountdown % 60).padStart(2, '0')}
                        </span>
                        <span className="text-xs text-orange-600 font-medium">Time Left</span>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-orange-700">Time Limit Active</p>
                        <p className="text-xs text-orange-600">Complete payment to finalize</p>
                      </div>
                    </div>
                    {/* Progress indicator */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                      background: `conic-gradient(rgb(249, 115, 22) ${(seatLockCountdown / 600) * 360}deg, rgb(254, 243, 224) 0deg)`
                    }}>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold text-orange-600">
                        {Math.round((seatLockCountdown / 600) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              <div className="border rounded-lg p-3 sm:p-4 mb-6">
                <h4 className="font-semibold mb-3 text-sm sm:text-base">Booking Summary</h4>
                <div className="space-y-2 text-xs sm:text-sm">
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
                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-orange-600">₹{((bookingData.trip?.price || 0) * bookingData.seats).toLocaleString()}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
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

              <div className="flex flex-col sm:flex-row gap-3 justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep('details')} className="text-xs sm:text-base py-2 sm:py-3 min-h-[44px]">
                  Back to Details
                </Button>
                <Button onClick={completeBooking} disabled={loading} className="text-xs sm:text-base py-2 sm:py-3 min-h-[44px]">
                  <CreditCard className="w-4 h-4 mr-1 sm:mr-2" />
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirmation' && (
            <div className="text-center">
              <div className="mb-6">
                <CheckCircle className="w-12 sm:w-16 h-12 sm:h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Your adventure is booked! You'll receive a confirmation email shortly with all the details.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-6">
                <h4 className="font-semibold text-green-800 mb-2 text-xs sm:text-sm">What's Next?</h4>
                <ul className="text-xs sm:text-sm text-green-700 space-y-1">
                  <li>• Check your email for detailed itinerary</li>
                  <li>• Our team will contact you with pre-trip instructions</li>
                  <li>• Complete balance payment before the trip</li>
                  <li>• Get ready for an amazing adventure!</li>
                </ul>
              </div>

              <Button onClick={onClose} className="w-full py-2 sm:py-3 min-h-[44px] text-sm sm:text-base">
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
