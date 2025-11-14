import { useEffect, useState } from 'react';

export interface PWADisplayMode {
  isStandalone: boolean;
  isInstalled: boolean;
  displayMode: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  isPWA: boolean;
  canInstall: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isPortrait: boolean;
}

export function usePWADisplay(): PWADisplayMode {
  const [displayMode, setDisplayMode] = useState<PWADisplayMode>({
    isStandalone: false,
    isInstalled: false,
    displayMode: 'browser',
    isPWA: false,
    canInstall: false,
    isMobile: false,
    isTablet: false,
    isPortrait: true
  });

  useEffect(() => {
    // Check if running as standalone PWA
    const navStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         navStandalone === true;
    
    // Check if app is installed
    const isInstalled = isStandalone || ('onbeforeinstallprompt' in window);
    
    // Get display mode
    let mode: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser' = 'browser';
    if (window.matchMedia('(display-mode: fullscreen)').matches) mode = 'fullscreen';
    else if (window.matchMedia('(display-mode: minimal-ui)').matches) mode = 'minimal-ui';
    else if (window.matchMedia('(display-mode: standalone)').matches) mode = 'standalone';

    // Detect device type
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobi)/i.test(navigator.userAgent);

    // Check orientation
    const isPortrait = window.innerHeight > window.innerWidth;

    setDisplayMode({
      isStandalone,
      isInstalled,
      displayMode: mode,
      isPWA: isStandalone || isInstalled,
      canInstall: isStandalone === false && isInstalled === false,
      isMobile,
      isTablet,
      isPortrait
    });

    // Listen for display mode changes
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => {
      setDisplayMode(prev => ({
        ...prev,
        isStandalone: standaloneQuery.matches,
        displayMode: standaloneQuery.matches ? 'standalone' : prev.displayMode
      }));
    };

    standaloneQuery.addListener(handleChange);

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setDisplayMode(prev => ({
        ...prev,
        isPortrait: window.innerHeight > window.innerWidth
      }));
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      standaloneQuery.removeListener(handleChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return displayMode;
}

export default usePWADisplay;
