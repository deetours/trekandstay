import React from 'react';
import { Mountain, HeartHandshake, Compass, Clock8, IndianRupee, Leaf } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

/* Animated feature meta. Each feature gets a unique subtle loop animation plus an elevated hover effect. */
const features = [
  { icon: Compass, key: 'compass', title: 'Expert-led trips', desc: 'Licensed guides with local expertise' },
  { icon: Mountain, key: 'mountain', title: 'Curated adventures', desc: 'Handpicked trails and experiences' },
  { icon: Leaf, key: 'leaf', title: 'Eco-conscious', desc: 'Low-impact, community-friendly travel' },
  { icon: Clock8, key: 'clock', title: 'Flexible plans', desc: 'Easy reschedules and support' },
  { icon: IndianRupee, key: 'rupee', title: 'Best value', desc: 'Transparent pricing, no hidden fees' },
  { icon: HeartHandshake, key: 'heart', title: 'Loved by travelers', desc: '10k+ happy customers' },
];

export const ValueProps: React.FC = () => {
  const prefersReduced = useReducedMotion();

  const loopTransition = { repeat: Infinity, ease: 'easeInOut' as const };

  const iconVariants: Record<string, object> = {
    compass: prefersReduced ? {} : { rotate: [0, 12, -8, 6, -4, 0], transition: { ...loopTransition, duration: 6 } },
    mountain: prefersReduced ? {} : { y: [0, -4, 0], transition: { ...loopTransition, duration: 4 } },
    leaf: prefersReduced ? {} : { rotate: [0, -10, 8, -6, 4, 0], transition: { ...loopTransition, duration: 5 } },
    clock: prefersReduced ? {} : { rotate: [0, 3, -3, 2, -2, 0], transition: { ...loopTransition, duration: 4.5 } },
    rupee: prefersReduced ? {} : { y: [0, -6, 0], scale: [1, 1.05, 1], transition: { ...loopTransition, duration: 3.5 } },
    heart: prefersReduced ? {} : { scale: [1, 1.12, 1], transition: { ...loopTransition, duration: 2.8 } },
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-oswald font-bold text-forest-green dark:text-[var(--text)]">Why travel with us?</h2>
          <p className="text-mountain-blue mt-2 dark:text-[var(--muted)]">We obsess over safety, comfort and unforgettable memories.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, key }) => (
            <motion.div
              key={title}
              className="group relative rounded-2xl border border-[var(--border)] bg-white/80 dark:bg-[var(--surface)]/80 backdrop-blur p-6 hover:shadow-xl transition shadow-sm overflow-hidden"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
            >
              {/* subtle animated gradient halo */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_20%_15%,rgba(255,125,50,0.25),transparent_60%)] dark:bg-[radial-gradient(circle_at_20%_15%,rgba(255,125,50,0.35),transparent_65%)]" />
              <div className="relative">
                <motion.div
                  aria-hidden="true"
                  className="w-14 h-14 mb-4 rounded-xl relative flex items-center justify-center text-adventure-orange dark:text-amber-300"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-adventure-orange/15 via-amber-400/10 to-transparent dark:from-adventure-orange/25 blur-sm" />
                  <motion.div
                    variants={iconVariants}
                    animate={iconVariants[key] ? key : undefined}
                    className="relative"
                  >
                    <Icon className="w-7 h-7 drop-shadow-sm" />
                  </motion.div>
                </motion.div>
                <h3 className="text-lg font-semibold text-forest-green dark:text-[var(--text)] tracking-tight flex items-center gap-2">
                  {title}
                  <span className="inline-block w-1 h-1 rounded-full bg-adventure-orange/70 group-hover:scale-125 transition-transform" />
                </h3>
                <p className="text-sm mt-1 text-mountain-blue dark:text-[var(--muted)] leading-relaxed">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
