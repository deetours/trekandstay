import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { 
  Settings, 
  Zap, 
  GitBranch, 
  Play, 
  Pause, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  MessageSquare,
  Mail,
  Phone,
  Target,
  Filter,
  Search,
  MoreVertical,
  Code,
  Workflow
} from 'lucide-react';

// ---- Strongly typed workflow domain models ----
type WorkflowTriggerType = 'lead_stage_change' | 'time_delay' | 'customer_action' | 'manual' | 'ai_recommendation';

// Condition payloads per trigger type
interface LeadStageChangeConditions { stage: string }
interface TimeDelayConditions { last_activity?: string; stage?: string; hours?: number }
interface CustomerActionConditions { action: string }
interface ManualTriggerConditions { note?: string }
interface AIRecommendationConditions { recommendationType?: string }

type TriggerConditionsMap = {
  lead_stage_change: LeadStageChangeConditions;
  time_delay: TimeDelayConditions;
  customer_action: CustomerActionConditions;
  manual: ManualTriggerConditions;
  ai_recommendation: AIRecommendationConditions;
};

interface WorkflowTriggerBase<T extends WorkflowTriggerType> {
  id: string;
  type: T;
  name: string;
  conditions: TriggerConditionsMap[T];
  enabled: boolean;
}
type WorkflowTrigger =
  | WorkflowTriggerBase<'lead_stage_change'>
  | WorkflowTriggerBase<'time_delay'>
  | WorkflowTriggerBase<'customer_action'>
  | WorkflowTriggerBase<'manual'>
  | WorkflowTriggerBase<'ai_recommendation'>;

// Action config payloads per action type
type WorkflowActionType = 'send_whatsapp' | 'send_email' | 'create_task' | 'change_stage' | 'ai_response' | 'schedule_call';

interface SendWhatsAppConfig { template: string; personalized?: boolean; ai_generated?: boolean; discount_percent?: number; include_details?: boolean }
interface SendEmailConfig { template: string; subject?: string }
interface CreateTaskConfig { assigned_to: string; due_days?: number }
interface ChangeStageConfig { to_stage: string }
interface AIResponseConfig { ai_context: string; tone?: string }
interface ScheduleCallConfig { days_before_trip?: number; duration?: number }

type ActionConfigMap = {
  send_whatsapp: SendWhatsAppConfig;
  send_email: SendEmailConfig;
  create_task: CreateTaskConfig;
  change_stage: ChangeStageConfig;
  ai_response: AIResponseConfig;
  schedule_call: ScheduleCallConfig;
};

interface WorkflowActionBase<T extends WorkflowActionType> {
  id: string;
  type: T;
  name: string;
  config: ActionConfigMap[T];
  delay?: number; // seconds
}
type WorkflowAction =
  | WorkflowActionBase<'send_whatsapp'>
  | WorkflowActionBase<'send_email'>
  | WorkflowActionBase<'create_task'>
  | WorkflowActionBase<'change_stage'>
  | WorkflowActionBase<'ai_response'>
  | WorkflowActionBase<'schedule_call'>;

// Visual builder nodes
interface TriggerNodeData { trigger: WorkflowTrigger }
interface ActionNodeData { action: WorkflowAction }
interface ConditionNodeData { expression: string; trueBranch?: string[]; falseBranch?: string[] }
interface DelayNodeData { seconds: number }
type WorkflowNodeData = TriggerNodeData | ActionNodeData | ConditionNodeData | DelayNodeData;

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  name: string;
  data: WorkflowNodeData;
  position: { x: number; y: number };
  connections: string[];
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  nodes: WorkflowNode[];
  stats: {
    totalExecutions: number;
    successRate: number;
    lastExecuted: Date | null;
  };
  created: Date;
  tags: string[];
}

export default function AutomationWorkflowBuilder() {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockWorkflows: AutomationWorkflow[] = [
      {
        id: '1',
        name: 'Lead Nurturing Sequence',
        description: 'Automated follow-up for new leads with personalized WhatsApp messages',
        isActive: true,
        trigger: {
          id: '1',
          type: 'lead_stage_change',
          name: 'New Lead Created',
          conditions: { stage: 'new' },
          enabled: true
        },
        actions: [
          {
            id: '1',
            type: 'send_whatsapp',
            name: 'Welcome Message',
            config: { template: 'welcome_new_lead', personalized: true },
            delay: 0
          },
          {
            id: '2',
            type: 'send_whatsapp',
            name: 'Trip Recommendations',
            config: { template: 'trip_recommendations', ai_generated: true },
            delay: 24 * 60 * 60 // 24 hours
          }
        ],
        nodes: [],
        stats: {
          totalExecutions: 156,
          successRate: 94.2,
          lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        tags: ['whatsapp', 'nurturing', 'ai']
      },
      {
        id: '2',
        name: 'Booking Confirmation Flow',
        description: 'Sends confirmation and preparation details after booking',
        isActive: true,
        trigger: {
          id: '2',
          type: 'lead_stage_change',
          name: 'Booking Confirmed',
          conditions: { stage: 'booking_confirmed' },
          enabled: true
        },
        actions: [
          {
            id: '3',
            type: 'send_whatsapp',
            name: 'Booking Confirmation',
            config: { template: 'booking_confirmed', include_details: true },
            delay: 0
          },
          {
            id: '4',
            type: 'create_task',
            name: 'Prepare Travel Documents',
            config: { assigned_to: 'travel_coordinator', due_days: 3 },
            delay: 0
          },
          {
            id: '5',
            type: 'schedule_call',
            name: 'Pre-trip Briefing',
            config: { days_before_trip: 7, duration: 30 },
            delay: 0
          }
        ],
        nodes: [],
        stats: {
          totalExecutions: 89,
          successRate: 98.9,
          lastExecuted: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        created: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        tags: ['booking', 'confirmation', 'tasks']
      },
      {
        id: '3',
        name: 'Abandoned Cart Recovery',
        description: 'Re-engages customers who showed interest but didn\'t book',
        isActive: false,
        trigger: {
          id: '3',
          type: 'time_delay',
          name: 'No Activity for 48 hours',
          conditions: { last_activity: '48h', stage: 'interested' },
          enabled: false
        },
        actions: [
          {
            id: '6',
            type: 'ai_response',
            name: 'Personalized Follow-up',
            config: { ai_context: 'abandoned_interest', tone: 'helpful' },
            delay: 0
          },
          {
            id: '7',
            type: 'send_whatsapp',
            name: 'Special Offer',
            config: { template: 'special_discount', discount_percent: 10 },
            delay: 24 * 60 * 60
          }
        ],
        nodes: [],
        stats: {
          totalExecutions: 23,
          successRate: 73.9,
          lastExecuted: new Date(Date.now() - 12 * 60 * 60 * 1000)
        },
        created: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        tags: ['recovery', 'ai', 'offers']
      }
    ];

    setWorkflows(mockWorkflows);
  }, []);

  const selectedWorkflowData = workflows.find(w => w.id === selectedWorkflow);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterTag === 'all' || workflow.tags.includes(filterTag);
    return matchesSearch && matchesFilter;
  });

  const allTags = Array.from(new Set(workflows.flatMap(w => w.tags)));

  const toggleWorkflowStatus = (workflowId: string) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId 
          ? { ...workflow, isActive: !workflow.isActive }
          : workflow
      )
    );
  };

  const duplicateWorkflow = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      const newWorkflow = {
        ...workflow,
        id: Date.now().toString(),
        name: `${workflow.name} (Copy)`,
        isActive: false,
        created: new Date(),
        stats: {
          totalExecutions: 0,
          successRate: 0,
          lastExecuted: null
        }
      };
      setWorkflows(prev => [newWorkflow, ...prev]);
    }
  };

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    if (selectedWorkflow === workflowId) {
      setSelectedWorkflow(null);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'send_email': return <Mail className="w-4 h-4" />;
      case 'create_task': return <CheckCircle className="w-4 h-4" />;
      case 'change_stage': return <Target className="w-4 h-4" />;
      case 'ai_response': return <Zap className="w-4 h-4" />;
      case 'schedule_call': return <Phone className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'lead_stage_change': return <Target className="w-4 h-4" />;
      case 'time_delay': return <Clock className="w-4 h-4" />;
      case 'customer_action': return <Users className="w-4 h-4" />;
      case 'ai_recommendation': return <Zap className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const formatDelay = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Workflow className="w-8 h-8 mr-3 text-blue-600" />
            Automation Workflows
          </h2>
          <p className="text-gray-600 mt-1">Create and manage automated customer journey workflows</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary">
            <GitBranch className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button onClick={() => setIsBuilderOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredWorkflows.map((workflow) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`cursor-pointer transition-all ${
                selectedWorkflow === workflow.id
                  ? 'ring-2 ring-blue-500'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedWorkflow(workflow.id)}
            >
              <Card className="h-full">
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {workflow.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {workflow.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <div className={`w-3 h-3 rounded-full ${
                        workflow.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show options menu
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {workflow.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Trigger */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center text-blue-800 mb-1">
                      {getTriggerIcon(workflow.trigger.type)}
                      <span className="ml-2 text-sm font-medium">Trigger</span>
                    </div>
                    <p className="text-sm text-blue-700">{workflow.trigger.name}</p>
                  </div>

                  {/* Actions Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <Zap className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">{workflow.actions.length} Actions</span>
                    </div>
                    <div className="space-y-1">
                      {workflow.actions.slice(0, 2).map((action) => (
                        <div key={action.id} className="flex items-center text-sm text-gray-600">
                          <div className="flex items-center mr-2">
                            <div className="w-1 h-6 bg-gray-300 mr-2"></div>
                            {getActionIcon(action.type)}
                          </div>
                          <span className="truncate">{action.name}</span>
                          {action.delay && action.delay > 0 && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              +{formatDelay(action.delay)}
                            </Badge>
                          )}
                        </div>
                      ))}
                      {workflow.actions.length > 2 && (
                        <div className="text-xs text-gray-500 ml-6">
                          +{workflow.actions.length - 2} more actions
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Executions</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {workflow.stats.totalExecutions}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Success Rate</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {workflow.stats.successRate}%
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={workflow.isActive ? "secondary" : "primary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWorkflowStatus(workflow.id);
                        }}
                      >
                        {workflow.isActive ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateWorkflow(workflow.id);
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {workflow.stats.lastExecuted
                        ? `Last run ${Math.floor((Date.now() - workflow.stats.lastExecuted.getTime()) / (1000 * 60))}m ago`
                        : 'Never executed'
                      }
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Workflow Details Panel */}
      <AnimatePresence>
        {selectedWorkflowData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedWorkflowData.name} Details
                </h3>
                <div className="flex items-center space-x-3">
                  <Button variant="secondary">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="secondary">
                    <Code className="w-4 h-4 mr-2" />
                    View Logs
                  </Button>
                  <Button 
                    variant="secondary"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => deleteWorkflow(selectedWorkflowData.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Workflow Flow */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Workflow Flow</h4>
                  <div className="space-y-4">
                    {/* Trigger */}
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center text-blue-800 mb-2">
                        {getTriggerIcon(selectedWorkflowData.trigger.type)}
                        <span className="ml-2 font-medium">TRIGGER</span>
                      </div>
                      <h5 className="font-semibold text-blue-900 mb-1">
                        {selectedWorkflowData.trigger.name}
                      </h5>
                      <p className="text-sm text-blue-700">
                        {JSON.stringify(selectedWorkflowData.trigger.conditions)}
                      </p>
                    </div>

                    {/* Actions */}
                    {selectedWorkflowData.actions.map((action, index) => (
                      <div key={action.id}>
                        {action.delay && action.delay > 0 && (
                          <div className="flex items-center justify-center py-2">
                            <div className="flex items-center text-gray-500 text-sm">
                              <Clock className="w-4 h-4 mr-2" />
                              Wait {formatDelay(action.delay)}
                            </div>
                          </div>
                        )}
                        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400">
                          <div className="flex items-center text-gray-700 mb-2">
                            {getActionIcon(action.type)}
                            <span className="ml-2 font-medium">ACTION {index + 1}</span>
                          </div>
                          <h5 className="font-semibold text-gray-900 mb-1">
                            {action.name}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {JSON.stringify(action.config)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h4>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {selectedWorkflowData.stats.totalExecutions}
                        </div>
                        <div className="text-sm text-gray-600">Total Executions</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {selectedWorkflowData.stats.successRate}%
                        </div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </Card>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Recent Activity</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span>Workflow executed successfully</span>
                          </div>
                          <span className="text-gray-500">2h ago</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span>WhatsApp message sent</span>
                          </div>
                          <span className="text-gray-500">4h ago</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                            <span>Action delayed due to rate limit</span>
                          </div>
                          <span className="text-gray-500">6h ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Workflow Builder Modal */}
      <AnimatePresence>
        {isBuilderOpen && (
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
              className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col"
            >
              {/* Builder Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Visual Workflow Builder</h3>
                <div className="flex items-center space-x-3">
                  <Button variant="secondary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button>
                    <Play className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                  <Button variant="ghost" onClick={() => setIsBuilderOpen(false)}>
                    ✕
                  </Button>
                </div>
              </div>

              {/* Builder Content */}
              <div className="flex-1 flex">
                {/* Node Palette */}
                <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Components</h4>
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700">Triggers</div>
                    <div className="space-y-2">
                      {[
                        { type: 'lead_stage_change', name: 'Stage Change', icon: Target },
                        { type: 'time_delay', name: 'Time Delay', icon: Clock },
                        { type: 'customer_action', name: 'Customer Action', icon: Users }
                      ].map((trigger) => (
                        <div
                          key={trigger.type}
                          className="flex items-center p-2 bg-white rounded border cursor-pointer hover:shadow-sm"
                          draggable
                        >
                          <trigger.icon className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="text-sm">{trigger.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-sm font-medium text-gray-700 mt-4">Actions</div>
                    <div className="space-y-2">
                      {[
                        { type: 'send_whatsapp', name: 'Send WhatsApp', icon: MessageSquare },
                        { type: 'send_email', name: 'Send Email', icon: Mail },
                        { type: 'create_task', name: 'Create Task', icon: CheckCircle },
                        { type: 'ai_response', name: 'AI Response', icon: Zap }
                      ].map((action) => (
                        <div
                          key={action.type}
                          className="flex items-center p-2 bg-white rounded border cursor-pointer hover:shadow-sm"
                          draggable
                        >
                          <action.icon className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-sm">{action.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 relative bg-gray-100 overflow-hidden">
                  <div
                    ref={canvasRef}
                    className="w-full h-full relative cursor-move"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Workflow className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Drag components here to build your workflow</p>
                        <p className="text-sm">Connect triggers to actions to create automation flows</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
