import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Mountain } from 'lucide-react';
import MegaMenu from './MegaMenu';
import MobileMenu from './MobileMenu';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isHomePage = location.pathname === '/';

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || !isHomePage
            ? 'bg-cloud-white/95 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <Mountain className={`w-8 h-8 transition-colors ${
                isScrolled || !isHomePage ? 'text-sunrise-coral' : 'text-cloud-white'
              }`} />
              <div className="flex flex-col">
                <span className={`font-serif text-xl font-bold transition-colors ${
                  isScrolled || !isHomePage ? 'text-deep-forest' : 'text-cloud-white'
                }`}>
                  Transformation
                </span>
                <span className={`font-sans text-xs uppercase tracking-wider transition-colors ${
                  isScrolled || !isHomePage ? 'text-mystic-indigo' : 'text-cloud-white/80'
                }`}>
                  Travel
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <MegaMenu isOpen={false} onClose={() => {}} />
                
                <Link
                  to="/about"
                  className={`font-medium transition-colors ${
                    isScrolled || !isHomePage
                      ? 'text-deep-forest hover:text-sunrise-coral'
                      : 'text-cloud-white hover:text-warm-sand'
                  }`}
                >
                  About
                </Link>
                
                <Link
                  to="/blog"
                  className={`font-medium transition-colors ${
                    isScrolled || !isHomePage
                      ? 'text-deep-forest hover:text-sunrise-coral'
                      : 'text-cloud-white hover:text-warm-sand'
                  }`}
                >
                  Journal
                </Link>
                
                <Link
                  to="/contact"
                  className={`font-medium transition-colors ${
                    isScrolled || !isHomePage
                      ? 'text-deep-forest hover:text-sunrise-coral'
                      : 'text-cloud-white hover:text-warm-sand'
                  }`}
                >
                  Contact
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  to="/b2b"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled || !isHomePage
                      ? 'text-mystic-indigo hover:bg-warm-sand'
                      : 'text-cloud-white hover:bg-white/10'
                  }`}
                >
                  Partner Portal
                </Link>
                
                <Link to="/quiz">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-sunrise-coral text-cloud-white px-6 py-2 rounded-lg font-bold hover:bg-deep-forest transition-colors"
                  >
                    Find My Retreat
                  </motion.button>
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled || !isHomePage
                  ? 'text-deep-forest hover:bg-warm-sand'
                  : 'text-cloud-white hover:bg-white/10'
              }`}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}