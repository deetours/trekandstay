import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, MapPin, Calendar, Phone, Compass, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAdventureStore } from '../../store/adventureStore';
import { initTheme, toggleTheme } from '../../theme/theme';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, setActiveModal } = useAdventureStore();
  const [mode, setMode] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' ? initTheme() : 'light'));
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setMode(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Always show logo and all menu items
  const navigationItems = [
    { label: 'Home', href: '/', icon: Compass },
    { label: 'Destinations', href: '/destinations', icon: MapPin },
    { label: 'Stories', href: '/stories', icon: Calendar },
    { label: 'About', href: '/about', icon: Compass },
    { label: 'Contact', href: '/contact', icon: Phone },
  ];

  const headerVariants = {
    scrolled: {
      backgroundColor: 'rgba(27, 67, 50, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    },
    top: {
      backgroundColor: 'rgba(27, 67, 50, 0.8)',
      backdropFilter: 'blur(5px)',
      boxShadow: 'none',
    },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      opacity: 1,
      x: '0%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 px-4 py-4 transition-all duration-300"
        animate={isScrolled ? 'scrolled' : 'top'}
        variants={headerVariants}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
            <Link to="/">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  className="flex items-center"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-2 text-stone-gray hover:text-adventure-orange transition-colors duration-200 font-inter font-medium${location.pathname.startsWith(item.href) && item.href !== '/' ? ' text-adventure-orange font-bold' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              aria-label="Toggle dark mode"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setMode(toggleTheme())}
              title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAuthenticated && user ? (
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-8 h-8 rounded-full bg-stone-gray flex items-center justify-center border border-forest-green">
                  <User className="w-4 h-4 text-forest-green" />
                </div>
                <span className="text-stone-gray font-inter">
                  {user.name}
                </span>
              </motion.div>
            ) : (
              <Button
                variant="adventure"
                size="md"
                onClick={() => setActiveModal('login')}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden text-white"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              className="fixed right-0 top-0 h-full w-80 bg-forest-green z-50 lg:hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="p-6 pt-20">
                {/* Mobile Navigation */}
                <nav className="space-y-6">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        <Link
                          to={item.href}
                          className="flex items-center space-x-3 text-stone-gray hover:text-adventure-orange transition-colors duration-200 font-inter text-lg"
                          onClick={e => {
                            e.preventDefault();
                            setIsMobileMenuOpen(false);
                            setTimeout(() => {
                              window.location.href = item.href;
                            }, 200);
                          }}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Mobile User Actions */}
                <motion.div
                  className="mt-8 pt-8 border-t border-stone-gray/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-stone-gray">Theme</span>
                    <button
                      aria-label="Toggle dark mode"
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                      onClick={() => setMode(toggleTheme())}
                    >
                      {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                  </div>
                  {isAuthenticated && user ? (
                    <div className="flex items-center space-x-3 text-stone-gray">
                      <div className="w-10 h-10 rounded-full bg-stone-gray flex items-center justify-center border border-forest-green">
                        <User className="w-5 h-5 text-forest-green" />
                      </div>
                      <div>
                        <p className="font-inter font-medium">{user.name}</p>
                        <p className="text-sm opacity-80">
                          {user.adventurePoints} Points
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="adventure"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        setActiveModal('login');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};