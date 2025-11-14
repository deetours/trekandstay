/** @type {import('tailwindcss').Config} */
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

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
        'outbrave': ['Outbrave', 'Inter', 'sans-serif'],
        'great-adventurer': ['Great Adventurer', 'Inter', 'sans-serif'],
        'expat-rugged': ['Expat Rugged', 'Inter', 'sans-serif'],
        'adventure': ['Adventure Typeface', 'Inter', 'sans-serif'],
        'tall-rugged': ['Tall Rugged Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 20s linear infinite',
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
      boxShadow: {
        'adventure': '0 10px 25px -3px rgba(27, 67, 50, 0.3), 0 4px 6px -2px rgba(27, 67, 50, 0.1)',
        'glow': '0 0 20px rgba(255, 107, 53, 0.5)',
      },
    },
  },
  plugins: [addVariablesForColors],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}