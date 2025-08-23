import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
interface FirestoreStats {
  firestore_connected: boolean;
  firestore_stats: Record<string, number>;
  vector_db_count: number;
  last_sync: string | null;
}
interface SyncResult {
  status: string;
  message: string;
  before_count: number;
  after_count: number;
  synced_count: number;
  firestore_stats: Record<string, number>;
  last_sync: string | null;
}

const KnowledgeBaseAdmin: React.FC = () => {
  const [stats, setStats] = useState<FirestoreStats | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const apiBase = (() => {
  try { return localStorage.getItem('api_base') || (import.meta as ImportMeta).env?.VITE_API_BASE_URL || 'http://localhost:8000/api'; } catch { return 'http://localhost:8000/api'; }
  })().replace(/\/$/, '');

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/rag/firestore-stats/`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  const syncFirestore = async () => {
    try {
      setSyncing(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBase}/rag/sync-firestore/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSyncResult(data);
        // Refresh stats after sync
        await fetchStats();
      } else {
        const errorData = await response.json();
        setSyncResult({
          status: 'error',
          message: errorData.error || 'Failed to sync',
          before_count: 0,
          after_count: 0,
          synced_count: 0,
          firestore_stats: {},
          last_sync: null,
        });
      }
    } catch (error) {
      console.error('Error syncing:', error);
      setSyncResult({
        status: 'error',
        message: 'Network error occurred',
        before_count: 0,
        after_count: 0,
        synced_count: 0,
        firestore_stats: {},
        last_sync: null,
      });
    } finally {
      setSyncing(false);
    }
  };

  const addTestFAQs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBase}/rag/test-faqs/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Success: ${data.message}`);
        await fetchStats();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding test FAQs:', error);
      alert('Error adding test FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getConnectionStatus = () => {
    if (!stats) return 'Unknown';
    return stats.firestore_connected ? 'Connected' : 'Disconnected';
  };

  const getStatusColor = () => {
    if (!stats) return 'bg-gray-500';
    return stats.firestore_connected ? 'bg-green-500' : 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Knowledge Base Admin</h1>
        <Button 
          onClick={fetchStats} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <div className="p-5 border-b border-gray-100">
          <div className="text-lg font-semibold flex items-center gap-2">
            Firestore Connection
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold">{getConnectionStatus()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vector DB Documents</p>
              <p className="text-lg font-semibold">{stats?.vector_db_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Sync</p>
              <p className="text-lg font-semibold">{formatDate(stats?.last_sync ?? null)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Firestore Collections Stats */}
      {stats?.firestore_connected && (
        <Card>
          <div className="p-5 border-b border-gray-100">
            <div className="text-lg font-semibold">Firestore Collections</div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.firestore_stats).map(([collection, count]) => (
                <div key={collection} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{collection}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <div className="p-5 border-b border-gray-100">
          <div className="text-lg font-semibold">Actions</div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={syncFirestore}
              disabled={syncing || !stats?.firestore_connected}
              className="bg-green-600 hover:bg-green-700"
            >
              {syncing ? 'Syncing...' : 'Force Sync from Firestore'}
            </Button>
            
            <Button
              onClick={addTestFAQs}
              disabled={loading || !stats?.firestore_connected}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Add Test FAQs to Firestore
            </Button>

            <Button
              onClick={() => window.open(`${apiBase}/rag/health/`, '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View API Health
            </Button>
          </div>
        </div>
      </Card>

      {/* Sync Results */}
      {syncResult && (
        <Card>
          <div className="p-5 border-b border-gray-100">
            <div className="text-lg font-semibold flex items-center gap-2">
              Last Sync Result
              <div className={`w-3 h-3 rounded-full ${syncResult.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-2">
              <p className="text-lg font-semibold">{syncResult.message}</p>
              {syncResult.status === 'success' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Before Sync</p>
                    <p className="text-lg font-semibold">{syncResult.before_count} docs</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">After Sync</p>
                    <p className="text-lg font-semibold">{syncResult.after_count} docs</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Synced Count</p>
                    <p className="text-lg font-semibold">{syncResult.synced_count} docs</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Setup Instructions */}
      {!stats?.firestore_connected && (
        <Card>
          <div className="p-5 border-b border-gray-100">
            <div className="text-lg font-semibold">Setup Instructions</div>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-gray-600">
              To enable automated knowledge base updates from Firestore:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Set up a Firebase project and enable Firestore</li>
              <li>Create service account credentials</li>
              <li>Set FIREBASE_SERVICE_ACCOUNT_PATH environment variable</li>
              <li>Restart the backend server</li>
              <li>The system will automatically sync FAQs and other data</li>
            </ol>
            <p className="text-sm text-gray-500">
              See FIREBASE_SETUP.md for detailed instructions.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default KnowledgeBaseAdmin;
