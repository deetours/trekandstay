import React, { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: string; // e.g., 'sm', 'md', 'lg', 'xl', '2xl'
  closeButton?: boolean;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

/**
 * ResponsiveModal - A bulletproof, mobile-first modal component
 * 
 * Features:
 * - Perfectly centered on all devices (mobile, tablet, desktop)
 * - Fixed positioning with flexbox centering (no jumping/jumping)
 * - Body scroll lock when modal open
 * - Content scrolls internally if exceeds viewport
 * - Keyboard support (ESC to close)
 * - Smooth spring animations
 * - Responsive max-widths for all screen sizes
 * - Proper z-index stacking
 */
export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'lg',
  closeButton = true,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const widthClass = maxWidthMap[maxWidth as keyof typeof maxWidthMap] || maxWidthMap.lg;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
          style={{ pointerEvents: 'auto' }}
          onClick={onClose}
        >
          {/* Backdrop - Fixed, covers entire viewport */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ pointerEvents: 'auto' }}
          />

          {/* Modal Container - Centered with flexbox */}
          <motion.div
            className={`relative w-full ${widthClass} max-h-[85vh] sm:max-h-[90vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col pointer-events-auto`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 40 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (if title provided) */}
            {title && (
              <div className="flex-shrink-0 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4 sm:p-6 md:p-8">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
