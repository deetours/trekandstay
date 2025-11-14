import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { setApiBaseOverride } from '../../utils/api';

export const DevPanel: React.FC = () => {
  const [base, setBase] = useState<string>(() => {
  try { return localStorage.getItem('api_base') || (import.meta as ImportMeta).env?.VITE_API_BASE_URL || 'http://140.245.255.192:8000/api'; } catch { return 'http://140.245.255.192:8000/api'; }
  });
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const saveBase = () => {
    setApiBaseOverride(base);
    setStatus('Saved');
    setTimeout(() => setStatus(''), 1200);
  };

  const ping = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base.replace(/\/$/,'')}/rag/health/`);
      const ok = res.ok ? 'OK' : `HTTP ${res.status}`;
      setStatus(`RAG Health: ${ok}`);
  } catch (e) {
  setStatus(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // no-op initial load
  }, []);

  return (
    <Card className="p-4 space-y-3">
      <div className="text-sm font-semibold">Dev Panel</div>
      <div className="flex gap-2 items-center">
        <input className="border rounded px-2 py-1 w-full" value={base} onChange={e=>setBase(e.target.value)} placeholder="http://localhost:8000/api" />
        <Button size="sm" onClick={saveBase}>Save</Button>
        <Button size="sm" variant="secondary" onClick={ping} disabled={loading}>{loading? 'Pinging...' : 'Ping RAG'}</Button>
      </div>
      {status && <div className="text-xs text-gray-600">{status}</div>}
    </Card>
  );
};

export default DevPanel;
