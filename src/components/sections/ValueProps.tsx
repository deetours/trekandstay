import React from 'react';
import { Mountain, HeartHandshake, Compass, Clock8, IndianRupee, Leaf } from 'lucide-react';

const features = [
  { icon: Compass, title: 'Expert-led trips', desc: 'Licensed guides with local expertise' },
  { icon: Mountain, title: 'Curated adventures', desc: 'Handpicked trails and experiences' },
  { icon: Leaf, title: 'Eco-conscious', desc: 'Low-impact, community-friendly travel' },
  { icon: Clock8, title: 'Flexible plans', desc: 'Easy reschedules and support' },
  { icon: IndianRupee, title: 'Best value', desc: 'Transparent pricing, no hidden fees' },
  { icon: HeartHandshake, title: 'Loved by travelers', desc: '10k+ happy customers' },
];

export const ValueProps: React.FC = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-oswald font-bold text-forest-green">Why travel with us?</h2>
          <p className="text-mountain-blue mt-2">We obsess over safety, comfort and unforgettable memories.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border bg-white/80 backdrop-blur p-6 hover:shadow-adventure transition">
              <div className="w-12 h-12 rounded-xl bg-adventure-orange/10 text-adventure-orange flex items-center justify-center mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-forest-green">{title}</h3>
              <p className="text-sm text-mountain-blue mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
