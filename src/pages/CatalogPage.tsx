import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, X, Star, MapPin, Clock, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface TripDoc { id: string; name: string; location: string; duration?: string; difficulty?: string; price?: number; images?: string[]; tags?: string[]; description?: string; rating?: number; reviewCount?: number; }

function deriveCategory(t: TripDoc): string {
  const tags = (t.tags || []).map(s => s.toLowerCase());
  const name = t.name.toLowerCase();
  if (tags.includes('waterfalls') || tags.includes('waterfall') || name.includes('falls')) return 'Waterfall';
  if (tags.includes('fort') || name.includes('fort')) return 'Fort';
  if (tags.includes('beach') || name.includes('beach')) return 'Beach';
  if (tags.includes('mountain') || tags.includes('peak') || name.includes('peak')) return 'Mountain';
  return 'Adventure';
}

export const CatalogPage: React.FC = () => {
  const [trips, setTrips] = useState<TripDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [queryText, setQueryText] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!db) {
          setError('Firestore database not available');
          setLoading(false);
          return;
        }
        const snap = await getDocs(collection(db, 'trips'));
        if (!active) return;
        setTrips(snap.docs.map(d => {
          const data = d.data() as Omit<TripDoc, 'id'>;
          return { id: d.id, ...data };
        }));
      } catch (e: unknown) {
        setError((e as Error).message || 'Failed to load catalog');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const meta = useMemo(()=>{ const prices = trips.map(t=>t.price||0); return { maxObserved: prices.length? Math.max(...prices):0 }; },[trips]);

  const normalized = useMemo(()=> trips.map(t=>({
    id: t.id,
    name: t.name,
    location: t.location || 'TBD',
    rating: t.rating || 4.7,
    reviewCount: t.reviewCount || 0,
    price: t.price || 0,
    duration: t.duration || '2 Days',
    difficulty: (t.difficulty || 'Moderate'),
    category: deriveCategory(t),
    image: (t.images && t.images[0]) || 'https://picsum.photos/600/400?random=adventure',
    description: t.description || 'Adventure experience'
  })),[trips]);

  const maxSlider = Math.max(10000, Math.ceil((meta.maxObserved||0)/10000)*10000);
  const filtered = useMemo(()=> normalized.filter(n=>{ if(queryText){ const q=queryText.toLowerCase(); if(!(n.name.toLowerCase().includes(q)||n.location.toLowerCase().includes(q)||n.description.toLowerCase().includes(q))) return false; } if(difficulty!=='all' && !new RegExp(difficulty,'i').test(n.difficulty)) return false; if(n.price > maxPrice) return false; return true; }),[normalized, queryText, difficulty, maxPrice]);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="mb-10 text-center">
          <h1 className="text-4xl lg:text-6xl font-oswald font-bold mb-4 bg-gradient-to-r from-forest-green to-adventure-orange bg-clip-text text-transparent">Full Adventure Catalog</h1>
          <p className="text-mountain-blue dark:text-gray-300 text-lg max-w-3xl mx-auto">Explore every trip we offer with powerful filtering & instant search.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input value={queryText} onChange={e=>setQueryText(e.target.value)} placeholder="Search trips, locations, descriptions" className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] focus:ring-2 focus:ring-adventure-orange/50 outline-none" />
            {queryText && <button onClick={()=>setQueryText('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" size="sm" onClick={()=>setShowFilters(s=>!s)} className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</Button>
            <Link to="/destinations"><Button variant="secondary" size="sm">Classic View</Button></Link>
          </div>
        </div>

        {showFilters && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 mb-8 grid gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold mb-2">Difficulty</label>
              <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                <option value="all">All</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Max Price (₹{maxPrice.toLocaleString()})</label>
              <input type="range" min={0} max={maxSlider} step={500} value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span><span>{maxSlider.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={()=>{setDifficulty('all'); setMaxPrice(maxSlider);}}>Reset</Button>
              <p className="text-xs text-gray-500">Showing {filtered.length} of {normalized.length} trips</p>
            </div>
          </motion.div>
        )}

        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({length:6}).map((_,i)=>(<div key={i} className="h-80 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />))}
          </div>
        )}
        {error && !loading && <div className="text-red-600 text-center py-20">{error}</div>}
        {!loading && !error && (
          <motion.div layout className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t,i)=>(
              <motion.div key={t.id} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.5, delay:0.04*i}} whileHover={{y:-6}}>
                <Card className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-52 overflow-hidden">
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-gray-700">{t.category}</div>
                    <div className="absolute top-3 right-3 bg-adventure-orange text-white px-3 py-1 rounded-full text-xs font-oswald font-bold">₹{t.price.toLocaleString()}</div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" /> {t.rating.toFixed(1)} <span className="opacity-70">({t.reviewCount})</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-oswald font-bold text-forest-green mb-1 line-clamp-1">{t.name}</h3>
                    <div className="flex items-center text-gray-600 text-xs mb-3"><MapPin className="w-4 h-4 mr-1" /> {t.location}</div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{t.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {t.duration}</div>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{t.difficulty}</span>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Link to={`/trip/${t.id}`} className="flex-1"><Button variant="adventure" size="sm" className="w-full">Details</Button></Link>
                      <Link to="/payment"><Button variant="secondary" size="sm" className="px-3">Book</Button></Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && !error && filtered.length===0 && (
          <div className="text-center py-24">
            <p className="text-gray-500 mb-4">No trips match your filters.</p>
            <Button variant="adventure" onClick={()=>{ setQueryText(''); setDifficulty('all'); setMaxPrice(maxSlider); }}>Reset Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
