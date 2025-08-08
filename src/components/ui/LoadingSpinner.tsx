import React from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

interface LoadingSpinnerProps {
  type?: 'page' | 'component' | 'inline';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  type = 'component',
  message = 'Loading...'
}) => {
  const containerClasses = {
    page: 'fixed inset-0 z-50 bg-gradient-to-br from-forest-green/90 to-mountain-blue/90 backdrop-blur-sm',
    component: 'w-full h-64 bg-stone-gray/50 rounded-lg',
    inline: 'inline-flex'
  };

  const contentClasses = {
    page: 'flex flex-col items-center justify-center h-full text-white',
    component: 'flex flex-col items-center justify-center h-full text-forest-green',
    inline: 'items-center space-x-2'
  };

  return (
    <div className={containerClasses[type]}>
      <div className={contentClasses[type]}>
        <>
          <motion.div
            className={type === 'inline' ? '' : 'mb-6'}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          >
            <Compass className={type === 'inline' ? 'w-5 h-5 text-adventure-orange' : 'w-14 h-14 text-adventure-orange'} />
          </motion.div>
          <p className={`font-inter ${type === 'inline' ? 'text-sm' : 'text-lg font-medium mb-2'} ${type === 'page' ? 'text-white' : 'text-forest-green'}`}>{message}</p>
          <motion.div
            className={`flex space-x-1 ${type === 'inline' ? '' : 'mt-2'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-adventure-orange"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </motion.div>
        </>
      </div>
    </div>
  );
};
