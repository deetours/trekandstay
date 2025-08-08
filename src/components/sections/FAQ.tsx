import React from 'react';

const faqs = [
  { q: 'How safe are your trips?', a: 'Safety is our top priority. All trips are led by certified guides, with first-aid kits and protocols in place.' },
  { q: 'What is your refund policy?', a: 'Full refund up to 7 days before departure. Partial refunds thereafter as per policy.' },
  { q: 'Do you arrange transport?', a: 'Yes, most trips include transport. Details are mentioned on each trip page.' },
  { q: 'Are beginners allowed?', a: 'Absolutely! We have beginner-friendly itineraries. Look for the “Easy” difficulty.' },
];

export const FAQ: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-stone-gray">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-oswald font-bold text-forest-green text-center">FAQs</h2>
        <div className="mt-8 divide-y rounded-2xl border bg-white/80 backdrop-blur">
          {faqs.map((item, idx) => (
            <details key={idx} className="group p-6">
              <summary className="cursor-pointer list-none font-semibold text-mountain-blue flex justify-between items-center">
                {item.q}
                <span className="ml-4 text-forest-green group-open:rotate-45 transition">+</span>
              </summary>
              <p className="text-gray-600 mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
