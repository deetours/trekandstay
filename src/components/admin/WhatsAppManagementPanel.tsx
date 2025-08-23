import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { whatsappAPI } from '../../services/adminAPI';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  CheckCheck, 
  Check, 
  Bot,
  MoreVertical,
  Settings,
  Search,
  Zap
} from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  content: string;
  timestamp: Date;
  isFromCustomer: boolean;
  type: 'text' | 'image' | 'document' | 'audio';
  status: 'sent' | 'delivered' | 'read';
  isAI?: boolean;
}

interface ApiConversation {
  id: string;
  customerName: string;
  customerPhone: string | undefined;
  customerAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: WhatsAppMessage[];
  status: string;
  priority: 'high' | 'medium' | 'low';
  tags: (string | undefined)[];
  tripInterest?: string;
}

interface WhatsAppConversation {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastMessageTime: Date;
  isUnread: boolean;
  messages: WhatsAppMessage[];
  status: 'active' | 'archived' | 'pending';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  tripInterest?: string;
}

interface WhatsAppManagementPanelProps {
  isVisible: boolean;
}

function WhatsAppManagementPanel({ isVisible }: WhatsAppManagementPanelProps) {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus] = useState<'all' | 'unread' | 'archived'>('all');
  const [aiMode, setAiMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      loadConversations();
    }
  }, [isVisible]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const result = await whatsappAPI.getConversations();
      if (result.conversations) {
        setConversations(result.conversations.map((conv: ApiConversation) => ({
          ...conv,
          tags: (conv.tags ?? []).filter((tag): tag is string => typeof tag === 'string'),
          isUnread: conv.unreadCount > 0,
          status: conv.status as 'active' | 'archived' | 'pending'
        })) as WhatsAppConversation[]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const result = await whatsappAPI.getConversationMessages(conversationId);
      if (result.messages) {
        const conversation = conversations.find((c: WhatsAppConversation) => c.id === conversationId);
        if (conversation) {
          conversation.messages = result.messages as WhatsAppMessage[];
          setConversations([...conversations]);
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const result = await whatsappAPI.sendMessage(selectedConversation, newMessage);
      
      if (result.success) {
        loadConversationMessages(selectedConversation);
      } else {
        // Fallback to local state update
        const conversation = conversations.find((c: WhatsAppConversation) => c.id === selectedConversation);
        if (conversation) {
          const newMsg: WhatsAppMessage = {
            id: Date.now().toString(),
            content: newMessage,
            timestamp: new Date(),
            isFromCustomer: false,
            type: 'text',
            status: 'sent',
            isAI: aiMode
          };

          conversation.messages = [...conversation.messages, newMsg];
          conversation.lastMessage = newMessage;
          conversation.lastMessageTime = new Date();
          
          setConversations([...conversations]);
        }
      }
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    loadConversationMessages(conversationId);
  };

  const selectedConversationData = conversations.find((c: WhatsAppConversation) => c.id === selectedConversation);

  const filteredConversations = conversations.filter((conv: WhatsAppConversation) => {
    const matchesSearch = conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.customerPhone.includes(searchQuery) ||
                         conv.tripInterest?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || conv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read': return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case 'delivered': return <CheckCheck className="w-4 h-4 text-gray-500" />;
      case 'sent': return <Check className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden h-full"
    >
      <div className="flex h-full">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                WhatsApp Conversations
              </h3>
              <div className="flex space-x-2">
                <Button
                  onClick={loadConversations}
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                >
                  <Zap className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No conversations found</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map((conversation: WhatsAppConversation) => (
                  <motion.div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conversation.id ? 'bg-green-50 border-r-2 border-green-500' : ''
                    }`}
                    whileHover={{ x: 2 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.customerName}
                          </p>
                          <div className="flex items-center space-x-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(conversation.priority)}`}>
                              {conversation.priority}
                            </span>
                            {conversation.isUnread && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {conversation.lastMessage}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{conversation.lastMessageTime.toLocaleTimeString()}</span>
                          <div className="flex space-x-1">
                            {conversation.tags.map((tag: string) => (
                              <span key={tag} className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {selectedConversationData ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedConversationData.customerName}
                      </h3>
                      <p className="text-sm text-gray-500">{selectedConversationData.customerPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setAiMode(!aiMode)}
                      size="sm"
                      variant={aiMode ? "primary" : "ghost"}
                      className={`transition-colors ${aiMode ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-50'}`}
                    >
                      <Bot className={`w-4 h-4 ${aiMode ? 'text-white' : 'text-purple-600'}`} />
                      {aiMode ? 'AI On' : 'AI Off'}
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {selectedConversationData.messages.map((message: WhatsAppMessage) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isFromCustomer
                            ? 'bg-gray-100 text-gray-800'
                            : message.isAI
                            ? 'bg-purple-600 text-white'
                            : 'bg-green-500 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-between mt-1 text-xs ${
                          message.isFromCustomer ? 'text-gray-500' : 'text-green-100'
                        }`}>
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {!message.isFromCustomer && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={aiMode ? "Type your message (AI assistance enabled)..." : "Type your message..."}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`${aiMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No conversation selected</p>
                <p className="text-sm">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default WhatsAppManagementPanel;
