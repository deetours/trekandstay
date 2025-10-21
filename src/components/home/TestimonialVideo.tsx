import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Play } from 'lucide-react';

export default function TestimonialVideo() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-20 bg-cloud-white">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-4xl md:text-5xl font-serif text-deep-forest text-center mb-12"
        >
          Real Transformations, Real People
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="bg-warm-sand rounded-xl p-8"
        >
          <div className="relative mb-8">
            <img
              src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Testimonial video thumbnail"
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
            <button className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 rounded-lg transition-colors group">
              <Play className="w-16 h-16 text-cloud-white group-hover:scale-110 transition-transform" fill="currentColor" />
            </button>
          </div>

          <blockquote className="text-xl md:text-2xl font-serif text-deep-forest text-center mb-4 italic leading-relaxed">
            "I went as a consultant obsessed with KPIs. I came back remembering I'm human."
          </blockquote>
          
          <div className="text-center">
            <p className="text-mystic-indigo italic mb-2">— Rahul M., Bangalore</p>
            <p className="text-soft-grey text-sm">Agumbe Digital Detox, Nov 2024</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}