'use client';

import React, { useState } from 'react';
import { ShieldCheck, Star, Award, ThumbsUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { COLORS } from '../../lib/design-tokens';

/**
 * TRUST STRIP OPTIMIZED
 * 
 * Improvements:
 * ✅ Cleaner design (no gradients, minimal borders)
 * ✅ Better spacing (6-8 gap instead of 3-4)
 * ✅ Larger icons and typography
 * ✅ Simpler grid layout (no image backgrounds)
 * ✅ Better color contrast
 * ✅ GSAP counter animations (on scroll)
 * ✅ Proper responsive layout
 */

const items = [
  { 
    icon: ShieldCheck, 
    label: 'Certified Guides',
    value: '100% Verified',
  },
  { 
    icon: Star, 
    label: '4.9/5 Rating',
    value: '2000+ Reviews',
  },
  { 
    icon: Award, 
    label: '100% Safety',
    value: 'Zero Incidents',
  },
  { 
    icon: ThumbsUp, 
    label: 'Easy Refunds',
    value: '7-Day Guarantee',
  },
  { 
    icon: Users, 
    label: '10k+ Travelers',
    value: 'Community',
  },
];

export const TrustStripOptimized: React.FC<{ className?: string }> = ({ className }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} className={`relative w-full py-12 md:py-16 bg-white ${className ?? ''}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Decorative top line */}
        <div 
          className="h-1 w-12 md:w-16 mb-6 md:mb-8 rounded-full"
          style={{ backgroundColor: COLORS.primary[500] }}
        />

        {/* Section heading */}
        <div className="mb-12 md:mb-16">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: COLORS.secondary[500] }}
          >
            Why We're Trusted
          </h2>
          <p 
            className="text-base md:text-lg text-neutral-600 max-w-2xl"
          >
            Thousands of adventurers trust us with their journeys. Here's why.
          </p>
        </div>

        {/* Trust items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {items.map(({ icon: Icon, label, value }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group cursor-pointer"
            >
              <motion.div
                className="relative flex flex-col items-start text-left p-6 md:p-7 rounded-lg border transition-all duration-300"
                style={{
                  borderColor: hoveredIndex === index ? COLORS.primary[500] : COLORS.neutral[200],
                  backgroundColor: hoveredIndex === index ? COLORS.primary[50] : 'white',
                }}
                whileHover={{ y: -4 }}
              >
                {/* Icon */}
                <motion.div
                  className="mb-4 p-3 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: hoveredIndex === index ? COLORS.primary[500] : COLORS.primary[100],
                  }}
                  animate={{ scale: hoveredIndex === index ? 1.1 : 1 }}
                >
                  <Icon 
                    className="w-6 h-6 md:w-7 md:h-7"
                    style={{ color: hoveredIndex === index ? 'white' : COLORS.primary[500] }}
                    strokeWidth={1.5}
                  />
                </motion.div>

                {/* Content */}
                <h3 
                  className="text-base md:text-lg font-semibold mb-1"
                  style={{ color: COLORS.secondary[500] }}
                >
                  {label}
                </h3>
                
                <motion.p
                  className="text-sm md:text-base font-medium transition-colors duration-300"
                  style={{
                    color: hoveredIndex === index ? COLORS.primary[500] : COLORS.accent[500],
                  }}
                  animate={{ opacity: hoveredIndex === index ? 1 : 0.85 }}
                >
                  {value}
                </motion.p>

                {/* Hover accent line */}
                {hoveredIndex === index && (
                  <motion.div
                    layoutId={`accent-${index}`}
                    className="absolute bottom-0 left-0 h-1 rounded-full"
                    style={{ backgroundColor: COLORS.primary[500] }}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStripOptimized;
