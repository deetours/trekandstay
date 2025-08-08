import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  tilt?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  tilt = false,
}) => {
  const cardVariants = {
    initial: { opacity: 0, y: 20, rotateY: 0 },
    animate: { opacity: 1, y: 0, rotateY: 0 },
    hover: {
      y: -10,
      rotateY: tilt ? 5 : 0,
      scale: 1.02,
      boxShadow: glow 
        ? "0 25px 50px -12px rgba(255, 107, 53, 0.25)" 
        : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    },
  };

  return (
    <motion.div
      className={cn(
        'bg-white rounded-xl shadow-lg border border-stone-gray/50 overflow-hidden backdrop-blur-sm',
        glow && 'shadow-glow',
        className
      )}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={hover ? "hover" : undefined}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};