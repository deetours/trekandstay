import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Heart 
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'Destinations', href: '/destinations' },
    { name: 'About Us', href: '/about' },
    { name: 'Safety Guidelines', href: '/safety' },
    { name: 'Terms & Conditions', href: '/terms' },
  ];

  const adventures = [
    { name: 'Waterfall Expeditions', href: '/waterfalls' },
    { name: 'Fort Adventures', href: '/forts' },
    { name: 'Beach Exploration', href: '/beaches' },
    { name: 'Hill Treks', href: '/hills' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-forest-green text-white relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] repeat" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <Logo size="md" showText={true} animated={false} theme="white" />
            </div>
            
            <p className="text-stone-gray font-inter mb-6 leading-relaxed">
              Discover the hidden gems of Karnataka and Maharashtra with our expertly 
              curated adventure experiences. Your safety and satisfaction are our top priorities.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-stone-gray">
                <MapPin className="w-4 h-4 text-adventure-orange flex-shrink-0" />
                <span className="text-sm">Bangalore, Karnataka, India</span>
              </div>
              <div className="flex items-center space-x-3 text-stone-gray">
                <Phone className="w-4 h-4 text-adventure-orange flex-shrink-0" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3 text-stone-gray">
                <Mail className="w-4 h-4 text-adventure-orange flex-shrink-0" />
                <span className="text-sm">hello@trekandstay.com</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-xl font-oswald font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Link
                    to={link.href}
                    className="text-stone-gray hover:text-adventure-orange transition-colors duration-200 font-inter"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Adventures */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-xl font-oswald font-bold mb-6">Adventures</h4>
            <ul className="space-y-3">
              {adventures.map((adventure, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Link
                    to={adventure.href}
                    className="text-stone-gray hover:text-adventure-orange transition-colors duration-200 font-inter"
                  >
                    {adventure.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter & Social */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-xl font-oswald font-bold mb-6">Stay Connected</h4>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <p className="text-stone-gray font-inter text-sm mb-4">
                Get updates on new adventures and exclusive offers
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l-lg focus:outline-none focus:border-adventure-orange text-white placeholder-stone-gray"
                />
                <motion.button
                  className="px-4 py-2 bg-adventure-orange text-white rounded-r-lg hover:bg-adventure-orange/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-stone-gray font-inter text-sm mb-4">Follow us</p>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-stone-gray hover:text-adventure-orange hover:bg-white/20 transition-colors duration-200"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-stone-gray font-inter text-sm mb-4 md:mb-0">
            © 2024 Trek & Stay. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-2 text-stone-gray text-sm">
            <span>Made with</span>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                color: ['#F4F3EE', '#FF6B35', '#F4F3EE']
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
            >
              <Heart className="w-4 h-4 fill-current" />
            </motion.div>
            <span>for adventurers</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};