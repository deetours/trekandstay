import React, { ReactNode, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  showCloseButton?: boolean;
}

/**
 * CenterModal - Premium styled modal matching app theme
 * ✅ Smooth animations with spring physics
 * ✅ Compact design (75vh max height)
 * ✅ Prominent full-screen blur backdrop
 * ✅ Matches app color scheme & fonts throughout
 * ✅ Internal scrolling for long content
 * ✅ Perfect mobile responsiveness
 * ✅ ESC key & click-outside support
 */
export const CenterModal: React.FC<CenterModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Debug log to verify new code is loaded
  useEffect(() => {
    if (isOpen) {
      console.log('🎨 CenterModal v2 OPENED - New stylish version with blur!');
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Behind everything */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          />

          {/* Modal Container - On top of backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              ref={modalRef}
              tabIndex={-1}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: 'spring',
                damping: 26,
                stiffness: 360,
                mass: 0.9,
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                background: 'white',
                borderRadius: '1rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: 'min(90vw, 600px)',
                maxHeight: '75vh',
                border: '1px solid #f3f4f6',
              }}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '2px solid rgba(27, 67, 50, 0.1)',
                    background: 'linear-gradient(to right, rgba(27, 67, 50, 0.08), transparent, rgba(255, 107, 53, 0.08))',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  {title && (
                    <h2
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: 'bold',
                        color: '#1B4332',
                        fontFamily: '"Great Adventurer", Inter, sans-serif',
                        margin: 0,
                      }}
                    >
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      style={{
                        marginLeft: 'auto',
                        padding: '0.5rem',
                        background: 'rgba(27, 67, 50, 0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        color: '#1B4332',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 250ms ease',
                      }}
                      aria-label="Close modal"
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.color = '#FF6B35';
                        (e.target as HTMLButtonElement).style.background = 'rgba(27, 67, 50, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.color = '#1B4332';
                        (e.target as HTMLButtonElement).style.background = 'rgba(27, 67, 50, 0.1)';
                      }}
                    >
                      <X style={{ width: '1.25rem', height: '1.25rem', strokeWidth: 2.5 }} />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem 1.25rem',
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(38, 70, 83, 0.9)',
                }}
              >
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
