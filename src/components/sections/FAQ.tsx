/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { faqs } from './faqData';

const FAQ: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-stone-gray">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-great-adventurer font-bold text-forest-green text-center">FAQs</h2>
        <div className="mt-8 divide-y rounded-2xl border bg-white/80 backdrop-blur">
          {faqs.map((item, idx) => (
            <details key={idx} className="group p-6">
              <summary className="cursor-pointer list-none font-expat-rugged font-bold text-mountain-blue flex justify-between items-center">
                {item.q}
                <span className="ml-4 text-forest-green group-open:rotate-45 transition">+</span>
              </summary>
              <p className="font-inter text-gray-600 mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
