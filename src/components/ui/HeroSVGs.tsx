import React from 'react';

const HeroSVGs: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div aria-hidden className={className}>
      {/* decorative defs used by inline svgs */}
      <svg width="0" height="0" className="sr-only" aria-hidden>
        <title>Trek & Stay hero gradients</title>
        <defs>
          <linearGradient id="g1" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id="g2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      <div className="pointer-events-none">
        {/* large soft glow */}
        <div className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/15 blur-3xl transform rotate-12" />
        {/* cooler accent shape */}
        <div className="absolute right-6 top-28 w-48 h-48 rounded-2xl bg-gradient-to-tr from-purple-400/20 to-pink-300/12 blur-2xl transform -rotate-6" />

        {/* gentle waveform using gradient */}
        <svg className="absolute left-1/2 -translate-x-1/2 bottom-6 opacity-40" width="520" height="140" viewBox="0 0 520 140" fill="none" xmlns="http://www.w3.org/2000/svg" role="presentation">
          <path d="M0 90 C140 20, 380 160, 520 50" stroke="url(#g1)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.65" />
          <ellipse cx="260" cy="70" rx="240" ry="40" fill="url(#g2)" opacity="0.12" />
        </svg>
      </div>
    </div>
  );
};

export default HeroSVGs;
