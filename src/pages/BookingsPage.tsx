import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Download,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/layout/PageTransition';
import { format } from 'date-fns';
import { LocalScene } from '../components/3d/LocalScene';

interface Booking {
  id: string;
  destination: string;
  location: string;
  bookingDate: Date;
  travelDate: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  participants: number;
  totalAmount: number;
  bookingRef: string;
  image: string;
  duration: string;
}

const sampleBookings: Booking[] = [
  {
    id: '1',
    destination: 'Jog Falls Adventure',
    location: 'Sagara, Karnataka',
    bookingDate: new Date('2024-12-15'),
    travelDate: new Date('2025-01-20'),
    status: 'confirmed',
    participants: 2,
    totalAmount: 4998,
    bookingRef: 'TKS001234',
    image: 'https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: '2 days'
  },
  {
    id: '2',
    destination: 'Hampi Heritage Trek',
    location: 'Hampi, Karnataka',
    bookingDate: new Date('2024-12-10'),
    travelDate: new Date('2025-02-15'),
    status: 'pending',
    participants: 4,
    totalAmount: 15996,
    bookingRef: 'TKS001235',
    image: 'https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: '3 days'
  },
  {
    id: '3',
    destination: 'Kodachadri Peak Expedition',
    location: 'Shimoga, Karnataka',
    bookingDate: new Date('2024-11-25'),
    travelDate: new Date('2024-12-20'),
    status: 'cancelled',
    participants: 1,
    totalAmount: 1999,
    bookingRef: 'TKS001236',
    image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: '2 days'
  }
];

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = booking.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingRef.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusConfig = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50',
          text: 'Confirmed'
        };
      case 'pending':
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          text: 'Pending'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          text: 'Cancelled'
        };
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      )
    );
  };

  const BookingModal = ({ booking, onClose }: { booking: Booking; onClose: () => void }) => (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-oswald font-bold text-forest-green">
              Booking Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Image */}
            <div className="relative h-48 rounded-xl overflow-hidden">
              <img
                src={booking.image}
                alt={booking.destination}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-oswald font-bold">{booking.destination}</h3>
                <p className="text-sm opacity-90">{booking.location}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Booking Reference</label>
                  <p className="text-lg font-oswald font-bold text-forest-green">{booking.bookingRef}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Travel Date</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-adventure-orange" />
                    <p className="text-gray-900">{format(booking.travelDate, 'PPP')}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-4 h-4 text-adventure-orange" />
                    <p className="text-gray-900">{booking.duration}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    {(() => {
                      const config = getStatusConfig(booking.status);
                      const Icon = config.icon;
                      return (
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${config.bg}`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className={`font-medium ${config.color}`}>{config.text}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Participants</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Users className="w-4 h-4 text-adventure-orange" />
                    <p className="text-gray-900">{booking.participants} person{booking.participants > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Total Amount</label>
                  <p className="text-2xl font-oswald font-bold text-forest-green">
                    ₹{booking.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t">
              <Button variant="adventure" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Voucher
              </Button>
              {booking.status === 'confirmed' && (
                <Button variant="secondary">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modify
                </Button>
              )}
              {booking.status !== 'cancelled' && (
                <Button
                  variant="ghost"
                  onClick={() => handleCancelBooking(booking.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-stone-gray pt-24 pb-16 relative">
        <div className="absolute top-6 right-8 opacity-50">
          <LocalScene variant="fireflies" size={160} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-6xl font-oswald font-bold text-forest-green mb-4">
              My Adventures
            </h1>
            <p className="text-xl text-mountain-blue font-inter max-w-3xl mx-auto">
              Track your bookings, download vouchers, and manage your upcoming adventures.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by destination, location, or booking reference..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-adventure-orange focus:border-transparent transition-all duration-200 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
                { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
                { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as typeof filter)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    filter === filterOption.key
                      ? 'bg-adventure-orange text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">{filterOption.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    filter === filterOption.key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {filterOption.count}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Bookings List */}
          {filteredBookings.length > 0 ? (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {filteredBookings.map((booking, index) => {
                const statusConfig = getStatusConfig(booking.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <div className="flex flex-col lg:flex-row">
                        {/* Image */}
                        <div className="lg:w-80 h-48 lg:h-auto relative">
                          <img
                            src={booking.image}
                            alt={booking.destination}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Status Badge */}
                          <div className="absolute top-4 right-4">
                            <div className={`flex items-center space-x-1 backdrop-blur-sm rounded-full px-3 py-1 ${statusConfig.bg}`}>
                              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                              <span className={`text-sm font-medium ${statusConfig.color}`}>
                                {statusConfig.text}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl lg:text-2xl font-oswald font-bold text-forest-green mb-1">
                                {booking.destination}
                              </h3>
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{booking.location}</span>
                              </div>
                              <p className="text-sm text-gray-500 font-mono">
                                Ref: {booking.bookingRef}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-oswald font-bold text-forest-green">
                                ₹{booking.totalAmount.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                for {booking.participants} person{booking.participants > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="w-4 h-4 text-adventure-orange" />
                              <div>
                                <p className="text-sm font-medium">Travel Date</p>
                                <p className="text-sm">{format(booking.travelDate, 'MMM dd, yyyy')}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Clock className="w-4 h-4 text-adventure-orange" />
                              <div>
                                <p className="text-sm font-medium">Duration</p>
                                <p className="text-sm">{booking.duration}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 text-gray-600">
                              <Users className="w-4 h-4 text-adventure-orange" />
                              <div>
                                <p className="text-sm font-medium">Booked on</p>
                                <p className="text-sm">{format(booking.bookingDate, 'MMM dd, yyyy')}</p>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3">
                            <Button
                              variant="adventure"
                              size="sm"
                              onClick={() => handleViewDetails(booking)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            
                            {booking.status === 'confirmed' && (
                              <>
                                <Button variant="secondary" size="sm">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Voucher
                                </Button>
                                <Button variant="secondary" size="sm">
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Modify Booking
                                </Button>
                              </>
                            )}
                            
                            {booking.status !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-oswald font-bold text-gray-600 mb-2">
                {searchTerm || filter !== 'all' ? 'No bookings found' : 'No adventures yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : "Start your adventure journey by exploring our amazing destinations."
                }
              </p>
              <Button variant="adventure">
                {searchTerm || filter !== 'all' ? 'Clear Filters' : 'Explore Destinations'}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && selectedBooking && (
            <BookingModal 
              booking={selectedBooking} 
              onClose={() => setShowModal(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default BookingsPage;
