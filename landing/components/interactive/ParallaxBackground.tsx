import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Mountain, Trees, Cloud } from 'lucide-react';

interface ParallaxBackgroundProps {
  className?: string;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -50]), springConfig);
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -100]), springConfig);
  const y3 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -150]), springConfig);
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]), springConfig);

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(5, 150, 105, 0.4) 0%, rgba(8, 145, 178, 0.4) 50%, rgba(168, 85, 247, 0.4) 100%)',
            'linear-gradient(225deg, rgba(168, 85, 247, 0.4) 0%, rgba(5, 150, 105, 0.4) 50%, rgba(8, 145, 178, 0.4) 100%)',
            'linear-gradient(315deg, rgba(8, 145, 178, 0.4) 0%, rgba(168, 85, 247, 0.4) 50%, rgba(5, 150, 105, 0.4) 100%)',
            'linear-gradient(135deg, rgba(5, 150, 105, 0.4) 0%, rgba(8, 145, 178, 0.4) 50%, rgba(168, 85, 247, 0.4) 100%)'
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity }}
      />

      {/* Parallax Mountains Layer 1 (Farthest) */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-64 opacity-20"
        style={{ y: y3 }}
      >
        <div className="flex items-end justify-center h-full">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-gradient-to-t from-emerald-600 to-emerald-400"
              style={{
                width: `${120 + i * 40}px`,
                height: `${100 + i * 20}px`,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                marginLeft: i > 0 ? '-20px' : '0'
              }}
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Parallax Mountains Layer 2 (Middle) */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-48 opacity-30"
        style={{ y: y2 }}
      >
        <div className="flex items-end justify-center h-full">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-gradient-to-t from-teal-600 to-teal-400"
              style={{
                width: `${100 + i * 35}px`,
                height: `${80 + i * 15}px`,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                marginLeft: i > 0 ? '-15px' : '0'
              }}
              animate={{
                scale: [1, 1.01, 1],
                opacity: [0.3, 0.4, 0.3]
              }}
              transition={{
                duration: 6 + i * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Parallax Mountains Layer 3 (Closest) */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-32 opacity-40"
        style={{ y: y1 }}
      >
        <div className="flex items-end justify-center h-full">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-gradient-to-t from-cyan-600 to-cyan-400"
              style={{
                width: `${80 + i * 30}px`,
                height: `${60 + i * 10}px`,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                marginLeft: i > 0 ? '-10px' : '0'
              }}
              animate={{
                scale: [1, 1.005, 1],
                opacity: [0.4, 0.5, 0.4]
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 left-10 opacity-20"
        animate={{
          y: [-20, 20, -20],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Mountain className="w-16 h-16 text-emerald-300" />
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-16 opacity-15"
        animate={{
          y: [20, -20, 20],
          rotate: [0, -3, 3, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <Trees className="w-20 h-20 text-teal-300" />
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/3 opacity-10"
        animate={{
          y: [-10, 10, -10],
          x: [-5, 5, -5],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      >
        <Cloud className="w-12 h-12 text-cyan-300" />
      </motion.div>

      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-300 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [-50, 50, -50],
              opacity: [0.2, 0.5, 0.2],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
    </div>
  );
};