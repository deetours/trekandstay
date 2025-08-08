import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/Button';

// Beautifully styled Customer Stories section for the Home page
export function StoriesWidget() {
  const navigate = useNavigate();

  // In a real app, fetch stories from backend
  const stories = [
    {
      id: 1,
      author: 'Amit',
      destination: 'Hampi',
      story:
        'Hampi was magical! The ruins, the sunsets, and the people made it unforgettable.',
      image:
        'https://images.pexels.com/photos/1165325/pexels-photo-1165325.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    },
    {
      id: 2,
      author: 'Priya',
      destination: 'Coorg',
      story:
        'Coorg was a dream come true for coffee lovers. The plantations and the weather were perfect.',
      image:
        'https://images.pexels.com/photos/127753/pexels-photo-127753.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-blue-100">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />

      <div className="relative px-6 py-10 md:px-10">
        <div className="text-center mb-8">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900"
          >
            Customer Stories
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Real adventures from our community. Get inspired by unforgettable
            moments.
          </motion.p>
        </div>

        {/* Stories Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
            >
              <Card className="overflow-hidden bg-white/90 hover:bg-white/100 transition-colors shadow-sm hover:shadow-xl rounded-2xl">
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={`${item.destination} scenery`}
                    className="h-full w-full object-cover transition-transform duration-500 will-change-transform hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 backdrop-blur text-gray-800"
                    >
                      {item.destination}
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={''} alt={item.author} />
                      <AvatarFallback>{item.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {item.author}
                      </div>
                      <div className="text-xs text-gray-500">Explorer</div>
                    </div>
                  </div>

                  <blockquote className="mt-4 text-gray-700 leading-relaxed">
                    “{item.story}”
                  </blockquote>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-400">Verified traveler</div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="secondary"
                        onClick={() => navigate('/stories/new')}
                      >
                        Share yours
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => navigate('/stories/new')} className="px-6">
              Share your story
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
