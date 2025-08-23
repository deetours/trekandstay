// Speech recognition vendor API guarded usage (no explicit interface to avoid TS conflicts)
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Minimize2, Mic, MicOff, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { useAdventureStore } from '../../store/adventureStore';
import { userIntelligenceService, AIRecommendation } from '../../services/userIntelligence';
import { 
  getDashboardSummary, 
  fetchTrips, 
  fetchTripHistory, 
  fetchTripRecommendations,
  type Trip,
  type TripHistory,
  type TripRecommendation as ApiTripRecommendation,
  type DashboardSummary
} from '../../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  recommendations?: AIRecommendation[];
  actionButtons?: ActionButton[];
}

interface ActionButton {
  label: string;
  action: string;
  variant: 'primary' | 'secondary' | 'ghost';
  data?: AIRecommendation | string | number | object | undefined;
}

interface AITravelAssistantProps {
  className?: string;
  minimized?: boolean;
}

const SUGGESTED_PROMPTS = [
  "What's my ideal travel destination?",
  "Plan a weekend getaway within ₹15,000",
  "When should I book my next trip?",
  "Show me budget-friendly mountain destinations",
  "What destinations match my travel personality?"
];

const AITravelAssistant: React.FC<AITravelAssistantProps> = ({ 
  className = "",
  minimized: initialMinimized = false
}) => {
  const { user } = useAdventureStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(initialMinimized);
  const [isListening, setIsListening] = useState(false);
  const [aiPersonality, setAiPersonality] = useState<import('../../services/userIntelligence').TravelPersonality | null>(null);
  
  // Real user data state
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [userTripHistory, setUserTripHistory] = useState<TripHistory[]>([]);
  const [userRecommendations, setUserRecommendations] = useState<ApiTripRecommendation[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  interface BasicRecognition {
    continuous: boolean; interimResults: boolean; lang: string;
    start: () => void; stop: () => void;
    onstart?: () => void; onend?: () => void;
    onresult?: (ev: unknown) => void; onerror?: (ev: unknown) => void;
  }
  const recognitionRef = useRef<BasicRecognition | null>(null);

  const loadUserData = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const [tripsData, historyData, recommendationsData, dashboardSummary] = await Promise.allSettled([
        fetchTrips(),
        fetchTripHistory(),
        fetchTripRecommendations(),
        getDashboardSummary(),
      ]);
      
      if (tripsData.status === 'fulfilled') setUserTrips(tripsData.value);
      if (historyData.status === 'fulfilled') setUserTripHistory(historyData.value);
      if (recommendationsData.status === 'fulfilled') setUserRecommendations(recommendationsData.value);
      if (dashboardSummary.status === 'fulfilled') setDashboardData(dashboardSummary.value);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, [user]);

  const initializeAssistant = React.useCallback(async () => {
    // Load user data first
    await loadUserData();
    
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.name}! 👋 I'm your AI travel companion. I've analyzed your travel history and preferences to provide personalized recommendations! \n\nI can see you have ${userTripHistory.length} completed adventures and ${userRecommendations.length} personalized suggestions waiting for you. What would you like to explore today?`,
      timestamp: new Date(),
      actionButtons: [
        { label: 'Get Personalized Recommendations', action: 'get_recommendations', variant: 'primary' },
        { label: 'Analyze My Travel History', action: 'analyze_history', variant: 'secondary' },
        { label: 'Find Budget Deals', action: 'find_deals', variant: 'ghost' }
      ]
    };
    setMessages([welcomeMessage]);
    
    // Track assistant initialization
    if (user?.id) {
      userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'chat_interaction',
        data: { action: 'assistant_opened' },
        timestamp: new Date(),
        sessionId: ''
      });
    }
  }, [user, userTripHistory.length, userRecommendations.length, loadUserData]);

  const loadUserPersonality = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const personality = await userIntelligenceService.getTravelPersonality(user.id.toString());
      setAiPersonality(personality);
    } catch (error) {
      console.error('Failed to load user personality:', error);
    }
  }, [user]);

  useEffect(() => {
    // Initialize with welcome message and user personality
    if (user && messages.length === 0) {
      initializeAssistant();
    }
    loadUserPersonality();
  }, [user, initializeAssistant, loadUserPersonality, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    const w = window as unknown as { webkitSpeechRecognition?: new () => BasicRecognition };
    if (w.webkitSpeechRecognition) {
      try {
        recognitionRef.current = new w.webkitSpeechRecognition();
        const rec = recognitionRef.current as BasicRecognition;
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        rec.onresult = (event: unknown) => {
          try {
            const evt = event as { results?: Array<Array<{ transcript?: string }>> };
            const transcript = evt.results?.[0]?.[0]?.transcript;
            if (transcript) setInput(transcript);
          } catch {/* ignore */}
        };
        rec.onerror = (event: unknown) => {
          const errObj = event as { error?: unknown };
          console.error('Speech recognition error:', errObj.error);
          setIsListening(false);
        };
      } catch {
        recognitionRef.current = null;
      }
    }
  }, []);




  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    setInput('');
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Track user message
      if (user?.id) {
        userIntelligenceService.trackUserBehavior(user.id.toString(), {
          type: 'chat_interaction',
          data: { message: text, intent: 'query' },
          timestamp: new Date(),
          sessionId: ''
        });
      }

      // Generate AI response based on user query
      const response = await generateAIResponse(text);
      setMessages(prev => [...prev, response]);

    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or use one of the suggested prompts below.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = async (query: string): Promise<ChatMessage> => {
    // Simulate intelligent processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowercaseQuery = query.toLowerCase();
  const response: ChatMessage = {
      id: `ai_${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    // Intent-based responses using real user data
    if (lowercaseQuery.includes('recommend') || lowercaseQuery.includes('suggest') || lowercaseQuery.includes('destination')) {
      const recommendations = await userIntelligenceService.generatePersonalizedRecommendations(
        user?.id?.toString() || '0',
        { query, preferences: aiPersonality }
      );

      const completedDestinations = userTripHistory.map(trip => trip.destination);
      const historyContext = completedDestinations.length > 0 
        ? `\n\nBased on your previous trips to ${completedDestinations.slice(0, 3).join(', ')}, I've curated these recommendations to match your travel style.` 
        : '';

      response.content = `Based on your travel history and preferences, I've found perfect matches for you! 🎯${historyContext}

Here are my top AI-powered recommendations:`;
      response.recommendations = recommendations.slice(0, 3);
      response.actionButtons = [
        { label: 'Book Now', action: 'book_trip', variant: 'primary' },
        { label: 'Add to Wishlist', action: 'add_wishlist', variant: 'secondary' },
        { label: 'Get More Options', action: 'more_recommendations', variant: 'ghost' }
      ];

    } else if (lowercaseQuery.includes('history') || lowercaseQuery.includes('past') || lowercaseQuery.includes('been')) {
      if (userTripHistory.length === 0) {
        response.content = `🗺️ I see you're just starting your adventure journey! That's exciting!

You haven't completed any trips yet, but that means endless possibilities await. Let me help you plan your first amazing experience!`;
        response.actionButtons = [
          { label: 'Plan First Trip', action: 'plan_first_trip', variant: 'primary' },
          { label: 'Browse Beginner Trips', action: 'beginner_trips', variant: 'secondary' }
        ];
      } else {
        const totalTrips = userTripHistory.length;
        const recentTrips = userTripHistory.slice(0, 3);
        const avgRating = userTripHistory
          .filter(trip => trip.rating)
          .reduce((sum, trip) => sum + (trip.rating || 0), 0) / userTripHistory.filter(trip => trip.rating).length;

        response.content = `🌟 Your Adventure Story So Far:

**${totalTrips} Amazing ${totalTrips === 1 ? 'Trip' : 'Trips'} Completed!**

Recent adventures:
${recentTrips.map(trip => `• ${trip.destination} (${new Date(trip.date).toLocaleDateString()})`).join('\n')}

${avgRating ? `Your average trip rating: ${avgRating.toFixed(1)}⭐ - You clearly love adventure!` : ''}

${userTripHistory.some(trip => trip.feedback) ? '\nLatest feedback: "' + userTripHistory.find(trip => trip.feedback)?.feedback + '"' : ''}`;

        response.actionButtons = [
          { label: 'Plan Similar Trip', action: 'similar_trip', variant: 'primary' },
          { label: 'Explore New Destinations', action: 'new_destinations', variant: 'secondary' }
        ];
      }

    } else if (lowercaseQuery.includes('budget') || lowercaseQuery.includes('cheap') || lowercaseQuery.includes('affordable')) {
      const totalBookings = dashboardData?.stats.totalBookings || 0;
      const avgTripCost = userTrips.length > 0 
        ? userTrips.reduce((sum, trip) => sum + trip.price, 0) / userTrips.length 
        : 25000; // default estimate

      response.content = `💰 Smart Budget Analysis Based on Your History!

${totalBookings > 0 ? `You've made ${totalBookings} bookings with us. ` : ''}Based on available trips, here's your budget optimization:

• Average trip cost: ₹${avgTripCost.toLocaleString()}
• Best booking window: 45-60 days in advance for 25% savings
• Optimal travel months: October-March (off-peak pricing)
• Current available trips: ${userTrips.length} options

${userTrips.length > 0 ? `Most affordable trip available: ${userTrips.sort((a, b) => a.price - b.price)[0]?.name} - ₹${userTrips.sort((a, b) => a.price - b.price)[0]?.price.toLocaleString()}` : ''}`;

      response.actionButtons = [
        { label: 'Find Deals Under ₹15k', action: 'budget_15k', variant: 'primary', data: { budget: 15000 } },
        { label: 'Find Deals Under ₹25k', action: 'budget_25k', variant: 'secondary', data: { budget: 25000 } },
        { label: 'Set Budget Alert', action: 'set_alert', variant: 'ghost' }
      ];

    } else if (lowercaseQuery.includes('booking') || lowercaseQuery.includes('status') || lowercaseQuery.includes('my trips')) {
      const pendingBookings = dashboardData?.stats.pendingBookings || 0;
      const confirmedBookings = dashboardData?.stats.confirmedBookings || 0;
      const recentBookings = dashboardData?.recentActivity.bookings || [];

      response.content = `📋 Your Booking Status:

**Current Bookings:**
• Pending: ${pendingBookings}
• Confirmed: ${confirmedBookings}
• Total: ${dashboardData?.stats.totalBookings || 0}

${recentBookings.length > 0 ? `\n**Recent Activity:**\n${recentBookings.slice(0, 3).map(booking => `• ${booking.trip_name || 'Trip'} - ${booking.status} (₹${booking.amount.toLocaleString()})`).join('\n')}` : ''}

${dashboardData?.user.adventurePoints ? `🎯 Adventure Points: ${dashboardData.user.adventurePoints}` : ''}`;

      response.actionButtons = [
        { label: 'View All Bookings', action: 'view_bookings', variant: 'primary' },
        { label: 'Make Payment', action: 'make_payment', variant: 'secondary' },
        { label: 'Contact Support', action: 'contact_support', variant: 'ghost' }
      ];

    } else if (lowercaseQuery.includes('personality') || lowercaseQuery.includes('style') || lowercaseQuery.includes('analyze')) {
  response.content = `🧠 Here's your AI-analyzed travel personality:

**${aiPersonality?.type?.replace('_', ' ').toUpperCase() || 'CULTURAL ENTHUSIAST'}**
${aiPersonality?.description || 'You enjoy exploring new cultures and authentic experiences while being mindful of your budget.'}

Your key traits:
${aiPersonality?.traits?.map((trait: string) => `• ${trait}`).join('\n') || '• Curious\n• Budget-conscious\n• Social'}

Confidence Score: ${aiPersonality?.confidence || 85}% 🎯`;

      response.actionButtons = [
        { label: 'Get Personality-Based Trips', action: 'personality_trips', variant: 'primary' },
        { label: 'Update Preferences', action: 'update_preferences', variant: 'secondary' }
      ];

    } else if (lowercaseQuery.includes('when') || lowercaseQuery.includes('timing') || lowercaseQuery.includes('book')) {
      response.content = `⏰ Perfect timing insights for you:

**Best Booking Strategy:**
• Book domestic trips: 30-45 days in advance
• Book international trips: 60-90 days in advance
• Sweet spot for savings: Tuesday bookings, avoiding weekends

**Optimal Travel Windows:**
• October-December: Best weather + fewer crowds
• January-March: Great deals + pleasant climate
• Avoid: June-September (monsoon peak)

**Price Prediction:** Prices are expected to drop 15% in the next 3 weeks for your preferred destinations!`;

      response.actionButtons = [
        { label: 'Set Price Alert', action: 'price_alert', variant: 'primary' },
        { label: 'Book Now', action: 'book_immediate', variant: 'secondary' },
        { label: 'See Calendar View', action: 'calendar', variant: 'ghost' }
      ];

    } else {
      // General conversational response
      response.content = `I understand you're asking about "${query}". Let me help you with that! 

As your AI travel companion, I can assist you with:
• 🎯 Personalized destination recommendations
• 💰 Budget optimization and deal hunting
• 📅 Perfect timing for bookings
• 🧠 Travel personality analysis
• 🌍 Real-time trip planning

What specific aspect would you like to explore?`;

      response.actionButtons = [
        { label: 'Get Smart Recommendations', action: 'get_recommendations', variant: 'primary' },
        { label: 'Optimize My Budget', action: 'optimize_budget', variant: 'secondary' }
      ];
    }

    return response;
  };

  const handleActionButton = async (action: string, data?: AIRecommendation | string | number | object | undefined) => {
    let responseText = '';
    
    switch (action) {
      case 'get_recommendations':
        responseText = userRecommendations.length > 0 
          ? `Based on your profile, I found ${userRecommendations.length} personalized recommendations! Let me show you the best matches...`
          : "Let me generate fresh recommendations based on your travel preferences and history...";
        break;
      case 'analyze_history':
        responseText = userTripHistory.length > 0 
          ? `Analyzing your ${userTripHistory.length} completed adventures to understand your travel patterns...`
          : "I see you're new to our platform! Let me help you start your adventure journey...";
        break;
      case 'find_deals': {
        const cheapestTrip = userTrips.sort((a, b) => a.price - b.price)[0];
        responseText = cheapestTrip 
          ? `Found amazing deals! The best value trip right now is ${cheapestTrip.name} for just ₹${cheapestTrip.price.toLocaleString()}...`
          : "Searching for the best deals matching your budget and travel style...";
        break;
      }
      case 'book_trip':
        responseText = "Excellent choice! I'm preparing the booking page with your preferences pre-filled...";
        break;
      case 'add_wishlist':
        responseText = "Perfect! Added to your wishlist. I'll notify you about price drops and special offers for this destination.";
        break;
      case 'view_bookings':
        responseText = `Showing your ${dashboardData?.stats.totalBookings || 0} bookings with current status and payment details...`;
        break;
      case 'budget_15k': {
        const budget15k = userTrips.filter(trip => trip.price <= 15000);
        responseText = `Found ${budget15k.length} amazing trips under ₹15,000! Let me show you the best value options...`;
        break;
      }
      case 'budget_25k': {
        const budget25k = userTrips.filter(trip => trip.price <= 25000);
        responseText = `Discovered ${budget25k.length} fantastic trips under ₹25,000! These offer great value for money...`;
        break;
      }
      case 'similar_trip': {
        const lastTrip = userTripHistory[0];
        responseText = lastTrip 
          ? `Finding trips similar to your last adventure in ${lastTrip.destination}...`
          : "Let me find trips that match your adventure style...";
        break;
      }
      case 'plan_first_trip':
        responseText = "How exciting! Let me curate the perfect beginner-friendly adventure for you...";
        break;
      default:
        responseText = `Processing your request for ${action.replace('_', ' ')}...`;
    }

    // Add user action message
    const actionMessage: ChatMessage = {
      id: `action_${Date.now()}`,
      role: 'user',
      content: `🎯 ${action.replace('_', ' ').toUpperCase()}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, actionMessage]);
    
    // Simulate processing and respond
    setTimeout(() => {
      handleSend(responseText);
    }, 500);

    // Track action
    if (user?.id) {
      userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'chat_interaction',
        data: { action, data },
        timestamp: new Date(),
        sessionId: ''
      });
    }
  };

  const startVoiceRecognition = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (minimized) {
    return (
      <motion.div
        className={`fixed bottom-6 right-6 z-50 ${className}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Button
          onClick={() => setMinimized(false)}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
        >
          <Bot className="w-6 h-6" />
        </Button>
        <div className="absolute -top-2 -right-2">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-xl border border-purple-200 overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center">
                AI Travel Companion
                <Sparkles className="w-4 h-4 ml-2" />
              </h3>
              <p className="text-xs opacity-90">
                {aiPersonality?.type ? `${aiPersonality.type.replace('_', ' ')} • ${aiPersonality.confidence}% Match` : 'Learning your preferences...'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-white/20 text-white border-white/30">
              BETA
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMinimized(true)}
              className="text-white hover:bg-white/20"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-white/50">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Recommendations */}
                {message.recommendations && (
                  <div className="mt-3 space-y-2">
                    {message.recommendations.map((rec) => (
                      <div key={rec.id} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm">{rec.destination}</h4>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {rec.aiConfidence}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{rec.personalizedReason}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-purple-600">
                            ₹{rec.priceRange[0].toLocaleString()} - ₹{rec.priceRange[1].toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {rec.bestTravelTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {message.actionButtons && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.actionButtons.map((button, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={button.variant}
                        onClick={() => handleActionButton(button.action, button.data)}
                        className="text-xs"
                      >
                        {button.label}
                      </Button>
                    ))}
                  </div>
                )}

                <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 bg-gray-50 border-t">
          <p className="text-xs text-gray-600 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-1">
            {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSend(prompt)}
                className="text-xs bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded-full px-3 py-1 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything about travel..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              disabled={loading}
            />
            {isListening && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              </motion.div>
            )}
          </div>
          
          <Button
            onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
            variant="ghost"
            size="sm"
            className="rounded-full p-2"
            disabled={loading}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="rounded-full p-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AITravelAssistant;
