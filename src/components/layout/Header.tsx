import { useCart } from '../shop/useCart';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, MapPinned, Hotel, ShoppingBag, Info, Mail, ShoppingCart } from 'lucide-react';
import { products } from '../../data/shopProducts';
import { Button } from '../ui/Button';
import { useAdventureStore } from '../../store/adventureStore';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { cart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAdventureStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Always show logo and all menu items
  const navigationItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Destinations', href: '/destinations', icon: MapPinned },
    { label: 'Stays', href: '/stays', icon: Hotel },
    { label: 'Shop', href: '/shop', icon: ShoppingBag },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Contact', href: '/contact', icon: Mail },
  ];

  // Do not show "Home" link while already on the home page
  const visibleNavigationItems = location.pathname === '/' ? navigationItems.filter(i => i.label !== 'Home') : navigationItems;

  // Color / style map per nav item
  const navStyles: Record<string, { ring: string; icon: string; gradient: string; hover: string }> = {
    Home: { ring: 'ring-teal-300/40', icon: 'text-teal-600', gradient: 'from-teal-50 to-cyan-50', hover:'hover:from-teal-100 hover:to-cyan-100' },
    Destinations: { ring: 'ring-rose-300/40', icon: 'text-rose-600', gradient: 'from-rose-50 to-pink-50', hover:'hover:from-rose-100 hover:to-pink-100' },
    Stays: { ring: 'ring-amber-300/40', icon: 'text-amber-600', gradient: 'from-amber-50 to-orange-50', hover:'hover:from-amber-100 hover:to-orange-100' },
    Shop: { ring: 'ring-yellow-300/40', icon: 'text-yellow-600', gradient: 'from-yellow-50 to-orange-50', hover:'hover:from-yellow-100 hover:to-orange-100' },
    Cart: { ring: 'ring-blue-300/40', icon: 'text-blue-600', gradient: 'from-blue-50 to-cyan-50', hover:'hover:from-blue-100 hover:to-cyan-100' },
    Wishlist: { ring: 'ring-pink-300/40', icon: 'text-pink-600', gradient: 'from-pink-50 to-rose-50', hover:'hover:from-pink-100 hover:to-rose-100' },
    About: { ring: 'ring-violet-300/40', icon: 'text-violet-600', gradient: 'from-violet-50 to-fuchsia-50', hover:'hover:from-violet-100 hover:to-fuchsia-100' },
    Contact: { ring: 'ring-emerald-300/40', icon: 'text-emerald-600', gradient: 'from-emerald-50 to-green-50', hover:'hover:from-emerald-100 hover:to-green-100' },
  };

  const headerVariants = {
    scrolled: {
      backgroundColor: 'rgba(27, 67, 50, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    },
    top: {
      backgroundColor: 'rgba(27, 67, 50, 0.8)',
      backdropFilter: 'blur(5px)',
      boxShadow: '0 0 0 0 rgba(0,0,0,0)', // avoid animating from 'none'
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
        className="fixed top-0 left-0 right-0 z-50 px-3 py-2 md:px-4 md:py-3 transition-all duration-300 w-full"
        animate={isScrolled ? 'scrolled' : 'top'}
        variants={headerVariants}
      >
        <div className="w-full flex items-center justify-between gap-2">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
            <Link to="/">
              <img src="/logo.png" alt="Logo" className="h-7 md:h-10 w-auto flex-shrink-0" />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {visibleNavigationItems.map((item, index) => {
              const Icon = item.icon;
              const active = item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);
              const sty = navStyles[item.label];
              return (
                <motion.div
                  key={item.label}
                  className="flex items-center"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Link
                    to={item.href}
                    className={`group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${active ? 'text-forest-green' : 'text-stone-gray'} `}
                  >
                    <span className={`relative inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br ${sty.gradient} ${sty.darkGradient} ${sty.hover} ring-1 ${sty.ring} shadow-sm group-hover:shadow-md transition-all duration-300 ${active ? 'scale-105 ring-2' : ''}`}>
                      <Icon className={`w-3.5 h-3.5 ${sty.icon}`} />
                      {active && <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/60 to-white/0 opacity-70 mix-blend-overlay pointer-events-none" />}
                    </span>
                    <span className="relative z-10 tracking-wide">{item.label}</span>
                    {active && (
                      <motion.span
                        layoutId="navActiveUnderline"
                        className="absolute -bottom-1 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 via-primary to-blue-500"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Cart Icon with badge */}
            <button
              aria-label="View cart"
              className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white focus:outline-none"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-adventure-orange text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow-lg border-2 border-white">{cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)}</span>
              )}
            </button>
      {/* Cart Drawer/Modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-end lg:items-start lg:justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          {/* Drawer */}
          <div className="relative w-full max-w-md h-[85vh] rounded-t-3xl lg:rounded-l-3xl shadow-2xl p-0 z-10 flex flex-col border-t-4 border-forest-green bg-[var(--card)] text-[var(--text)]">
            <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-[var(--border)]">
              <h2 className="text-2xl font-great-adventurer font-bold text-forest-green tracking-tight">Your Cart</h2>
              <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setCartOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 font-medium text-lg">Your cart is empty.</div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {cart.map((item: { id: string; quantity: number }) => {
                    const product = products.find(p => p.id === item.id);
                    if (!product) return null;
                    return (
                      <li key={item.id} className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow p-3">
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow" />
                        <div className="flex-1 min-w-0">
                          <div className="font-expat-rugged font-bold text-mountain-blue truncate">{product.name}</div>
                          <div className="font-inter text-gray-500 text-xs truncate">{product.description}</div>
                          <div className="font-outbrave font-bold text-forest-green mt-1">₹{product.price} <span className="text-xs text-gray-400">x {item.quantity}</span></div>
                        </div>
                        <span className="text-lg font-outbrave font-bold text-mountain-blue">₹{product.price * item.quantity}</span>
                      </li>
                    );
                  })}
                </ul>
                {/* Cart total and checkout */}
                <div className="px-6 pb-6 pt-2 border-t bg-gradient-to-r from-white to-yellow-50">
                  <div className="flex justify-between items-center mb-4 text-[var(--text)]">
                    <span className="font-expat-rugged font-bold text-lg text-forest-green">Total</span>
                    <span className="text-xl font-outbrave font-bold text-mountain-blue">
                      ₹{cart.reduce((sum, item) => {
                        const product = products.find(p => p.id === item.id);
                        return sum + (product ? product.price * item.quantity : 0);
                      }, 0)}
                    </span>
                  </div>
                  <button
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-forest-green to-mountain-blue text-white font-tall-rugged font-bold text-lg shadow-lg hover:from-mountain-blue hover:to-forest-green transition-all duration-200 disabled:opacity-60"
                    onClick={() => { setCartOpen(false); navigate('/cart'); }}
                    disabled={cart.length === 0}
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
            {isAuthenticated && user ? (
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-8 h-8 rounded-full bg-stone-gray flex items-center justify-center border border-forest-green">
                  {/* <User className="w-4 h-4 text-forest-green" /> */}
                </div>
                <span className="text-stone-gray font-inter">
                  <Link to="/dashboard">{user.name}</Link>
                </span>
                <Button
                  variant="secondary"
                  onClick={() => { localStorage.removeItem('auth_token'); useAdventureStore.getState().logout(); navigate('/'); }}
                >
                  Sign Out
                </Button>
              </motion.div>
            ) : (
              <Button
                variant="adventure"
                size="md"
                onClick={() => navigate('/signin')}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Buttons - Cart and Menu on same line */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile Cart Button */}
            <button
              className="relative flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg rounded-full w-9 h-9 md:w-10 md:h-10 border-2 border-white/80 focus:outline-none flex-shrink-0 hover:shadow-xl transition-shadow"
              style={{ boxShadow: '0 3px 12px 0 rgba(0,0,0,0.12)' }}
              aria-label="View cart"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow border-2 border-white">
                  {cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <motion.button
              className="relative text-white flex-shrink-0"
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="absolute -inset-2 rounded-xl bg-gradient-to-br from-emerald-500/30 via-primary/30 to-blue-500/30 blur-xl opacity-60" />
              <span className="relative inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-primary to-blue-600 ring-1 ring-white/20 shadow-lg shadow-primary/30">
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Menu className="w-4 h-4 md:w-5 md:h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </span>
            </motion.button>
          </div>
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
                <nav className="space-y-5">
                  {visibleNavigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);
                    const sty = navStyles[item.label];
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.07 + 0.15 }}
                      >
                        <Link
                          to={item.href}
                          className={`group flex items-center gap-4 rounded-2xl px-4 py-3 font-inter text-base tracking-wide transition-colors ${active ? 'text-white' : 'text-stone-gray hover:text-white'}`}
                          onClick={e => {
                            e.preventDefault();
                            setIsMobileMenuOpen(false);
                            setTimeout(() => { window.location.href = item.href; }, 220);
                          }}
                        >
                          <span className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${sty.gradient} ring-1 ${sty.ring} shadow ${active ? 'scale-105 ring-2 ring-white/60' : 'opacity-90'} transition-all duration-300`}>
                            <Icon className={`w-4 h-4 ${sty.icon}`} />
                            {active && <span className="absolute inset-0 rounded-xl bg-white/30 mix-blend-overlay" />}
                          </span>
                          <span className="flex-1 flex items-center justify-between">
                            {item.label}
                            {active && <span className="ml-3 inline-block w-2 h-2 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 animate-pulse" />}
                          </span>
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
                  {isAuthenticated && user ? (
                    <div className="flex items-center space-x-3 text-stone-gray">
                      <div className="w-10 h-10 rounded-full bg-stone-gray flex items-center justify-center border border-forest-green">
                        {/* <User className="w-5 h-5 text-forest-green" /> */}
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
                        navigate('/signin');
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