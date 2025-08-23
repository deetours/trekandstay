import React from 'react';
import DevPanel from '../components/admin/DevPanel';
import KnowledgeBaseAdmin from '../components/admin/KnowledgeBaseAdmin';

export const DevAdminPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Developer Admin</h1>
      <DevPanel />
      <KnowledgeBaseAdmin />
    </div>
  );
};

export default DevAdminPage;
