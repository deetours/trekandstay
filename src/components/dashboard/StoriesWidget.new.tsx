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
    <section className="space-y-6">
      {/* Stories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story, idx) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <Card className="overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border-0 shadow-lg group">
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={story.image}
                  alt={`${story.destination} scenery`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/95 backdrop-blur text-gray-800 shadow-lg">
                    <MapPin className="w-3 h-3 mr-1" />
                    {story.category}
                  </Badge>
                </div>
                
                <div className="absolute top-3 right-3">
                  <Badge className="bg-emerald-500/95 backdrop-blur text-white shadow-lg">
                    <Clock className="w-3 h-3 mr-1" />
                    {story.duration}
                  </Badge>
                </div>

                {/* Heart icon */}
                <div className="absolute bottom-3 right-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-red-500"
                  >
                    <Heart className="w-4 h-4" fill="currentColor" />
                  </motion.button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                {/* Author Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                      <AvatarImage src={''} alt={story.author} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                        {story.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900">{story.author}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {story.date}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                </div>

                {/* Destination */}
                <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {story.destination}
                </h4>

                {/* Story */}
                <blockquote className="text-gray-700 leading-relaxed text-sm mb-4 line-clamp-3">
                  "{story.story}"
                </blockquote>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {story.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
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
                      className="shadow-sm"
                    >
                      Read Full
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
        className="text-center mt-8 p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100"
      >
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900">Share Your Adventure</h4>
          </div>
          <p className="text-gray-600 mb-6">
            Have an amazing travel story? Share it with our community and inspire others to explore!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => navigate('/stories/new')} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg px-6"
              >
                <Camera className="w-4 h-4 mr-2" />
                Share Your Story
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/stories')}
                className="px-6"
              >
                View All Stories
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
