import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1920')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70" />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-4 max-w-5xl"
      >
        <h1 className="text-cloud-white text-4xl md:text-6xl lg:text-7xl font-serif mb-6 leading-tight">
          When Was the Last Time<br />You Felt Like Yourself?
        </h1>
        <p className="text-cloud-white/90 text-xl md:text-2xl mb-12 font-light max-w-2xl mx-auto">
          Not tired. Erased. Not busy. Numb.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/quiz">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-sunrise-coral text-cloud-white px-8 py-4 rounded-lg text-lg font-bold uppercase tracking-wider hover:bg-deep-forest transition-colors duration-300 shadow-lg"
            >
              Take the 2-Min Quiz →
            </motion.button>
          </Link>
          
          <Link to="/trips">
            <button className="text-cloud-white border-2 border-cloud-white px-8 py-4 rounded-lg text-lg font-bold uppercase tracking-wider hover:bg-cloud-white hover:text-deep-forest transition-all duration-300">
              Browse Retreats
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <ChevronDown className="text-cloud-white w-8 h-8" />
      </motion.div>
    </section>
  );
}