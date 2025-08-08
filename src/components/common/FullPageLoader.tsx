import React from 'react';

export const FullPageLoader: React.FC = () => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-[#0B0F10]/80 backdrop-blur">
    <div className="flex flex-col items-center gap-4">
      <img src="/logo.png" alt="Loading..." className="h-16 w-16 animate-bounce" />
      <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-lg text-gray-700 dark:text-gray-200 font-semibold mt-2">Loading…</span>
    </div>
  </div>
);

export default FullPageLoader;
