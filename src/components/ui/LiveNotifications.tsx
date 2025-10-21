import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  X,
  Zap,
  TrendingUp,
  Star
} from 'lucide-react';

interface BookingNotification {
  id: string;
  type: 'booking' | 'spot_alert' | 'price_drop' | 'weather_update' | 'offer' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  urgent?: boolean;
  actionable?: boolean;
  trek?: string;
  location?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

interface LiveNotificationsProps {
  className?: string;
  onNotificationAction?: (notificationId: string, action: string) => void;
}

const LiveNotifications: React.FC<LiveNotificationsProps> = ({
  className = '',
  onNotificationAction
}) => {
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Mock notification generator
  const generateMockNotifications = (): BookingNotification[] => [
    {
      id: '1',
      type: 'booking',
      title: 'New Booking Alert',
      message: 'Sarah from Mumbai just booked Rajmachi Trek for next weekend!',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      trek: 'Rajmachi Trek',
      location: 'Mumbai',
      icon: Users,
      color: 'green'
    },
    {
      id: '2',
      type: 'spot_alert',
      title: 'Limited Spots Available',
      message: 'Only 2 spots left for Harishchandragad Trek on Dec 15-16!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      urgent: true,
      actionable: true,
      trek: 'Harishchandragad Trek',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      id: '3',
      type: 'price_drop',
      title: 'Price Drop Alert',
      message: 'Kalsubai Trek price reduced by ₹500 for this weekend!',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      actionable: true,
      trek: 'Kalsubai Trek',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      id: '4',
      type: 'weather_update',
      title: 'Weather Update',
      message: 'Perfect weather conditions for Sinhagad Trek tomorrow!',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      trek: 'Sinhagad Trek',
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: '5',
      type: 'offer',
      title: 'Special Offer',
      message: 'Get 20% off on group bookings of 6+ people. Valid until midnight!',
      timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
      urgent: true,
      actionable: true,
      icon: Star,
      color: 'purple'
    },
    {
      id: '6',
      type: 'booking',
      title: 'Recent Booking',
      message: 'Amit and 3 friends booked Andharban Trek for next month',
      timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      trek: 'Andharban Trek',
      icon: Users,
      color: 'blue'
    }
  ];

  useEffect(() => {
    // Initial load
    setNotifications(generateMockNotifications());

    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotifications = [
        {
          id: Date.now().toString(),
          type: 'booking' as const,
          title: 'Live Booking',
          message: `${['Priya', 'Rahul', 'Sneha', 'Vikram', 'Anjali'][Math.floor(Math.random() * 5)]} just booked a trek!`,
          timestamp: new Date(),
          trek: ['Rajmachi', 'Kalsubai', 'Sinhagad', 'Harishchandragad'][Math.floor(Math.random() * 4)] + ' Trek',
          icon: Users,
          color: 'green' as const
        }
      ];

      setNotifications(prev => [...newNotifications, ...prev.slice(0, 9)]); // Keep only 10 notifications
    }, 30000); // New notification every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getColorClasses = (color: string, variant: 'bg' | 'text' | 'border') => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
      red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' }
    };
    return colors[color as keyof typeof colors][variant];
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAction = (notificationId: string, action: string) => {
    onNotificationAction?.(notificationId, action);
    if (action === 'dismiss') {
      removeNotification(notificationId);
    }
  };

  if (!isVisible || notifications.length === 0) return null;

  return (
    <motion.div
      className={`fixed top-4 right-4 w-96 max-h-[80vh] z-50 ${className}`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Bell className="w-6 h-6" />
              </motion.div>
              <div>
                <h3 className="font-semibold">Live Updates</h3>
                <p className="text-blue-100 text-sm">{notifications.length} notifications</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence>
            {notifications.map((notification, index) => {
              const Icon = notification.icon || Bell;
              return (
                <motion.div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    notification.urgent ? 'bg-red-50' : ''
                  }`}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 100, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300
                  }}
                  layout
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-full ${getColorClasses(notification.color || 'blue', 'bg')}`}>
                      <Icon className={`w-4 h-4 ${getColorClasses(notification.color || 'blue', 'text')}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {notification.title}
                            {notification.urgent && (
                              <motion.span
                                className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            )}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {/* Meta information */}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{getTimeAgo(notification.timestamp)}</span>
                            </div>
                            {notification.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{notification.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Trek badge */}
                          {notification.trek && (
                            <div className="mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                getColorClasses(notification.color || 'blue', 'bg')
                              } ${getColorClasses(notification.color || 'blue', 'text')}`}>
                                {notification.trek}
                              </span>
                            </div>
                          )}

                          {/* Action buttons */}
                          {notification.actionable && (
                            <div className="flex space-x-2 mt-3">
                              <button
                                onClick={() => handleAction(notification.id, 'view')}
                                className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                {notification.type === 'spot_alert' ? 'Book Now' : 
                                 notification.type === 'price_drop' ? 'View Deal' :
                                 notification.type === 'offer' ? 'Claim Offer' : 'View'}
                              </button>
                              <button
                                onClick={() => handleAction(notification.id, 'dismiss')}
                                className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-300 transition-colors"
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Close button */}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors ml-2"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Zap className="w-4 h-4 text-green-500" />
                <span>Live updates enabled</span>
              </div>
              <button
                onClick={() => setNotifications([])}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Show/Hide toggle when hidden */}
      {!isVisible && (
        <motion.button
          onClick={() => setIsVisible(true)}
          className="fixed top-4 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <motion.span
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {notifications.length > 9 ? '9+' : notifications.length}
            </motion.span>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};

export default LiveNotifications;
