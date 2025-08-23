import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Play, 
  RotateCcw,
  Settings, 
  Brain, 
  Zap, 
  MessageSquare, 
  BarChart3,
  Command,
  Type,
  Headphones
} from 'lucide-react';

interface VoiceCommand {
  id: string;
  phrase: string;
  action: string;
  category: 'navigation' | 'data' | 'action' | 'analysis';
  confidence: number;
  timestamp: Date;
  result?: string;
}

interface AIAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  currentTranscript: string;
  context: string;
  conversationHistory: VoiceCommand[];
}

export default function VoiceAIAssistant() {
  const [assistant, setAssistant] = useState<AIAssistantState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    currentTranscript: '',
    context: 'dashboard',
    conversationHistory: []
  });

  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en-US',
    voice: 'female',
    speed: 1.0,
    volume: 0.8,
    autoSpeak: true,
    wakeWord: 'Hey Assistant',
    continuousMode: false
  });

  const [availableCommands] = useState([
    {
      category: 'navigation',
      commands: [
        { phrase: 'Show dashboard', action: 'navigate_dashboard', description: 'Navigate to main dashboard' },
        { phrase: 'Open WhatsApp management', action: 'open_whatsapp', description: 'Open WhatsApp conversation panel' },
        { phrase: 'Show analytics', action: 'show_analytics', description: 'Display analytics and insights' },
        { phrase: 'View customer list', action: 'view_customers', description: 'Open customer management' },
        { phrase: 'Go to bookings', action: 'navigate_bookings', description: 'Open booking management' }
      ]
    },
    {
      category: 'data',
      commands: [
        { phrase: 'How many leads today', action: 'get_leads_today', description: 'Get today\'s lead count' },
        { phrase: 'Show revenue this month', action: 'revenue_month', description: 'Display monthly revenue' },
        { phrase: 'WhatsApp engagement stats', action: 'whatsapp_stats', description: 'Show WhatsApp metrics' },
        { phrase: 'Top performing trips', action: 'top_trips', description: 'Show most popular trips' },
        { phrase: 'Conversion rate overview', action: 'conversion_rates', description: 'Display conversion metrics' }
      ]
    },
    {
      category: 'action',
      commands: [
        { phrase: 'Send WhatsApp to [customer]', action: 'send_whatsapp', description: 'Send WhatsApp message' },
        { phrase: 'Create new task', action: 'create_task', description: 'Create a new task' },
        { phrase: 'Schedule follow up', action: 'schedule_followup', description: 'Schedule customer follow-up' },
        { phrase: 'Update lead stage', action: 'update_stage', description: 'Change lead stage' },
        { phrase: 'Export data', action: 'export_data', description: 'Export current data view' }
      ]
    },
    {
      category: 'analysis',
      commands: [
        { phrase: 'Analyze customer trends', action: 'analyze_trends', description: 'Generate trend analysis' },
        { phrase: 'Recommend next actions', action: 'ai_recommendations', description: 'Get AI recommendations' },
        { phrase: 'Predict revenue forecast', action: 'revenue_forecast', description: 'Generate revenue predictions' },
        { phrase: 'Identify high-value leads', action: 'identify_leads', description: 'Find high-potential leads' },
        { phrase: 'Optimize marketing spend', action: 'optimize_marketing', description: 'Get marketing optimization advice' }
      ]
    }
  ]);

  // Mock voice recognition and synthesis
  const startListening = () => {
    setAssistant(prev => ({ ...prev, isListening: true, currentTranscript: '' }));
    
    // Simulate voice recognition
    setTimeout(() => {
      const mockTranscripts = [
        'Show me today\'s leads',
        'How many WhatsApp messages were sent this week',
        'What\'s our conversion rate this month',
        'Send a WhatsApp to Sarah Johnson',
        'Create a task to follow up with Mike Chen'
      ];
      
      const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      setAssistant(prev => ({ ...prev, currentTranscript: randomTranscript }));
      
      setTimeout(() => {
        processVoiceCommand(randomTranscript);
      }, 1500);
    }, 2000);
  };

  const stopListening = () => {
    setAssistant(prev => ({ ...prev, isListening: false }));
  };

  const processVoiceCommand = (transcript: string) => {
    setAssistant(prev => ({ ...prev, isProcessing: true, isListening: false }));

    // Mock AI processing
    setTimeout(() => {
      const command: VoiceCommand = {
        id: Date.now().toString(),
        phrase: transcript,
        action: 'mock_action',
        category: 'data',
        confidence: 0.92,
        timestamp: new Date(),
        result: generateMockResponse(transcript)
      };

      setAssistant(prev => ({
        ...prev,
        isProcessing: false,
        isSpeaking: true,
        conversationHistory: [command, ...prev.conversationHistory.slice(0, 9)]
      }));

      // Mock text-to-speech
      if (voiceSettings.autoSpeak) {
        setTimeout(() => {
          setAssistant(prev => ({ ...prev, isSpeaking: false }));
        }, 3000);
      }
    }, 2000);
  };

  const generateMockResponse = (transcript: string): string => {
    const responses = {
      'leads': 'You have 12 new leads today. 5 are in the interested stage and 3 are qualified for follow-up.',
      'whatsapp': 'This week you sent 89 WhatsApp messages with a 78% response rate. 23 conversations are currently active.',
      'conversion': 'Your conversion rate this month is 18.5%, which is 3.2% higher than last month. Great improvement!',
      'sarah': 'I\'ve prepared a personalized message for Sarah Johnson about the Himalayan Trek. Would you like me to send it?',
      'task': 'I\'ve created a follow-up task for Mike Chen scheduled for tomorrow at 2 PM. Added to your task list.'
    };

    for (const [key, response] of Object.entries(responses)) {
      if (transcript.toLowerCase().includes(key)) {
        return response;
      }
    }

    return 'I understand you want information about your travel business. Let me analyze the data and provide insights.';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return <Command className="w-4 h-4" />;
      case 'data': return <BarChart3 className="w-4 h-4" />;
      case 'action': return <Zap className="w-4 h-4" />;
      case 'analysis': return <Brain className="w-4 h-4" />;
      default: return <Mic className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return 'text-blue-600 bg-blue-50';
      case 'data': return 'text-green-600 bg-green-50';
      case 'action': return 'text-purple-600 bg-purple-50';
      case 'analysis': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Headphones className="w-8 h-8 mr-3 text-purple-600" />
            Voice AI Assistant
          </h2>
          <p className="text-gray-600 mt-1">Control your dashboard and get insights using voice commands</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <div className="flex items-center space-x-2 px-3 py-1 bg-purple-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${assistant.isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-purple-700">
              {assistant.isListening ? 'Listening' : assistant.isProcessing ? 'Processing' : assistant.isSpeaking ? 'Speaking' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Voice Interface */}
      <Card className="p-8">
        <div className="text-center space-y-6">
          {/* Voice Visualizer */}
          <div className="relative">
            <motion.div
              className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center cursor-pointer transition-all ${
                assistant.isListening 
                  ? 'border-red-500 bg-red-50' 
                  : assistant.isProcessing
                    ? 'border-blue-500 bg-blue-50'
                    : assistant.isSpeaking
                      ? 'border-green-500 bg-green-50'
                      : 'border-purple-500 bg-purple-50 hover:bg-purple-100'
              }`}
              animate={assistant.isListening ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              onClick={assistant.isListening ? stopListening : startListening}
            >
              {assistant.isListening ? (
                <MicOff className="w-12 h-12 text-red-600" />
              ) : assistant.isProcessing ? (
                <Brain className="w-12 h-12 text-blue-600 animate-pulse" />
              ) : assistant.isSpeaking ? (
                <Volume2 className="w-12 h-12 text-green-600" />
              ) : (
                <Mic className="w-12 h-12 text-purple-600" />
              )}
            </motion.div>
            
            {/* Status rings */}
            {assistant.isListening && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-400"
                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </div>

          {/* Current Status */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {assistant.isListening && "I'm listening..."}
              {assistant.isProcessing && "Processing your request..."}
              {assistant.isSpeaking && "Speaking response..."}
              {!assistant.isListening && !assistant.isProcessing && !assistant.isSpeaking && "Ready for your command"}
            </h3>
            
            {assistant.currentTranscript && (
              <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-gray-700 italic">"{assistant.currentTranscript}"</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="secondary"
              onClick={assistant.isListening ? stopListening : startListening}
              className={assistant.isListening ? 'border-red-500 text-red-600' : 'border-purple-500 text-purple-600'}
            >
              {assistant.isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {assistant.isListening ? 'Stop' : 'Start'} Listening
            </Button>
            <Button variant="secondary">
              <Type className="w-4 h-4 mr-2" />
              Type Command
            </Button>
            <Button variant="secondary">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
            Recent Conversations
          </h3>
          
          <div className="space-y-4">
            {assistant.conversationHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No voice commands yet</p>
                <p className="text-sm">Start a conversation to see history here</p>
              </div>
            ) : (
              assistant.conversationHistory.map((command) => (
                <div key={command.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${getCategoryColor(command.category)}`}>
                        {getCategoryIcon(command.category)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {command.phrase}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(command.confidence * 100)}%
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {command.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {command.result && (
                    <div className="bg-white rounded p-3 text-sm text-gray-700 border-l-2 border-purple-500">
                      {command.result}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Available Commands */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Command className="w-5 h-5 mr-2 text-purple-600" />
            Voice Commands
          </h3>
          
          <div className="space-y-4">
            {availableCommands.map((group) => (
              <div key={group.category}>
                <h4 className={`text-sm font-medium mb-3 flex items-center ${getCategoryColor(group.category)}`}>
                  <div className="p-1 rounded mr-2">
                    {getCategoryIcon(group.category)}
                  </div>
                  {group.category.charAt(0).toUpperCase() + group.category.slice(1)}
                </h4>
                <div className="space-y-2 ml-6">
                  {group.commands.slice(0, 3).map((cmd, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div>
                        <span className="font-medium text-gray-900">"{cmd.phrase}"</span>
                        <p className="text-gray-600 text-xs mt-1">{cmd.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => processVoiceCommand(cmd.phrase)}
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {group.commands.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{group.commands.length - 3} more commands
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Voice Settings Panel */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-purple-600" />
          Voice Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={voiceSettings.language}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Type
            </label>
            <select
              value={voiceSettings.voice}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speech Speed
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.speed}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">{voiceSettings.speed}x</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={voiceSettings.volume}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">{Math.round(voiceSettings.volume * 100)}%</div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={voiceSettings.autoSpeak}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, autoSpeak: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Auto-speak responses</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={voiceSettings.continuousMode}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, continuousMode: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Continuous listening mode</span>
          </label>
        </div>
      </Card>
    </div>
  );
}
