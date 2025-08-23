import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { API_BASE } from '../../utils/api';

interface Task { id:number; lead:number; lead_name?:string; type:string; status:string; title:string; due_at?:string; created_at:string; }

export const AdminTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'open'|'done'|'all'>('open');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/tasks/?ordering=-created_at`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : data.results || []);
    } catch {/* ignore */}
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  const markDone = async (t:Task) => {
    try {
      await fetch(`${API_BASE}/api/tasks/${t.id}/`, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ status:'done' }) });
      setTasks(prev => prev.map(p => p.id===t.id ? { ...p, status:'done' } : p));
    } catch {/* ignore */}
  };

  const visible = tasks.filter(t => filterStatus==='all' ? true : t.status===filterStatus);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value as 'open'|'done'|'all')} className="px-2 py-1 text-sm border rounded">
            <option value="open">Open</option>
            <option value="done">Done</option>
            <option value="all">All</option>
          </select>
          <Button size="sm" variant="secondary" onClick={load} disabled={loading}>{loading? 'Loading...':'Refresh'}</Button>
        </div>
      </div>
      <div className="space-y-3">
        {visible.map(t => (
          <div key={t.id} className={`bg-white border rounded-lg p-4 flex flex-col gap-1 ${t.status==='done'?'opacity-70':''}`}> 
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <div className="text-sm font-semibold">{t.title}</div>
                <div className="text-[11px] text-gray-500">Lead #{t.lead} {t.lead_name && `· ${t.lead_name}`} · {t.type}</div>
              </div>
              {t.status==='open' && <Button size="sm" onClick={()=>markDone(t)}>Complete</Button>}
            </div>
            {t.due_at && <div className="text-[11px] text-gray-500">Due {new Date(t.due_at).toLocaleString()}</div>}
          </div>
        ))}
        {!visible.length && <div className="text-sm text-gray-500">No tasks.</div>}
      </div>
    </main>
  );
};

export default AdminTasksPage;
