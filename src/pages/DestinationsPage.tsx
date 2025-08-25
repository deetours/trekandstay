import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  Camera,
  Mountain,
  TreePine,
  Waves,
  Castle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/layout/PageTransition';
import { Link, useLocation } from 'react-router-dom';
import { usePopupTriggers } from '../hooks/usePopupTriggers';
import { Logo } from '../components/common/Logo';
import { LocalScene } from '../components/3d/LocalScene';
import { collection, getDocs } from 'firebase/firestore';
import { db, waitForFirestore, getDbOrThrow } from '../firebase';

interface TripDoc { id: string; name: string; location: string; duration?: string; difficulty?: string; price?: number; images?: string[]; tags?: string[]; description?: string; highlights?: string[]; rating?: number; reviewCount?: number; }

// Derive canonical category from name/tags
function deriveCategory(t: TripDoc): 'waterfall' | 'fort' | 'mountain' | 'forest' | 'beach' | 'other' {
  const tags = (t.tags || []).map(x => x.toLowerCase());
  const name = t.name.toLowerCase();
  if (tags.includes('waterfalls') || tags.includes('waterfall') || name.includes('falls') || name.includes('waterfall')) return 'waterfall';
  if (tags.includes('fort') || name.includes('fort')) return 'fort';
  if (tags.includes('beach') || name.includes('beaches') || name.includes('beach')) return 'beach';
  if (tags.includes('forest') || tags.includes('wildlife')) return 'forest';
  if (tags.includes('mountain') || tags.includes('peak') || name.includes('peak')) return 'mountain';
  return 'other';
}

const categories = [
  { id: 'all', name: 'All Adventures', icon: Mountain },
  { id: 'waterfall', name: 'Waterfalls', icon: Waves },
  { id: 'fort', name: 'Forts & Heritage', icon: Castle },
  { id: 'mountain', name: 'Mountains', icon: Mountain },
  { id: 'forest', name: 'Forests & Wildlife', icon: TreePine },
  { id: 'beach', name: 'Beaches', icon: Waves }
];

const difficulties = ['All', 'Easy', 'Moderate', 'Hard'];

const routeCategoryMeta: Record<string,{title:string;subtitle:string}> = {
  waterfalls: { title: 'Waterfall Expeditions', subtitle: 'Chase cascading wonders across hidden valleys and rainforest canyons.' },
  forts: { title: 'Fort Adventures', subtitle: 'Scale historic ramparts and relive tales of valor atop ancient strongholds.' },
  beaches: { title: 'Beach Exploration', subtitle: 'Salt air, golden sands, and coastal trails for the soul and senses.' },
  hills: { title: 'Hill Treks', subtitle: 'Misty ridgelines, emerald slopes, and panoramic sunrise summits.' }
};

export const DestinationsPage: React.FC = () => {
  const location = useLocation();
  const { trackTripView } = usePopupTriggers();
  
  // Derive path segment once
  const pathSegment = location.pathname.split('/').filter(Boolean).pop() || '';
  const [rawTrips, setRawTrips] = useState<TripDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  // Preselect category if navigated from category-specific route (optional future use)
  useEffect(() => {
    const path = pathSegment;
    if (path && ['waterfalls','forts','beaches','hills'].includes(path)) {
      const map: Record<string,string> = { waterfalls: 'waterfall', forts: 'fort', beaches: 'beach', hills: 'mountain' };
      setSelectedCategory(map[path]);
    }
  }, [pathSegment]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let activeDb = db;
        if (!activeDb) {
          try { activeDb = await waitForFirestore(3000); } catch { try { activeDb = getDbOrThrow(); } catch { activeDb = undefined; } }
        }
        if (!activeDb) {
          setError('Firestore database not available');
          return;
        }
        const snap = await getDocs(collection(activeDb, 'trips'));
        if (!active) return;
        const trips: TripDoc[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<TripDoc, 'id'>) }));
        setRawTrips(trips);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load destinations';
        setError(message);
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const destinations = useMemo(() => rawTrips.map(t => {
    // Normalize difficulty simple bucket by first word
    let diff = t.difficulty || 'Moderate';
    if (/easy/i.test(diff)) diff = 'Easy'; else if (/hard|difficult|challenging/i.test(diff)) diff = 'Hard'; else if (/moderate/i.test(diff)) diff = 'Moderate';
    const category = deriveCategory(t);
    return {
      id: t.id,
      name: t.name,
      location: t.location || 'TBD',
      rating: t.rating || 4.7,
      reviews: t.reviewCount || 0,
      duration: t.duration || '2 Days',
      difficulty: diff as 'Easy' | 'Moderate' | 'Hard',
      price: t.price || 0,
      category,
      image: (t.images && t.images[0]) || 'https://via.placeholder.com/600x400?text=Adventure',
      description: t.description || 'Adventure experience',
      highlights: t.highlights && t.highlights.length ? t.highlights : ['Scenic views','Great experience','Guided trek']
    };
  }), [rawTrips]);

  const filteredDestinations = useMemo(() => {
    let filtered = destinations;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(d => d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'all') filtered = filtered.filter(d => d.category === selectedCategory);
    if (selectedDifficulty !== 'All') filtered = filtered.filter(d => d.difficulty === selectedDifficulty);
    filtered = [...filtered].sort((a,b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'price': return a.price - b.price;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
    return filtered;
  }, [destinations, searchTerm, selectedCategory, selectedDifficulty, sortBy]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData ? categoryData.icon : Mountain;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-stone-gray pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-10 right-10 opacity-60">
          <LocalScene variant="fireflies" size={180} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-center mb-4">
              <Logo size="lg" showText={false} />
            </div>
            <h1 className="text-4xl lg:text-6xl font-oswald font-bold text-forest-green mb-4">
              {routeCategoryMeta[pathSegment]?.title || 'Adventure Destinations'}
            </h1>
            <p className="text-xl text-mountain-blue font-inter max-w-3xl mx-auto">
              {routeCategoryMeta[pathSegment]?.subtitle || 'Discover curated adventures. Search, filter and find your next trek.'}
            </p>
          </motion.div>

          {/* Loading / Error */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {Array.from({ length:6 }).map((_,i)=>(<div key={i} className="h-96 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />))}
            </div>
          )}
          {error && !loading && <div className="text-center text-red-600 mb-8">{error}</div>}

          {!loading && !error && (
            <>
              <motion.div
                className="rounded-2xl shadow-xl p-6 mb-8 bg-[var(--card)] border border-[var(--border)] transition-colors"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search destinations, locations, or activities..."
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-adventure-orange focus:border-transparent transition-all duration-200 text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {categories.map(c => { const Icon = c.icon; return (
                    <button key={c.id} onClick={()=>setSelectedCategory(c.id)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${selectedCategory===c.id? 'bg-adventure-orange text-white shadow-lg':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      <Icon className="w-4 h-4" /><span className="font-medium">{c.name}</span>
                    </button>
                  );})}
                </div>

                {/* Difficulty and Sort */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-adventure-orange focus:border-transparent"
                    >
                      {difficulties.map(d => <option key={d} value={d}>Difficulty: {d}</option>)}
                    </select>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-adventure-orange focus:border-transparent"
                  >
                    <option value="rating">Sort by Rating</option>
                    <option value="price">Sort by Price</option>
                    <option value="name">Sort by Name</option>
                  </select>
                </div>
              </motion.div>

              {/* Results Count */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p className="text-gray-600 font-inter">
                  Showing {filteredDestinations.length} destinations
                  {selectedCategory!=='all' && ` in ${categories.find(c=>c.id===selectedCategory)?.name}`}
                  {routeCategoryMeta[pathSegment] && selectedCategory==='all' && ' (all categories)'}
                </p>
              </motion.div>

              {/* Destinations Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {filteredDestinations.map((d,i)=>{ const CategoryIcon = getCategoryIcon(d.category); return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.05*i }}
                    whileHover={{ y: -8 }}
                    className="group"
                  >
                    <Card className="overflow-hidden h-full hover:shadow-2xl transition-all duration-300">
                      {/* Image */}
                      <div className="relative overflow-hidden h-64">
                        <img
                          src={d.image}
                          alt={d.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                            <CategoryIcon className="w-4 h-4 text-adventure-orange" />
                            <span className="text-gray-700 capitalize">{d.category}</span>
                          </div>
                        </div>

                        {/* Difficulty Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(d.difficulty)}`}>
                            {d.difficulty}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="absolute bottom-4 right-4">
                          <div className="bg-adventure-orange text-white px-3 py-1 rounded-full font-oswald font-bold">
                            ₹{d.price.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-oswald font-bold text-forest-green group-hover:text-adventure-orange transition-colors mb-2">
                          {d.name}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{d.location}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {d.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-between mb-4 text-sm">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <span className="font-medium">{d.rating.toFixed(1)}</span>
                              <span className="text-gray-500 ml-1">({d.reviews})</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{d.duration}</span>
                            </div>
                          </div>
                        </div>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {d.highlights.slice(0,3).map((h,hi)=>(<span key={hi} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{h}</span>))}
                          {d.highlights.length>3 && (<span className="text-xs text-gray-500">+{d.highlights.length-3} more</span>)}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Link to={`/trip/${d.id}`} className="flex-1" onClick={trackTripView}>
                            <Button
                              variant="adventure"
                              size="sm"
                              className="w-full font-oswald"
                            >
                              View Details
                            </Button>
                          </Link>
                          <Link to="/payment">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="px-3"
                            >
                              Book
                            </Button>
                          </Link>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="px-3"
                          >
                            <Camera className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );})}
              </motion.div>

              {/* Empty State */}
              {filteredDestinations.length===0 && (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Mountain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-oswald font-bold text-gray-600 mb-2">
                    No destinations found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search or filters.
                  </p>
                  <Button
                    variant="adventure"
                    onClick={()=>{setSearchTerm('');setSelectedCategory('all');setSelectedDifficulty('All');}}
                  >
                    Show All
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default DestinationsPage;
