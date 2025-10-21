interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
}

// Preset validation rules
export const ValidationRules = {
  required: (fieldName: string): ValidationRule => ({
    test: (value: string) => value.trim().length > 0,
    message: `${fieldName} is required`,
    type: 'error'
  }),

  email: (): ValidationRule => ({
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address',
    type: 'error'
  }),

  minLength: (min: number): ValidationRule => ({
    test: (value: string) => value.length >= min,
    message: `Must be at least ${min} characters long`,
    type: 'error'
  }),

  phone: (): ValidationRule => ({
    test: (value: string) => /^[+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-()]/g, '')),
    message: 'Please enter a valid phone number',
    type: 'error'
  }),

  noSpaces: (): ValidationRule => ({
    test: (value: string) => !/\s/.test(value),
    message: 'Should not contain spaces',
    type: 'warning'
  }),

  strongPassword: (): ValidationRule => ({
    test: (value: string) => {
      return value.length >= 8 && 
             /[A-Z]/.test(value) && 
             /[a-z]/.test(value) && 
             /\d/.test(value) && 
             /[^A-Za-z0-9]/.test(value);
    },
    message: 'Password should be strong (8+ chars, upper, lower, number, special)',
    type: 'warning'
  })
};

export type { ValidationRule };
