// Theme Constants for Trek & Stay
// Centralized color and styling definitions

export const THEME = {
  // Primary Colors
  colors: {
    // Brand Green
    forestGreen: '#1B4332',
    forestGreenLight: '#2D6A4F',
    forestGreenDark: '#0F2818',
    
    // Accent Blue
    waterfallBlue: '#2A9D8F',
    waterfallBlueDark: '#1D7A73',
    waterfallBlueLight: '#47B5A8',
    
    // Accent Orange
    adventureOrange: '#FF6B35',
    adventureOrangeDark: '#E55A28',
    adventureOrangeLight: '#FF8A5B',
    
    // Neutral
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    
    // Semantic
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  
  // Gradient Combinations
  gradients: {
    // Primary Gradient (Green to Blue)
    primary: 'from-forest-green to-waterfall-blue',
    primaryDark: 'from-[#0F2818] to-[#1D7A73]',
    primaryLight: 'from-[#2D6A4F] to-[#47B5A8]',
    
    // Adventure Gradient (Blue to Orange)
    adventure: 'from-waterfall-blue to-adventure-orange',
    adventureDark: 'from-[#1D7A73] to-[#E55A28]',
    
    // Gold Gradient (for achievements)
    achievement: 'from-amber-400 to-yellow-500',
    
    // Success Gradient
    success: 'from-green-400 to-emerald-600',
  },
  
  // Shadow Definitions
  shadows: {
    sm: '0 1px 2px 0 rgba(27, 67, 50, 0.05)',
    md: '0 4px 6px -1px rgba(27, 67, 50, 0.1)',
    lg: '0 10px 15px -3px rgba(27, 67, 50, 0.15)',
    xl: '0 20px 25px -5px rgba(27, 67, 50, 0.2)',
    primary: '0 10px 30px -5px rgba(27, 67, 50, 0.3)',
  },
  
  // Border Radius
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  
  // Spacing (in pixels)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
  },
  
  // Typography
  typography: {
    h1: 'text-4xl font-bold text-gray-900',
    h2: 'text-3xl font-bold text-gray-900',
    h3: 'text-2xl font-bold text-gray-800',
    h4: 'text-xl font-bold text-gray-800',
    h5: 'text-lg font-semibold text-gray-800',
    body: 'text-base text-gray-700',
    small: 'text-sm text-gray-600',
  },
  
  // Component Classes (Tailwind)
  components: {
    // Buttons
    primaryButton: 'bg-gradient-to-r from-forest-green to-waterfall-blue text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300',
    secondaryButton: 'bg-white border-2 border-forest-green text-forest-green px-6 py-3 rounded-lg font-semibold hover:bg-forest-green hover:text-white transition-all duration-300',
    dangerButton: 'bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300',
    
    // Cards
    card: 'bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300',
    cardHover: 'bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer',
    
    // Input
    input: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent',
    
    // Badge
    badge: 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold',
    badgePrimary: 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-forest-green text-white',
    badgeSuccess: 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800',
    badgeWarning: 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800',
    
    // Container
    container: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
    
    // Section
    section: 'py-12 sm:py-16 lg:py-20',
    sectionDark: 'py-12 sm:py-16 lg:py-20 bg-gray-50',
  },
} as const;

// Color mappings for dynamic usage
export const colorMap = {
  forest_green: THEME.colors.forestGreen,
  waterfall_blue: THEME.colors.waterfallBlue,
  adventure_orange: THEME.colors.adventureOrange,
  success: THEME.colors.success,
  warning: THEME.colors.warning,
  danger: THEME.colors.danger,
} as const;

// Export type for usage
export type ThemeType = typeof THEME;
export type ColorMapType = typeof colorMap;
