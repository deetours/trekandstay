'use client';

import React from 'react';
import { COLORS } from '../../lib/design-tokens';

/**
 * CTA SECTION OPTIMIZED
 * 
 * Improvements:
 * ✅ Strong headline with emotional appeal
 * ✅ Simple, focused design
 * ✅ Gradient background for visual interest
 * ✅ Clear CTA hierarchy
 * ✅ Mobile responsive
 * ✅ Good white space
 */

export const CTASectionOptimized: React.FC = () => {
  return (
    <section 
      className="relative w-full py-16 md:py-24 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${COLORS.primary[50]} 0%, ${COLORS.accent[50]} 100%)`
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: COLORS.primary[500] }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10" style={{ backgroundColor: COLORS.accent[500] }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
        {/* Heading */}
        <h2 
          className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight"
          style={{ color: COLORS.secondary[500] }}
        >
          Ready to Start Your Adventure?
        </h2>

        {/* Subheading */}
        <p 
          className="text-lg md:text-xl text-neutral-700 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Join thousands of travelers who've discovered the magic of Karnataka's mountains. 
          <br className="hidden md:block" />
          Book your trek today and get 10% off your first adventure.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Primary CTA */}
          <button 
            className="px-10 py-4 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95 w-full sm:w-auto"
            style={{ backgroundColor: COLORS.primary[500] }}
          >
            Book Your Trek Now
          </button>

          {/* Secondary CTA */}
          <button 
            className="px-10 py-4 rounded-lg font-semibold border-2 transition-all duration-200 hover:shadow-lg w-full sm:w-auto"
            style={{
              color: COLORS.primary[500],
              borderColor: COLORS.primary[500],
              backgroundColor: 'white'
            }}
          >
            Browse Destinations
          </button>
        </div>

        {/* Trust indicator */}
        <div className="mt-12 pt-8 border-t border-neutral-300/50">
          <p className="text-sm text-neutral-600">
            ✓ No hidden charges • ✓ Free cancellation • ✓ 24/7 support
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASectionOptimized;
