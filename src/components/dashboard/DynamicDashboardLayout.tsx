import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Grid,
  Settings,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Zap,
  Brain,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  BarChart3,
  Award
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { useAdventureStore } from '../../store/adventureStore';
import { userIntelligenceService } from '../../services/userIntelligence';

interface WidgetConfig {
  id: string;
  type: 'ai-assistant' | 'recommendations' | 'budget' | 'planner' | 'bookings' | 'wishlist' | 'analytics' | 'social' | 'achievements' | 'weather';
  title: string;
  description: string;
  icon: React.ReactNode;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  visible: boolean;
  priority: number;
  aiRelevance: number;
  personalizedConfig?: {
    welcomeMessage?: string;
    suggestedQuestions?: string[];
    focusCategories?: string[];
  };
}

interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  layout: WidgetConfig[];
  aiPersonality: string[];
  userType: 'beginner' | 'intermediate' | 'expert';
}

interface UserLayoutPreferences {
  favoriteWidgets: string[];
  hiddenWidgets: string[];
  customLayout: WidgetConfig[];
  autoAdaptEnabled: boolean;
  lastAdaptation: Date;
}

const DynamicDashboardLayout: React.FC = () => {
  const { user } = useAdventureStore();
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [layoutPresets, setLayoutPresets] = useState<LayoutPreset[]>([]);
  const [currentPreset, setCurrentPreset] = useState<string>('smart-adaptive');
  const [isEditMode, setIsEditMode] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserLayoutPreferences | null>(null);
  const [aiAdaptationScore, setAiAdaptationScore] = useState(0);
  const [loading, setLoading] = useState(true);


  const initializeDynamicLayout = React.useCallback(async () => {
    try {
      setLoading(true);
      // Track layout initialization
      if (user?.id) {
        await userIntelligenceService.trackUserBehavior(user.id.toString(), {
          type: 'layout_view',
          data: { 
            section: 'dynamic_layout_initialization',
            timestamp: new Date()
          },
          timestamp: new Date(),
          sessionId: ''
        });
      }
      // Get user's travel personality for layout adaptation
      const personality = user?.id ? await userIntelligenceService.getTravelPersonality(user.id.toString()) : null;
      // Generate AI-optimized layout based on user behavior
      const optimizedWidgets = await generateAIOptimizedLayout(personality);
      setWidgets(optimizedWidgets);
      // Load layout presets
      const presets = generateLayoutPresets();
      setLayoutPresets(presets);
      // Load user preferences
      const preferences = await loadUserLayoutPreferences();
      setUserPreferences(preferences);
      // Calculate AI adaptation score
      const adaptationScore = calculateAIAdaptationScore(optimizedWidgets, preferences);
      setAiAdaptationScore(adaptationScore);
    } catch (error) {
      console.error('Error initializing dynamic layout:', error);
    } finally {
      setLoading(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user?.id) {
      initializeDynamicLayout();
    }
  }, [user, initializeDynamicLayout]);

  const generateAIOptimizedLayout = async (personality: { type?: string; traits?: string[]; preferences?: string[] } | null): Promise<WidgetConfig[]> => {
    const baseWidgets: WidgetConfig[] = [
      {
        id: 'ai-assistant',
        type: 'ai-assistant',
        title: 'AI Travel Companion',
        description: 'Your personal travel assistant',
        icon: <Brain className="w-5 h-5" />,
        size: 'large',
        position: { x: 0, y: 0 },
        visible: true,
        priority: 1,
        aiRelevance: 95,
        personalizedConfig: {
          welcomeMessage: personality && personality.type ? `Hello ${personality.type.replace('_', ' ')} traveler!` : 'Hello traveler!',
          suggestedQuestions: personality?.traits?.slice(0, 3) || []
        }
      },
      {
        id: 'smart-recommendations',
        type: 'recommendations',
        title: 'Smart Recommendations',
        description: 'AI-powered travel suggestions',
        icon: <Target className="w-5 h-5" />,
        size: 'medium',
        position: { x: 1, y: 0 },
        visible: true,
        priority: 2,
        aiRelevance: 90,
        personalizedConfig: {
          focusCategories: personality?.preferences || ['adventure', 'culture']
        }
      },
      {
        id: 'budget-manager',
        type: 'budget',
        title: 'Smart Budget Manager',
        description: 'AI budget optimization',
        icon: <DollarSign className="w-5 h-5" />,
        size: 'medium',
        position: { x: 2, y: 0 },
        visible: true,
        priority: 3,
        aiRelevance: 85,
      },
      {
        id: 'predictive-planner',
        type: 'planner',
        title: 'Predictive Planner',
        description: 'AI-powered trip planning',
        icon: <Calendar className="w-5 h-5" />,
        size: 'large',
        position: { x: 0, y: 1 },
        visible: true,
        priority: 4,
        aiRelevance: 88,
      },
      {
        id: 'travel-analytics',
        type: 'analytics',
        title: 'Travel Analytics',
        description: 'Your travel insights dashboard',
        icon: <BarChart3 className="w-5 h-5" />,
        size: 'medium',
        position: { x: 1, y: 1 },
        visible: true,
        priority: 5,
        aiRelevance: 75,
      },
      {
        id: 'social-travel',
        type: 'social',
        title: 'Travel Community',
        description: 'Connect with fellow travelers',
        icon: <Users className="w-5 h-5" />,
        size: 'medium',
        position: { x: 2, y: 1 },
        visible: true,
        priority: 6,
        aiRelevance: 70,
      },
      {
        id: 'achievements',
        type: 'achievements',
        title: 'Travel Achievements',
        description: 'Your travel milestones',
        icon: <Award className="w-5 h-5" />,
        size: 'small',
        position: { x: 0, y: 2 },
        visible: true,
        priority: 7,
        aiRelevance: 65,
      },
      {
        id: 'weather-insights',
        type: 'weather',
        title: 'Weather Insights',
        description: 'Smart weather predictions',
        icon: <MapPin className="w-5 h-5" />,
        size: 'small',
        position: { x: 1, y: 2 },
        visible: true,
        priority: 8,
        aiRelevance: 60,
      }
    ];

    // AI-based prioritization based on user personality and behavior
    if (personality) {
      baseWidgets.forEach(widget => {
        // Adjust relevance based on personality type
        switch (personality.type) {
          case 'adventure_seeker':
            if (widget.type === 'recommendations' || widget.type === 'weather') {
              widget.aiRelevance += 15;
            }
            break;
          case 'luxury_traveler':
            if (widget.type === 'budget' || widget.type === 'social') {
              widget.aiRelevance += 10;
            }
            break;
          case 'budget_explorer':
            if (widget.type === 'budget' || widget.type === 'planner') {
              widget.aiRelevance += 20;
            }
            break;
        }
      });
    }

    // Sort by AI relevance and update priorities
    const sortedWidgets = baseWidgets.sort((a, b) => b.aiRelevance - a.aiRelevance);
    sortedWidgets.forEach((widget, index) => {
      widget.priority = index + 1;
    });

    return sortedWidgets;
  };

  const generateLayoutPresets = (): LayoutPreset[] => {
    return [
      {
        id: 'smart-adaptive',
        name: 'Smart Adaptive',
        description: 'AI-optimized layout that adapts to your behavior',
        layout: [], // Will be populated dynamically
        aiPersonality: ['all'],
        userType: 'intermediate'
      },
      {
        id: 'planning-focused',
        name: 'Planning Focused',
        description: 'Optimized for trip planning and organization',
        layout: [], // Specific layout for planning
        aiPersonality: ['adventure_seeker', 'budget_explorer'],
        userType: 'intermediate'
      },
      {
        id: 'analytics-heavy',
        name: 'Analytics Heavy',
        description: 'Data-driven layout with detailed insights',
        layout: [], // Analytics-focused layout
        aiPersonality: ['luxury_traveler', 'cultural_enthusiast'],
        userType: 'expert'
      },
      {
        id: 'social-explorer',
        name: 'Social Explorer',
        description: 'Community-focused with social features',
        layout: [], // Social-focused layout
        aiPersonality: ['nature_lover', 'cultural_enthusiast'],
        userType: 'beginner'
      },
      {
        id: 'minimalist',
        name: 'Minimalist',
        description: 'Clean, focused layout with essential widgets',
        layout: [], // Minimal layout
        aiPersonality: ['all'],
        userType: 'beginner'
      }
    ];
  };

  const loadUserLayoutPreferences = async (): Promise<UserLayoutPreferences> => {
    // In a real app, this would load from backend
    const defaultPreferences: UserLayoutPreferences = {
      favoriteWidgets: ['ai-assistant', 'smart-recommendations'],
      hiddenWidgets: [],
      customLayout: [],
      autoAdaptEnabled: true,
      lastAdaptation: new Date()
    };

    const savedPreferences = localStorage.getItem(`layout_preferences_${user?.id}`);
    return savedPreferences ? JSON.parse(savedPreferences) : defaultPreferences;
  };

  const calculateAIAdaptationScore = (widgets: WidgetConfig[], preferences: UserLayoutPreferences | null): number => {
    if (!preferences) return 75; // Default score

    let score = 0;
    const totalWidgets = widgets.length;

    // Check how well the layout matches user preferences
    widgets.forEach(widget => {
      if (preferences.favoriteWidgets.includes(widget.id)) {
        score += widget.aiRelevance * 0.3; // Favorite widgets get higher weight
      }
      if (!preferences.hiddenWidgets.includes(widget.id) && widget.visible) {
        score += widget.aiRelevance * 0.1;
      }
    });

    // Normalize score to 0-100
    return Math.min(Math.round(score / totalWidgets), 100);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const newWidgets = Array.from(widgets);
    const [reorderedWidget] = newWidgets.splice(result.source.index, 1);
    newWidgets.splice(result.destination.index, 0, reorderedWidget);

    // Update positions
    newWidgets.forEach((widget, index) => {
      widget.priority = index + 1;
      widget.position = { x: index % 3, y: Math.floor(index / 3) };
    });

    setWidgets(newWidgets);

    // Track layout change
    if (user?.id) {
      await userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'layout_change',
        data: { 
          action: 'widget_reorder',
          widgetId: reorderedWidget.id,
          newPosition: result.destination.index
        },
        timestamp: new Date(),
        sessionId: ''
      });
    }
  };

  const toggleWidgetVisibility = async (widgetId: string) => {
    const updatedWidgets = widgets.map(widget => 
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    );
    setWidgets(updatedWidgets);

    const widget = widgets.find(w => w.id === widgetId);
    
    // Track visibility change
    if (user?.id && widget) {
      await userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'layout_change',
        data: { 
          action: 'toggle_widget_visibility',
          widgetId,
          visible: !widget.visible
        },
        timestamp: new Date(),
        sessionId: ''
      });
    }
  };

  const saveLayoutPreferences = async () => {
    if (!user?.id) return;

    const preferences: UserLayoutPreferences = {
      favoriteWidgets: widgets.filter(w => w.priority <= 3).map(w => w.id),
      hiddenWidgets: widgets.filter(w => !w.visible).map(w => w.id),
      customLayout: widgets,
      autoAdaptEnabled: userPreferences?.autoAdaptEnabled || true,
      lastAdaptation: new Date()
    };

    localStorage.setItem(`layout_preferences_${user.id}`, JSON.stringify(preferences));
    setUserPreferences(preferences);

    // Track save action
    await userIntelligenceService.trackUserBehavior(user.id.toString(), {
      type: 'layout_change',
      data: { 
        action: 'save_preferences',
        widgetCount: widgets.length,
        visibleWidgets: widgets.filter(w => w.visible).length
      },
      timestamp: new Date(),
      sessionId: ''
    });
  };

  const resetToAIOptimized = async () => {
    const personality = user?.id ? await userIntelligenceService.getTravelPersonality(user.id.toString()) : null;
    const optimizedWidgets = await generateAIOptimizedLayout(personality);
    setWidgets(optimizedWidgets);
    setIsEditMode(false);

    // Track reset action
    if (user?.id) {
      await userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'layout_change',
        data: { 
          action: 'reset_to_ai_optimized',
          aiAdaptationScore: aiAdaptationScore
        },
        timestamp: new Date(),
        sessionId: ''
      });
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1';
      case 'medium': return 'col-span-1 row-span-1 md:col-span-2';
      case 'large': return 'col-span-1 row-span-2 md:col-span-2';
      case 'full': return 'col-span-full';
      default: return 'col-span-1 row-span-1';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Layout className="w-8 h-8 text-indigo-600" />
            Dynamic Dashboard
            <Badge className="bg-purple-100 text-purple-800">
              AI-Adaptive
            </Badge>
          </h1>
          <p className="text-gray-600 mt-2">
            Your personalized, AI-optimized travel dashboard that adapts to your behavior
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* AI Adaptation Score */}
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-3 border border-purple-200">
            <div className="text-xs text-purple-600 font-medium">AI Optimization</div>
            <div className="text-2xl font-bold text-purple-700 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              {aiAdaptationScore}%
            </div>
          </div>
          
          {/* Controls */}
          <Button
            variant={isEditMode ? 'secondary' : 'ghost'}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? <Eye className="w-4 h-4 mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
            {isEditMode ? 'Preview' : 'Customize'}
          </Button>
          
          {isEditMode && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToAIOptimized}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                AI Reset
              </Button>
              <Button
                size="sm"
                onClick={saveLayoutPreferences}
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Layout Presets */}
      {isEditMode && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Layout Presets
          </h3>
          <div className="flex flex-wrap gap-2">
            {layoutPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => setCurrentPreset(preset.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPreset === preset.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Widget Management */}
      {isEditMode && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Widget Controls
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {widgets.map(widget => (
              <div key={widget.id} className="flex items-center justify-between bg-white p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  {widget.icon}
                  <span className="text-sm font-medium truncate">{widget.title}</span>
                </div>
                <button
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className={`p-1 rounded ${
                    widget.visible 
                      ? 'text-green-600 hover:bg-green-100' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Widget Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard-widgets" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-colors ${
                snapshot.isDraggingOver && isEditMode ? 'bg-indigo-50 rounded-xl p-4' : ''
              }`}
            >
              <AnimatePresence>
                {widgets.filter(w => w.visible).map((widget, index) => (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                    isDragDisabled={!isEditMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${getSizeClass(widget.size)} ${
                          snapshot.isDragging ? 'z-50 rotate-3 scale-105' : ''
                        } ${isEditMode ? 'cursor-move' : ''}`}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="h-full"
                        >
                        <Card className={`h-full bg-white/90 backdrop-blur border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 ${
                          isEditMode ? 'ring-2 ring-indigo-200 ring-opacity-50' : ''
                        }`}>
                          {/* Widget Header */}
                          <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  widget.aiRelevance >= 80 ? 'bg-green-100 text-green-600' :
                                  widget.aiRelevance >= 60 ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {widget.icon}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{widget.title}</h3>
                                  <p className="text-xs text-gray-500">{widget.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="text-xs bg-indigo-100 text-indigo-700">
                                  {widget.aiRelevance}% match
                                </Badge>
                                {isEditMode && (
                                  <button
                                    onClick={() => toggleWidgetVisibility(widget.id)}
                                    className="p-1 rounded hover:bg-gray-100"
                                  >
                                    <Settings className="w-3 h-3 text-gray-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Widget Content Placeholder */}
                          <div className="p-4 flex-1 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl mb-2">{widget.icon}</div>
                              <div className="text-sm text-gray-500">
                                {widget.type === 'ai-assistant' && 'AI Chat Interface'}
                                {widget.type === 'recommendations' && 'Smart Recommendations'}
                                {widget.type === 'budget' && 'Budget Management'}
                                {widget.type === 'planner' && 'Trip Planning'}
                                {widget.type === 'analytics' && 'Travel Analytics'}
                                {widget.type === 'social' && 'Social Features'}
                                {widget.type === 'achievements' && 'Achievement System'}
                                {widget.type === 'weather' && 'Weather Insights'}
                              </div>
                              {widget.personalizedConfig && (
                                <div className="mt-2 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                  Personalized for you
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                        </motion.div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* AI Insights */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
        <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Layout Insights
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/60 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Most Used Widget</div>
            <div className="text-lg font-bold text-purple-800">AI Assistant</div>
            <div className="text-xs text-purple-500">85% interaction rate</div>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Optimal Layout Score</div>
            <div className="text-lg font-bold text-purple-800">{aiAdaptationScore}%</div>
            <div className="text-xs text-purple-500">Above average performance</div>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Next Suggestion</div>
            <div className="text-lg font-bold text-purple-800">Add Weather Widget</div>
            <div className="text-xs text-purple-500">Based on your travel patterns</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicDashboardLayout;
