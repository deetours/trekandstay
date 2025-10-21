import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const HeroSVGs: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  
  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const rotate1 = useTransform(scrollY, [0, 300], [0, 45]);
  const rotate2 = useTransform(scrollY, [0, 300], [0, -30]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / window.innerWidth,
        y: (e.clientY - window.innerHeight / 2) / window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div aria-hidden className={className}>
      {/* Enhanced gradient definitions */}
      <svg width="0" height="0" className="sr-only" aria-hidden>
        <title>Trek & Stay hero gradients and effects</title>
        <defs>
          <linearGradient id="g1" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.95">
              <animate attributeName="stopColor" 
                values="#10b981;#059669;#047857;#059669;#10b981" 
                dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.95">
              <animate attributeName="stopColor" 
                values="#06b6d4;#0891b2;#0e7490;#0891b2;#06b6d4" 
                dur="8s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          <radialGradient id="g2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="pointer-events-none overflow-hidden">
        {/* Interactive parallax glow with mouse tracking */}
        <motion.div 
          className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/15 blur-3xl"
          style={{ 
            y: y1,
            rotate: rotate1
          }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            x: mousePosition.x * 20,
            y: mousePosition.y * 15
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Secondary floating element */}
        <motion.div 
          className="absolute right-6 top-28 w-48 h-48 rounded-2xl bg-gradient-to-tr from-purple-400/20 to-pink-300/12 blur-2xl"
          style={{ 
            y: y2,
            rotate: rotate2
          }}
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [-6, 6, -6],
            x: mousePosition.x * -15,
            y: mousePosition.y * -10
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Mountain silhouettes for depth */}
        <motion.div 
          className="absolute inset-x-0 bottom-20 h-32 opacity-20"
          style={{ y: y1 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 1200 120" className="fill-emerald-600/30">
            <path d="M0,120 L0,80 L200,20 L400,60 L600,10 L800,40 L1000,25 L1200,55 L1200,120 Z" />
          </svg>
        </motion.div>

        {/* Enhanced animated waveform */}
        <motion.svg 
          className="absolute left-1/2 -translate-x-1/2 bottom-6 opacity-40" 
          width="520" 
          height="140" 
          viewBox="0 0 520 140" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          role="presentation"
          style={{ y: y2 }}
          animate={{ 
            scale: [1, 1.02, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.path 
            d="M0 90 C140 20, 380 160, 520 50" 
            stroke="url(#g1)" 
            strokeWidth="14" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
            opacity="0.65"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.65 }}
            transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
          />
          <motion.ellipse 
            cx="260" 
            cy="70" 
            rx="240" 
            ry="40" 
            fill="url(#g2)" 
            opacity="0.12"
            animate={{ 
              rx: [240, 260, 240],
              opacity: [0.12, 0.2, 0.12]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>

        {/* Floating particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSVGs;
