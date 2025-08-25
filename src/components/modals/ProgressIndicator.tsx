import React from 'react';
import { motion } from 'framer-motion';
import { Check, User, MapPin, Star } from 'lucide-react';
import { useLeadCaptureStore } from '../../store/leadCaptureStore';

export const ProgressIndicator: React.FC = () => {
  const { currentStep, totalSteps } = useLeadCaptureStore();

  const steps = [
    { icon: User, label: 'Personal Info' },
    { icon: MapPin, label: 'Preferences' },
    { icon: Star, label: 'Recommendations' }
  ];

  return (
    <div className="flex items-center justify-between relative">
      {/* Progress Line */}
      <div className="absolute top-4 left-0 w-full h-0.5 bg-orange-200">
        <motion.div
          className="h-full bg-white"
          initial={{ width: '0%' }}
          animate={{ 
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` 
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Step Indicators */}
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const IconComponent = step.icon;

        return (
          <div key={stepNumber} className="relative flex flex-col items-center z-10">
            {/* Circle */}
            <motion.div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isCompleted 
                  ? 'bg-white border-white text-adventure-orange' 
                  : isCurrent 
                    ? 'bg-white border-white text-adventure-orange' 
                    : 'bg-orange-200 border-orange-200 text-orange-400'
                }
              `}
              whileHover={{ scale: isCurrent ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <IconComponent className="w-4 h-4" />
              )}
            </motion.div>

            {/* Label */}
            <span 
              className={`
                mt-2 text-xs font-medium transition-colors duration-300
                ${isCompleted || isCurrent 
                  ? 'text-white' 
                  : 'text-orange-200'
                }
              `}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};