import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  User,
  Calendar,
  Mountain,
  Instagram,
  Facebook,
  Twitter,
  Youtube
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/layout/PageTransition';
import { StoriesWidget } from '../components/dashboard/StoriesWidget';
import { Logo } from '../components/common/Logo';
import { LocalScene } from '../components/3d/LocalScene';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  preferredDate: string;
  participants: string;
}

const initialForm: ContactForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  preferredDate: '',
  participants: '1'
};

const contactInfo = [
  {
    icon: Phone,
    title: 'Call Us',
    content: '+91 98765 43210',
    subContent: 'Mon-Sat, 9AM-7PM',
    action: 'tel:+919876543210'
  },
  {
    icon: Mail,
    title: 'Email Us',
    content: 'adventures@trekandstay.com',
    subContent: 'We reply within 2 hours',
    action: 'mailto:adventures@trekandstay.com'
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    content: 'MG Road, Bangalore',
    subContent: 'Karnataka, India 560001',
    action: 'https://maps.google.com'
  },
  {
    icon: Clock,
    title: 'Office Hours',
    content: 'Mon - Sat: 9AM - 7PM',
    subContent: 'Sun: 10AM - 4PM',
    action: ''
  }
];

const socialLinks = [
  { icon: Instagram, name: 'Instagram', url: 'https://instagram.com/trekandstay', color: 'text-pink-600' },
  { icon: Facebook, name: 'Facebook', url: 'https://facebook.com/trekandstay', color: 'text-blue-600' },
  { icon: Twitter, name: 'Twitter', url: 'https://twitter.com/trekandstay', color: 'text-blue-400' },
  { icon: Youtube, name: 'YouTube', url: 'https://youtube.com/trekandstay', color: 'text-red-600' }
];

const subjects = [
  'General Inquiry',
  'Book an Adventure',
  'Custom Trip Planning',
  'Group Booking',
  'Equipment Rental',
  'Partnership Opportunity',
  'Feedback & Reviews',
  'Other'
];

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactForm>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ContactForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactForm> = {};
    
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9]{10}$/.test(form.phone.replace(/\D/g, ''))) newErrors.phone = 'Invalid phone number';
    if (!form.subject) newErrors.subject = 'Subject is required';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    setForm(initialForm);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setForm(initialForm);
    setErrors({});
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-stone-gray pt-24 pb-16 relative">
        <div className="absolute top-8 left-8 opacity-50">
          <LocalScene variant="compass" size={180} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center mb-4">
              <Logo size="lg" showText={false} />
            </div>
            <h1 className="text-4xl lg:text-6xl font-oswald font-bold text-forest-green mb-6">
              Let's Plan Your Adventure
            </h1>
            <p className="text-xl text-mountain-blue font-inter max-w-4xl mx-auto leading-relaxed">
              Ready to explore Karnataka's hidden gems? We're here to help you create 
              the perfect adventure tailored to your dreams and preferences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="space-y-6 mb-8">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-start space-x-4">
                          <motion.div
                            className="flex-shrink-0 bg-adventure-orange/10 rounded-xl p-3"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Icon className="w-6 h-6 text-adventure-orange" />
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="font-oswald font-bold text-forest-green text-lg mb-1">
                              {info.title}
                            </h3>
                            <p className="text-gray-900 font-medium mb-1">
                              {info.content}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {info.subContent}
                            </p>
                            {info.action && (
                              <motion.a
                                href={info.action}
                                className="text-adventure-orange text-sm font-medium hover:underline inline-block mt-2"
                                whileHover={{ x: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                {info.icon === Phone ? 'Call Now' : 
                                 info.icon === Mail ? 'Send Email' : 'View Location'} →
                              </motion.a>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Card className="p-6">
                  <h3 className="font-oswald font-bold text-forest-green text-lg mb-4">
                    Follow Our Adventures
                  </h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <motion.a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-3 bg-gray-100 rounded-full hover:bg-white transition-colors duration-200 ${social.color}`}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.a>
                      );
                    })}
                  </div>
                  <p className="text-gray-600 text-sm mt-4">
                    Follow us for daily adventure inspiration and stunning photography from Karnataka's landscapes.
                  </p>
                </Card>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="p-8">
                {!isSubmitted ? (
                  <>
                    <h2 className="text-2xl font-oswald font-bold text-forest-green mb-6">
                      Send Us a Message
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Personal Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4 text-adventure-orange" />
                            <span>Full Name *</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-adventure-orange focus:border-transparent transition-all duration-200 ${
                              errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                            }`}
                            placeholder="Enter your full name"
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4 text-adventure-orange" />
                            <span>Email Address *</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-adventure-orange focus:border-transparent transition-all duration-200 ${
                              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                            }`}
                            placeholder="your@email.com"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4 text-adventure-orange" />
                            <span>Phone Number *</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-adventure-orange focus:border-transparent transition-all duration-200 ${
                              errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'
                            }`}
                            placeholder="+91 98765 43210"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <MessageSquare className="w-4 h-4 text-adventure-orange" />
                            <span>Subject *</span>
                          </label>
                          <select
                            name="subject"
                            value={form.subject}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-adventure-orange focus:border-transparent transition-all duration-200 ${
                              errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-200'
                            }`}
                          >
                            <option value="">Select a subject</option>
                            {subjects.map((subject) => (
                              <option key={subject} value={subject}>
                                {subject}
                              </option>
                            ))}
                          </select>
                          {errors.subject && (
                            <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                          )}
                        </div>
                      </div>

                      {/* Adventure Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 text-adventure-orange" />
                            <span>Preferred Date</span>
                          </label>
                          <input
                            type="date"
                            name="preferredDate"
                            value={form.preferredDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-adventure-orange focus:border-transparent transition-all duration-200"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>

                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <Mountain className="w-4 h-4 text-adventure-orange" />
                            <span>Number of Participants</span>
                          </label>
                          <select
                            name="participants"
                            value={form.participants}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-adventure-orange focus:border-transparent transition-all duration-200"
                          >
                            {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? 'person' : 'people'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Message *
                        </label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleInputChange}
                          rows={6}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-adventure-orange focus:border-transparent transition-all duration-200 resize-none ${
                            errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200'
                          }`}
                          placeholder="Tell us about your dream adventure, any specific requirements, or questions you have..."
                        />
                        {errors.message && (
                          <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          variant="adventure"
                          size="lg"
                          loading={isSubmitting}
                          className="w-full font-oswald text-lg py-4"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            'Sending Message...'
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </>
                ) : (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: 3 }}
                    >
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-oswald font-bold text-forest-green mb-4">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Thank you for reaching out! Our adventure experts will get back to you within 2 hours 
                      with personalized recommendations and answers to your questions.
                    </p>
                    <Button
                      variant="adventure"
                      onClick={resetForm}
                      className="font-oswald"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-oswald font-bold text-forest-green mb-4">
                Quick Answers
              </h2>
              <p className="text-xl text-mountain-blue font-inter max-w-2xl mx-auto">
                Common questions from fellow adventurers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  question: "How far in advance should I book?",
                  answer: "We recommend booking 2-4 weeks in advance for popular destinations, especially during peak season (Oct-Feb)."
                },
                {
                  question: "What's included in the package?",
                  answer: "All packages include professional guides, safety equipment, permits, and meals as specified. Accommodation varies by package."
                },
                {
                  question: "Do you offer group discounts?",
                  answer: "Yes! We offer attractive discounts for groups of 6+ people. Contact us for customized group packages."
                },
                {
                  question: "What if weather conditions are bad?",
                  answer: "Safety is our priority. We'll reschedule or offer alternative destinations if weather conditions are unsafe."
                },
                {
                  question: "Can beginners join adventure trips?",
                  answer: "Absolutely! We have trips for all fitness levels, from easy nature walks to challenging mountain climbs."
                },
                {
                  question: "What should I bring?",
                  answer: "We provide a detailed packing list after booking. Basic items include comfortable shoes, weather-appropriate clothing, and personal items."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="p-6 h-full hover:shadow-xl transition-all duration-300">
                    <h4 className="font-oswald font-bold text-forest-green mb-3">
                      {faq.question}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto mt-16">
        <StoriesWidget />
      </div>
    </PageTransition>
  );
};
