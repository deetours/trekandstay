import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Play, MapPin, Users, Star } from 'lucide-react';
import { Button } from '../ui/Button';

const videos = [
  'https://cdn.pixabay.com/video/2025/01/07/251262_large.mp4',
  'https://cdn.pixabay.com/video/2019/06/17/24515-343454414_large.mp4',
  'https://cdn.pixabay.com/video/2025/01/07/251262_large.mp4',
  'https://cdn.pixabay.com/video/2025/01/07/251262_large.mp4',
];

export const HeroSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  const scrollToDestinations = () => {
    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleEnded = () => setCurrent((prev) => (prev + 1) % videos.length);
    const video = videoRef.current;
    if (video) video.addEventListener('ended', handleEnded);
    return () => video?.removeEventListener('ended', handleEnded);
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-label="Hero">
      {/* Video Background */}
      <video
        key={current}
        ref={videoRef}
        src={videos[current]}
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        playsInline
        preload="auto"
        tabIndex={-1}
        aria-hidden="true"
        style={{ transition: 'opacity 0.5s' }}
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10" />
      {/* Hero Content */}
      <motion.div style={{ y, opacity }} className="relative z-20 text-center text-white px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.h1
            className="text-5xl lg:text-7xl font-oswald font-bold mb-6 leading-tight"
            animate={{
              textShadow: [
                '0 0 20px rgba(255, 107, 53, 0.5)',
                '0 0 30px rgba(255, 107, 53, 0.8)',
                '0 0 20px rgba(255, 107, 53, 0.5)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Discover Karnataka's
            <br />
            <span className="text-adventure-orange">Hidden Gems</span>
          </motion.h1>
          
          <motion.p
            className="text-xl lg:text-2xl font-inter mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Embark on unforgettable adventures through pristine waterfalls, 
            ancient forts, and breathtaking landscapes across Karnataka and Maharashtra
          </motion.p>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {[
              { icon: MapPin, label: '50+ Destinations', count: '50+' },
              { icon: Users, label: 'Happy Adventurers', count: '2000+' },
              { icon: Star, label: 'Average Rating', count: '4.9' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon className="w-6 h-6 text-adventure-orange" />
                  <div>
                    <div className="font-oswald font-bold text-xl">{stat.count}</div>
                    <div className="font-inter text-sm opacity-90">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Button
              variant="adventure"
              size="xl"
              className="font-oswald text-lg px-8 py-4"
              onClick={scrollToDestinations}
            >
              Explore Adventures
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="xl"
              className="text-white border-white/30 hover:bg-white/20 font-oswald text-lg px-8 py-4"
              icon={<Play className="w-5 h-5" />}
            >
              Watch Stories
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating Action Elements */}
        <motion.div
          className="absolute -bottom-24 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            className="w-8 h-12 border-2 border-white rounded-full flex justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{
                y: [0, 16, 0],
                opacity: [1, 0, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 opacity-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="w-32 h-32 border border-white rounded-full flex items-center justify-center"
        >
          <div className="w-24 h-24 border border-white rounded-full flex items-center justify-center">
            <div className="w-16 h-16 border border-white rounded-full" />
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-20 left-10 opacity-20">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 border-2 border-white rotate-45"
        />
      </div>
    </section>
  );
};