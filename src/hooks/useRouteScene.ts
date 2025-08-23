import { useLocation } from 'react-router-dom';
import React from 'react';
import type { SceneConfig } from '../three/components/ScenePortal';

// Derive active scene(s) from current route. Expandable.
export function useRouteScene() {
  const location = useLocation();
  const path = location.pathname;

  const activeScenes: SceneConfig[] = React.useMemo(() => {
    if (path.startsWith('/trip/')) return [{ id: 'trip-hero', type: 'trip-hero' }];
    if (path.startsWith('/payment')) return [{ id: 'payment', type: 'payment' }];
    if (path.startsWith('/dashboard')) return [{ id: 'dashboard', type: 'dashboard' }];
    if (path === '/' ) return [{ id: 'home-hero', type: 'hero' }];
    return [];
  }, [path]);

  return { activeScenes };
}
