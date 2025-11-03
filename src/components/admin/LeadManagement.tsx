import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { MessageCircle, Edit2, Trash2, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface Lead {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  trip_id: number;
  trip_name?: string;
  budget?: number;
  lead_score: number;
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'rejected';
  source?: string;
  notes?: string;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
}

export const LeadManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'interested' | 'converted' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [leadNotes, setLeadNotes] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [filter, sortBy]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getAllLeads({
        status: filter === 'all' ? undefined : filter
      });
      let leadsList = data.results || data || [];
      
      if (sortBy === 'score') {
        leadsList = leadsList.sort((a: Lead, b: Lead) => b.lead_score - a.lead_score);
      } else {
        leadsList = leadsList.sort((a: Lead, b: Lead) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      
      setLeads(leadsList);
    } catch (err) {
      setError('Failed to load leads');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!selectedLead || !whatsappMessage) return;
    try {
      setError(null);
      await adminAPI.sendWhatsAppToLead(selectedLead.id, whatsappMessage);
      setSuccess('WhatsApp message sent successfully!');
      setShowModal(false);
      resetModal();
      fetchLeads();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send message');
    }
  };

  const handleUpdateLead = async () => {
    if (!selectedLead || !newStatus) return;
    try {
      setError(null);
      await adminAPI.updateLead(selectedLead.id, {
        status: newStatus,
        notes: leadNotes
      });
      setSuccess('Lead updated successfully!');
      setShowModal(false);
      resetModal();
      fetchLeads();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update lead');
    }
  };

  const handleDelete = async (leadId: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      setError(null);
      await adminAPI.deleteLead(leadId);
      setSuccess('Lead deleted successfully!');
      fetchLeads();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete lead');
    }
  };

  const resetModal = () => {
    setSelectedLead(null);
    setWhatsappMessage('');
    setNewStatus('');
    setLeadNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'contacted':
        return 'bg-purple-100 text-purple-700';
      case 'interested':
        return 'bg-yellow-100 text-yellow-700';
      case 'converted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
        <p className="text-gray-600 mt-1">Manage inquiries and track conversions</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'new', 'contacted', 'interested', 'converted', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && ` (${leads.filter(l => l.status === status).length})`}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="score">Sort by Score</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">New Leads</p>
          <p className="text-2xl font-bold text-blue-600">{leads.filter(l => l.status === 'new').length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Contacted</p>
          <p className="text-2xl font-bold text-purple-600">{leads.filter(l => l.status === 'contacted').length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Interested</p>
          <p className="text-2xl font-bold text-yellow-600">{leads.filter(l => l.status === 'interested').length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Converted</p>
          <p className="text-2xl font-bold text-green-600">{leads.filter(l => l.status === 'converted').length}</p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trip Interest</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{lead.name}</td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  <div>{lead.phone_number}</div>
                  <div className="text-xs text-gray-500">{lead.email}</div>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{lead.trip_name || 'Not specified'}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={16} className={getScoreColor(lead.lead_score)} />
                    <span className={`font-bold ${getScoreColor(lead.lead_score)}`}>{lead.lead_score}</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setNewStatus(lead.status);
                        setLeadNotes(lead.notes || '');
                        setShowModal(true);
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                      title="Update Lead"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setWhatsappMessage('');
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      title="Send WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No leads found with current filter</p>
        </div>
      )}

      {/* Modal for Update/Message */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Lead</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">{selectedLead.name}</p>
                <p className="text-xs text-gray-500">{selectedLead.phone_number}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="converted">Converted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="Internal notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Message</label>
                <textarea
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  placeholder="Send a WhatsApp message to this lead..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                {whatsappMessage && (
                  <button
                    onClick={handleSendWhatsApp}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} />
                    Send WhatsApp
                  </button>
                )}
                <button
                  onClick={handleUpdateLead}
                  className={`${whatsappMessage ? 'flex-1' : 'flex-1'} bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700`}
                >
                  Update Lead
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetModal();
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
