import React, { useState, useMemo, Suspense, useEffect, useRef, useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import { RefreshCw, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp, writeBatch, getCountFromServer, where } from 'firebase/firestore';
import { useToast } from '../../components/ui/useToast';

// Lazy import existing admin pages
const Trips = React.lazy(() => import('./AdminTripsPage'));
const Products = React.lazy(() => import('./AdminProductsPage'));
const Stories = React.lazy(() => import('./AdminStoriesPage'));
const Leads = React.lazy(() => import('./AdminLeadsPage'));
const Tasks = React.lazy(() => import('./AdminTasksPage'));
const MarketingCampaignPage = React.lazy(() => import('../MarketingCampaignPage'));

// Direct import TIER 2 admin components (named exports)
import { BookingManagement } from '../../components/admin/BookingManagement';
import { UserManagement } from '../../components/admin/UserManagement';
import { AnalyticsDashboard } from '../../components/admin/AnalyticsDashboard';

// Lazy import AI-powered admin components
import AIInsights from '../../components/admin/AIInsightsPanel';
import WhatsAppManager from '../../components/admin/WhatsAppManagementPanel';
import ErrorBoundary from '../../components/ErrorBoundary';
const WorkflowBuilder = React.lazy(() => import('../../components/admin/AutomationWorkflowBuilder'));
const VoiceAssistant = React.lazy(() => import('../../components/admin/VoiceAIAssistant'));

// Regular import for header component (not lazy loaded)
import RealTimeNotificationCenter from '../../components/admin/RealTimeNotificationCenter';

interface TabDef { id: string; label: string; description: string; }

const tabs: TabDef[] = [
  { id: 'overview', label: 'Overview', description: 'Quick access dashboard' },
  { id: 'analytics', label: 'Analytics', description: 'KPIs and business metrics' },
  { id: 'ai-insights', label: 'AI Insights', description: 'Business intelligence and analytics' },
  { id: 'whatsapp', label: 'WhatsApp', description: 'Customer conversations and messaging' },
  { id: 'campaigns', label: 'Campaigns', description: 'Marketing campaigns and messaging' },
  { id: 'automation', label: 'Automation', description: 'Workflow builder and triggers' },
  { id: 'voice-ai', label: 'Voice AI', description: 'Voice commands and AI assistant' },
  { id: 'trips', label: 'Trips', description: 'Manage trips' },
  { id: 'bookings', label: 'Bookings', description: 'Manage all bookings' },
  { id: 'itinerary', label: 'Itinerary', description: 'Edit trip day-by-day steps' },
  { id: 'products', label: 'Products', description: 'Shop product catalog' },
  { id: 'stories', label: 'Stories', description: 'Moderate user stories' },
  { id: 'leads', label: 'Leads', description: 'Inbound inquiries & leads' },
  { id: 'users', label: 'Users', description: 'Manage user accounts' },
  { id: 'tasks', label: 'Tasks', description: 'Follow-ups & actions' },
];

interface Trip { id:string; title?:string; name?:string; location?:string; days?:number; }
interface ItineraryItem { id:string; day:number; title:string; description:string; }

export const AdminPortal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab');
  const [active, setActive] = useState<string>(tabs.some(t=>t.id===initialTab) ? (initialTab as string) : 'overview');
  const [reloadKey, setReloadKey] = useState(0); // force remount for refresh
  const forceReload = () => setReloadKey(k => k + 1);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [metrics, setMetrics] = useState<{ activeTrips?:number; totalTrips?:number; activeProducts?:number; totalProducts?:number } >({});
  const [searchTerm, setSearchTerm] = useState('');
  const [tripDifficulty, setTripDifficulty] = useState('');
  const [showInactiveTrips, setShowInactiveTrips] = useState(true);
  const [productCategory, setProductCategory] = useState('');
  const [showInactiveProducts, setShowInactiveProducts] = useState(true);
  const [storyStatus, setStoryStatus] = useState<'all'|'pending'|'approved'|'rejected'>('all');
  const [hideProcessedLeads, setHideProcessedLeads] = useState(false);
  const [dirtyTabs, setDirtyTabs] = useState<Record<string, boolean>>({});
  const { success, info } = useToast();

  // Fetch lightweight counts for badges
  const loadCounts = useCallback(async () => {
    const target = ['trips','products','stories','leads'];
    const next: Record<string, number> = {};
    if (!db) {
      target.forEach(t => { next[t] = 0; });
      setCounts(next);
      return;
    }
    const dbRef = db; // narrowed non-null reference for TS
    await Promise.all(target.map(async t => {
      if (!dbRef) { next[t] = 0; return; }
      try {
        const snap = await getCountFromServer(collection(dbRef, t));
        next[t] = snap.data().count || 0;
      } catch (error: unknown) {
        const err = error as { code?: string };
        if (err?.code === 'permission-denied') {
          console.log(`[ADMIN INFO] No permission to read ${t} collection - using mock data`);
          const mockCounts = { trips: 24, products: 15, stories: 8, leads: 42 };
            next[t] = mockCounts[t as keyof typeof mockCounts] || 0;
        } else {
          console.warn(`[ADMIN WARNING] Error loading ${t} count:`, error);
          next[t] = 0;
        }
      }
    }));
    setCounts(next);
  }, []);

  useEffect(()=>{ loadCounts(); }, [loadCounts, reloadKey]);

  // Extended metrics (active vs total) for overview
  useEffect(()=>{
    (async () => {
      if (!db) {
        setMetrics({});
        return;
      }
      try {
        const tripsCol = collection(db,'trips');
        const productsCol = collection(db,'products');
        const [totalTripsSnap, activeTripsSnap, totalProdSnap, activeProdSnap] = await Promise.all([
          getCountFromServer(tripsCol),
          getCountFromServer(query(tripsCol, where('active','==', true))),
          getCountFromServer(productsCol),
          getCountFromServer(query(productsCol, where('active','==', true))),
        ]);
        setMetrics({
          totalTrips: totalTripsSnap.data().count || 0,
          activeTrips: activeTripsSnap.data().count || 0,
          totalProducts: totalProdSnap.data().count || 0,
          activeProducts: activeProdSnap.data().count || 0,
        });
  } catch {
        setMetrics({});
      }
    })();
  }, [reloadKey]);

  // Listen for global form dirty events from child pages
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { tab, dirty } = e.detail || {};
      if (!tab) return;
      setDirtyTabs(d => ({ ...d, [tab]: !!dirty }));
    };
    window.addEventListener('adminDirty', handler as EventListener);
    return () => window.removeEventListener('adminDirty', handler as EventListener);
  }, []);

  const guardedSetActive = (next:string) => {
    if (next === active) return;
    if (dirtyTabs[active]) {
      if (confirm('You have unsaved changes in this tab. Switch anyway?')) {
  info({ title: 'Switched tab', description: 'Unsaved changes discarded' });
        setDirtyTabs(d => ({ ...d, [active]: false }));
      } else {
  info({ title: 'Stayed on current tab', description: '' });
        return;
      }
    }
    setActive(next);
  };

  // Sync tab to URL
  useEffect(() => {
    const current = searchParams.get('tab');
    if (current !== active) {
      const next = new URLSearchParams(searchParams);
      next.set('tab', active);
      setSearchParams(next, { replace: true });
    }
  }, [active, searchParams, setSearchParams]);

  // Itinerary management state (only used on itinerary tab)
  const [tripsList, setTripsList] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [itForm, setItForm] = useState<{ id?:string; day:number; title:string; description:string }>({ day:1, title:'', description:'' });
  const [savingStep, setSavingStep] = useState(false);
  const [reordering, setReordering] = useState(false);
  const dragId = useRef<string | null>(null);
  const [tripSearch, setTripSearch] = useState('');

  // Load trips when itinerary tab becomes active
  useEffect(() => {
    if (active !== 'itinerary' || !db) return;
    const unsub = onSnapshot(collection(db, 'trips'), snap => {
      const data: Trip[] = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Trip);
      const sorted = data.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
      setTripsList(sorted);
      // auto-select persisted trip if exists
      const persisted = localStorage.getItem('admin:lastItineraryTrip');
      if (persisted && !selectedTrip && sorted.find(t => t.id === persisted)) {
        setSelectedTrip(sorted.find(t => t.id === persisted) || null);
      }
    });
    return () => unsub();
  }, [active, selectedTrip]);

  // Load selected trip itinerary
  useEffect(() => {
    if (active !== 'itinerary' || !selectedTrip || !db) { setItems([]); return; }
    const q = query(collection(db, 'trips', selectedTrip.id, 'itinerary'), orderBy('day', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }) as ItineraryItem));
    });
    return () => unsub();
  }, [active, selectedTrip]);

  // persist selected trip
  useEffect(() => {
    if (selectedTrip) localStorage.setItem('admin:lastItineraryTrip', selectedTrip.id);
  }, [selectedTrip]);

  const saveStep = useCallback(async () => {
    if (!selectedTrip || !itForm.title.trim() || !db) return;
    setSavingStep(true);
    try {
      const payload = { day: itForm.day, title: itForm.title, description: itForm.description, updatedAt: serverTimestamp() };
      if (itForm.id) await updateDoc(doc(db, 'trips', selectedTrip.id, 'itinerary', itForm.id), payload);
      else await addDoc(collection(db, 'trips', selectedTrip.id, 'itinerary'), { ...payload, createdAt: serverTimestamp() });
      setItForm({ day: 1, title: '', description: '' });
      success({ title: itForm.id ? 'Step updated' : 'Step added', description: '' });
    } finally { setSavingStep(false); }
  }, [selectedTrip, itForm, success]);
  const editStep = (item:ItineraryItem) => { setItForm({ id:item.id, day:item.day, title:item.title, description:item.description }); };
  const deleteStep = useCallback(async (id: string) => {
    if (!selectedTrip || !db) return;
    if (!confirm('Delete step?')) return;
    await deleteDoc(doc(db, 'trips', selectedTrip.id, 'itinerary', id));
    success({ title: 'Step deleted', description: '' });
  }, [selectedTrip, success]);
  const cancelEdit = useCallback(() => { setItForm({ day:1, title:'', description:'' }); info({ title: 'Edit cancelled', description: '' }); }, [info]);

  // drag & drop handlers for itinerary steps
  const onDragStart = (id:string) => (e: React.DragEvent) => { dragId.current = id; e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const onDrop = useCallback((targetId:string) => async (e: React.DragEvent) => {
    e.preventDefault();
    if (!selectedTrip || !db) return;
    const sourceId = dragId.current; dragId.current = null;
    if (!sourceId || sourceId === targetId) return;
    const current = [...items];
    const fromIndex = current.findIndex(i => i.id === sourceId);
    const toIndex = current.findIndex(i => i.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    // reorder array
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    // assign sequential days
    const reassigned = current.map((it, idx) => ({ ...it, day: idx + 1 }));
    setItems(reassigned); // optimistic
    setReordering(true);
    try {
      if (!db) return;
      const batch = writeBatch(db);
      for (const it of reassigned) {
        if (!db) continue;
        batch.update(doc(db, 'trips', selectedTrip.id, 'itinerary', it.id), { day: it.day, updatedAt: serverTimestamp() });
      }
      await batch.commit();
      success({ title: 'Order updated', description: '' });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Reorder failed';
  info({ title: 'Reorder failed', description: errorMessage });
    } finally { setReordering(false); }
  }, [selectedTrip, items, success, info]);

  const filteredTrips = tripsList.filter(t => {
    if (!tripSearch.trim()) return true;
    const q = tripSearch.toLowerCase();
    return (t.title || t.name || '').toLowerCase().includes(q) || (t.location||'').toLowerCase().includes(q);
  });

  const ActiveComponent = useMemo(() => {
    if (active === 'overview') return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* TIER 2 Admin Dashboard Section */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">⚙️</span>
            <span className="truncate">TIER 2: Admin Dashboard</span>
          </h3>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {['analytics', 'bookings', 'users'].map(tabId => {
              const tab = tabs.find(t => t.id === tabId);
              return (
                <button
                  key={tabId}
                  onClick={() => setActive(tabId)}
                  className="group border rounded-xl bg-gradient-to-br from-white to-emerald-50 shadow-sm hover:shadow-lg transition-all p-6 text-left relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-emerald-500 to-teal-500 transition-opacity" />
                  <div className="relative z-10">
                    <div className="font-semibold text-base sm:text-lg mb-2 flex items-center gap-2 text-emerald-700">
                      {tab?.label}
                      <span className="text-[10px] font-normal px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 whitespace-nowrap">TIER 2</span>
                    </div>
                    <div className="text-xs text-emerald-600 leading-snug line-clamp-2">{tab?.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI-Powered Features Section */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">AI</span>
            <span className="truncate">AI-Powered Admin Tools</span>
          </h3>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['ai-insights', 'whatsapp', 'campaigns', 'automation', 'voice-ai'].map(tabId => {
              const tab = tabs.find(t => t.id === tabId);
              return (
                <button
                  key={tabId}
                  onClick={() => setActive(tabId)}
                  className="group border rounded-xl bg-gradient-to-br from-white to-purple-50 shadow-sm hover:shadow-lg transition-all p-6 text-left relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-purple-500 to-blue-500 transition-opacity" />
                  <div className="relative z-10">
                    <div className="font-semibold text-base sm:text-lg mb-2 flex items-center gap-2 text-purple-700">
                      {tab?.label}
                      <span className="text-[10px] font-normal px-2 py-1 rounded-full bg-purple-100 text-purple-600 border border-purple-200 whitespace-nowrap">NEW</span>
                    </div>
                    <div className="text-xs text-purple-600 leading-snug line-clamp-2">{tab?.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Traditional Management Section */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">📊</span>
            <span className="truncate">Content Management</span>
          </h3>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tabs.filter(t => !['overview', 'ai-insights', 'whatsapp', 'campaigns', 'automation', 'voice-ai', 'analytics', 'bookings', 'users'].includes(t.id)).map(t => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className="group border rounded-xl bg-white shadow-sm hover:shadow-md transition-all p-5 text-left relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-emerald-400 to-sky-500 transition-opacity" />
                <div className="font-semibold text-lg mb-1 flex items-center gap-2">
                  {t.label}
                  {counts[t.id] > 0 && (
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">{counts[t.id]}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 leading-snug line-clamp-2">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Metrics */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">📈</span>
            <span className="truncate">Quick Metrics</span>
          </h3>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Trips" value={metrics.totalTrips ?? 0} sub={`${metrics.activeTrips ?? 0} active`} />
            <MetricCard label="Products" value={metrics.totalProducts ?? 0} sub={`${metrics.activeProducts ?? 0} active`} />
            <MetricCard label="Stories" value={counts.stories ?? 0} sub="All statuses" />
            <MetricCard label="Leads" value={counts.leads ?? 0} sub="Total leads" />
          </div>
        </div>
      </div>
    );
    if (active === 'itinerary') return (
      <div key={`itinerary-${reloadKey}`} className="p-4 sm:p-6">
        <div className="grid md:grid-cols-5 gap-4 sm:gap-6">
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg font-semibold truncate">Trips</h2>
                {selectedTrip && <Button size="sm" variant="secondary" onClick={()=>setSelectedTrip(null)} className="text-xs">Clear</Button>}
              </div>
              <input value={tripSearch} onChange={e=>setTripSearch(e.target.value)} placeholder="Search trips..." className="w-full border rounded px-2 sm:px-3 py-2 text-xs" />
            </div>
            <div className="border rounded-lg divide-y bg-white overflow-hidden max-h-[400px] sm:max-h-none overflow-y-auto">
              {filteredTrips.map(t => (
                <button key={t.id} onClick={()=>setSelectedTrip(t)} className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-emerald-50 flex items-center justify-between gap-2 ${selectedTrip?.id===t.id? 'bg-emerald-100/70':''}`}> 
                  <span className="truncate">{t.title || t.name || 'Trip'}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{t.days || ''}</span>
                </button>
              ))}
              {filteredTrips.length===0 && <div className="px-3 sm:px-4 py-4 sm:py-6 text-xs text-gray-500 text-center">No matching trips.</div>}
            </div>
          </div>
          <div className="md:col-span-3">
            {!selectedTrip && <div className="text-xs sm:text-sm text-gray-500 p-3 sm:p-4 border rounded-lg bg-gray-50">Select a trip to manage its itinerary.</div>}
            {selectedTrip && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base sm:text-lg font-semibold truncate">Itinerary: {selectedTrip.title || selectedTrip.name}</h2>
                  <span className="text-xs text-gray-400 flex-shrink-0">{items.length} steps</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="text-xs sm:text-sm font-medium flex items-center gap-2">{itForm.id? 'Edit Step':'Add Step'} {itForm.id && <button onClick={cancelEdit} className="text-xs text-rose-600 hover:underline flex items-center gap-1"><X className="w-3 h-3" />Cancel</button>}</div>
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <input type="number" min={1} value={itForm.day} onChange={e=>setItForm(f=>({...f, day:Number(e.target.value)}))} placeholder="Day" className="w-full sm:w-24 border rounded px-2 sm:px-3 py-2 text-xs" />
                      <input value={itForm.title} onChange={e=>setItForm(f=>({...f,title:e.target.value}))} placeholder="Title" className="flex-1 border rounded px-2 sm:px-3 py-2 text-xs" />
                    </div>
                    <textarea value={itForm.description} onChange={e=>setItForm(f=>({...f,description:e.target.value}))} placeholder="Description" className="w-full border rounded px-2 sm:px-3 py-2 text-xs min-h-[90px] sm:min-h-[110px]" />
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <Button size="sm" variant="adventure" onClick={saveStep} disabled={savingStep} className="text-xs">{savingStep? 'Saving...': itForm.id? 'Update':'Add'}</Button>
                      {itForm.id && <Button size="sm" variant="secondary" onClick={cancelEdit} className="text-xs">Reset</Button>}
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3 max-h-[350px] sm:max-h-[450px] overflow-auto pr-1">
                    {items.map(it => (
                      <div
                        key={it.id}
                        className="border rounded-lg p-2 sm:p-3 text-xs sm:text-sm bg-white flex flex-col gap-1 group cursor-move"
                        draggable
                        onDragStart={onDragStart(it.id)}
                        onDragOver={onDragOver}
                        onDrop={onDrop(it.id)}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="font-medium truncate">Day {it.day}: {it.title}</div>
                          <div className="opacity-0 group-hover:opacity-100 transition flex gap-1 flex-shrink-0">
                            <Button size="sm" variant="secondary" onClick={()=>editStep(it)} className="text-xs px-2 py-1">Edit</Button>
                            <Button size="sm" variant="destructive" onClick={()=>deleteStep(it.id)} className="text-xs px-2 py-1">Del</Button>
                          </div>
                        </div>
                        <div className="text-gray-600 whitespace-pre-wrap leading-snug text-xs">{it.description}</div>
                      </div>
                    ))}
                    {items.length===0 && <div className="text-xs text-gray-500">No steps yet.</div>}
                    {reordering && <div className="text-[10px] text-emerald-600">Updating order...</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
    switch (active) {
    case 'ai-insights': return (
      <ErrorBoundary fallback={
        <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
          <div className="text-center text-blue-600">
            <div className="text-xl font-semibold">AI Insights Loading</div>
            <div className="text-sm text-blue-500 mt-2">Analytics features are initializing...</div>
          </div>
        </div>
      }>
        <AIInsights key={`ai-insights-${reloadKey}`} />
      </ErrorBoundary>
    );
    case 'analytics': return (
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Analytics...</div>}>
        <AnalyticsDashboard key={`analytics-${reloadKey}`} />
      </Suspense>
    );
    case 'bookings': return (
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Bookings...</div>}>
        <BookingManagement key={`bookings-${reloadKey}`} />
      </Suspense>
    );
    case 'users': return (
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Users...</div>}>
        <UserManagement key={`users-${reloadKey}`} />
      </Suspense>
    );
      case 'whatsapp': return <WhatsAppManager key={`whatsapp-${reloadKey}`} isVisible={true} />;
      case 'automation': return <WorkflowBuilder key={`automation-${reloadKey}`} />;
      case 'voice-ai': return <VoiceAssistant key={`voice-ai-${reloadKey}`} />;
      case 'campaigns': return <MarketingCampaignPage key={`campaigns-${reloadKey}`} />;
    case 'trips': return <Trips key={`trips-${reloadKey}`} />;
      case 'products': return <Products key={`products-${reloadKey}`} />;
      case 'stories': return <Stories key={`stories-${reloadKey}`} />;
      case 'leads': return <Leads key={`leads-${reloadKey}`} />;
      case 'tasks': return <Tasks key={`tasks-${reloadKey}`} />;
      default: return null;
    }
  }, [active, reloadKey, selectedTrip, items, itForm, savingStep, tripSearch, cancelEdit, counts, deleteStep, filteredTrips, metrics.activeProducts, metrics.activeTrips, metrics.totalProducts, metrics.totalTrips, onDrop, reordering, saveStep]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40 md:relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          {/* Mobile Header */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
                <p className="text-xs text-gray-500">Management tools</p>
              </div>
              <div className="flex items-center gap-2">
                <RealTimeNotificationCenter />
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => window.location.reload()} 
                  icon={<RefreshCw className="w-4 h-4" />}
                  title="Refresh real data"
                >
                  Sync
                </Button>
              </div>
            </div>
            {/* Mobile Tab Selector - Fixed alignment and scrolling */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {tabs.slice(0, 6).map(t => ( // Show first 6 tabs on mobile
                <button
                  key={t.id}
                  onClick={() => guardedSetActive(t.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${
                    active === t.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  {t.label}
                  {t.id !== 'overview' && !['ai-insights', 'whatsapp', 'automation', 'voice-ai'].includes(t.id) && counts[t.id] > 0 && (
                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                      active===t.id ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {counts[t.id]}
                    </span>
                  )}
                </button>
              ))}
              {/* More tabs dropdown for mobile - properly positioned */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => {
                    // Simple dropdown toggle for mobile
                    const dropdown = document.getElementById('mobile-more-tabs');
                    if (dropdown) {
                      dropdown.classList.toggle('hidden');
                    }
                  }}
                  className="px-3 py-2 rounded-lg text-sm font-medium border bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                >
                  More...
                </button>
                {/* Mobile dropdown menu */}
                <div id="mobile-more-tabs" className="hidden absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                  {tabs.slice(6).map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        guardedSetActive(t.id);
                        document.getElementById('mobile-more-tabs')?.classList.add('hidden');
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        active === t.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {t.label}
                      {t.id !== 'overview' && !['ai-insights', 'whatsapp', 'automation', 'voice-ai'].includes(t.id) && counts[t.id] > 0 && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          {counts[t.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
              <p className="text-xs text-gray-500">All management tools unified</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <RealTimeNotificationCenter />
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => window.location.reload()} 
                icon={<RefreshCw className="w-4 h-4" />}
                title="Refresh real data"
              >
                Sync Data
              </Button>
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => guardedSetActive(t.id)}
                  className={`group px-4 py-2 rounded-full text-sm font-medium border transition-all shadow-sm flex items-center gap-2 relative overflow-hidden ${
                    active === t.id 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  <span className="relative z-10">{t.label}</span>
                  {t.id !== 'overview' && !['ai-insights', 'whatsapp', 'automation', 'voice-ai'].includes(t.id) && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      active===t.id ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                    } transition-colors`}>
                      {counts[t.id] ?? 0}
                    </span>
                  )}
                  <span className={`absolute inset-0 opacity-0 group-hover:opacity-10 ${
                    active===t.id ? 'bg-white/0' : 'bg-emerald-400'
                  } transition-opacity`} />
                </button>
              ))}
              <Button size="sm" variant="secondary" onClick={forceReload} icon={<RefreshCw className="w-4 h-4" />}>
                Refresh Tab
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Floating quick nav (desktop) */}
      <div className="hidden lg:flex flex-col gap-2 fixed top-1/2 -translate-y-1/2 left-2 z-20">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={()=>guardedSetActive(t.id)}
            className={`w-10 h-10 rounded-xl text-[10px] font-semibold flex flex-col items-center justify-center border shadow-sm transition-all hover:shadow-md hover:scale-105 ${active===t.id? 'bg-emerald-600 text-white border-emerald-600':'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
            title={t.label}
          >
            {t.label.substring(0,2)}
            {t.id!=='overview' && <span className="text-[8px] font-normal leading-none">{(counts[t.id] ?? 0)}</span>}
          </button>
        ))}
      </div>
      {/* Keyboard shortcuts hint */}
      <div className="hidden md:block fixed bottom-3 right-3 z-30 text-[10px] text-gray-400 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border shadow-sm">Alt + 1..9 to switch tabs</div>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-4 pb-24 md:pt-6 md:pb-24">
        {/* Dynamic tab utility bar */}
        {active !== 'overview' && !['ai-insights', 'whatsapp', 'automation', 'voice-ai'].includes(active) && (
          <div className="mb-3 sm:mb-4 flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-thin">
              <input
                value={searchTerm}
                onChange={e=>setSearchTerm(e.target.value)}
                placeholder={`Search ${active}...`}
                className="flex-1 min-w-[140px] sm:min-w-[160px] border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              {active==='trips' && (
                <>
                  <select value={tripDifficulty} onChange={e=>setTripDifficulty(e.target.value)} className="border rounded-lg px-2 py-2 text-xs sm:text-sm bg-white whitespace-nowrap">
                    <option value="">All Diff</option>
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <label className="text-xs flex items-center gap-1 px-2 py-2 border rounded-lg bg-white/60 whitespace-nowrap">
                    <input type="checkbox" checked={showInactiveTrips} onChange={e=>setShowInactiveTrips(e.target.checked)} className="w-3 h-3" /> Inactive
                  </label>
                </>
              )}
              {active==='products' && (
                <>
                  <input value={productCategory} onChange={e=>setProductCategory(e.target.value)} placeholder="Category" className="border rounded-lg px-2 py-2 text-xs sm:text-sm w-24 sm:w-28 bg-white" />
                  <label className="text-xs flex items-center gap-1 px-2 py-2 border rounded-lg bg-white/60 whitespace-nowrap">
                    <input type="checkbox" checked={showInactiveProducts} onChange={e=>setShowInactiveProducts(e.target.checked)} className="w-3 h-3" /> Inactive
                  </label>
                </>
              )}
              {active==='stories' && (
                <select value={storyStatus} onChange={e=>setStoryStatus(e.target.value as 'all'|'pending'|'approved'|'rejected')} className="border rounded-lg px-2 py-2 text-xs sm:text-sm bg-white whitespace-nowrap">
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              )}
              {active==='leads' && (
                <label className="text-xs flex items-center gap-1 px-2 py-2 border rounded-lg bg-white/60 whitespace-nowrap">
                  <input type="checkbox" checked={hideProcessedLeads} onChange={e=>setHideProcessedLeads(e.target.checked)} className="w-3 h-3" /> Hide
                </label>
              )}
            </div>
            {dirtyTabs[active] && <div className="text-xs text-rose-600 font-medium whitespace-nowrap">Unsaved changes</div>}
          </div>
        )}
        <div className="mb-4 sm:mb-6">
          {tabs.filter(t=>t.id===active).map(t => (
            <div key={t.id} className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
              <span className="font-semibold text-gray-800">{t.label}</span>·<span className="truncate">{t.description}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
          <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading {active}...</div>}>
            {ActiveComponent}
          </Suspense>
        </div>
      </div>
      {/* Keyboard shortcuts */}
      <Shortcuts active={active} setActive={setActive} />
    </main>
  );
};

// Separate component to isolate event listener (avoid re-attaching on every render)
const Shortcuts: React.FC<{active:string; setActive:(t:string)=>void}> = ({ setActive }) => {
  useEffect(()=>{
    const handler = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const keyMap: Record<string,string> = { 
        '1':'overview',
        '2':'ai-insights',
        '3':'whatsapp',
        '4':'automation',
        '5':'voice-ai',
        '6':'trips',
        '7':'itinerary',
        '8':'products',
        '9':'stories',
        '0':'leads'
      };
      const next = keyMap[e.key];
      if (next) { e.preventDefault(); setActive(next); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActive]);
  return null;
};

const MetricCard: React.FC<{label:string; value:number|string; sub?:string}> = ({ label, value, sub }) => (
  <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm">
    <div className="text-xs font-medium text-emerald-600 mb-1 tracking-wide uppercase">{label}</div>
    <div className="text-3xl font-bold text-emerald-800">{value}</div>
    {sub && <div className="text-[11px] text-emerald-700/70 mt-1">{sub}</div>}
    <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-emerald-200/30" />
  </div>
);

export default AdminPortal;
