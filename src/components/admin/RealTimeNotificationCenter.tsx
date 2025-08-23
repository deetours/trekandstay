import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { 
  Bell, 
  MessageSquare, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  User,
  Mail,
  DollarSign,
  Zap,
  X,
  Settings,
  BellRing,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react';

interface WhatsAppMetadata {
  customerName: string;
  phone: string;
}

interface BookingMetadata {
  customerName: string;
  tripName: string;
  amount: number;
}

interface LeadMetadata {
  leadId: string;
  customerName: string;
  email: string;
  source: string;
}

interface SystemMetadata {
  taskId: string;
  component: string;
  action: string;
  severity?: 'low' | 'medium' | 'high';
}

type NotificationMetadata = WhatsAppMetadata | BookingMetadata | LeadMetadata | SystemMetadata | Record<string, unknown>;

interface Notification {
  id: string;
  type: 'whatsapp' | 'booking' | 'lead' | 'system' | 'ai_insight' | 'task' | 'payment';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  metadata?: NotificationMetadata;
  channel: 'web' | 'mobile' | 'email' | 'sms';
}

export default function RealTimeNotificationCenter() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'high' | 'actionable'>('all');
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [pushEnabled] = React.useState(true);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Mock real-time notifications
  React.useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'whatsapp',
        title: 'New WhatsApp Message',
        message: 'Sarah Johnson: "Thanks for the pricing info! When is the next departure?"',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        isRead: false,
        priority: 'high',
        actionable: true,
        metadata: { customerName: 'Sarah Johnson', phone: '+1234567890' },
        channel: 'web'
      },
      {
        id: '2',
        type: 'booking',
        title: 'New Booking Confirmed',
        message: 'Mike Chen booked "Desert Safari Adventure" for $2,499',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isRead: false,
        priority: 'high',
        actionable: true,
        metadata: { customerName: 'Mike Chen', amount: 2499, trip: 'Desert Safari Adventure' },
        channel: 'web'
      },
      {
        id: '3',
        type: 'ai_insight',
        title: 'AI Insight: Lead Opportunity',
        message: 'Emma Wilson shows high conversion potential based on engagement patterns',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        isRead: true,
        priority: 'medium',
        actionable: true,
        metadata: { leadId: 'emma_wilson_123', score: 0.87 },
        channel: 'web'
      },
      {
        id: '4',
        type: 'lead',
        title: 'Lead Stage Updated',
        message: 'John Smith moved from "Interested" to "Qualified"',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isRead: true,
        priority: 'medium',
        actionable: false,
        metadata: { leadId: 'john_smith_456', fromStage: 'interested', toStage: 'qualified' },
        channel: 'web'
      },
      {
        id: '5',
        type: 'system',
        title: 'WhatsApp API Status',
        message: 'WhatsApp service temporarily unavailable. Automatic retry in progress.',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        isRead: false,
        priority: 'high',
        actionable: true,
        metadata: { service: 'whatsapp_api', status: 'degraded' },
        channel: 'web'
      },
      {
        id: '6',
        type: 'task',
        title: 'Task Due Soon',
        message: 'Follow up with Lisa Brown is due in 30 minutes',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        isRead: false,
        priority: 'medium',
        actionable: true,
        metadata: { taskId: 'task_789', customerName: 'Lisa Brown', dueIn: 30 },
        channel: 'web'
      },
      {
        id: '7',
        type: 'payment',
        title: 'Payment Received',
        message: 'Payment of $1,299 received from David Kim for Beach Paradise Getaway',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        isRead: true,
        priority: 'medium',
        actionable: false,
        metadata: { amount: 1299, customerName: 'David Kim', trip: 'Beach Paradise Getaway' },
        channel: 'web'
      }
    ];

    setNotifications(mockNotifications);

    // Simulate real-time notifications
    const interval = setInterval(() => {
      const types: Array<'whatsapp' | 'lead' | 'ai_insight'> = ['whatsapp', 'lead', 'ai_insight'];
      const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: types[Math.floor(Math.random() * types.length)],
        title: 'New Update',
        message: 'This is a simulated real-time notification',
        timestamp: new Date(),
        isRead: false,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        actionable: Math.random() > 0.5,
        channel: 'web'
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
    }, 30000); // New notification every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.isRead;
      case 'high': return notification.priority === 'high';
      case 'actionable': return notification.actionable;
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'booking': return <Calendar className="w-4 h-4" />;
      case 'lead': return <User className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'ai_insight': return <Zap className="w-4 h-4" />;
      case 'task': return <CheckCircle className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-50';
    
    switch (type) {
      case 'whatsapp': return 'text-green-600 bg-green-50';
      case 'booking': return 'text-blue-600 bg-blue-50';
      case 'lead': return 'text-purple-600 bg-purple-50';
      case 'system': return 'text-orange-600 bg-orange-50';
      case 'ai_insight': return 'text-indigo-600 bg-indigo-50';
      case 'task': return 'text-teal-600 bg-teal-50';
      case 'payment': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Type guards for notification metadata
  const isWhatsAppNotification = (metadata: NotificationMetadata | undefined): metadata is WhatsAppMetadata => {
    return metadata !== undefined && 'customerName' in metadata && 'phone' in metadata;
  };

  const isBookingNotification = (metadata: NotificationMetadata | undefined): metadata is BookingMetadata => {
    return metadata !== undefined && 'customerName' in metadata && 'bookingId' in metadata;
  };

  const isLeadNotification = (metadata: NotificationMetadata | undefined): metadata is LeadMetadata => {
    return metadata !== undefined && 'leadId' in metadata && 'source' in metadata;
  };

  const isSystemNotification = (metadata: NotificationMetadata | undefined): metadata is SystemMetadata => {
    return metadata !== undefined && 'taskId' in metadata && 'severity' in metadata;
  };

  const handleNotificationAction = (notification: Notification) => {
    switch (notification.type) {
      case 'whatsapp':
        // Navigate to WhatsApp management
        if (isWhatsAppNotification(notification.metadata)) {
          console.log('Opening WhatsApp management for:', notification.metadata.customerName);
        }
        break;
      case 'booking':
        // Navigate to booking details
        if (isBookingNotification(notification.metadata)) {
          console.log('Opening booking details for:', notification.metadata.customerName);
        }
        break;
      case 'lead':
        // Navigate to lead management
        if (isLeadNotification(notification.metadata)) {
          console.log('Opening lead details for:', notification.metadata.leadId);
        }
        break;
      case 'ai_insight':
        // Show AI insight details
        console.log('Showing AI insight:', notification.metadata);
        break;
      case 'task':
        // Navigate to task management
        if (isSystemNotification(notification.metadata)) {
          console.log('Opening task:', notification.metadata.taskId);
        }
        break;
      default:
        console.log('No specific action for notification type:', notification.type);
    }
    markAsRead(notification.id);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="secondary"
        size="sm"
        className="relative"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </Button>

      {/* Notification Panel */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BellRing className="w-5 h-5 mr-2 text-blue-600" />
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'high', label: 'Urgent', count: notifications.filter(n => n.priority === 'high').length },
                { key: 'actionable', label: 'Action', count: notifications.filter(n => n.actionable).length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as 'all' | 'unread' | 'high' | 'actionable')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    filter === tab.key
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={markAllAsRead}
                className="mt-2 w-full"
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationAction(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          {notification.priority === 'high' && (
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          )}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        <div className="flex items-center space-x-1">
                          {notification.actionable && (
                            <Badge variant="secondary" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                          <div className="text-xs text-gray-400">
                            {notification.channel === 'web' ? <Monitor className="w-3 h-3" /> :
                             notification.channel === 'mobile' ? <Smartphone className="w-3 h-3" /> :
                             notification.channel === 'email' ? <Mail className="w-3 h-3" /> :
                             <Globe className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${pushEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span>Push notifications</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${soundEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span>Sound alerts</span>
                </div>
              </div>
              <Button size="sm" variant="ghost">
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
