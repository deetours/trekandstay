// Map amenity names to icons
const amenitiesIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'WiFi': Wifi,
  'Parking': Car,
  'Restaurant': Coffee,
  'Gym': Users,
  'Pool': Waves,
  'Room Service': Clock,
  'Garden': Home,
  'Beach Access': Waves,
  'Fireplace': Mountain,
  'Lake View': Waves,
  'Spa': Star,
  'Kitchen': Coffee,
  'BBQ Area': Coffee,
  'Home-cooked meals': Coffee,
  'Coffee Plantation': Mountain,
  'Wildlife Safari': Mountain,
  'Sunset Views': Star,
  'Nature Walks': Mountain,
  'Bird Watching': Star
};
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  Bed,
  Hotel,
  Home,
  TreePine,
  Waves,
  Mountain,
  Users,
  Wifi,
  Car,
  Coffee
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/layout/PageTransition';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { LocalScene } from '../components/3d/LocalScene';

interface StayDoc { 
  id: string; 
  name: string; 
  location: string; 
  type?: string; 
  capacity?: number; 
  price?: number; 
  images?: string[]; 
  amenities?: string[]; 
  description?: string; 
  features?: string[]; 
  rating?: number; 
  reviewCount?: number; 
}

// Derive canonical category from name/type
function deriveStayCategory(s: StayDoc): 'hotel' | 'homestay' | 'resort' | 'villa' | 'cottage' | 'other' {
  const type = (s.type || '').toLowerCase();
  const name = s.name.toLowerCase();
  
  if (type.includes('hotel') || name.includes('hotel')) return 'hotel';
  if (type.includes('homestay') || name.includes('homestay')) return 'homestay';
  if (type.includes('villa') || name.includes('villa')) return 'villa';
  if (type.includes('cottage') || name.includes('cottage')) return 'cottage';
  return 'other';
}

const categories = [
  { id: 'all', name: 'All Stays', icon: Bed },
  { id: 'hotel', name: 'Hotels', icon: Hotel },
  { id: 'homestay', name: 'Homestays', icon: Home },
  { id: 'resort', name: 'Resorts', icon: TreePine },
  { id: 'villa', name: 'Villas', icon: Mountain },
  { id: 'cottage', name: 'Cottages', icon: Waves }
];

const capacities = ['All', '1-2 Guests', '3-4 Guests', '5+ Guests'];

const routeCategoryMeta: Record<string, { title: string; subtitle: string }> = {
  hotels: { title: 'Premium Hotels', subtitle: 'Luxurious accommodations with world-class amenities and service.' },
  homestays: { title: 'Cozy Homestays', subtitle: 'Experience local culture with authentic home-style hospitality.' },
  resorts: { title: 'Resort Getaways', subtitle: 'All-inclusive resorts for the perfect vacation escape.' },
  villas: { title: 'Private Villas', subtitle: 'Exclusive villas offering privacy and personalized luxury.' }
};

export const StaysPage: React.FC = () => {
  const location = useLocation();
  const pathSegment = location.pathname.split('/').filter(Boolean).pop() || '';
  const [rawStays, setRawStays] = useState<StayDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCapacity, setSelectedCapacity] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  // Mock data for stays (replace with Firebase call later)

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setRawStays([
        {
          id: '1',
          name: 'Mountain View Resort',
          location: 'Coorg, Karnataka',
          type: 'Resort',
          capacity: 4,
          price: 8500,
          rating: 4.8,
          reviewCount: 142,
          images: ['https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg'],
          amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa'],
          description: 'Luxury resort nestled in the hills with panoramic mountain views',
          features: ['Mountain View', 'Swimming Pool', 'Spa Services', 'Fine Dining']
        },
        {
          id: '2',
          name: 'Heritage Homestay',
          location: 'Hampi, Karnataka',
          type: 'Homestay',
          capacity: 6,
          price: 3500,
          rating: 4.6,
          reviewCount: 89,
          images: ['https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg'],
          amenities: ['WiFi', 'Home-cooked meals', 'Garden', 'Parking'],
          description: 'Traditional homestay near ancient ruins with warm hospitality',
          features: ['Cultural Experience', 'Home-cooked Food', 'Garden View', 'Local Guide']
        },
        {
          id: '3',
          name: 'Beachside Villa',
          location: 'Gokarna, Karnataka',
          type: 'Villa',
          capacity: 8,
          price: 12000,
          rating: 4.9,
          reviewCount: 67,
          images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
          amenities: ['Beach Access', 'WiFi', 'Kitchen', 'BBQ Area'],
          description: 'Private villa with direct beach access and stunning sunset views',
          features: ['Beach Access', 'Private Kitchen', 'BBQ Area', 'Sunset Views']
        },
        {
          id: '4',
          name: 'Forest Cottage',
          location: 'Chikmagalur, Karnataka',
          type: 'Cottage',
          capacity: 4,
          price: 4500,
          rating: 4.7,
          reviewCount: 93,
          images: ['https://images.pexels.com/photos/1767434/pexels-photo-1767434.jpeg'],
          amenities: ['WiFi', 'Fireplace', 'Garden', 'Coffee Plantation'],
          description: 'Cozy cottage surrounded by coffee plantations and nature',
          features: ['Coffee Plantation', 'Fireplace', 'Nature Walks', 'Bird Watching']
        },
        {
          id: '5',
          name: 'Luxury Hotel',
          location: 'Mysore, Karnataka',
          type: 'Hotel',
          capacity: 2,
          price: 6500,
          rating: 4.5,
          reviewCount: 156,
          images: ['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'],
          amenities: ['WiFi', 'Gym', 'Restaurant', 'Room Service'],
          description: 'Luxury hotel in the heart of the city with modern amenities',
          features: ['City Center', 'Modern Amenities', 'Business Center', '24/7 Service']
        },
        {
          id: '6',
          name: 'Lake View Resort',
          location: 'Kabini, Karnataka',
          type: 'Resort',
          capacity: 6,
          price: 9500,
          rating: 4.8,
          reviewCount: 78,
          images: ['https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg'],
          amenities: ['Lake View', 'Wildlife Safari', 'Restaurant', 'Spa'],
          description: 'Resort overlooking pristine lake with wildlife safari experiences',
          features: ['Lake View', 'Wildlife Safari', 'Nature Photography', 'Boat Rides']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const stays = useMemo(() => rawStays.map(s => {
    const category = deriveStayCategory(s);
    return {
      id: s.id,
      name: s.name,
      location: s.location || 'TBD',
      rating: s.rating || 4.5,
      reviews: s.reviewCount || 0,
      capacity: s.capacity || 2,
      price: s.price || 5000,
      category,
      image: (s.images && s.images[0]) || 'https://picsum.photos/600/400?random=stay',
      description: s.description || 'Comfortable accommodation',
      features: s.features && s.features.length ? s.features : ['Comfortable', 'Clean', 'Well-located'],
      amenities: s.amenities || []
    };
  }), [rawStays]);

  const filteredStays = useMemo(() => {
    let filtered = stays;
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.location.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q)
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    if (selectedCapacity !== 'All') {
      if (selectedCapacity === '1-2 Guests') {
        filtered = filtered.filter(s => s.capacity <= 2);
      } else if (selectedCapacity === '3-4 Guests') {
        filtered = filtered.filter(s => s.capacity >= 3 && s.capacity <= 4);
      } else if (selectedCapacity === '5+ Guests') {
        filtered = filtered.filter(s => s.capacity >= 5);
      }
    }
    
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'price': return a.price - b.price;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
    
    return filtered;
  }, [stays, searchTerm, selectedCategory, selectedCapacity, sortBy]);

  const getCapacityColor = (capacity: number) => {
    if (capacity <= 2) return 'text-blue-600 bg-blue-50';
    if (capacity <= 4) return 'text-green-600 bg-green-50';
    return 'text-purple-600 bg-purple-50';
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData ? categoryData.icon : Bed;
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
              {routeCategoryMeta[pathSegment]?.title || 'Comfortable Stays'}
            </h1>
            <p className="text-xl text-mountain-blue font-inter max-w-3xl mx-auto">
              {routeCategoryMeta[pathSegment]?.subtitle || 'Find perfect accommodations for your next adventure. From luxury resorts to cozy homestays.'}
            </p>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
              ))}
            </div>
          )}


          {!loading && (
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
                    placeholder="Search stays by name, location, or amenities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-forest-green focus:border-transparent transition-all bg-white"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stay Type</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent bg-white"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Capacity Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Guests</label>
                    <select
                      value={selectedCapacity}
                      onChange={(e) => setSelectedCapacity(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent bg-white"
                    >
                      {capacities.map(cap => (
                        <option key={cap} value={cap}>{cap}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent bg-white"
                    >
                      <option value="rating">Rating</option>
                      <option value="price">Price (Low to High)</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedCapacity('All');
                        setSortBy('rating');
                      }}
                      className="w-full h-12"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Results Count */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p className="text-mountain-blue">
                  Found <span className="font-semibold text-forest-green">{filteredStays.length}</span> stays
                </p>
              </motion.div>

              {/* Stays Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {filteredStays.map((stay, index) => {
                  const IconComponent = getCategoryIcon(stay.category);
                  return (
                    <motion.div
                      key={stay.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                        {/* Image */}
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={stay.image}
                            alt={stay.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCapacityColor(stay.capacity)}`}>
                              <Users className="w-4 h-4 inline mr-1" />
                              {stay.capacity} Guests
                            </span>
                          </div>
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-sm font-medium text-gray-800">
                              <IconComponent className="w-4 h-4 inline mr-1" />
                              {categories.find(c => c.id === stay.category)?.name}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-forest-green transition-colors">
                                {stay.name}
                              </h3>
                              <p className="text-mountain-blue flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {stay.location}
                              </p>
                            </div>
                            <div className="flex items-center text-amber-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="ml-1 text-sm font-semibold">{stay.rating}</span>
                              <span className="text-gray-500 text-xs ml-1">({stay.reviews})</span>
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {stay.description}
                          </p>

                          {/* Features */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {stay.features.slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>

                          {/* Amenities */}
                          <div className="flex items-center gap-3 mb-4 text-gray-500">
                            {stay.amenities.map((amenity, idx) => {
                              const Icon = amenitiesIconMap[amenity] || Star;
                              return <Icon key={idx} className="w-4 h-4" />;
                            })}
                          </div>

                          {/* Price and Book Button */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-forest-green">
                                ₹{stay.price.toLocaleString()}
                              </span>
                              <span className="text-gray-500 text-sm ml-1">/night</span>
                            </div>
                            <Link to={`/stays/${stay.id}`}>
                              <Button className="bg-forest-green hover:bg-forest-green/90">
                                Book Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* No Results */}
              {filteredStays.length === 0 && (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Bed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No stays found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search criteria</p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedCapacity('All');
                    }}
                  >
                    Clear All Filters
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

export default StaysPage;
