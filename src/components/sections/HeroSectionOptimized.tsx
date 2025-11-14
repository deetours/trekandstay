'use client';

import React, { useEffect, useRef } from 'react';
import { COLORS } from '../../lib/design-tokens';

/**
 * HERO SECTION OPTIMIZED
 * 
 * Improvements:
 * ✅ Animated SVG background (lighter than canvas)
 * ✅ Better typography hierarchy
 * ✅ Improved spacing and breathing room
 * ✅ GSAP animation (commented, will add)
 * ✅ Better button styling
 * ✅ Mobile-first responsive design
 * ✅ No external animation library overhead (CSS animations)
 */

export const HeroSectionOptimized = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP animation setup (requires: npm install gsap)
    // Uncomment after GSAP is installed
    
    /*
    import gsap from 'gsap';

    if (containerRef.current) {
      const tl = gsap.timeline({
        defaults: { duration: 0.8, ease: 'power2.out' }
      });

      tl.fromTo(
        '.hero-headline',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0 }
      )
      .fromTo(
        '.hero-subheadline',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0 },
        '-=0.4'
      )
      .fromTo(
        '.hero-cta',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0 },
        '-=0.4'
      );
    }
    */
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white"
    >
      {/* Animated SVG Background */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 800"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.primary[50]} stopOpacity="1" />
            <stop offset="100%" stopColor={COLORS.primary[100]} stopOpacity="1" />
          </linearGradient>
          <animate id="anim1" attributeName="offset" values="0%;100%;0%" dur="8s" repeatCount="indefinite" />
        </defs>
        <rect width="1200" height="800" fill="url(#grad1)" />
        {/* Animated circles */}
        <circle cx="100" cy="100" r="150" fill={`${COLORS.accent[500]}`} opacity="0.1" className="animate-pulse" />
        <circle cx="1100" cy="700" r="200" fill={`${COLORS.secondary[500]}`} opacity="0.08" className="animate-pulse" style={{ animationDelay: '1s' }} />
      </svg>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h1 
          className="hero-headline mb-6 md:mb-8 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
          style={{ color: COLORS.secondary[500] }}
        >
          Discover Your Next
          <br />
          <span style={{ color: COLORS.primary[500] }}>Mountain Adventure</span>
        </h1>

        {/* Subheadline */}
        <p 
          className="hero-subheadline mb-8 md:mb-12 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
          style={{ color: COLORS.neutral[600] }}
        >
          Expert-guided treks through Karnataka's most stunning landscapes. 
          <br className="hidden md:block" />
          Perfect for adventurers of all levels.
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Primary Button */}
          <button 
            className="px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ backgroundColor: COLORS.primary[500] }}
          >
            Start Booking
          </button>

          {/* Secondary Button */}
          <button 
            className="px-8 py-4 rounded-lg font-semibold border-2 transition-all duration-200 hover:shadow-lg"
            style={{
              color: COLORS.primary[500],
              borderColor: COLORS.primary[500],
              backgroundColor: 'transparent'
            }}
          >
            Explore Destinations
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-neutral-200 flex flex-col sm:flex-row justify-center gap-8 md:gap-12">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.primary[500] }}>10k+</p>
            <p className="text-sm text-neutral-600">Happy Travelers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.primary[500] }}>4.9★</p>
            <p className="text-sm text-neutral-600">Highly Rated</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.primary[500] }}>100%</p>
            <p className="text-sm text-neutral-600">Safe & Verified</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke={COLORS.neutral[400]} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSectionOptimized;
