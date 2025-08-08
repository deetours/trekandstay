import React from 'react';
import { Button } from '../ui/Button';

export const NewsletterCTA: React.FC = () => {
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-6 text-center rounded-3xl border bg-gradient-to-br from-blue-50 via-white to-purple-50 p-10">
        <h3 className="text-2xl md:text-3xl font-oswald font-bold text-forest-green">Join our adventure newsletter</h3>
        <p className="text-mountain-blue mt-2">Get exclusive deals, trip alerts and inspiring stories directly in your inbox.</p>
        <form className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <input
            type="email"
            required
            className="px-4 py-3 rounded-xl border w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-adventure-orange/40"
            placeholder="Enter your email"
          />
          <Button type="submit" className="px-6">Subscribe</Button>
        </form>
        <p className="text-xs text-gray-500 mt-3">We respect your privacy. Unsubscribe anytime.</p>
      </div>
    </section>
  );
};

export default NewsletterCTA;
