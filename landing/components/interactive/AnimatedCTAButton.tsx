import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Heart, 
  Star, 
  Rocket,
  Gift,
  Crown,
  Flame,
  Target
} from 'lucide-react';

interface AnimatedCTAButtonProps {
  primaryText?: string;
  secondaryText?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'premium' | 'urgency';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCountdown?: boolean;
  className?: string;
}

export const AnimatedCTAButton: React.FC<AnimatedCTAButtonProps> = ({
  primaryText = 'Book Your Adventure Now',
  secondaryText = 'Limited Time Offer',
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'lg',
  showCountdown = true,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showSpecialEffect, setShowSpecialEffect] = useState(false);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes in seconds
  const controls = useAnimation();

  // Countdown timer
  useEffect(() => {
    if (!showCountdown) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showCountdown]);

  // Periodic attention animation
  useEffect(() => {
    const attentionInterval = setInterval(() => {
      if (!isHovered && clickCount < 3) {
        controls.start({
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 0 0 rgba(16, 185, 129, 0.7)',
            '0 0 0 15px rgba(16, 185, 129, 0)',
            '0 0 0 0 rgba(16, 185, 129, 0)'
          ]
        });
      }
    }, 8000);

    return () => clearInterval(attentionInterval);
  }, [isHovered, clickCount, controls]);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
    
    // Special effect on multiple clicks
    if (clickCount >= 2) {
      setShowSpecialEffect(true);
      setTimeout(() => setShowSpecialEffect(false), 2000);
    }

    // Trigger click animation
    controls.start({
      scale: [1, 0.95, 1.05, 1],
      rotate: [0, -2, 2, 0]
    });

    onClick?.();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600';
      case 'secondary':
        return 'from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600';
      case 'premium':
        return 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';
      case 'urgency':
        return 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600';
      default:
        return 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-6 py-3 text-sm';
      case 'md':
        return 'px-8 py-4 text-base';
      case 'lg':
        return 'px-10 py-5 text-lg';
      case 'xl':
        return 'px-12 py-6 text-xl';
      default:
        return 'px-10 py-5 text-lg';
    }
  };

  const getIcon = () => {
    if (clickCount >= 5) return Crown;
    if (clickCount >= 3) return Flame;
    if (variant === 'premium') return Star;
    if (variant === 'urgency') return Zap;
    return ArrowRight;
  };

  const IconComponent = getIcon();

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Special Effect Burst */}
      <AnimatePresence>
        {showSpecialEffect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Confetti particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%'
                }}
                initial={{ 
                  x: 0, 
                  y: 0,
                  opacity: 1 
                }}
                animate={{
                  x: Math.cos(i * 30 * Math.PI / 180) * 100,
                  y: Math.sin(i * 30 * Math.PI / 180) * 100,
                  opacity: 0
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            ))}
            
            {/* Central burst */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-30"
              initial={{ scale: 0 }}
              animate={{ scale: 3 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown Badge */}
      {showCountdown && countdown > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10"
        >
          ⏰ {formatTime(countdown)}
        </motion.div>
      )}

      {/* Achievement Badge */}
      {clickCount >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-3 -left-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1"
        >
          <Crown className="w-3 h-3" />
          VIP
        </motion.div>
      )}

      {/* Main Button */}
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
        animate={controls}
        className={`
          relative overflow-hidden font-bold text-white rounded-full shadow-2xl transition-all duration-300 
          bg-gradient-to-r ${getVariantStyles()} ${getSizeStyles()}
          hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed
          transform-gpu
        `}
        whileHover={{
          scale: 1.05,
          y: -2
        }}
        whileTap={{
          scale: 0.98
        }}
      >
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
          animate={{
            x: isHovered ? ['0%', '100%'] : '0%',
            opacity: isHovered ? [0, 1, 0] : 0
          }}
          transition={{
            duration: isHovered ? 0.8 : 0,
            ease: "easeInOut"
          }}
        />

        {/* Sparkle Effects */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${20 + (i % 2) * 40}%`
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    rotate: [0, 180]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Button Content */}
        <div className="relative z-10 flex items-center justify-center gap-3">
          {/* Icon with special states */}
          <motion.div
            animate={{
              rotate: isHovered ? [0, 360] : 0,
              scale: clickCount >= 3 ? [1, 1.2, 1] : 1
            }}
            transition={{
              rotate: { duration: 0.6 },
              scale: { duration: 1, repeat: Infinity }
            }}
          >
            <IconComponent className={`${size === 'xl' ? 'w-7 h-7' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
          </motion.div>

          {/* Text Content */}
          <div className="flex flex-col items-start">
            <motion.span
              animate={{
                y: isHovered ? -2 : 0
              }}
              className="leading-tight"
            >
              {primaryText}
            </motion.span>
            
            {secondaryText && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0.7, 
                  y: isHovered ? 0 : 5 
                }}
                className={`${size === 'xl' ? 'text-sm' : 'text-xs'} text-white/90 leading-tight`}
              >
                {secondaryText}
              </motion.span>
            )}
          </div>

          {/* Engagement Indicator */}
          {clickCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1"
            >
              {[...Array(Math.min(clickCount, 5))].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Heart className="w-3 h-3 text-red-200 fill-current" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Pulse Effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(16, 185, 129, 0.4)',
              '0 0 0 8px rgba(16, 185, 129, 0)',
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </motion.button>

      {/* Engagement Messages */}
      <AnimatePresence>
        {clickCount === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap"
          >
            🎉 Great choice! Click again to continue
          </motion.div>
        )}
        
        {clickCount === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap"
          >
            🔥 You're on fire! VIP status unlocked!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};