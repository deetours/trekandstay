import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Button } from '../../components/ui/Button';
import { API_BASE } from '../../utils/api';
import { useToast } from '../../components/ui/useToast';

interface LeadDoc { id:string; name?:string; phone?:string; email?:string; message?:string; source?:string; trip?:string|number; createdAt?: { seconds: number; nanoseconds: number } | Date; processed?: boolean; stage?: LeadStage; score?: number; owner?: string; nextActionAt?: { seconds: number; nanoseconds: number } | Date; lostReason?: string; }

type LeadStage = 'new' | 'contacted' | 'qualified' | 'booked' | 'lost';

// Helper function to convert Firestore timestamp to Date
const getTimestamp = (timestamp: { seconds: number; nanoseconds: number } | Date | undefined): Date | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp.seconds * 1000);
};

const STAGES: { key: LeadStage; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'bg-slate-50 border-slate-200' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-50 border-blue-200' },
  { key: 'qualified', label: 'Qualified', color: 'bg-amber-50 border-amber-200' },
  { key: 'booked', label: 'Booked', color: 'bg-emerald-50 border-emerald-200' },
  { key: 'lost', label: 'Lost', color: 'bg-rose-50 border-rose-200' },
];

const LOST_REASONS = ['Price','Schedule','Competitor','No Response','Not Qualified'];
const OWNERS = ['TeamA','TeamB','TeamC'];

// Simple automation rule skeleton (in-memory demo)
type AutomationRule = { id:string; trigger:'stage_change'; when:{ from?:LeadStage; to?:LeadStage }; actions: ((lead:LeadDoc)=>Partial<LeadDoc>)[] };
const automationRules: AutomationRule[] = [
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { id:'on-contacted', trigger:'stage_change', when:{ to:'contacted' }, actions:[(_lead)=>({ nextActionAt: new Date(Date.now()+24*3600_000) })] },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { id:'on-new', trigger:'stage_change', when:{ to:'new' }, actions:[(_lead)=>({ nextActionAt: new Date(Date.now()+2*3600_000) })] },
];

// Reminder UI components
const ReminderBar: React.FC<{ lead:LeadDoc; updateNextAction:(l:LeadDoc, ts:Date|null)=>void }> = ({ lead, updateNextAction }) => {
  const ts = getTimestamp(lead.nextActionAt);
  const overdue = ts ? ts.getTime() < Date.now() : false;
  return (
    <div className="flex items-center gap-2 text-[11px] mt-1">
      <span className={`px-2 py-0.5 rounded ${overdue? 'bg-rose-50 text-rose-600 border border-rose-200':'bg-emerald-50 text-emerald-700 border border-emerald-200'} `}>
        {ts ? (overdue? 'Overdue ':'Next ') + ts.toLocaleString() : 'No reminder'}
      </span>
      <button onClick={()=>updateNextAction(lead, new Date(Date.now()+4*3600_000))} className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200">+4h</button>
      <button onClick={()=>updateNextAction(lead, new Date(Date.now()+24*3600_000))} className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200">+1d</button>
      <button onClick={()=>updateNextAction(lead, null)} className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200">Clear</button>
    </div>
  );
};

const ReminderBadge: React.FC<{ lead:LeadDoc }> = ({ lead }) => {
  const ts = getTimestamp(lead.nextActionAt);
  if (!ts) return null;
  const overdue = ts.getTime() < Date.now();
  return <span className={`mt-1 inline-block text-[9px] px-1.5 py-0.5 rounded ${overdue? 'bg-rose-100 text-rose-700':'bg-emerald-100 text-emerald-700'}`}>{overdue? 'Overdue':'Next'} {ts.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>;
};

function computeScore(l: LeadDoc): number {
  // Simple heuristic scoring baseline
  let score = 10;
  const src = (l.source||'').toLowerCase();
  if (src.includes('whatsapp')) score += 15; else if (src.includes('referral')) score += 20; else if (src.includes('web')) score += 5; else if (src) score += 3;
  if (l.trip) score += 5;
  if (l.message) score += Math.min(10, Math.floor(l.message.length/50));
  // Freshness boost: created within last 2h
  const ts = getTimestamp(l.createdAt);
  if (ts && Date.now() - ts.getTime() < 2*3600_000) score += 5;
  return score;
}

const PAGE_SIZE = 20;

const AdminLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<LeadDoc[]>([]);
  const [last, setLast] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hideProcessed, setHideProcessed] = useState(true);
  const [view, setView] = useState<'list'|'pipeline'>('list');
  const [filter, setFilter] = useState('');
  const [filterStage, setFilterStage] = useState<LeadStage | 'all'>('all');
  const { success } = useToast();
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tasks/?status=open`);
        const data = await res.json();
        const counts: Record<string, number> = {};
        (Array.isArray(data) ? data : data.results || []).forEach((t: { lead: string }) => {
          const lid = String(t.lead);
          counts[lid] = (counts[lid] || 0) + 1;
        });
        setTaskCounts(counts);
      } catch {/* ignore */}
    })();
  }, []);

  const load = React.useCallback(async (append=false) => {
    if (loading || (done && append)) return;
    setLoading(true);
    try {
      if (!db) {
        setLoading(false);
        return;
      }
      const base = collection(db, 'leads');
      let q = query(base, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
      if (append && last) q = query(base, orderBy('createdAt', 'desc'), startAfter(last), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }) as LeadDoc);
      setLeads(prev => append ? [...prev, ...docs] : docs);
      setLast(snap.docs[snap.docs.length - 1]);
      if (snap.size < PAGE_SIZE) setDone(true);
    } finally { setLoading(false); }
  }, [loading, done, last]);

  useEffect(() => { load(false); }, [load]);

  const markProcessed = async (id:string, value:boolean) => {
    if (!db) {
      success({ title: 'Firestore not available', description: 'Cannot update lead.' });
      return;
    }
    await updateDoc(doc(db, 'leads', id), { processed: value });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, processed: value } : l));
    success({ title: value ? 'Lead processed' : 'Lead reopened', description: '' });
  };

  // Round-robin owner assignment helper
  const assignOwner = async (lead:LeadDoc) => {
    if (!db) {
      success({ title: 'Firestore not available', description: 'Cannot assign owner.' });
      return;
    }
    const last = localStorage.getItem('lead:lastOwner');
    let idx = last ? OWNERS.indexOf(last) : -1; if (idx<0) idx=-1; idx = (idx+1) % OWNERS.length; const owner = OWNERS[idx];
    localStorage.setItem('lead:lastOwner', owner);
    await updateDoc(doc(db, 'leads', lead.id), { owner });
    setLeads(prev => prev.map(p => p.id === lead.id ? { ...p, owner } : p));
  };

  const enriched = leads.map(l => ({ ...l, score: l.score ?? computeScore(l), stage: (l.stage as LeadStage) || 'new' }));
  // Assign owners lazily (client-side demo)
  enriched.filter(l=>!l.owner).slice(0,3).forEach(l=>{ assignOwner(l); });
  const filtered = enriched.filter(l => (hideProcessed ? !l.processed : true) && (!filter || JSON.stringify(l).toLowerCase().includes(filter.toLowerCase())) && (filterStage==='all' || l.stage===filterStage));
  const visible = filtered;

  const grouped: Record<LeadStage, LeadDoc[]> = { new:[], contacted:[], qualified:[], booked:[], lost:[] };
  visible.forEach(l => { grouped[l.stage as LeadStage].push(l); });

  const runAutomation = (oldStage: LeadStage | undefined, newStage: LeadStage, lead: LeadDoc) => {
    if (!db) return;
    automationRules.filter(r => r.trigger === 'stage_change').forEach(r => {
      if (r.when.to && r.when.to !== newStage) return;
      if (r.when.from && r.when.from !== oldStage) return;
      let updates: Partial<LeadDoc> = {};
      r.actions.forEach(a => { updates = { ...updates, ...a(lead) }; });
      if (updates.nextActionAt instanceof Date) updates.nextActionAt = { seconds: Math.floor(updates.nextActionAt.getTime() / 1000), nanoseconds: 0 };
      if (Object.keys(updates).length) {
        if (db) {
          updateDoc(doc(db, 'leads', lead.id), updates).catch(() => undefined);
        }
        setLeads(prev => prev.map(p => p.id === lead.id ? { ...p, ...updates } : p));
      }
    });
  };

  const updateStage = async (lead: LeadDoc, stage: LeadStage) => {
    if (!db) {
      success({ title: 'Firestore not available', description: 'Cannot update lead stage.' });
      return;
    }
    const payload: Partial<LeadDoc> = { stage };
    if (!lead.score) payload.score = computeScore(lead);
    await updateDoc(doc(db, 'leads', lead.id), payload);
    setLeads(prev => prev.map(p => p.id === lead.id ? { ...p, ...payload } : p));
    runAutomation(lead.stage as LeadStage, stage, lead);
  };

  const updateNextAction = async (lead: LeadDoc, ts: Date | null) => {
    if (!db) {
      success({ title: 'Firestore not available', description: 'Cannot update next action.' });
      return;
    }
    const val = ts ? { seconds: Math.floor(ts.getTime() / 1000), nanoseconds: 0 } : undefined;
    await updateDoc(doc(db, 'leads', lead.id), { nextActionAt: val });
    setLeads(prev => prev.map(p => p.id === lead.id ? { ...p, nextActionAt: val } : p));
  };

  const setLostReason = async (lead: LeadDoc, reason: string) => {
    if (!db) {
      success({ title: 'Firestore not available', description: 'Cannot set lost reason.' });
      return;
    }
    await updateDoc(doc(db, 'leads', lead.id), { lostReason: reason, stage: 'lost' });
    setLeads(prev => prev.map(p => p.id === lead.id ? { ...p, lostReason: reason, stage: 'lost' } : p));
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={hideProcessed} onChange={e=>setHideProcessed(e.target.checked)} /> Hide processed</label>
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search" className="px-2 py-1 text-sm border rounded" />
          <select value={filterStage} onChange={e=>setFilterStage(e.target.value as LeadStage | 'all')} className="px-2 py-1 text-sm border rounded">
            <option value="all">All Stages</option>
            {STAGES.map(s=> <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <div className="flex gap-1 rounded-md overflow-hidden border">
            <button onClick={()=>setView('list')} className={`px-3 py-1 text-sm ${view==='list'?'bg-emerald-600 text-white':'bg-white text-gray-600'}`}>List</button>
            <button onClick={()=>setView('pipeline')} className={`px-3 py-1 text-sm ${view==='pipeline'?'bg-emerald-600 text-white':'bg-white text-gray-600'}`}>Pipeline</button>
          </div>
        </div>
      </div>

      {view==='list' && (
        <div className="space-y-4">
          {visible.map(l => (
            <div key={l.id} className={`bg-white border rounded-xl p-4 shadow flex flex-col gap-2 ${l.processed? 'opacity-70':''}`}> 
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold flex items-center gap-2">{l.name || 'Lead'}<span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">{l.stage}</span><span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">Score {l.score}</span>{taskCounts[l.id] && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">{taskCounts[l.id]} task{taskCounts[l.id]>1?'s':''}</span>}</div>
                <div className="text-xs text-gray-500">{getTimestamp(l.createdAt)?.toLocaleString() || ''}</div>
              </div>
              <div className="text-xs text-gray-500">{l.phone} {l.email && '· '+l.email} {l.source && '· '+l.source} {l.owner && '· '+l.owner}</div>
              {l.trip && <div className="text-xs text-gray-600">Trip: {l.trip}</div>}
              {l.message && <div className="text-sm text-gray-700 whitespace-pre-wrap">{l.message}</div>}
              {/* Reminders */}
              <ReminderBar lead={l} updateNextAction={updateNextAction} />
              {l.stage==='lost' && l.lostReason && <div className="text-[11px] text-rose-600">Lost: {l.lostReason}</div>}
              <div className="flex flex-wrap gap-2 pt-1 items-center">
                <Button size="sm" variant={l.processed? 'secondary':'adventure'} onClick={()=>markProcessed(l.id,!l.processed)}>{l.processed? 'Reopen':'Mark Processed'}</Button>
                <div className="flex gap-1 text-[11px]">{STAGES.map(s => s.key!==l.stage && (
                  <button key={s.key} onClick={()=>updateStage(l, s.key)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">{s.label}</button>
                ))}</div>
                {l.stage!=='lost' && <div className="flex gap-1">{LOST_REASONS.slice(0,3).map(r => (
                  <button key={r} onClick={()=>setLostReason(l,r)} className="text-[10px] px-2 py-1 rounded bg-rose-50 text-rose-600 border border-rose-200">{r}</button>
                ))}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {view==='pipeline' && (
        <div className="grid md:grid-cols-5 gap-4 overflow-x-auto">
          {STAGES.map(stage => (
            <div key={stage.key} className={`rounded-xl border p-3 min-h-[300px] flex flex-col ${stage.color}`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">{stage.label}</h2>
                <span className="text-[10px] bg-white/70 px-2 py-0.5 rounded-full border">{grouped[stage.key].length}</span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                {grouped[stage.key].map(l => (
                  <div key={l.id} className="bg-white rounded-lg border p-2 shadow-sm flex flex-col gap-1">
                    <div className="text-xs font-semibold flex items-center justify-between gap-1"><span className="truncate max-w-[110px]">{l.name||'Lead'}</span><span className="text-[9px] px-1 rounded bg-blue-100 text-blue-700">{l.score}</span></div>
                    {l.owner && <div className="text-[9px] text-gray-500 truncate">{l.owner}</div>}
                    {l.phone && <div className="text-[10px] text-gray-500 truncate">{l.phone}</div>}
                    {l.trip && <div className="text-[10px] text-gray-500 truncate">Trip {l.trip}</div>}
                    <div className="flex flex-wrap gap-1 pt-1">{STAGES.filter(s=>s.key!==stage.key).slice(0,3).map(s => (
                      <button key={s.key} onClick={()=>updateStage(l,s.key)} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200">{s.label}</button>
                    ))}</div>
                    <ReminderBadge lead={l} />
                  </div>
                ))}
                {grouped[stage.key].length===0 && <div className="text-[11px] text-gray-400 italic">No leads</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-center">
        {!done && <Button variant="secondary" onClick={()=>load(true)} disabled={loading}>{loading? 'Loading...':'Load More'}</Button>}
        {done && <div className="text-xs text-gray-500">No more leads.</div>}
      </div>
    </main>
  );
};

export default AdminLeadsPage;
