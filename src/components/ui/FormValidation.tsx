import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Info, Eye, EyeOff } from 'lucide-react';
import { ValidationRule } from '../../utils/validationRules';

interface EnhancedInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  validationRules?: ValidationRule[];
  required?: boolean;
  className?: string;
  showStrengthIndicator?: boolean;
  helpText?: string;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  validationRules = [],
  required = false,
  className = '',
  showStrengthIndicator = false,
  helpText
}) => {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    rule: ValidationRule;
    passed: boolean;
  }[]>([]);

  useEffect(() => {
    if (validationRules.length > 0) {
      const results = validationRules.map(rule => ({
        rule,
        passed: rule.test(value)
      }));
      setValidationResults(results);
    }
  }, [value, validationRules]);

  const hasErrors = validationResults.some(r => r.rule.type === 'error' && !r.passed);
  const hasWarnings = validationResults.some(r => r.rule.type === 'warning' && !r.passed);
  
  const getInputClasses = () => {
    let classes = "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white/50 backdrop-blur-sm";
    
    if (focused) {
      classes += " border-emerald-400 shadow-lg shadow-emerald-100";
    } else if (hasErrors && touched) {
      classes += " border-red-300 shadow-lg shadow-red-100";
    } else if (hasWarnings && touched) {
      classes += " border-yellow-300 shadow-lg shadow-yellow-100";
    } else if (validationResults.length > 0 && validationResults.every(r => r.passed) && touched) {
      classes += " border-green-300 shadow-lg shadow-green-100";
    } else {
      classes += " border-gray-200 hover:border-gray-300";
    }
    
    return classes;
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push("At least 8 characters");

    if (/[A-Z]/.test(password)) score++;
    else feedback.push("One uppercase letter");

    if (/[a-z]/.test(password)) score++;
    else feedback.push("One lowercase letter");

    if (/\d/.test(password)) score++;
    else feedback.push("One number");

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push("One special character");

    const strength = score <= 2 ? 'weak' : score <= 3 ? 'medium' : score <= 4 ? 'strong' : 'excellent';
    return { score, feedback, strength };
  };

  const strengthColors: Record<string, string> = {
    weak: 'bg-red-400',
    medium: 'bg-yellow-400',
    strong: 'bg-blue-400',
    excellent: 'bg-green-400'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTouched(true);
          }}
          className={getInputClasses()}
        />

        {/* Password visibility toggle */}
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {/* Validation status icon */}
        <AnimatePresence>
          {touched && validationResults.length > 0 && (
            <motion.div
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              {hasErrors ? (
                <X className="w-5 h-5 text-red-500" />
              ) : hasWarnings ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ) : validationResults.every(r => r.passed) ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Password strength indicator */}
      {type === 'password' && showStrengthIndicator && value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          {(() => {
            const { score, feedback, strength } = getPasswordStrength(value);
            return (
              <>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${strengthColors[strength]} transition-all duration-300`}
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium capitalize ${
                    strength === 'weak' ? 'text-red-600' :
                    strength === 'medium' ? 'text-yellow-600' :
                    strength === 'strong' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {strength}
                  </span>
                </div>
                {feedback.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Missing: {feedback.join(', ')}
                  </div>
                )}
              </>
            );
          })()}
        </motion.div>
      )}

      {/* Validation messages */}
      <AnimatePresence>
        {touched && validationResults.some(r => !r.passed) && (
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {validationResults
              .filter(r => !r.passed)
              .map((result, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center space-x-2 text-xs ${
                    result.rule.type === 'error' ? 'text-red-600' :
                    result.rule.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {result.rule.type === 'error' ? (
                    <X className="w-3 h-3" />
                  ) : result.rule.type === 'warning' ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <Info className="w-3 h-3" />
                  )}
                  <span>{result.rule.message}</span>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
};

interface FormValidationProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isValid?: boolean;
  isSubmitting?: boolean;
  submitText?: string;
  className?: string;
}

export const FormValidation: React.FC<FormValidationProps> = ({
  children,
  onSubmit,
  isValid = true,
  isSubmitting = false,
  submitText = "Submit",
  className = ''
}) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {children}
      
      <motion.button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
          isValid && !isSubmitting
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        whileHover={isValid && !isSubmitting ? { scale: 1.02 } : {}}
        whileTap={isValid && !isSubmitting ? { scale: 0.98 } : {}}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Submitting...</span>
          </div>
        ) : (
          submitText
        )}
      </motion.button>
    </form>
  );
};
