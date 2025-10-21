import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppFloat() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "Hi! I'm interested in your transformation retreats. Can you help me choose the right journey?"
    );
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2, type: "spring" }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleWhatsAppClick}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-2xl transition-all duration-300 group"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
          <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
            Chat with us on WhatsApp
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}