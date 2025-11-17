import React from 'react';
import { AuroraBackground } from './aurora-background';

interface AdventureTrailDividerProps {
  id?: string;
  className?: string;
}

export const AdventureTrailDivider: React.FC<AdventureTrailDividerProps> = ({ 
  id = 'trailGradient', 
  className = '' 
}) => {
  return (
    <div className={`relative w-full hidden md:block py-0 overflow-hidden ${className}`} style={{ zIndex: 25 }}>
      {/* Aurora Background for seamless blending */}
      <AuroraBackground showRadialGradient={true}>
        <div className="relative w-full flex items-center justify-center py-4 md:py-6">
          <svg 
            viewBox="0 0 1200 80" 
            className="w-full h-auto max-h-20"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gradient Definition */}
            <defs>
              <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#16a34a" stopOpacity="0.4"/>
                <stop offset="25%" stopColor="#f97316" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.5"/>
                <stop offset="75%" stopColor="#ea580c" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#16a34a" stopOpacity="0.4"/>
              </linearGradient>
              <filter id={`glow-${id}`}>
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Main Wavy Trail */}
            <path 
              d="M 0,30 Q 150,10 300,30 T 600,30 T 900,30 T 1200,30" 
              stroke={`url(#${id})`}
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
              filter={`url(#glow-${id})`}
            />
            
            {/* Accent Dashes for Trail Effect */}
            <path 
              d="M 0,35 Q 150,15 300,35 T 600,35 T 900,35 T 1200,35" 
              stroke="#f97316" 
              strokeWidth="1.5" 
              fill="none" 
              strokeLinecap="round"
              opacity="0.4"
            />
            
            {/* Decorative Adventure Markers (Small Circles) */}
            <circle cx="150" cy="30" r="4" fill="#16a34a" opacity="0.7"/>
            <circle cx="300" cy="30" r="5" fill="#f97316" opacity="0.8"/>
            <circle cx="450" cy="30" r="3.5" fill="#ea580c" opacity="0.6"/>
            <circle cx="600" cy="30" r="5" fill="#f97316" opacity="0.8"/>
            <circle cx="750" cy="30" r="3.5" fill="#16a34a" opacity="0.6"/>
            <circle cx="900" cy="30" r="5" fill="#f97316" opacity="0.8"/>
            <circle cx="1050" cy="30" r="4" fill="#ea580c" opacity="0.7"/>
          </svg>
        </div>
      </AuroraBackground>
    </div>
  );
};

export default AdventureTrailDivider;
