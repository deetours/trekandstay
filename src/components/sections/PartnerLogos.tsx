import React from 'react';

const logos = [
  'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/0/08/Google_Logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
];

export const PartnerLogos: React.FC = () => {
  return (
    <div className="py-8 bg-white/60">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 items-center gap-6 opacity-80">
        {logos.map((src, i) => (
          <img key={i} src={src} alt="Partner logo" className="h-8 object-contain mx-auto" loading="lazy" />
        ))}
      </div>
    </div>
  );
};

export default PartnerLogos;
