import React from 'react';
import { PageTransition } from '../components/layout/PageTransition';

export function AIDashboard() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Dashboard</h1>
          <p className="text-gray-600">AI Dashboard functionality coming soon...</p>
        </div>
      </div>
    </PageTransition>
  );
}

export default AIDashboard;