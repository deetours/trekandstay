import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'wave' | 'trek' | 'mountain';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'default',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3', 
    xl: 'w-4 h-4'
  };

  if (variant === 'dots') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${dotSizes[size]} bg-emerald-500 rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={`${sizeClasses[size]} bg-emerald-500 rounded-full ${className}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    );
  }

  if (variant === 'wave') {
    return (
      <div className={`flex items-end space-x-1 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className={`${dotSizes[size]} bg-gradient-to-t from-emerald-500 to-teal-400 rounded-sm`}
            animate={{
              scaleY: [1, 2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'trek') {
    return (
      <div className={`relative ${className}`}>
        <motion.svg
          className={sizeClasses[size]}
          viewBox="0 0 50 50"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <path
            d="M25 5 L35 20 L45 15 L40 30 L50 35 L35 40 L40 50 L25 45 L10 50 L15 35 L0 30 L10 20 L5 10 L20 15 Z"
            fill="none"
            stroke="url(#trekGradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="trekGradient">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </motion.svg>
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-emerald-600"
          animate={{
            scale: [0.8, 1, 0.8],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🏔️
        </motion.div>
      </div>
    );
  }

  if (variant === 'mountain') {
    return (
      <div className={`relative ${className}`}>
        <motion.svg
          className={sizeClasses[size]}
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Mountain peaks */}
          <motion.path
            d="M10 80 L25 40 L40 60 L55 30 L70 50 L85 35 L90 80 Z"
            fill="url(#mountainGradient)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M0 85 L15 70 L30 75 L45 65 L60 75 L75 65 L90 70 L100 85"
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>
    );
  }

  // Default spinner
  return (
    <motion.div
      className={`${sizeClasses[size]} border-4 border-gray-200 border-t-emerald-500 rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: LoadingSpinnerProps['variant'];
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = "Loading amazing trek experiences...",
  variant = 'trek'
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-center mb-4">
          <LoadingSpinner variant={variant} size="xl" />
        </div>
        <p className="text-gray-700 font-medium">{message}</p>
        
        {/* Animated dots */}
        <div className="flex justify-center mt-3">
          <LoadingSpinner variant="dots" size="sm" />
        </div>
      </motion.div>
    </motion.div>
  );
};

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = true,
  animated = true
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Loading trek data</span>
        {showPercentage && (
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className="h-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: animated ? 0.5 : 0,
            ease: "easeOut" 
          }}
        />
      </div>
    </div>
  );
};

interface SkeletonProps {
  variant?: 'text' | 'card' | 'trip' | 'avatar';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  variant = 'text', 
  className = '' 
}) => {
  const baseClasses = "animate-pulse bg-gray-200 rounded";

  if (variant === 'card') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="h-48 bg-gray-300 rounded-t-lg mb-4"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (variant === 'trip') {
    return (
      <div className={`${baseClasses} p-6 ${className}`}>
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-300 rounded-xl flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="flex space-x-4 mt-3">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`${baseClasses} w-10 h-10 rounded-full ${className}`}></div>
    );
  }

  // Default text skeleton
  return (
    <div className={`${baseClasses} h-4 ${className}`}></div>
  );
};
