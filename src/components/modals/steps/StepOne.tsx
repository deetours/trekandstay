import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, AlertCircle } from 'lucide-react';
import { useLeadCaptureStore } from '../../../store/leadCaptureStore';

export const StepOne: React.FC = () => {
  const { formData, updateFormData, errors } = useLeadCaptureStore();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const formatWhatsAppNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Format as XXX-XXX-XXXX for better readability
    if (limitedDigits.length >= 6) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    } else if (limitedDigits.length >= 3) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
    }
    return limitedDigits;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Message */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h3 className="text-2xl font-oswald font-bold text-gray-900 mb-2">
          Ready for Your Next Adventure? 🏔️
        </h3>
        <p className="text-gray-600">
          Join thousands of adventure seekers who've discovered their perfect trip with us!
        </p>
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>500+ Happy Travelers</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>50+ Destinations</span>
          </div>
        </div>
      </motion.div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Name Field */}
        <motion.div variants={itemVariants}>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            What should we call you? *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg
                focus:ring-2 focus:ring-adventure-orange focus:border-transparent
                transition-colors duration-200
                ${errors.name && touched.name 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              placeholder="Enter your full name"
              autoFocus
            />
            {errors.name && touched.name && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
            )}
          </div>
          {errors.name && touched.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </motion.div>

        {/* Email Field */}
        <motion.div variants={itemVariants}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg
                focus:ring-2 focus:ring-adventure-orange focus:border-transparent
                transition-colors duration-200
                ${errors.email && touched.email 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              placeholder="your.email@example.com"
            />
            {errors.email && touched.email && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
            )}
          </div>
          {errors.email && touched.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            We'll send you trip recommendations and important updates
          </p>
        </motion.div>

        {/* WhatsApp Field */}
        <motion.div variants={itemVariants}>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Number *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <div className="absolute inset-y-0 left-10 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">+91</span>
            </div>
            <input
              type="tel"
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', formatWhatsAppNumber(e.target.value))}
              className={`
                block w-full pl-20 pr-3 py-3 border rounded-lg
                focus:ring-2 focus:ring-adventure-orange focus:border-transparent
                transition-colors duration-200
                ${errors.whatsapp && touched.whatsapp 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              placeholder="98765-43210"
              maxLength={12} // Formatted length
            />
            {errors.whatsapp && touched.whatsapp && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
            )}
          </div>
          {errors.whatsapp && touched.whatsapp && (
            <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            We'll connect with you via WhatsApp for trip planning and updates
          </p>
        </motion.div>
      </div>

      {/* Benefits Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mt-6"
      >
        <h4 className="font-semibold text-gray-900 mb-2">Why share your details?</h4>
        <ul className="space-y-1 text-sm text-gray-600">
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Get personalized trip recommendations</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span>Instant WhatsApp support from our travel experts</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
            <span>Exclusive deals and early access to new destinations</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
};