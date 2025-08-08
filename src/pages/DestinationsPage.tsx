import React, { useState, useMemo } from 'react';
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
import { Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';

interface Destination {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  duration: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  price: number;
  image: string;
  category: 'waterfall' | 'fort' | 'mountain' | 'forest';
  description: string;
  highlights: string[];
  bestTime: string;
}

const destinations: Destination[] = [
  {
    id: 1,
    name: "Jog Falls",
    location: "Sagara, Karnataka",
    rating: 4.8,
    reviews: 1245,
    duration: "2 days",
    difficulty: "Easy",
    price: 2499,
    category: "waterfall",
    image: "https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "India's second-highest plunge waterfall, offering breathtaking views and monsoon magic.",
    highlights: ["Photography", "Nature Walk", "Viewpoints", "Local Cuisine"],
    bestTime: "Jul-Feb"
  },
  {
    id: 2,
    name: "Hampi Heritage",
    location: "Hampi, Karnataka",
    rating: 4.9,
    reviews: 2341,
    duration: "3 days",
    difficulty: "Moderate",
    price: 3999,
    category: "fort",
    image: "https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "UNESCO World Heritage site with stunning ruins and boulder landscapes.",
    highlights: ["Historical Sites", "Rock Climbing", "Sunset Views", "Cultural Experience"],
    bestTime: "Oct-Mar"
  },
  {
    id: 3,
    name: "Kodachadri Peak",
    location: "Shimoga, Karnataka",
    rating: 4.7,
    reviews: 856,
    duration: "2 days",
    difficulty: "Hard",
    price: 1999,
    category: "mountain",
    image: "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Challenging trek through Western Ghats with panoramic sunset views.",
    highlights: ["Trekking", "Sunrise/Sunset", "Wildlife", "Adventure Sports"],
    bestTime: "Oct-Feb"
  },
  {
    id: 4,
    name: "Bandipur Safari",
    location: "Bandipur, Karnataka",
    rating: 4.6,
    reviews: 723,
    duration: "2 days",
    difficulty: "Easy",
    price: 3299,
    category: "forest",
    image: "https://images.pexels.com/photos/35990/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
    description: "Wildlife sanctuary experience with tigers, elephants, and diverse flora.",
    highlights: ["Wildlife Safari", "Bird Watching", "Photography", "Nature Walks"],
    bestTime: "Nov-May"
  },
  {
    id: 5,
    name: "Chitradurga Fort",
    location: "Chitradurga, Karnataka",
    rating: 4.5,
    reviews: 567,
    duration: "1 day",
    difficulty: "Easy",
    price: 1299,
    category: "fort",
    image: "https://images.pexels.com/photos/1139556/pexels-photo-1139556.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Historic hill fort with intricate architecture and panoramic views.",
    highlights: ["Historical Architecture", "Hill Climbing", "Photography", "Local History"],
    bestTime: "Oct-Mar"
  },
  {
    id: 6,
    name: "Abbey Falls",
    location: "Coorg, Karnataka",
    rating: 4.4,
    reviews: 934,
    duration: "1 day",
    difficulty: "Easy",
    price: 1799,
    category: "waterfall",
    image: "https://images.pexels.com/photos/1450273/pexels-photo-1450273.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Picturesque waterfall in coffee plantations with serene surroundings.",
    highlights: ["Coffee Plantation", "Photography", "Nature Walk", "Peaceful Environment"],
    bestTime: "Oct-Mar"
  }
];

const categories = [
  { id: 'all', name: 'All Adventures', icon: Mountain },
  { id: 'waterfall', name: 'Waterfalls', icon: Waves },
  { id: 'fort', name: 'Forts & Heritage', icon: Castle },
  { id: 'mountain', name: 'Mountains', icon: Mountain },
  { id: 'forest', name: 'Forests & Wildlife', icon: TreePine }
];

const difficulties = ['All', 'Easy', 'Moderate', 'Hard'];

export const DestinationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const filteredDestinations = useMemo(() => {
    let filtered = destinations;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(dest =>
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(dest => dest.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(dest => dest.difficulty === selectedDifficulty);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedDifficulty, sortBy]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : Mountain;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-stone-gray pt-24 pb-16">
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
              Adventure Destinations
            </h1>
            <p className="text-xl text-mountain-blue font-inter max-w-3xl mx-auto">
              Discover Karnataka's most breathtaking locations. From majestic waterfalls to ancient forts,
              every adventure tells a story.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 mb-8"
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
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-adventure-orange text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{category.name}</span>
                  </button>
                );
              })}
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
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>Difficulty: {diff}</option>
                  ))}
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
              {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
            </p>
          </motion.div>

          {/* Destinations Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {filteredDestinations.map((destination, index) => {
              const CategoryIcon = getCategoryIcon(destination.category);
              
              return (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card className="overflow-hidden h-full hover:shadow-2xl transition-all duration-300">
                    {/* Image */}
                    <div className="relative overflow-hidden h-64">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                          <CategoryIcon className="w-4 h-4 text-adventure-orange" />
                          <span className="text-gray-700 capitalize">{destination.category}</span>
                        </div>
                      </div>

                      {/* Difficulty Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(destination.difficulty)}`}>
                          {destination.difficulty}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-adventure-orange text-white px-3 py-1 rounded-full font-oswald font-bold">
                          ₹{destination.price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-oswald font-bold text-forest-green group-hover:text-adventure-orange transition-colors">
                          {destination.name}
                        </h3>
                      </div>

                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{destination.location}</span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {destination.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-4 text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-medium">{destination.rating}</span>
                            <span className="text-gray-500 ml-1">({destination.reviews})</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{destination.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {destination.highlights.slice(0, 3).map((highlight, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                          >
                            {highlight}
                          </span>
                        ))}
                        {destination.highlights.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{destination.highlights.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Link to={`/trip/${destination.id}`} className="flex-1">
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
                            Book Now
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
              );
            })}
          </motion.div>

          {/* Empty State */}
          {filteredDestinations.length === 0 && (
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
                Try adjusting your search criteria or explore our featured destinations.
              </p>
              <Button
                variant="adventure"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('All');
                }}
              >
                Show All Destinations
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
