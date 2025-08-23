import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'adventure' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';
  
  const variants = {
    primary: 'bg-forest-green text-white hover:bg-forest-green/90 focus:ring-forest-green shadow-adventure',
    secondary: 'bg-stone-gray text-forest-green hover:bg-stone-gray/80 focus:ring-stone-gray border border-forest-green/20 dark:bg-[var(--card)] dark:text-[var(--text)] dark:border-white/10 dark:hover:bg-white/10',
    adventure: 'bg-gradient-to-r from-adventure-orange to-sunset-yellow text-white hover:from-adventure-orange/90 hover:to-sunset-yellow/90 focus:ring-adventure-orange shadow-glow',
    ghost: 'text-forest-green hover:bg-forest-green/10 focus:ring-forest-green dark:text-[var(--text)] dark:hover:bg-white/10',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600',
  } as const;
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };
  
  const motionProps = {
    whileHover: { 
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    whileTap: { scale: 0.95 },
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  return (
    <motion.button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...motionProps}
      {...props}
    >
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 bg-white opacity-0 hover:opacity-20 dark:bg-white/10 transition-opacity duration-200 rounded-lg" />
      <span className="relative z-10 flex items-center gap-x-2">
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        )}
        {icon && !loading && <span>{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
};