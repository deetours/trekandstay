'use client';
import React, { useState } from 'react';
import { ShieldCheck, Star, Award, ThumbsUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const items = [
  { 
    icon: ShieldCheck, 
    label: 'Expert Guides',
    value: '100% Verified',
    highlight: true,
  },
  { 
    icon: Star, 
    label: 'Highly Rated',
    value: '4.9 / 5',
  },
  { 
    icon: Award, 
    label: 'Safety First',
    value: 'Zero Incidents',
  },
  { 
    icon: ThumbsUp, 
    label: 'Easy Refunds',
    value: '7-Day Guarantee',
  },
  { 
    icon: Users, 
    label: 'Trusted By',
    value: '10k+ Travelers',
  },
];

export const TrustStripImproved: React.FC<{ className?: string }> = ({ className }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className={`w-full py-12 md:py-16 bg-white ${className ?? ''}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 md:mb-14 text-center">
          <h2 className="font-great-adventurer text-3xl md:text-4xl font-bold text-forest-green mb-3">
            Why Explorers Choose Us
          </h2>
          <p className="font-inter text-lg md:text-xl text-mountain-blue/70 max-w-2xl mx-auto">
            Trusted by thousands. Certified guides. Unmatched safety record.
          </p>
        </div>

        {/* Trust Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {items.map(({ icon: Icon, label, value, highlight }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.12, 
                duration: 0.6,
                ease: 'easeOut'
              }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group"
            >
              {/* Card Container */}
              <motion.div
                className={`relative rounded-xl p-6 md:p-8 h-full transition-all duration-300 border-2 ${
                  highlight 
                    ? 'border-adventure-orange/40 bg-adventure-orange/5'
                    : hoveredIndex === index
                    ? 'border-adventure-orange/30 bg-adventure-orange/5 shadow-lg'
                    : 'border-stone-200/60 bg-white shadow-sm hover:shadow-md'
                }`}
                whileHover={{ 
                  y: -6,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Optional Badge for Featured Item */}
                {highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-block font-tall-rugged text-xs font-bold uppercase tracking-widest text-adventure-orange bg-adventure-orange/10 px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon Container */}
                  <motion.div
                    className="mb-5"
                    animate={{ 
                      scale: hoveredIndex === index ? 1.2 : 1,
                      rotate: hoveredIndex === index ? 5 : 0,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      hoveredIndex === index || highlight
                        ? 'bg-adventure-orange text-white shadow-lg shadow-adventure-orange/30'
                        : 'bg-adventure-orange/10 text-adventure-orange'
                    }`}>
                      <Icon className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
                    </div>
                  </motion.div>

                  {/* Label - Bold, Uppercase */}
                  <h3 className="font-tall-rugged text-sm md:text-base font-bold uppercase tracking-wide text-forest-green mb-3">
                    {label}
                  </h3>

                  {/* Value - Large Number/Stat */}
                  <motion.div
                    className={`font-outbrave text-2xl md:text-3xl font-bold transition-colors duration-300 ${
                      hoveredIndex === index 
                        ? 'text-adventure-orange' 
                        : 'text-mountain-blue'
                    }`}
                    animate={{ 
                      scale: hoveredIndex === index ? 1.08 : 1,
                    }}
                  >
                    {value}
                  </motion.div>

                  {/* Hover Indicator Line */}
                  {hoveredIndex === index && (
                    <motion.div
                      layoutId={`line-${index}`}
                      className="mt-4 h-1 w-12 bg-adventure-orange rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: 48 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Below */}
        <div className="mt-12 md:mt-16 text-center">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="inline-flex items-center justify-center px-8 py-4 bg-adventure-orange text-white font-tall-rugged font-bold uppercase tracking-wide rounded-lg hover:bg-adventure-orange/90 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Start Your Adventure
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default TrustStripImproved;
