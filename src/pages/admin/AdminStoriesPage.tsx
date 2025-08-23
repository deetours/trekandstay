import React, { useEffect, useState } from 'react';
import { storiesApi, StoryItem } from '../../services/stories';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ShieldAlert, ThumbsUp, ThumbsDown, RefreshCcw } from 'lucide-react';

const statusColors: Record<string,string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200'
};

const AdminStoriesPage: React.FC = () => {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all'|'pending'|'approved'|'rejected'>('pending');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await storiesApi.listStories({ includePending: true });
      setStories(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: 'approve'|'reject') => {
    if (action === 'approve') await storiesApi.approveStory(id);
    else {
      const reason = prompt('Reason for rejection?') || 'Not suitable';
      await storiesApi.rejectStory(id, reason);
    }
    await load();
  };

  const filtered = stories.filter(s => {
    if (filter !== 'all' && (s.status || 'approved') !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.authorName.toLowerCase().includes(q) || s.destination.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">Story Moderation <ShieldAlert className="w-7 h-7 text-amber-600" /></h1>
        <div className="flex gap-2 flex-wrap">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search stories..." className="border rounded px-3 py-2 text-sm" />
          <select value={filter} onChange={e=>setFilter(e.target.value as 'all'|'pending'|'approved'|'rejected')} className="border rounded px-3 py-2 text-sm">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button variant="secondary" size="sm" onClick={load} icon={<RefreshCcw className="w-4 h-4" />}>Refresh</Button>
        </div>
      </div>
      {loading && <div className="text-sm text-gray-500">Loading stories...</div>}
      {!loading && filtered.length === 0 && <div className="text-sm text-gray-500">No stories match filter.</div>}
      <div className="space-y-4">
        {filtered.map(s => (
          <Card key={s.id} className="p-5 border flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-lg">{s.title}</h2>
                <div className="text-xs text-gray-500">By {s.authorName} · {new Date(s.createdAt).toLocaleDateString()} · {s.destination}</div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full border h-fit ${statusColors[s.status||'approved']}`}>{s.status || 'approved'}</span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-4 whitespace-pre-wrap">{s.text}</p>
            {s.images?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {s.images.slice(0,4).map((img,i)=>(<img key={i} src={img} alt="story" className="w-24 h-16 object-cover rounded" loading="lazy" />))}
                {s.images.length>4 && <div className="text-xs text-gray-500 self-center">+{s.images.length-4} more</div>}
              </div>
            )}
            {s.audioUrl && <audio controls className="w-full"><source src={s.audioUrl} /></audio>}
            <div className="flex gap-2 flex-wrap">
              {s.status === 'pending' && (
                <>
                  <Button size="sm" variant="adventure" onClick={()=>act(s.id,'approve')} icon={<ThumbsUp className="w-4 h-4" />}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={()=>act(s.id,'reject')} icon={<ThumbsDown className="w-4 h-4" />}>Reject</Button>
                </>
              )}
              {s.status === 'rejected' && s.rejectionReason && (
                <div className="text-xs text-rose-600">Reason: {s.rejectionReason}</div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default AdminStoriesPage;
