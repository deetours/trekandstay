'use client';
import React, { useState } from 'react';
import { ShieldCheck, Star, Award, ThumbsUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

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

export const TrustStrip: React.FC<{ className?: string }> = ({ className }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className={`relative w-full bg-white overflow-hidden ${className ?? ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Desktop: 5 columns, Tablet: 3 columns, Mobile: 2 columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
          {items.map(({ icon: Icon, label, value }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
              className="h-full"
            >
              <motion.div
                className={`relative h-full rounded-lg p-4 md:p-5 lg:p-6 text-center transition-all duration-300 border flex flex-col items-center justify-center ${
                  hoveredIndex === index 
                    ? 'bg-adventure-orange/8 border-adventure-orange/50 shadow-md' 
                    : 'bg-gradient-to-b from-white to-stone-gray/20 border-stone-200/60 shadow-sm hover:shadow-md hover:border-adventure-orange/30'
                }`}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
              >
                {/* Icon Container */}
                <motion.div
                  className="flex justify-center mb-3 md:mb-4"
                  animate={{ 
                    scale: hoveredIndex === index ? 1.25 : 1,
                    rotate: hoveredIndex === index ? 5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                    hoveredIndex === index 
                      ? 'bg-adventure-orange text-white shadow-lg shadow-adventure-orange/40' 
                      : 'bg-adventure-orange/10 text-adventure-orange'
                  }`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" strokeWidth={1.5} />
                  </div>
                </motion.div>

                {/* Label - Using Tall Rugged Sans constant font */}
                <h3 className="text-xs md:text-sm lg:text-base font-tall-rugged font-bold text-forest-green uppercase tracking-wider leading-tight mb-2 md:mb-3 min-h-[2.5rem] md:min-h-[3rem] lg:min-h-[3.5rem] flex items-center justify-center">
                  {label}
                </h3>

                {/* Value - Using Outbrave constant font */}
                <motion.p
                  className={`text-xs md:text-sm lg:text-base font-outbrave font-bold transition-colors duration-300 min-h-[1.5rem] md:min-h-[2rem] flex items-center justify-center ${
                    hoveredIndex === index 
                      ? 'text-adventure-orange' 
                      : 'text-mountain-blue'
                  }`}
                  animate={{ scale: hoveredIndex === index ? 1.08 : 1 }}
                >
                  {value}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
