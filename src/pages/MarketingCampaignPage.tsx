import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Users,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Loader,
  Plus,
  MoreVertical
} from 'lucide-react';
import axios from 'axios';

interface Contact {
  phone: string;
  name: string;
  [key: string]: string | undefined;
}

interface CampaignResult {
  sent_count: number;
  failed_count: number;
  success_rate: string;
  sent: Array<{ phone: string; name: string; message: string }>;
  failed: Array<{ phone: string; error: string }>;
}

interface Campaign {
  id: string;
  name: string;
  brief: string;
  personalize: boolean;
  total_contacts: number;
  sent_count: number;
  failed_count: number;
  success_rate: string;
  created_at: string;
  status: 'draft' | 'running' | 'completed' | 'failed';
}

export default function MarketingCampaignPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'campaigns' | 'analytics'>('create');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [campaignResults, setCampaignResults] = useState<CampaignResult | null>(null);

  // Campaign creation form
  const [formData, setFormData] = useState({
    campaign_name: '',
    campaign_brief: '',
    personalize: true,
    target_audience: 'all',
    delay_seconds: 2
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  // Handle form input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'personalize' ? !prev.personalize : value
    }));
  };

  // Parse CSV contacts
  const handleCSVUpload = () => {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const phoneIndex = headers.indexOf('phone');
    const nameIndex = headers.indexOf('name');

    if (phoneIndex === -1) {
      alert('CSV must contain a "phone" column');
      return;
    }

    const parsedContacts = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        phone: values[phoneIndex],
        name: nameIndex !== -1 ? values[nameIndex] : `User ${Math.random()}`
      };
    });

    setContacts(parsedContacts);
    setShowUploadModal(false);
    setCsvContent('');
  };

  // Send campaign
  const handleSendCampaign = async () => {
    if (!formData.campaign_brief) {
      alert('Please enter campaign brief');
      return;
    }

    if (contacts.length === 0) {
      alert('Please add contacts');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/whatsapp/campaign/', {
        contacts,
        campaign_brief: formData.campaign_brief,
        personalize: formData.personalize,
        delay_seconds: formData.delay_seconds
      });

      setCampaignResults(response.data.campaign_results);

      // Add to campaigns list
      const newCampaign: Campaign = {
        id: `campaign_${Date.now()}`,
        name: formData.campaign_name || `Campaign ${new Date().toLocaleDateString()}`,
        brief: formData.campaign_brief,
        personalize: formData.personalize,
        total_contacts: contacts.length,
        sent_count: response.data.campaign_results.sent_count,
        failed_count: response.data.campaign_results.failed_count,
        success_rate: response.data.campaign_results.success_rate,
        created_at: new Date().toISOString(),
        status: response.data.campaign_results.failed_count === 0 ? 'completed' : 'completed'
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      alert(`Campaign sent! ${response.data.campaign_results.sent_count} messages sent successfully.`);

      // Reset form
      setFormData({
        campaign_name: '',
        campaign_brief: '',
        personalize: true,
        target_audience: 'all',
        delay_seconds: 2
      });
      setContacts([]);
    } catch (error) {
      console.error('Campaign error:', error);
      alert('Failed to send campaign');
    } finally {
      setIsLoading(false);
    }
  };

  // Tab content
  const renderCreateTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Campaign Brief */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Campaign Message
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name (Optional)
          </label>
          <input
            type="text"
            name="campaign_name"
            value={formData.campaign_name}
            onChange={handleInputChange}
            placeholder="e.g., Summer Trek Special"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Brief / Message Template *
          </label>
          <textarea
            name="campaign_brief"
            value={formData.campaign_brief}
            onChange={handleInputChange}
            placeholder="Enter your campaign message or brief. Include placeholders like {name}, {trip_name}, etc. for personalization."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            Example: "Hi {name}! 👋 Check out our new trek with 30% discount. Limited time offer! 🎉"
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="personalize"
              checked={formData.personalize}
              onChange={() => setFormData(prev => ({ ...prev, personalize: !prev.personalize }))}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Personalize each message using Grok LLM ✨
            </span>
          </label>
          <p className="text-xs text-gray-500 ml-7">
            Each message will be uniquely personalized for the recipient based on their profile data.
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delay between messages (seconds)
          </label>
          <select
            name="delay_seconds"
            value={formData.delay_seconds}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>1 second (fast)</option>
            <option value={2}>2 seconds (recommended)</option>
            <option value={5}>5 seconds (safe)</option>
            <option value={10}>10 seconds (very safe)</option>
          </select>
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          Target Audience ({contacts.length} contacts)
        </h3>

        {contacts.length === 0 ? (
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600"
          >
            <Plus className="w-8 h-8" />
            <span className="font-medium">Upload Contacts (CSV)</span>
            <span className="text-xs">Format: phone, name (and any other fields)</span>
          </button>
        ) : (
          <div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Phone</th>
                    <th className="text-left py-2">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.slice(0, 10).map((contact, idx) => (
                    <tr key={idx} className="border-b hover:bg-white">
                      <td className="py-2 text-gray-700">{contact.phone}</td>
                      <td className="py-2 text-gray-700">{contact.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contacts.length > 10 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ... and {contacts.length - 10} more contacts
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Change Contacts
              </button>
              <button
                onClick={() => setContacts([])}
                className="flex-1 px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Send Button */}
      <button
        onClick={handleSendCampaign}
        disabled={isLoading || contacts.length === 0 || !formData.campaign_brief}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Sending Campaign...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Campaign ({contacts.length} contacts)
          </>
        )}
      </button>

      {/* Campaign Results */}
      {campaignResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-600">
            <CheckCircle className="w-6 h-6" />
            Campaign Results
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{campaignResults.sent_count}</div>
              <div className="text-sm text-gray-600">Messages Sent</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{campaignResults.failed_count}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{campaignResults.success_rate}</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>

          {campaignResults.failed.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-700 mb-2">Failed Contacts:</h4>
              <div className="space-y-1 text-sm text-red-600">
                {campaignResults.failed.slice(0, 5).map((item, idx) => (
                  <div key={idx}>
                    {item.phone}: {item.error}
                  </div>
                ))}
                {campaignResults.failed.length > 5 && (
                  <div className="text-red-500">... and {campaignResults.failed.length - 5} more</div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );

  const renderCampaignsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No campaigns yet. Create your first campaign to get started! 🚀</p>
        </div>
      ) : (
        campaigns.map((campaign, idx) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-lg">{campaign.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{campaign.brief.substring(0, 100)}...</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{campaign.total_contacts}</div>
                <div className="text-xs text-gray-600">Total Contacts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{campaign.sent_count}</div>
                <div className="text-xs text-gray-600">Sent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{campaign.failed_count}</div>
                <div className="text-xs text-gray-600">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{campaign.success_rate}</div>
                <div className="text-xs text-gray-600">Success Rate</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                {campaign.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Loader className="w-4 h-4 animate-spin text-blue-600" />
                )}
                {new Date(campaign.created_at).toLocaleString()}
              </span>
              {campaign.personalize && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                  Personalized with Grok
                </span>
              )}
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );

  const renderAnalyticsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Campaigns</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{campaigns.length}</p>
            </div>
            <Send className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Contacts Reached</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {campaigns.reduce((sum, c) => sum + c.sent_count, 0)}
              </p>
            </div>
            <Users className="w-12 h-12 text-green-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Success Rate</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {campaigns.length > 0
                  ? `${(campaigns.reduce((sum, c) => sum + parseFloat(c.success_rate), 0) / campaigns.length).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-100" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold mb-4">Campaign Performance</h3>
        <div className="space-y-3">
          {campaigns.slice(0, 5).map((campaign) => (
            <div key={campaign.id}>
              <div className="flex justify-between text-sm mb-1">
                <span>{campaign.name}</span>
                <span className="font-semibold">{campaign.success_rate}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: campaign.success_rate }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Marketing Campaigns</h1>
          <p className="text-gray-600">Create, manage, and track WhatsApp marketing campaigns powered by AI</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 bg-white rounded-lg shadow-sm p-1">
          {(['create', 'campaigns', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab === 'create' && '✨ Create Campaign'}
              {tab === 'campaigns' && '📊 My Campaigns'}
              {tab === 'analytics' && '📈 Analytics'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50">
          {activeTab === 'create' && renderCreateTab()}
          {activeTab === 'campaigns' && renderCampaignsTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Upload Contacts</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste CSV Content (Format: phone,name,email,etc.)
              </label>
              <textarea
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder={`phone,name,email\n919876543210,Raj Kumar,raj@example.com\n919876543211,Priya Singh,priya@example.com`}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCSVUpload}
                disabled={!csvContent.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                Upload {csvContent.trim().split('\n').length - 1} Contacts
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
