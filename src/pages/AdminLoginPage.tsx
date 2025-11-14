import React from 'react';
import { PageTransition } from '../components/layout/PageTransition';
import SignInPage from './SignInPage';

export function AdminLoginPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Sign in with your admin credentials</p>
          </div>
          <SignInPage />
        </div>
      </div>
    </PageTransition>
  );
}

export default AdminLoginPage;