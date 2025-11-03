import React, { useState } from 'react';
import { QrCode, Plus, Trash2, Copy } from 'lucide-react';
import QRCodeGenerator from '../../components/qr/QRCodeGenerator';

interface QRCodeCampaign {
  id: string;
  name: string;
  url: string;
  utmSource: string;
  description: string;
  createdAt: Date;
  scans: number;
  conversions: number;
  status: 'active' | 'inactive';
}

export default function QRDistributionPage() {
  const [campaigns, setCampaigns] = useState<QRCodeCampaign[]>([
    {
      id: '1',
      name: 'Print Ads Campaign',
      url: 'https://trekandstay.com?utm_source=qr&utm_campaign=print_ads',
      utmSource: 'qr',
      description: 'QR codes for magazine and newspaper ads',
      createdAt: new Date(),
      scans: 127,
      conversions: 38,
      status: 'active'
    },
    {
      id: '2',
      name: 'Outdoor Posters',
      url: 'https://trekandstay.com?utm_source=qr&utm_campaign=outdoor_posters',
      utmSource: 'qr',
      description: 'Street posters and billboards',
      createdAt: new Date(),
      scans: 89,
      conversions: 24,
      status: 'active'
    },
    {
      id: '3',
      name: 'Business Cards',
      url: 'https://trekandstay.com?utm_source=qr&utm_campaign=business_cards',
      utmSource: 'qr',
      description: 'Business card back-side QR codes',
      createdAt: new Date(),
      scans: 45,
      conversions: 18,
      status: 'active'
    }
  ]);

  const [selectedCampaign, setSelectedCampaign] = useState<QRCodeCampaign | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    utmCampaign: ''
  });

  const handleCreateCampaign = () => {
    if (!formData.name || !formData.utmCampaign) {
      alert('Please fill in all fields');
      return;
    }

    const newCampaign: QRCodeCampaign = {
      id: Date.now().toString(),
      name: formData.name,
      url: `https://trekandstay.com?utm_source=qr&utm_campaign=${formData.utmCampaign.toLowerCase().replace(/\s+/g, '_')}`,
      utmSource: 'qr',
      description: formData.description,
      createdAt: new Date(),
      scans: 0,
      conversions: 0,
      status: 'active'
    };

    setCampaigns([...campaigns, newCampaign]);
    setFormData({ name: '', description: '', utmCampaign: '' });
    setShowForm(false);
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Delete this QR campaign?')) {
      setCampaigns(campaigns.filter(c => c.id !== id));
      if (selectedCampaign?.id === id) {
        setSelectedCampaign(null);
      }
    }
  };

  const totalScans = campaigns.reduce((sum, c) => sum + c.scans, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const conversionRate = totalScans > 0 ? ((totalConversions / totalScans) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500 rounded-lg">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">QR Code Distribution</h1>
          </div>
          <p className="text-gray-600 text-lg">Create, manage, and track QR code campaigns for app distribution</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Campaigns</p>
            <p className="text-3xl font-bold text-emerald-600">{campaigns.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total QR Scans</p>
            <p className="text-3xl font-bold text-blue-600">{totalScans}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Conversions</p>
            <p className="text-3xl font-bold text-purple-600">{totalConversions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Conversion Rate</p>
            <p className="text-3xl font-bold text-orange-600">{conversionRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Campaign List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  New Campaign
                </button>
              </div>

              {/* Create Form */}
              {showForm && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-emerald-900 mb-4">Create New QR Campaign</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Campaign Name (e.g., 'Instagram Ads')"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="UTM Campaign Name (e.g., 'instagram_ads')"
                      value={formData.utmCampaign}
                      onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                      className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <textarea
                      placeholder="Description (e.g., 'QR codes for Instagram story ads')"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateCampaign}
                        className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                      >
                        Create Campaign
                      </button>
                      <button
                        onClick={() => setShowForm(false)}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Campaign List */}
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => setSelectedCampaign(campaign)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCampaign?.id === campaign.id
                        ? 'border-emerald-500 bg-emerald-50 shadow-md'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-blue-600">📊 {campaign.scans} scans</span>
                          <span className="text-emerald-600">✅ {campaign.conversions} conversions</span>
                          <span className="text-gray-600">
                            {campaign.scans > 0 ? `${((campaign.conversions / campaign.scans) * 100).toFixed(1)}%` : '0%'} rate
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(campaign.url);
                          }}
                          className="p-2 text-gray-500 hover:text-emerald-600 transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCampaign(campaign.id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - QR Preview */}
          <div className="lg:col-span-1">
            {selectedCampaign ? (
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">QR Preview</h3>
                  <span className="text-sm px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    {selectedCampaign.status}
                  </span>
                </div>

                <QRCodeGenerator
                  url={selectedCampaign.url}
                  title={selectedCampaign.name}
                  size={250}
                  errorCorrectionLevel="H"
                  includeLabel={true}
                  customColor={{ dark: '#059669', light: '#FFFFFF' }}
                />

                {/* Campaign Stats */}
                <div className="mt-6 space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">QR Scans:</span>
                    <span className="font-bold text-blue-600">{selectedCampaign.scans}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Conversions:</span>
                    <span className="font-bold text-emerald-600">{selectedCampaign.conversions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Conv. Rate:</span>
                    <span className="font-bold text-orange-600">
                      {selectedCampaign.scans > 0
                        ? `${((selectedCampaign.conversions / selectedCampaign.scans) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-600 bg-blue-50 p-3 rounded">
                  <p className="font-semibold mb-2">📋 Campaign Details:</p>
                  <p>Created: {selectedCampaign.createdAt.toLocaleDateString()}</p>
                  <p>UTM Source: {selectedCampaign.utmSource}</p>
                  <p className="mt-2 break-all text-blue-600">
                    <strong>URL:</strong> {selectedCampaign.url}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Select a campaign to preview QR code</p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Guide */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📖 How to Use QR Codes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-l-4 border-emerald-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">1. Create Campaign</h3>
              <p className="text-sm text-gray-600">
                Create a new campaign with a name and UTM tracking parameters
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">2. Download QR</h3>
              <p className="text-sm text-gray-600">
                Download the generated QR code as PNG image or print directly
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">3. Distribute</h3>
              <p className="text-sm text-gray-600">
                Print on posters, ads, business cards, or share digitally
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">4. Track Results</h3>
              <p className="text-sm text-gray-600">
                Monitor scans and conversions in real-time analytics dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-lg p-8">
          <h3 className="text-xl font-bold text-emerald-900 mb-4">✨ Best Practices</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-emerald-800">
            <li>✓ Use high-contrast colors for easy scanning</li>
            <li>✓ Add text below QR: "Scan to download"</li>
            <li>✓ Make QR code at least 2cm × 2cm for print</li>
            <li>✓ Test QR codes before printing/distribution</li>
            <li>✓ Create separate QR for each channel</li>
            <li>✓ Track results to optimize campaigns</li>
            <li>✓ Update QR codes for seasonal campaigns</li>
            <li>✓ Include QR in emails and social media</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
