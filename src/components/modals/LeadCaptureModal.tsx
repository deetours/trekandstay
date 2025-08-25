import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, User, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useLeadCaptureStore } from '../../store/leadCaptureStore';
import { StepOne } from './steps/StepOne';
import { StepTwo } from './steps/StepTwo';
import { StepThree } from './steps/StepThree';
import { ProgressIndicator } from './ProgressIndicator';

export const LeadCaptureModal: React.FC = () => {
  const {
    isOpen,
    currentStep,
    totalSteps,
    closePopup,
    nextStep,
    prevStep,
    dismissPopup,
    isLoading,
    errors
  } = useLeadCaptureStore();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        dismissPopup();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, dismissPopup]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const stepTitles = [
    'Let\'s Get Started',
    'Your Adventure Preferences',
    'Perfect Recommendations'
  ];

  const stepSubtitles = [
    'Tell us a bit about yourself',
    'Help us find your ideal trip',
    'Trips tailored just for you'
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOne />;
      case 2:
        return <StepTwo />;
      case 3:
        return <StepThree />;
      default:
        return <StepOne />;
    }
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      const { formData } = useLeadCaptureStore.getState();
      return formData.name && formData.email && formData.whatsapp;
    }
    return true;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismissPopup}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-6 py-4 bg-gradient-to-r from-adventure-orange to-orange-600">
              <button
                onClick={dismissPopup}
                className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="pr-12">
                <h2 className="text-xl font-oswald font-bold text-white">
                  {stepTitles[currentStep - 1]}
                </h2>
                <p className="text-orange-100 text-sm mt-1">
                  {stepSubtitles[currentStep - 1]}
                </p>
              </div>
              
              {/* Progress Indicator */}
              <div className="mt-4">
                <ProgressIndicator />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>

              {/* Global Error */}
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                >
                  {errors.submit}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Step {currentStep} of {totalSteps}</span>
              </div>

              <div className="flex items-center space-x-3">
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    onClick={nextStep}
                    disabled={!canGoNext() || isLoading}
                    className="flex items-center space-x-2 px-6 py-2 bg-adventure-orange text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => useLeadCaptureStore.getState().submitLead()}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Get My Recommendations</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="px-6 py-3 bg-gray-100 border-t">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>No Spam Guarantee</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>Free Consultation</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};