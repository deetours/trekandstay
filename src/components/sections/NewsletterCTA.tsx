import React, { useState } from 'react';
import { Button } from '../ui/Button';

export const NewsletterCTA: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle'|'ok'|'error'>('idle');
  const [message, setMessage] = useState('');

  const validatePhone = (value: string) => {
    // Basic allow +, digits, spaces. Require 10-15 digits total.
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  };

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setStatus('error');
      setMessage('Enter a valid WhatsApp number (10-15 digits).');
      return;
    }
    // Placeholder success state (wire to backend / API / WhatsApp opt-in service later)
    setStatus('ok');
    setMessage('Thanks! You\'ll start receiving WhatsApp updates soon.');
  };

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-6 text-center rounded-3xl border bg-gradient-to-br from-blue-50 via-white to-purple-50 p-10 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 dark:border-slate-700">
        <h3 className="text-2xl md:text-3xl font-great-adventurer font-bold text-forest-green dark:text-white">Join our adventure updates</h3>
        <p className="font-inter text-mountain-blue dark:text-slate-300 mt-2">Get exclusive deals, trip alerts and inspiring stories directly on WhatsApp.</p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <label className="sr-only" htmlFor="whatsapp-number">WhatsApp Number</label>
          <input
            id="whatsapp-number"
            type="tel"
            inputMode="tel"
            required
            value={phone}
            onChange={(e) => { setPhone(e.target.value); if(status!=='idle') { setStatus('idle'); setMessage(''); } }}
            className={`px-4 py-3 rounded-xl border w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-adventure-orange/40 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white ${status==='error' ? 'border-red-400 focus:ring-red-300' : ''}`}
            placeholder="Enter your WhatsApp number (e.g. +91 99029 37730)"
            aria-invalid={status==='error'}
            aria-describedby={message ? 'whatsapp-helper' : undefined}
            pattern="[+0-9 ()-]{7,}"
          />
          <Button type="submit" className="px-6 font-tall-rugged">Join</Button>
        </form>
        <p id="whatsapp-helper" className={`text-xs mt-3 ${status==='error' ? 'text-red-500' : 'text-gray-500 dark:text-slate-400'}`}>
          {message || 'We respect your privacy. Opt-out anytime.'}
        </p>
      </div>
    </section>
  );
};

export default NewsletterCTA;
