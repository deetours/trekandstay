import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function FounderStory() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-20 bg-warm-sand">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
          >
            <img
              src="https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Founder in nature"
              className="w-full h-96 object-cover rounded-lg shadow-md"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-serif text-deep-forest mb-6">
              Why I Created This
            </h2>
            <p className="text-lg text-mystic-indigo leading-relaxed mb-6">
              In 2019, I burned out leading a startup. My therapist said 'take a break.' I said 'I can't.' 
              She said, 'Then you'll break.' I went to Agumbe for 7 days. No phone. No agenda. Just rain, 
              silence, and permission to feel.
            </p>
            <p className="text-lg text-mystic-indigo leading-relaxed mb-8">
              I didn't find answers. I found myself. Now I create these experiences for you.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-sunrise-coral font-bold text-lg hover:text-deep-forest transition-colors underline decoration-2 underline-offset-4"
            >
              Read My Full Story →
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}