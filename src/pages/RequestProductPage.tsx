import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function RequestProductPage() {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send the request to your backend or API
    setSubmitted(true);
    setTimeout(() => navigate('/shop'), 2000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-orange-100 px-4 py-24">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-yellow-100">
        <h1 className="text-2xl font-bold text-forest-green mb-4 text-center">Request a Product</h1>
        {submitted ? (
          <div className="text-center text-mountain-blue font-semibold py-8">
            Thank you for your request!<br />We will try to add this product soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="font-semibold text-gray-700">Product Name
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mountain-blue"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Herbal Tea"
              />
            </label>
            <label className="font-semibold text-gray-700">Details (optional)
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mountain-blue"
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Describe the product, brand, etc."
                rows={3}
              />
            </label>
            <Button type="submit" variant="adventure" size="lg" className="w-full mt-2">Submit Request</Button>
          </form>
        )}
      </div>
    </main>
  );
}
