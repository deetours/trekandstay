import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/fonts.css';
import './index.css';
import { ToastProvider } from './components/ui/toast';
import { AuthProvider } from './context/AuthContext';

// ============================================
// THEME INITIALIZATION - LIGHT MODE ONLY
// ============================================

const initTheme = () => {
  if (typeof window === 'undefined') return;

  // Force light mode only
  const html = document.documentElement;
  html.classList.remove('dark');
  localStorage.setItem('theme-preference', 'light');

  // Set body background and text color to light
  document.body.style.backgroundColor = '#ffffff';
  document.body.style.color = '#0B0F10';
};

// Initialize theme before React renders
initTheme();

// ============================================
// PWA SERVICE WORKER REGISTRATION
// ============================================

let refreshing = false;

const handleServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
  if (refreshing) return;
  
  refreshing = true;
  
  // Check for new service worker
  if (registration.waiting) {
    console.log('🔄 New version available!');
    
    // Show update notification
    const updateAvailable = confirm(
      '🎉 New version available!\n\nRefresh to get the latest features?'
    );
    
    if (updateAvailable) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
};

// Register service worker with auto-update (only in production/after build)
const registerServiceWorker = async () => {
  try {
    // This module is only available after build with vite-plugin-pwa
    // @ts-expect-error - virtual module only available after build
    const { registerSW } = await import('virtual:pwa-register');
    
    registerSW({
      onNeedRefresh() {
        console.log('📲 Service Worker needs refresh');
        handleServiceWorkerUpdate(this.registration as ServiceWorkerRegistration);
      },
      onOfflineReady() {
        console.log('✅ App is ready to work offline!');
      }
    });
  } catch {
    console.log('ℹ️ PWA service worker not available (normal in development)');
  }
};

registerServiceWorker();

// ============================================
// OFFLINE/ONLINE DETECTION
// ============================================

const updateOnlineStatus = () => {
  const isOnline = navigator.onLine;
  const indicator = document.body;
  
  if (isOnline) {
    indicator.classList.remove('offline');
    console.log('✅ App is online');
  } else {
    indicator.classList.add('offline');
    console.log('❌ App is offline');
  }
};

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Check initial status
updateOnlineStatus();

// ============================================
// LISTEN FOR CONTROLLER CHANGE
// ============================================

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service Worker controller changed');
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);

console.log('✅ Main.tsx loaded successfully');
console.log('📱 PWA Service Worker registered');

