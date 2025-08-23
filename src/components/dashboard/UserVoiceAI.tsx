import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  MessageSquare,
  Sparkles,
  Settings,
  Send
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { useAdventureStore } from '../../store/adventureStore';

interface VoiceMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

interface VoiceCommand {
  trigger: string;
  description: string;
  example: string;
}

const VoiceAIAssistant: React.FC = () => {
  const { user } = useAdventureStore();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const voiceCommands: VoiceCommand[] = [
    {
      trigger: 'find trips to',
      description: 'Search destinations',
      example: 'Hey Trek&Stay, find trips to Kerala'
    },
    {
      trigger: 'show my bookings',
      description: 'View booking status',
      example: 'Show my upcoming bookings'
    },
    {
      trigger: 'budget for',
      description: 'Get cost estimates',
      example: 'What\'s the budget for Himachal trip?'
    },
    {
      trigger: 'book',
      description: 'Make reservations',
      example: 'Book the Manali adventure package'
    }
  ];

  const simulateVoiceRecognition = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate voice recognition after 3 seconds
      setTimeout(() => {
        const sampleCommands = [
          'Find trips to Kerala',
          'Show my bookings',
          'What\'s the budget for Goa trip?',
          'Book the Manali package'
        ];
        const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
        handleVoiceCommand(randomCommand, true);
        setIsListening(false);
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  const handleVoiceCommand = useCallback(async (command: string, isVoice: boolean = false) => {
    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: command,
      timestamp: new Date(),
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    if (!isVoice) setTextInput('');

    // Simulate AI processing
    setIsSpeaking(true);
    setTimeout(() => {
      const response = processVoiceCommand(command);
      const aiMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
        isVoice: false
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsSpeaking(false);
    }, 1500);
  }, []);

  const processVoiceCommand = (command: string): string => {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('find trips') || lowerCommand.includes('search')) {
      return 'I found several amazing trips for you! Let me show you some popular destinations in Kerala - backwaters, hill stations, and beach resorts. Would you like to see detailed itineraries?';
    }

    if (lowerCommand.includes('booking') || lowerCommand.includes('reservation')) {
      return 'You have 2 upcoming bookings: Goa Beach Trek on March 15th and Himachal Adventure on April 2nd. Your Manali trip payment is pending. Would you like me to help with that?';
    }

    if (lowerCommand.includes('budget') || lowerCommand.includes('cost') || lowerCommand.includes('price')) {
      return 'Based on your preferences, a 5-day Himachal trip would cost around ₹25,000 per person including accommodation, meals, and activities. I can help you optimize this budget further!';
    }

    if (lowerCommand.includes('book') || lowerCommand.includes('reserve')) {
      return 'Perfect! I can help you book the Manali Adventure package. It includes trekking, river rafting, and camping for ₹18,000. Shall I proceed with the booking?';
    }

    if (lowerCommand.includes('weather')) {
      return 'Current weather in your saved destinations: Manali is 12°C with clear skies, perfect for trekking! Goa is 28°C and sunny, ideal for beach activities.';
    }

    return `I understand you said "${command}". I can help you find trips, check bookings, get budget estimates, or make reservations. What would you like to do?`;
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleVoiceCommand(textInput.trim());
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200"
    >
      {/* Compact Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center ${isListening ? 'animate-pulse' : ''}`}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-purple-900">AI Voice Assistant</h3>
            <p className="text-sm text-purple-600">
              {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Say "Hey Trek&Stay"'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${isListening ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>
            {isListening ? 'Live' : 'Ready'}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              simulateVoiceRecognition();
            }}
            className={`${isListening ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-purple-200"
          >
            {/* Settings */}
            <div className="p-4 bg-purple-25 border-b border-purple-200">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-purple-900">Voice Settings</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className="flex items-center gap-1 text-sm text-purple-600"
                  >
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    {voiceEnabled ? 'Voice On' : 'Voice Off'}
                  </button>
                  <Settings className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Voice Commands Help */}
            <div className="p-4 bg-white">
              <h4 className="font-medium text-purple-900 mb-3">Try these commands:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {voiceCommands.map((command, index) => (
                  <div key={index} className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-purple-800 mb-1">
                      "{command.trigger}..."
                    </div>
                    <div className="text-xs text-purple-600">
                      {command.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="p-4 border-t border-purple-200">
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your message or use voice..."
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!textInput.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Conversation History */}
            {messages.length > 0 && (
              <div className="p-4 border-t border-purple-200 max-h-64 overflow-y-auto">
                <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Conversation
                </h4>
                <div className="space-y-3">
                  {messages.slice(-4).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          message.type === 'user'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.isVoice && <Mic className="w-3 h-3" />}
                          <span className="text-xs opacity-75">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="p-4 bg-purple-25 border-t border-purple-200">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleVoiceCommand('Show my bookings')}
                >
                  My Bookings
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleVoiceCommand('Find trips to Kerala')}
                >
                  Find Trips
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VoiceAIAssistant;
