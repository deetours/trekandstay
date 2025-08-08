import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storiesApi, StoryItem } from '../services/stories';
import { Button } from '../components/ui/Button';
import { Star } from 'lucide-react';

export const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<StoryItem | null>(null);

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
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">{story.title}</h1>
      <div className="text-sm text-gray-500">By {story.authorName} · {new Date(story.createdAt).toLocaleDateString()}</div>
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
          <Button key={n} variant="secondary" size="sm" onClick={() => rate(n)}>
            <Star className="w-4 h-4" /> {n}
          </Button>
        ))}
        <span className="ml-3 text-yellow-700 flex items-center gap-1"><Star className="w-4 h-4" /> {story.avgRating.toFixed(1)}</span>
      </div>
    </main>
  );
};

export default StoryDetailPage;
