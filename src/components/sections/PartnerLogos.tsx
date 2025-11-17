import React from 'react';
import { BackgroundBeams } from '../ui/background-beams';

// Travel brand logos (PNG variants requested instead of SVG wordmarks)
const travelLogos: { src: string; alt: string }[] = [
  { src: '/makemytrip.png', alt: 'MakeMyTrip' },
  { src: '/sotc.png', alt: 'SOTC' },
  { src: '/yatra.png', alt: 'Yatra' },
  { src: '/cleartrip.png', alt: 'Cleartrip' },
];

export const PartnerLogos: React.FC = () => {
  return (
    <div className="relative py-10 bg-transparent overflow-hidden">
      {/* Full-width Background Beams - subtle */}
      <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        <BackgroundBeams className="opacity-25" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,140,60,0.15),transparent_60%)]" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-500 dark:text-[var(--muted)] mb-4">Trusted travel ecosystem</p>
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-5">
            {travelLogos.map(l => (
              <div
                key={l.alt}
                title={l.alt}
                className="group relative flex items-center justify-center h-16 rounded-xl border border-[var(--border)] bg-white/80 dark:bg-[var(--surface)]/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-adventure-orange/10 via-transparent to-blue-500/10 transition-opacity" />
                <img
                  src={l.src}
                  alt={l.alt + ' logo'}
                  className="max-h-8 object-contain mx-auto text-transparent selection:bg-transparent [filter:contrast(1.05)] group-hover:scale-[1.04] transition-transform"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerLogos;
