import React, { useEffect, useState } from 'react';
import { storiesApi, StoryItem } from '../services/stories';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';


export const StoriesPage: React.FC = () => {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    storiesApi.listStories().then((data) => {
      if (mounted) setStories(data);
    }).finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <PageTransition>
      {loading ? (
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </main>
      ) : (
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Traveler Stories</h1>
            <Link to="/stories/new"><Button>Share your story</Button></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((s) => (
              <Card key={s.id} className="overflow-hidden">
                {s.images?.[0] && (
                  <img src={s.images[0]} alt={s.title} className="w-full h-40 object-cover" loading="lazy" />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <div className="text-sm text-gray-500">By {s.authorName} · {new Date(s.createdAt).toLocaleDateString()}</div>
                  <p className="mt-2 text-sm text-gray-700 line-clamp-3">{s.text}</p>
                  {s.audioUrl && (
                    <audio controls className="mt-3 w-full">
                      <source src={s.audioUrl} />
                    </audio>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-600"><Star className="w-4 h-4" /> {s.avgRating.toFixed(1)}</div>
                    <Link to={`/stories/${s.id}`}><Button variant="secondary" size="sm">Read</Button></Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      )}
    </PageTransition>
  );
};

export default StoriesPage;
