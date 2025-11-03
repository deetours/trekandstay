/**
 * InstallBanner.tsx
 * Smart install banner with tracking
 * - Only shows to customers who haven't installed yet
 * - Stops showing after 2 dismissals (for 24 hours)
 * - Automatically hides when app is installed
 * - Tracks all interactions for analytics
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useInstallTracker } from '../../hooks/useInstallTracker';
import './InstallBanner.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const {
    status,
    shouldShow,
    recordInstallAttempt,
    recordDismissal,
    recordInstallSuccess,
    logAnalyticsEvent
  } = useInstallTracker();

  useEffect(() => {
    if (!status) return;

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show banner after 3 seconds if we should show it
      if (shouldShow) {
        console.log('📲 Install prompt captured, showing banner in 3 seconds...');
        setTimeout(() => {
          setShowBanner(true);
          logAnalyticsEvent('install_banner_shown', {
            dismissCount: status.dismissCount,
            attemptCount: status.installAttemptCount
          });
        }, 3000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ App successfully installed!');
      recordInstallSuccess();
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [status, shouldShow, recordInstallAttempt, recordDismissal, recordInstallSuccess, logAnalyticsEvent]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.error('❌ Install prompt not available');
      return;
    }

    try {
      setIsInstalling(true);
      recordInstallAttempt();

      // Show the native install prompt
      deferredPrompt.prompt();

      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ User accepted installation');
        logAnalyticsEvent('install_accepted', {
          timestamp: new Date().toISOString()
        });
        recordInstallSuccess();
        setShowBanner(false);
      } else {
        console.log('❌ User declined installation');
        logAnalyticsEvent('install_declined', {
          timestamp: new Date().toISOString()
        });
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
      logAnalyticsEvent('install_error', {
        error: String(error)
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    console.log('❌ Banner dismissed');
    recordDismissal();
    setShowBanner(false);

    logAnalyticsEvent('install_banner_dismissed', {
      dismissCount: status?.dismissCount || 0
    });

    // Show message about how many more times banner will show
    if (status && status.dismissCount < 2) {
      const remaining = 2 - status.dismissCount;
      console.log(
        `💡 Banner will show ${remaining} more time(s) before hiding for 24 hours`
      );
    }
  };

  // Don't render if:
  // 1. Status not loaded yet
  // 2. Shouldn't show banner
  // 3. Banner not visible state
  // 4. App is already installed
  if (!status || !shouldShow || !showBanner || status.isInstalled || status.isStandalone) {
    return null;
  }

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="install-banner-backdrop"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Banner */}
      <div className="install-banner" role="alert">
        <div className="install-banner-content">
          {/* Icon */}
          <div className="install-banner-icon">📲</div>

          {/* Text Content */}
          <div className="install-banner-text">
            <h3 className="install-banner-title">
              Install Trek & Stay
            </h3>
            <p className="install-banner-description">
              Get quick access, offline support & push notifications!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="install-banner-actions">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className={`install-banner-button primary ${isInstalling ? 'loading' : ''}`}
              aria-label="Install Trek and Stay app"
            >
              {isInstalling ? (
                <>
                  <span className="spinner" />
                  Installing...
                </>
              ) : (
                'Install'
              )}
            </button>

            <button
              onClick={handleDismiss}
              disabled={isInstalling}
              className="install-banner-button dismiss"
              title="Dismiss installation prompt"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Helpful Tip */}
        <div className="install-banner-tip">
          💡 Or click the install icon in your browser address bar
        </div>

        {/* Dismissal Counter */}
        {status.dismissCount > 0 && (
          <div className="install-banner-counter">
            This prompt will appear {2 - status.dismissCount} more time(s)
          </div>
        )}
      </div>
    </>
  );
}
