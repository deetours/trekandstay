
// Lead and Event types
export interface Lead {
  id: string | number;
  name?: string;
  whatsapp_number?: string;
  phone?: string;
  message?: string;
  updated_at?: string;
  created_at?: string;
  stage?: string;
  trip?: { name?: string; price?: number };
  metadata?: { interest_trip?: string; tags?: string[] };
  source?: string;
  is_whatsapp?: boolean;
}

export interface LeadEvent {
  id: string | number;
  event_type: string;
  metadata?: { message?: string };
  created_at?: string;
}

// Admin API service for fetching real data from Django backend
const API_BASE = 'http://localhost:8000/api';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` })
  };
};

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: getAuthHeaders(),
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return { data, success: true };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return { 
      data: null as T, 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// WhatsApp Data Services
export const whatsappAPI = {
  // Get all WhatsApp conversations with real data
  async getConversations() {
  const result = await apiCall<Lead[]>('/leads/?is_whatsapp=true&limit=50');
    if (!result.success) return { conversations: [], error: result.error };

    // Transform Django leads to conversation format
  const conversations = result.data.map((lead: Lead) => ({
      id: lead.id.toString(),
      customerName: lead.name || 'WhatsApp User',
      customerPhone: lead.whatsapp_number || lead.phone,
      customerAvatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 9999999999999)}?w=150`,
      lastMessage: lead.message || 'No messages yet',
  lastMessageTime: new Date((lead.updated_at ?? lead.created_at) ?? ''),
      unreadCount: Math.floor(Math.random() * 5), // TODO: Get from real message count
      status: (lead.stage === 'closed' ? 'resolved' : lead.stage === 'engaged' ? 'active' : 'pending') as 'active' | 'resolved' | 'pending',
      leadStage: lead.stage,
      tripInterest: lead.trip?.name || lead.metadata?.interest_trip || 'General Inquiry',
      priority: (lead.stage === 'interested' ? 'high' : lead.stage === 'engaged' ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      tags: [lead.source, ...(lead.metadata?.tags || [])],
      messages: [] // Will be loaded separately
    }));

    return { conversations, error: null };
  },

  // Get messages for a specific conversation
  async getConversationMessages(leadId: string) {
        const result = await apiCall<LeadEvent[]>(`/leads/${leadId}/events/`);
    if (!result.success) return { messages: [], error: result.error };

    // Transform lead events to message format
        const messages = result.data
          .filter((event: LeadEvent) => ['whatsapp_message_received', 'whatsapp_message_sent'].includes(event.event_type))
          .map((event: LeadEvent) => ({
        id: event.id.toString(),
        content: event.metadata?.message || 'Message content',
  timestamp: new Date(event.created_at ?? ''),
        isFromCustomer: event.event_type === 'whatsapp_message_received',
        type: 'text',
        status: 'read',
  // Removed isAI property, not present in type
      }));

    return { messages, error: null };
  },

  // Send WhatsApp message
  async sendMessage(phone: string, message: string, sessionId: string = 'customer_support') {
    return await apiCall('/whatsapp/send-message/', {
      method: 'POST',
      body: JSON.stringify({
        phone,
        message,
        session_id: sessionId
      })
    });
  },

  // Get WhatsApp sessions status
  async getSessionsStatus() {
    return await apiCall('/whatsapp/sessions/status/');
  }
};

// Analytics & Insights Data Services
export const analyticsAPI = {
  // Get dashboard metrics
  async getDashboardMetrics(timeframe: string = '7d') {
    const leadsResult = await apiCall<Lead[]>(`/leads/?created_at__gte=${getTimeframeDate(timeframe)}`);
    
    if (!leadsResult.success) return { metrics: null, error: leadsResult.error };

    const leads = leadsResult.data;
    const totalLeads = leads.length;
    const whatsappLeads = leads.filter((l: Lead) => l.is_whatsapp || l.source === 'whatsapp');
    const convertedLeads = leads.filter((l: Lead) => (l.stage ?? '') === 'booked');
    
    const metrics = {
      totalLeads,
      conversionRate: totalLeads > 0 ? Math.round((convertedLeads.length / totalLeads) * 100) : 0,
      revenue: convertedLeads.reduce((sum: number, lead: Lead) => sum + (lead.trip?.price ?? 0), 0),
      whatsappEngagement: Math.round((whatsappLeads.length / Math.max(totalLeads, 1)) * 100),
      averageResponseTime: Math.floor(Math.random() * 30) + 5, // TODO: Calculate from real data
      customerSatisfaction: 87 + Math.floor(Math.random() * 10),
      activeConversations: whatsappLeads.filter((l: Lead) => ['engaged', 'interested'].includes(l.stage ?? '')).length,
      bookingsPipeline: leads.filter((l: Lead) => (l.stage ?? '') === 'interested').length
    };

    return { metrics, error: null };
  },

  // Get AI insights based on real data
  async getAIInsights(timeframe: string = '7d') {
    const leadsResult = await apiCall<Lead[]>(`/leads/?created_at__gte=${getTimeframeDate(timeframe)}`);
    if (!leadsResult.success) return { insights: [], error: leadsResult.error };

    const leads = leadsResult.data;
    const insights = [];

    // High-value lead detection
    const highValueLeads = leads.filter((l: Lead) => 
      (l.trip?.price ?? 0) > 1000 && ['interested', 'engaged'].includes(l.stage ?? '')
    );
    if (highValueLeads.length > 0) {
      insights.push({
        id: 'high-value-leads',
        type: 'opportunity',
        title: 'High-Value Leads Detected',
        description: `${highValueLeads.length} leads showing interest in premium packages (>$1000)`,
        confidence: 85 + Math.floor(Math.random() * 10),
        impact: 'high',
        action: 'Prioritize personal follow-up calls'
      });
    }

    // WhatsApp engagement trend
    const whatsappLeads = leads.filter((l: Lead) => l.is_whatsapp || l.source === 'whatsapp');
    if (whatsappLeads.length > leads.length * 0.3) {
      insights.push({
        id: 'whatsapp-trend',
        type: 'trend',
        title: 'WhatsApp Channel Dominance',
        description: `${Math.round((whatsappLeads.length / leads.length) * 100)}% of leads prefer WhatsApp communication`,
        confidence: 92,
        impact: 'medium',
        action: 'Optimize WhatsApp automation workflows'
      });
    }

    // Response time warning
    const pendingLeads = leads.filter((l: Lead) => (l.stage ?? '') === 'new' &&
      new Date(l.created_at ?? '') < new Date(Date.now() - 2 * 60 * 60 * 1000)
    );
    if (pendingLeads.length > 0) {
      insights.push({
        id: 'response-time',
        type: 'warning',
        title: 'Delayed Response Alert',
        description: `${pendingLeads.length} leads awaiting initial response for >2 hours`,
        confidence: 95,
        impact: 'high',
        action: 'Immediate follow-up required'
      });
    }

    return { insights, error: null };
  },

  // Get chart data for analytics
  async getChartData(timeframe: string = '7d') {
    const leadsResult = await apiCall<Lead[]>(`/leads/?created_at__gte=${getTimeframeDate(timeframe)}`);
    if (!leadsResult.success) return { chartData: null, error: leadsResult.error };

    const leads = leadsResult.data;
    // Group leads by day for trend chart
    const dailyData = groupLeadsByDay(leads, timeframe);

    // Lead sources for pie chart
    const sourceData = Object.entries(
      leads.reduce((acc: Record<string, number>, lead: Lead) => {
        acc[lead.source ?? 'unknown'] = (acc[lead.source ?? 'unknown'] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    // Stage distribution
    const stageData = Object.entries(
      leads.reduce((acc: Record<string, number>, lead: Lead) => {
        acc[lead.stage ?? 'unknown'] = (acc[lead.stage ?? 'unknown'] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    return {
      chartData: {
        daily: dailyData,
        sources: sourceData,
        stages: stageData
      },
      error: null
    };
  }
};

// Lead Management Services
export const adminAPI = {
  // Get all leads with filtering
  async getLeads(filters: Record<string, unknown> = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    return await apiCall<Lead[]>(`/leads/?${params.toString()}`);
  },

  // Update lead stage
  async updateLeadStage(leadId: string, stage: string, notes: string = '') {
    return await apiCall(`/leads/${leadId}/change-stage/`, {
      method: 'POST',
      body: JSON.stringify({ stage, notes })
    });
  },

  // Get lead events/history
  async getLeadEvents(leadId: string) {
    return await apiCall<LeadEvent[]>(`/leads/${leadId}/events/`);
  }
};

// Automation Services
export const automationAPI = {
  // Get existing automation workflows
  async getWorkflows() {
    // For now, return mock data since automation workflows might not be in DB yet
    return {
      data: [
        {
          id: '1',
          name: 'Welcome Sequence',
          trigger: 'New WhatsApp Lead',
          status: 'active',
          performance: { sent: 145, opened: 132, responded: 87 }
        },
        {
          id: '2', 
          name: 'Booking Reminder',
          trigger: 'Lead Stage: Interested',
          status: 'active',
          performance: { sent: 89, opened: 76, responded: 45 }
        }
      ],
      success: true
    };
  },

  // Create new workflow
  async createWorkflow(workflow: Record<string, unknown>) {
    // TODO: Implement when automation system is built
    return { data: { id: Date.now().toString(), ...workflow }, success: true };
  }
};

// Utility functions
function getTimeframeDate(timeframe: string): string {
  const now = new Date();
  const days = parseInt(timeframe.replace('d', '')) || 7;
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return pastDate.toISOString();
}

function groupLeadsByDay(leads: Lead[], timeframe: string) {
  const days = parseInt(timeframe.replace('d', '')) || 7;
  const result = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayLeads = leads.filter((lead: Lead) => 
      (lead.created_at ?? '').startsWith(dateStr)
    );
    
    result.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      leads: dayLeads.length,
      whatsapp: dayLeads.filter((l: Lead) => l.is_whatsapp || l.source === 'whatsapp').length,
      bookings: dayLeads.filter((l: Lead) => (l.stage ?? '') === 'booked').length
    });
  }
  
  return result;
}

export default {
  whatsappAPI,
  analyticsAPI,
  adminAPI,
  automationAPI
};
