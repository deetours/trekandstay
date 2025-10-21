import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Quote, 
  Camera, 
  MapPin, 
  Calendar,
  ThumbsUp,
  Play,
  Pause
} from 'lucide-react';

interface Review {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  title: string;
  content: string;
  trek: string;
  date: string;
  images?: string[];
  verified?: boolean;
  helpful?: number;
  type?: 'text' | 'photo' | 'video';
}

interface ReviewCarouselProps {
  className?: string;
  autoPlay?: boolean;
  showFilters?: boolean;
}

const ReviewCarousel: React.FC<ReviewCarouselProps> = ({
  className = '',
  autoPlay = true,
  showFilters = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [filter, setFilter] = useState<'all' | 'recent' | 'top-rated' | 'photos'>('all');

  const mockReviews: Review[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      location: 'Mumbai',
      avatar: '/api/placeholder/40/40',
      rating: 5,
      title: 'Absolutely Amazing Experience!',
      content: 'The Rajmachi trek was beyond my expectations. The guides were knowledgeable, the views were breathtaking, and the entire experience was well-organized. Would definitely book again!',
      trek: 'Rajmachi Trek',
      date: '2 days ago',
      verified: true,
      helpful: 24,
      type: 'text'
    },
    {
      id: '2',
      name: 'Arjun Patel',
      location: 'Pune',
      avatar: '/api/placeholder/40/40',
      rating: 5,
      title: 'Perfect Weekend Gateway',
      content: 'Harishchandragad was challenging but so rewarding. The sunrise view from the top is something I\'ll never forget. Great organization and safety measures.',
      trek: 'Harishchandragad Trek',
      date: '1 week ago',
      images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
      verified: true,
      helpful: 31,
      type: 'photo'
    },
    {
      id: '3',
      name: 'Sneha Desai',
      location: 'Nashik',
      avatar: '/api/placeholder/40/40',
      rating: 4,
      title: 'Great for Beginners',
      content: 'As a first-time trekker, I was nervous, but the team made me feel comfortable throughout. Sinhagad is perfect for beginners. Loved every moment!',
      trek: 'Sinhagad Trek',
      date: '3 days ago',
      verified: true,
      helpful: 18,
      type: 'text'
    },
    {
      id: '4',
      name: 'Vikram Singh',
      location: 'Delhi',
      avatar: '/api/placeholder/40/40',
      rating: 5,
      title: 'Incredible Adventure',
      content: 'Kalsubai peak was tough but the feeling of accomplishment at the top was unmatched. Professional guides, great food, and amazing fellow trekkers. 10/10!',
      trek: 'Kalsubai Trek',
      date: '5 days ago',
      images: ['/api/placeholder/300/200'],
      verified: true,
      helpful: 27,
      type: 'photo'
    },
    {
      id: '5',
      name: 'Anjali Menon',
      location: 'Bangalore',
      avatar: '/api/placeholder/40/40',
      rating: 5,
      title: 'Nature at its Best',
      content: 'Andharban jungle trek was magical! The dense forest, streams, and wildlife made it an unforgettable experience. Highly recommend for nature lovers.',
      trek: 'Andharban Trek',
      date: '1 week ago',
      verified: true,
      helpful: 22,
      type: 'text'
    },
    {
      id: '6',
      name: 'Rahul Joshi',
      location: 'Mumbai',
      avatar: '/api/placeholder/40/40',
      rating: 4,
      title: 'Well Organized Trek',
      content: 'Everything was planned perfectly. From pickup to drop, meals to accommodation, everything exceeded expectations. Great value for money!',
      trek: 'Rajgad Trek',
      date: '2 weeks ago',
      verified: true,
      helpful: 19,
      type: 'text'
    }
  ];

  const filteredReviews = mockReviews.filter(review => {
    switch (filter) {
      case 'recent':
        return review.date.includes('day') || review.date.includes('3 days');
      case 'top-rated':
        return review.rating === 5;
      case 'photos':
        return review.images && review.images.length > 0;
      default:
        return true;
    }
  });

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filteredReviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, filteredReviews.length]);

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % filteredReviews.length);
  };

  const goToPrev = () => {
    setCurrentIndex(prev => (prev - 1 + filteredReviews.length) % filteredReviews.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const currentReview = filteredReviews[currentIndex];

  if (!currentReview) return null;

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Quote className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Trekker Reviews</h2>
              <p className="text-purple-100">Real experiences from our community</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-purple-100 text-sm">
              {currentIndex + 1} of {filteredReviews.length}
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-3xl font-bold">4.8</p>
            <div className="flex items-center space-x-1">
              {renderStars(5)}
            </div>
          </div>
          <div className="text-sm text-purple-100">
            <p>Based on {mockReviews.length} verified reviews</p>
            <p>98% would recommend us</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {[
              { key: 'all', label: 'All Reviews' },
              { key: 'recent', label: 'Recent' },
              { key: 'top-rated', label: '5 Star' },
              { key: 'photos', label: 'With Photos' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as typeof filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === filterOption.key
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          disabled={filteredReviews.length <= 1}
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          disabled={filteredReviews.length <= 1}
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        {/* Review Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentReview.id}
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Reviewer Info */}
              <div className="flex items-start space-x-4">
                <motion.img
                  src={currentReview.avatar}
                  alt={currentReview.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  whileHover={{ scale: 1.1 }}
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <span>{currentReview.name}</span>
                        {currentReview.verified && (
                          <motion.div
                            className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                            whileHover={{ scale: 1.1 }}
                          >
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{currentReview.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{currentReview.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {renderStars(currentReview.rating)}
                      </div>
                      <span className="text-sm font-medium text-emerald-600">
                        {currentReview.trek}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Title */}
              <h4 className="text-xl font-bold text-gray-900">
                {currentReview.title}
              </h4>

              {/* Review Content */}
              <div className="bg-gray-50 rounded-xl p-6 relative">
                <Quote className="absolute top-4 left-4 w-6 h-6 text-gray-300" />
                <p className="text-gray-700 leading-relaxed pl-8">
                  {currentReview.content}
                </p>
              </div>

              {/* Review Images */}
              {currentReview.images && currentReview.images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Camera className="w-4 h-4" />
                    <span>{currentReview.images.length} photo(s) shared</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {currentReview.images.map((image, index) => (
                      <motion.img
                        key={index}
                        src={image}
                        alt={`Review ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Review Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({currentReview.helpful})</span>
                  </button>
                  
                  {currentReview.type === 'photo' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full flex items-center space-x-1">
                      <Camera className="w-3 h-3" />
                      <span>Photo Review</span>
                    </span>
                  )}
                </div>

                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Read Full Review
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2 pb-6">
          {filteredReviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-purple-500 w-6' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-50 p-6 text-center border-t">
        <p className="text-gray-600 mb-3">
          Join thousands of happy trekkers!
        </p>
        <motion.button
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Book Your Adventure
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ReviewCarousel;
