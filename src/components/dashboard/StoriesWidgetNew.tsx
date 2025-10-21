import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/Button';
import { Star, MapPin, Calendar, Heart, Camera, User, Clock } from 'lucide-react';

// Enhanced Customer Stories section with better visuals and interactions
export function StoriesWidget() {
  const navigate = useNavigate();

  // Enhanced stories with ratings and more details
  const stories = [
    {
      id: 1,
      author: 'Amit Kumar',
      destination: 'Hampi, Karnataka',
      story: 'Hampi was absolutely magical! The ancient ruins told stories of a glorious past, while the sunset from Matanga Hill painted the sky in golden hues. Every stone here whispers history.',
      image: 'https://images.pexels.com/photos/1165325/pexels-photo-1165325.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      rating: 5,
      date: '2 weeks ago',
      likes: 24,
      duration: '3 days',
      category: 'Heritage'
    },
    {
      id: 2,
      author: 'Priya Sharma',
      destination: 'Coorg, Karnataka',
      story: 'Coorg was a dream come true for coffee lovers like me! The aromatic plantations, misty hills, and warm hospitality made this trip absolutely unforgettable. The Abbey Falls were spectacular!',
      image: 'https://images.pexels.com/photos/127753/pexels-photo-127753.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      rating: 5,
      date: '1 month ago',
      likes: 31,
      duration: '4 days',
      category: 'Nature'
    },
    {
      id: 3,
      author: 'Rahul Patel',
      destination: 'Rishikesh, Uttarakhand',
      story: 'White water rafting in Rishikesh was pure adrenaline! The Ganges rapids, yoga sessions at sunrise, and the peaceful ashram visits created perfect balance of adventure and spirituality.',
      image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      rating: 5,
      date: '3 weeks ago',
      likes: 18,
      duration: '2 days',
      category: 'Adventure'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story, idx) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Card className="overflow-hidden bg-white hover:shadow-xl transition-all duration-500 border-0 shadow-md h-full">
              {/* Image Section */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={story.image}
                  alt={`${story.destination} scenery`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-white/90 backdrop-blur text-gray-800 shadow-sm text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {story.category}
                  </Badge>
                </div>
                
                <div className="absolute top-2 right-2">
                  <Badge className="bg-emerald-500/90 backdrop-blur text-white shadow-sm text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {story.duration}
                  </Badge>
                </div>

                {/* Heart icon */}
                <div className="absolute bottom-2 right-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 bg-white/90 backdrop-blur rounded-full shadow-md text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5" fill="currentColor" />
                  </motion.button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4">
                {/* Author Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border border-gray-200">
                      <AvatarImage src={''} alt={story.author} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-xs">
                        {story.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{story.author}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {story.date}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                </div>

                {/* Destination */}
                <h4 className="font-bold text-base text-gray-900 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {story.destination}
                </h4>

                {/* Story */}
                <blockquote className="text-gray-700 leading-relaxed text-xs mb-3 line-clamp-2">
                  "{story.story}"
                </blockquote>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      {story.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      Verified
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/stories/${story.id}`)}
                      className="shadow-sm text-xs px-3 py-1.5"
                    >
                      Read More
                    </Button>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Enhanced CTA Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-8 p-6 bg-gradient-to-br from-forest-green/10 to-waterfall-blue/10 rounded-2xl border border-forest-green/20 max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-forest-green to-waterfall-blue rounded-xl text-white">
            <Camera className="w-5 h-5" />
          </div>
          <h4 className="text-xl font-bold text-gray-900">Share Your Adventure</h4>
        </div>
        <p className="text-gray-600 mb-5 text-sm">
          Have an amazing travel story? Share it with our community and inspire others to explore!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => navigate('/stories/new')} 
              className="bg-gradient-to-r from-forest-green to-waterfall-blue hover:from-forest-green/90 hover:to-waterfall-blue/90 shadow-lg px-5 py-2 text-sm text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/stories')}
              className="px-5 py-2 text-sm border border-forest-green/30 text-forest-green hover:bg-forest-green/10"
            >
              View All Stories
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
