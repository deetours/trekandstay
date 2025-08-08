import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animated?: boolean;
  theme?: 'default' | 'white';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-4xl'
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  animated = false,
  theme = 'default'
}) => {
  const textColorClasses = {
    default: 'text-forest-green',
    white: 'text-white'
  };

  const subTextColorClasses = {
    default: 'text-mountain-blue',
    white: 'text-stone-gray'
  };

  const logoImage = (
    <img
      src="/logo.png"
      alt="Trek & Stay Logo"
      className={`${sizeClasses[size]} object-contain`}
    />
  );

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {animated ? (
        <motion.div
          className="flex-shrink-0"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {logoImage}
        </motion.div>
      ) : (
        <div className="flex-shrink-0">
          {logoImage}
        </div>
      )}
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-oswald font-bold ${textColorClasses[theme]} ${textSizeClasses[size]} leading-tight`}>
            Trek & Stay
          </span>
          {size !== 'sm' && (
            <span className={`text-xs ${subTextColorClasses[theme]} font-inter opacity-80 -mt-1`}>
              Adventure Awaits
            </span>
          )}
        </div>
      )}
    </div>
  );
};
