import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdventureStore } from '../../store/adventureStore';

interface ProtectedRouteProps {
  children: React.ReactElement;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAdventureStore();
  const location = useLocation();
  
  console.log('🛡️ ProtectedRoute check:', {
    path: location.pathname,
    isAuthenticated,
    user: user?.email || 'No user',
    adminOnly,
    isAdmin: user && typeof user === 'object' && 'isAdmin' in user ? user.isAdmin : 'N/A'
  });
  
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to /signin');
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }
  
  if (adminOnly && !(typeof user === 'object' && user !== null && 'isAdmin' in user && (user as { isAdmin?: boolean }).isAdmin)) {
    console.log('❌ Admin required but user is not admin, redirecting to /');
    return <Navigate to="/" replace />;
  }
  
  console.log('✅ Protected route access granted');
  return children;
};

export default ProtectedRoute;
