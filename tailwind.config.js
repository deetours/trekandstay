/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'forest-green': '#1B4332',
        'adventure-orange': '#FF6B35',
        'mountain-blue': '#264653',
        'stone-gray': '#F4F3EE',
        'waterfall-blue': '#2A9D8F',
        'earth-brown': '#8B4513',
        'sunset-yellow': '#FFB627',
      },
      fontFamily: {
        'oswald': ['Oswald', 'Montserrat', 'sans-serif'],
        'inter': ['Inter', 'Open Sans', 'sans-serif'],
        'fredoka': ['Fredoka One', 'Permanent Marker', 'cursive'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      boxShadow: {
        'adventure': '0 10px 25px -3px rgba(27, 67, 50, 0.3), 0 4px 6px -2px rgba(27, 67, 50, 0.1)',
        'glow': '0 0 20px rgba(255, 107, 53, 0.5)',
      },
    },
  },
  plugins: [],
};