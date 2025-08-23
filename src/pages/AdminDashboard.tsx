import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 px-1">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <a href="/admin/trips" className="p-4 sm:p-6 bg-white rounded-xl shadow hover:shadow-lg border hover:border-emerald-400 transition-all group">
            <div className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors">Trips Management</div>
            <div className="text-sm sm:text-base text-gray-500">Add, edit, or remove trips and itineraries.</div>
          </a>
          <a href="/admin/stories" className="p-4 sm:p-6 bg-white rounded-xl shadow hover:shadow-lg border hover:border-emerald-400 transition-all group">
            <div className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors">Story Moderation</div>
            <div className="text-sm sm:text-base text-gray-500">Approve or reject user-submitted stories.</div>
          </a>
          <a href="/admin/leads" className="p-4 sm:p-6 bg-white rounded-xl shadow hover:shadow-lg border hover:border-emerald-400 transition-all group">
            <div className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors">Lead Management</div>
            <div className="text-sm sm:text-base text-gray-500">View and manage leads and inquiries.</div>
          </a>
          <a href="/admin/products" className="p-4 sm:p-6 bg-white rounded-xl shadow hover:shadow-lg border hover:border-emerald-400 transition-all group">
            <div className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors">Shop Products</div>
            <div className="text-sm sm:text-base text-gray-500">Add, edit, or remove shop products.</div>
          </a>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
