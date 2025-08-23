import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storiesApi, StoryItem } from '../services/stories';
import { Button } from '../components/ui/Button';
import { Star } from 'lucide-react';
import { LocalScene } from '../components/3d/LocalScene';
import { useAdventureStore } from '../store/adventureStore';
import { BadgeCheck, ShieldAlert, XCircle } from 'lucide-react';

export const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<StoryItem | null>(null);
  const { user } = useAdventureStore();

  useEffect(() => {
    if (!id) return;
    storiesApi.getStory(id).then(setStory).catch(console.error);
  }, [id]);

  if (!story) return <main className="max-w-3xl mx-auto px-4 py-10">Loading…</main>;

  const rate = async (v: number) => {
    await storiesApi.rateStory(story.id, v);
    const fresh = await storiesApi.getStory(story.id);
    setStory(fresh);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 relative">
      <div className="absolute -top-6 -right-6 opacity-40"><LocalScene variant="dust" size={130} /></div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">{story.title} {story.status === 'approved' && <BadgeCheck className="w-6 h-6 text-emerald-600" />}</h1>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span>By {story.authorName} · {new Date(story.createdAt).toLocaleDateString()}</span>
            {story.status === 'pending' && <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200"><ShieldAlert className="w-3 h-3" /> Pending</span>}
            {story.status === 'rejected' && <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200"><XCircle className="w-3 h-3" /> Rejected</span>}
          </div>
          {user?.isAdmin && story.status === 'rejected' && story.rejectionReason && (
            <div className="mt-2 text-xs text-rose-600">Reason: {story.rejectionReason}</div>
          )}
        </div>
        {user?.isAdmin && story.status === 'pending' && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={async () => { await storiesApi.approveStory(story.id); const fresh = await storiesApi.getStory(story.id); setStory(fresh); }}>Approve</Button>
            <Button variant="adventure" size="sm" onClick={async () => { const reason = prompt('Reason for rejection?') || 'Not suitable'; await storiesApi.rejectStory(story.id, reason); const fresh = await storiesApi.getStory(story.id); setStory(fresh); }}>Reject</Button>
          </div>
        )}
      </div>
      {story.images?.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {story.images.map((src, i) => (
            <img key={i} src={src} className="w-full h-48 object-cover rounded" />
          ))}
        </div>
      )}
      <p className="mt-4 whitespace-pre-wrap leading-7">{story.text}</p>
      {story.audioUrl && (
        <audio controls className="mt-6 w-full">
          <source src={story.audioUrl} />
        </audio>
      )}

      <div className="mt-6 flex items-center gap-2">
        <span className="text-gray-600">Rate:</span>
        {[1,2,3,4,5].map(n => (
          <Button key={n} variant="secondary" size="sm" onClick={() => rate(n)} disabled={story.status !== 'approved'}>
            <Star className="w-4 h-4" /> {n}
          </Button>
        ))}
        <span className="ml-3 text-yellow-700 flex items-center gap-1"><Star className="w-4 h-4" /> {story.avgRating.toFixed(1)}</span>
      </div>
    </main>
  );
};

export default StoryDetailPage;
