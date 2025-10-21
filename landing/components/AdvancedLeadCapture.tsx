import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, ChevronRight, X, CheckCircle, AlertCircle
} from 'lucide-react';
import { THEME } from '../../src/config/theme';

interface UserBehavior {
  pageViews: number;
  timeOnPage: number;
  scrollDepth: number;
  interactions: string[];
  intent: 'low' | 'medium' | 'high';
  lastActivity: Date;
}

interface LeadCapture {
  name: string;
  phone: string;
  email: string;
  preferredDate: string;
  groupSize: number;
  budget: string;
  interests: string[];
  source: string;
  urgency: 'immediate' | 'this_week' | 'this_month' | 'flexible';
}

interface ContactData {
  name: string;
  phone: string;
  email: string;
}

interface PreferenceData {
  preferredDate: string;
  groupSize: number;
  budget: string;
  urgency: 'immediate' | 'this_week' | 'this_month' | 'flexible';
  interests: string[];
}

export const AdvancedLeadCapture: React.FC<{
  tripName?: string;
  tripPrice?: number;
  onCapture: (lead: LeadCapture) => void;
}> = ({ tripName, tripPrice, onCapture }) => {
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    pageViews: 1,
    timeOnPage: 0,
    scrollDepth: 0,
    interactions: [],
    intent: 'low',
    lastActivity: new Date()
  });

  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [triggerReason, setTriggerReason] = useState('');
  const [formData, setFormData] = useState<Partial<LeadCapture>>({
    groupSize: 2,
    budget: '',
    interests: [],
    urgency: 'flexible'
  });

  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [showUrgencyBar, setShowUrgencyBar] = useState(false);
  
  const timeOnPageRef = useRef(0);
  const scrollRef = useRef(0);
  const interactionCountRef = useRef(0);

  // Track user behavior and trigger engagement
  useEffect(() => {
    // Time tracking
    const timeTracker = setInterval(() => {
      timeOnPageRef.current += 1;
      setUserBehavior(prev => ({
        ...prev,
        timeOnPage: timeOnPageRef.current,
        intent: getIntentLevel(timeOnPageRef.current, interactionCountRef.current, scrollRef.current)
      }));
      
      // Trigger floating CTA after 30 seconds
      if (timeOnPageRef.current === 30) {
        setShowFloatingCTA(true);
      }
      
      // Show urgency bar after 2 minutes
      if (timeOnPageRef.current === 120) {
        setShowUrgencyBar(true);
      }
    }, 1000);

    // Scroll tracking
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      scrollRef.current = scrollPercent;
      setUserBehavior(prev => ({
        ...prev,
        scrollDepth: scrollPercent
      }));

      // Trigger lead capture at 60% scroll
      if (scrollPercent > 60 && !showModal) {
        triggerLeadCapture('scroll_depth', 'You seem interested! Let us help you plan the perfect adventure.');
      }
    };

    // Mouse movement and click tracking
    const handleMouseMove = () => {
      interactionCountRef.current += 1;
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interaction = target.textContent?.slice(0, 20) || 'click';
      
      setUserBehavior(prev => ({
        ...prev,
        interactions: [...prev.interactions, interaction],
        lastActivity: new Date()
      }));
    };

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitIntent && timeOnPageRef.current > 15) {
        setShowExitIntent(true);
        triggerLeadCapture('exit_intent', 'Wait! Before you go, let us create your dream adventure!');
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(timeTracker);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [showModal, showExitIntent]);

  const getIntentLevel = (timeOnPage: number, interactions: number, scrollDepth: number): 'low' | 'medium' | 'high' => {
    const score = (timeOnPage / 60) + (interactions / 10) + (scrollDepth / 100);
    
    if (score > 2) return 'high';
    if (score > 1) return 'medium';
    return 'low';
  };

  const triggerLeadCapture = (reason: string, message: string) => {
    setTriggerReason(message);
    setShowModal(true);
    setFormData(prev => ({ ...prev, source: reason }));
  };

  const handleStepComplete = (stepData: Partial<LeadCapture>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      onCapture(formData as LeadCapture);
      setShowModal(false);
    }
  };

  const FloatingCTA = () => (
    <AnimatePresence>
      {showFloatingCTA && !showModal && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <motion.button
            onClick={() => triggerLeadCapture('floating_cta', 'Ready to book your adventure?')}
            className="bg-gradient-to-r text-white px-6 py-4 rounded-2xl shadow-2xl font-bold text-lg flex items-center space-x-3"
            style={{
              background: `linear-gradient(135deg, ${THEME.colors.forestGreen}, ${THEME.colors.waterfallBlue})`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: ["0 10px 40px rgba(0,0,0,0.15)", "0 20px 60px rgba(251,146,60,0.4)", "0 10px 40px rgba(0,0,0,0.15)"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Phone className="w-6 h-6" />
            <span>Book Now - Call Back</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const UrgencyBar = () => (
    <AnimatePresence>
      {showUrgencyBar && !showModal && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-orange-600 text-white p-4"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">⚡ Limited Time Offer!</p>
                <p className="text-sm opacity-90">
                  Only 3 spots left for {tripName || 'this adventure'} - Book now to secure your place!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => triggerLeadCapture('urgency_bar', 'Secure your spot before it\'s gone!')}
                className="bg-white text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Now
              </motion.button>
              <button
                onClick={() => setShowUrgencyBar(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const LeadCaptureModal = () => (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Modal Header */}
            <div className="text-white p-6" style={{
              background: `linear-gradient(135deg, ${THEME.colors.forestGreen}, ${THEME.colors.waterfallBlue})`
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">🎯 Let's Plan Your Adventure!</h2>
                  <p className="text-white/70 mt-1">{triggerReason}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Progress Indicator */}
              <div className="flex items-center space-x-2 mt-4">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-2 rounded-full ${
                      step <= currentStep ? 'bg-white' : 'bg-white/30'
                    } transition-all duration-300`}
                  />
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {currentStep === 1 && (
                <Step1Contact onComplete={handleStepComplete} />
              )}
              {currentStep === 2 && (
                <Step2Preferences onComplete={handleStepComplete} tripName={tripName} tripPrice={tripPrice} />
              )}
              {currentStep === 3 && (
                <Step3Confirmation onComplete={handleStepComplete} formData={formData} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <FloatingCTA />
      <UrgencyBar />
      <LeadCaptureModal />
      
      {/* Intent-based triggers */}
      <div className="hidden">
        <div data-intent={userBehavior.intent}>Intent: {userBehavior.intent}</div>
        <div data-time={userBehavior.timeOnPage}>Time: {userBehavior.timeOnPage}s</div>
        <div data-scroll={userBehavior.scrollDepth}>Scroll: {Math.round(userBehavior.scrollDepth)}%</div>
      </div>
    </>
  );
};

// Step Components
const Step1Contact: React.FC<{ onComplete: (data: ContactData) => void }> = ({ onComplete }) => {
  const [data, setData] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!data.name.trim()) newErrors.name = 'Name is required';
    if (!data.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!data.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onComplete(data);
    }
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Information</h3>
        <p className="text-gray-600">We'll call you back within 2 minutes!</p>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Your Full Name"
            value={data.name}
            onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
            }`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <input
            type="tel"
            placeholder="Your Phone Number"
            value={data.phone}
            onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
            }`}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <input
            type="email"
            placeholder="Your Email Address"
            value={data.email}
            onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
      </div>

      <motion.button
        onClick={handleSubmit}
        className="w-full text-white py-4 rounded-xl font-bold text-lg transition-all"
        style={{
          background: `linear-gradient(135deg, ${THEME.colors.forestGreen}, ${THEME.colors.waterfallBlue})`
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Continue → Tell Us Your Preferences
      </motion.button>

      <p className="text-center text-sm text-gray-500">
        🔒 Your information is secure and will never be shared
      </p>
    </motion.div>
  );
};

const Step2Preferences: React.FC<{ 
  onComplete: (data: PreferenceData) => void;
  tripName?: string;
  tripPrice?: number;
}> = ({ onComplete }) => {
  const [data, setData] = useState({
    preferredDate: '',
    groupSize: 2,
    budget: '',
    urgency: 'flexible' as 'immediate' | 'this_week' | 'this_month' | 'flexible',
    interests: [] as string[]
  });

  const interests = [
    'Trekking', 'Photography', 'Adventure Sports', 'Wildlife',
    'Culture', 'Food', 'Camping', 'Waterfalls', 'Mountains', 'Beaches'
  ];

  const toggleInterest = (interest: string) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Trip Preferences</h3>
        <p className="text-gray-600">Help us customize the perfect adventure for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            When would you like to travel?
          </label>
          <input
            type="date"
            value={data.preferredDate}
            onChange={(e) => setData(prev => ({ ...prev, preferredDate: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Size
          </label>
          <select
            value={data.groupSize}
            onChange={(e) => setData(prev => ({ ...prev, groupSize: parseInt(e.target.value) }))}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
          >
            {[1,2,3,4,5,6,7,8,9,10].map(size => (
              <option key={size} value={size}>
                {size} {size === 1 ? 'Person' : 'People'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Budget Range (per person)
        </label>
        <select
          value={data.budget}
          onChange={(e) => setData(prev => ({ ...prev, budget: e.target.value }))}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
        >
          <option value="">Select Budget Range</option>
          <option value="under-5000">Under ₹5,000</option>
          <option value="5000-10000">₹5,000 - ₹10,000</option>
          <option value="10000-20000">₹10,000 - ₹20,000</option>
          <option value="20000-50000">₹20,000 - ₹50,000</option>
          <option value="above-50000">Above ₹50,000</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Your Interests (select multiple)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {interests.map(interest => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`p-2 rounded-xl text-sm font-medium transition-all ${
                data.interests.includes(interest)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How urgent is your booking?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'immediate', label: 'This Week', color: 'bg-red-600' },
            { value: 'this_week', label: 'Next 2 Weeks', color: 'bg-orange-600' },
            { value: 'this_month', label: 'This Month', color: 'bg-yellow-600' },
            { value: 'flexible', label: 'Flexible', color: 'bg-green-600' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setData(prev => ({ ...prev, urgency: option.value as 'immediate' | 'this_week' | 'this_month' | 'flexible' }))}
              className={`p-3 rounded-xl text-white font-medium transition-all ${
                data.urgency === option.value ? option.color : 'bg-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <motion.button
        onClick={() => onComplete(data)}
        className="w-full text-white py-4 rounded-xl font-bold text-lg transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: `linear-gradient(135deg, ${THEME.colors.forestGreen}, ${THEME.colors.waterfallBlue})`
        }}
      >
        Almost Done → Review & Submit
      </motion.button>
    </motion.div>
  );
};

const Step3Confirmation: React.FC<{ 
  onComplete: (data: Record<string, never>) => void;
  formData: Partial<LeadCapture>;
}> = ({ onComplete, formData }) => {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Perfect! We'll Call You Back</h3>
        <p className="text-gray-600">Our adventure experts will contact you within 2 minutes</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl">
        <h4 className="font-bold text-gray-900 mb-3">Your Request Summary:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{formData.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Group Size:</span>
            <span className="font-medium">{formData.groupSize} people</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Preferred Date:</span>
            <span className="font-medium">{formData.preferredDate || 'Flexible'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Urgency:</span>
            <span className="font-medium capitalize">{formData.urgency?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl">
        <h4 className="font-bold text-blue-900 mb-2">🎁 Exclusive Offer!</h4>
        <p className="text-blue-700 text-sm">
          As a thank you for your interest, we're offering you a special 10% early bird discount 
          + complimentary travel insurance worth ₹2,000!
        </p>
      </div>

      <motion.button
        onClick={() => onComplete({})}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        ✅ Confirm - Call Me Now!
      </motion.button>

      <p className="text-center text-xs text-gray-500">
        Our travel experts are available 24/7 to help you plan the perfect adventure
      </p>
    </motion.div>
  );
};

export default AdvancedLeadCapture;
