import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline';
import Header from '../components/navigation/Header';
import Footer from '../components/shared/Footer';
import WhatsAppFloat from '../components/shared/WhatsAppFloat';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  publishedAt: string;
  category: string;
  readTime: number;
  tags: string[];
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'digital-detox-changed-my-life',
    title: 'How a 5-Day Digital Detox Changed My Life (And Why You Need One Too)',
    excerpt: 'I was checking my phone 200+ times a day. Here\'s what happened when I gave it up for 5 days in the Western Ghats.',
    image: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: 'Priya Sharma',
    publishedAt: '2024-12-15',
    category: 'Transformation Stories',
    readTime: 8,
    tags: ['Digital Detox', 'Personal Growth', 'Mindfulness'],
    featured: true
  },
  {
    id: '2',
    slug: 'couples-retreat-saved-marriage',
    title: 'The Couples Retreat That Saved Our Marriage',
    excerpt: 'After 10 years together, we were like strangers. Here\'s how 5 days in Coorg brought us back to each other.',
    image: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: 'Rahul & Anita Mehta',
    publishedAt: '2024-12-10',
    category: 'Transformation Stories',
    readTime: 12,
    tags: ['Relationships', 'Couples', 'Communication'],
    featured: true
  },
  {
    id: '3',
    slug: 'spiti-spiritual-awakening',
    title: 'Finding God in the Spiti Valley (And I\'m Not Religious)',
    excerpt: 'What happens when an atheist tech executive spends 10 days in one of the world\'s most spiritual places.',
    image: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: 'Arjun Mehta',
    publishedAt: '2024-12-05',
    category: 'Founder Stories',
    readTime: 15,
    tags: ['Spirituality', 'Self-Discovery', 'Mountains'],
    featured: true
  },
  {
    id: '4',
    slug: 'burnout-recovery-guide',
    title: 'The Complete Guide to Recovering from Burnout',
    excerpt: 'Practical steps, warning signs, and why a retreat might be exactly what you need to heal.',
    image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: 'Dr. Kavya Reddy',
    publishedAt: '2024-11-28',
    category: 'Wellness',
    readTime: 10,
    tags: ['Burnout', 'Mental Health', 'Recovery'],
    featured: false
  },
  {
    id: '5',
    slug: 'nature-therapy-science',
    title: 'The Science Behind Nature Therapy: Why Forests Heal',
    excerpt: 'Research-backed reasons why spending time in nature is essential for mental health and wellbeing.',
    image: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: 'Dr. Ravi Kumar',
    publishedAt: '2024-11-20',
    category: 'Science',
    readTime: 7,
    tags: ['Nature Therapy', 'Science', 'Mental Health'],
    featured: false
  },
  {
    id: '6',
    slug: 'solo-travel-transformation',
    title: 'Why Solo Travel is the Ultimate Self-Discovery Tool',
    excerpt: 'The fears, the breakthroughs, and the person you become when you travel alone.',
    image: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: 'Sneha Patel',
    publishedAt: '2024-11-15',
    category: 'Travel Wisdom',
    readTime: 9,
    tags: ['Solo Travel', 'Self-Discovery', 'Independence'],
    featured: false
  }
];

const categories = ['All', 'Transformation Stories', 'Founder Stories', 'Wellness', 'Science', 'Travel Wisdom'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-warm-sand">
      <Header />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-serif text-deep-forest mb-6">
                Stories of<br />Transformation
              </h1>
              <p className="text-xl text-mystic-indigo leading-relaxed max-w-2xl mx-auto">
                Real stories from real people who found their way back to themselves. 
                Plus insights on travel, wellness, and the science of transformation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Posts */}
        {selectedCategory === 'All' && (
          <section className="py-16 bg-cloud-white">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-serif text-deep-forest mb-8 text-center">
                Featured Stories
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group"
                  >
                    <Link to={`/blog/${post.slug}`}>
                      <div className="bg-warm-sand rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-sunrise-coral text-cloud-white px-3 py-1 rounded-full text-sm font-bold">
                              Featured
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-center gap-4 text-sm text-mystic-indigo mb-3">
                            <span className="bg-sage-green/10 text-sage-green px-2 py-1 rounded-full">
                              {post.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>{post.readTime} min read</span>
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-serif text-deep-forest mb-3 group-hover:text-sunrise-coral transition-colors">
                            {post.title}
                          </h3>
                          
                          <p className="text-mystic-indigo leading-relaxed mb-4">
                            {post.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-mystic-indigo">
                              <UserIcon className="w-4 h-4" />
                              <span>{post.author}</span>
                            </div>
                            <span className="text-sm text-soft-grey">
                              {formatDate(post.publishedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="py-8 bg-warm-sand">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-sunrise-coral text-cloud-white'
                      : 'bg-cloud-white text-mystic-indigo hover:bg-sage-green hover:text-cloud-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* All Posts */}
        <section ref={ref} className="py-16 bg-warm-sand">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(selectedCategory === 'All' ? regularPosts : filteredPosts).map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <Link to={`/blog/${post.slug}`}>
                    <div className="bg-cloud-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-mystic-indigo mb-3">
                          <span className="bg-sage-green/10 text-sage-green px-2 py-1 rounded-full">
                            {post.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{post.readTime} min read</span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-serif text-deep-forest mb-3 group-hover:text-sunrise-coral transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-mystic-indigo leading-relaxed mb-4">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-sm text-mystic-indigo">
                            <UserIcon className="w-4 h-4" />
                            <span>{post.author}</span>
                          </div>
                          <span className="text-sm text-soft-grey">
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-soft-grey/20 text-mystic-indigo px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 bg-deep-forest">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
            >
              <h2 className="text-4xl font-serif text-cloud-white mb-6">
                Never Miss a Story
              </h2>
              <p className="text-xl text-cloud-white/90 mb-8 max-w-2xl mx-auto">
                Get our latest transformation stories, retreat updates, and wellness insights 
                delivered to your inbox every week.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sunrise-coral"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-sunrise-coral text-cloud-white px-6 py-3 rounded-lg font-bold hover:bg-sunrise-coral/90 transition-colors"
                >
                  Subscribe
                </motion.button>
              </div>
              
              <p className="text-sm text-cloud-white/70 mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}