import React from 'react';
import { ShieldCheck, Star, Award, ThumbsUp, Users } from 'lucide-react';

const items = [
  { icon: ShieldCheck, label: 'Govt. Certified Guides' },
  { icon: Star, label: '4.9/5 Average Rating' },
  { icon: Award, label: '100% Safety Record' },
  { icon: ThumbsUp, label: 'Easy Refund Policy' },
  { icon: Users, label: '10k+ Travelers Served' },
];

export const TrustStrip: React.FC<{ className?: string }>= ({ className }) => {
  return (
    <div className={"relative overflow-hidden rounded-2xl border bg-white/70 backdrop-blur " + (className ?? '')}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/60 to-purple-50/60" />
      <div className="relative max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-adventure-orange/10 text-adventure-orange flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-sm font-medium text-mountain-blue">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustStrip;
