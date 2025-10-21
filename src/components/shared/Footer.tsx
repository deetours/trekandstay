import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-deep-forest text-cloud-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="text-xl font-serif mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-sunrise-coral transition-colors">Our Story</Link></li>
              <li><Link to="/founder" className="hover:text-sunrise-coral transition-colors">Meet the Founder</Link></li>
              <li><Link to="/testimonials" className="hover:text-sunrise-coral transition-colors">Testimonials</Link></li>
              <li><Link to="/blog" className="hover:text-sunrise-coral transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Trips */}
          <div>
            <h3 className="text-xl font-serif mb-4">Journeys</h3>
            <ul className="space-y-2">
              <li><Link to="/trips" className="hover:text-sunrise-coral transition-colors">All Retreats</Link></li>
              <li><Link to="/quiz" className="hover:text-sunrise-coral transition-colors">Find My Journey</Link></li>
              <li><Link to="/digital-detox" className="hover:text-sunrise-coral transition-colors">Digital Detox</Link></li>
              <li><Link to="/couples" className="hover:text-sunrise-coral transition-colors">Couples Retreats</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-serif mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="hover:text-sunrise-coral transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-sunrise-coral transition-colors">Contact Us</Link></li>
              <li><Link to="/booking" className="hover:text-sunrise-coral transition-colors">Booking Policy</Link></li>
              <li><Link to="/safety" className="hover:text-sunrise-coral transition-colors">Safety Guidelines</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-serif mb-4">Stay Connected</h3>
            <p className="text-soft-grey mb-4">Get transformation tips and exclusive retreat offers.</p>
            <div className="flex mb-4">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-mystic-indigo text-cloud-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-sunrise-coral"
              />
              <button className="bg-sunrise-coral px-4 py-2 rounded-r-lg hover:bg-sunrise-coral/80 transition-colors">
                <Mail className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-4">
              <a href="#" className="hover:text-sunrise-coral transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-sunrise-coral transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-sunrise-coral transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-mystic-indigo mt-12 pt-8 text-center">
          <p className="text-soft-grey flex items-center justify-center gap-2">
            © 2025 Transformation Travel. Journeys that change you. Made with <Heart className="w-4 h-4 text-sunrise-coral" fill="currentColor" /> in India.
          </p>
        </div>
      </div>
    </footer>
  );
}