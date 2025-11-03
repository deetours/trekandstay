/**
 * useInstallTracker.ts
 * Tracks PWA installation status and manages banner visibility
 * 
 * Features:
 * - Detects if app is already installed
 * - Prevents repeated banner shows for installed users
 * - Tracks installation attempts and dismissals
 * - Manages localStorage for persistent tracking
 * - Sends analytics events
 */

import { useEffect, useState } from 'react'

interface InstallStatus {
  isInstalled: boolean
  isDismissed: boolean
  dismissCount: number
  lastDismissedAt: number | null
  installAttemptCount: number
  lastAttemptAt: number | null
  firstVisitAt: number
  isStandalone: boolean
}

const STORAGE_KEY = 'pwa_install_status'
const BANNER_STORAGE_KEY = 'pwa_banner_state'
const MAX_DISMISSALS = 2
const HOURS_BEFORE_RESHOW = 24

/**
 * Check if app is already installed
 */
const checkIfInstalled = (): boolean => {
  // Check if running in standalone mode (iOS)
  if (window.navigator.standalone === true) {
    console.log('✅ Detected: iOS Standalone Mode')
    return true
  }

  // Check if running in standalone mode (Android/PWA)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('✅ Detected: PWA Standalone Mode')
    return true
  }

  // Check if running in fullscreen mode (some PWAs)
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    console.log('✅ Detected: Fullscreen Mode')
    return true
  }

  // Check if running in minimal-ui mode
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    console.log('✅ Detected: Minimal UI Mode')
    return true
  }

  return false
}

/**
 * Get installation status from localStorage
 */
const getInstallStatus = (): InstallStatus => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...parsed,
        isStandalone: checkIfInstalled()
      }
    }
  } catch (error) {
    console.error('Error reading install status:', error)
  }

  return {
    isInstalled: checkIfInstalled(),
    isDismissed: false,
    dismissCount: 0,
    lastDismissedAt: null,
    installAttemptCount: 0,
    lastAttemptAt: null,
    firstVisitAt: Date.now(),
    isStandalone: checkIfInstalled()
  }
}

/**
 * Save installation status to localStorage
 */
const saveInstallStatus = (status: InstallStatus): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status))
    console.log('💾 Installation status saved:', status)
  } catch (error) {
    console.error('Error saving install status:', error)
  }
}

/**
 * Should show banner logic
 */
const shouldShowBanner = (status: InstallStatus): boolean => {
  // Never show if already installed
  if (status.isInstalled || status.isStandalone) {
    console.log('🔇 Banner hidden: App already installed')
    return false
  }

  // Never show if dismissed too many times
  if (status.dismissCount >= MAX_DISMISSALS) {
    console.log('🔇 Banner hidden: User dismissed too many times')
    return false
  }

  // If recently dismissed, don't show for 24 hours
  if (status.lastDismissedAt) {
    const hoursSinceDismissal = (Date.now() - status.lastDismissedAt) / (1000 * 60 * 60)
    if (hoursSinceDismissal < HOURS_BEFORE_RESHOW) {
      console.log(`🔇 Banner hidden: Will show again in ${Math.round(HOURS_BEFORE_RESHOW - hoursSinceDismissal)} hours`)
      return false
    }
  }

  return true
}

/**
 * Record installation attempt
 */
const recordInstallAttempt = (): void => {
  const status = getInstallStatus()
  status.installAttemptCount += 1
  status.lastAttemptAt = Date.now()
  saveInstallStatus(status)

  // Send analytics
  logAnalyticsEvent('install_attempt', {
    attempt_number: status.installAttemptCount,
    timestamp: new Date().toISOString()
  })
}

/**
 * Record banner dismissal
 */
const recordDismissal = (): void => {
  const status = getInstallStatus()
  status.dismissCount += 1
  status.lastDismissedAt = Date.now()
  status.isDismissed = true
  saveInstallStatus(status)

  // Send analytics
  logAnalyticsEvent('install_banner_dismissed', {
    dismissal_number: status.dismissCount,
    timestamp: new Date().toISOString()
  })
}

/**
 * Record successful installation
 */
const recordInstallSuccess = (): void => {
  const status = getInstallStatus()
  status.isInstalled = true
  status.isStandalone = true
  saveInstallStatus(status)

  // Send analytics
  logAnalyticsEvent('app_installed', {
    timestamp: new Date().toISOString(),
    installation_attempts: status.installAttemptCount
  })

  console.log('✅ Installation success recorded!')
}

/**
 * Log analytics event (integrate with your analytics service)
 */
const logAnalyticsEvent = (eventName: string, data: Record<string, any>): void => {
  try {
    // Firebase Analytics
    if (window.gtag) {
      window.gtag('event', eventName, data)
    }

    // Console log for debugging
    console.log(`📊 Analytics: ${eventName}`, data)

    // Send to your backend (optional)
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        data,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {}) // Silently fail if analytics endpoint not available
  } catch (error) {
    console.error('Analytics error:', error)
  }
}

/**
 * Main hook for tracking installation status
 */
export const useInstallTracker = () => {
  const [status, setStatus] = useState<InstallStatus | null>(null)
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Get initial status
    const initialStatus = getInstallStatus()
    setStatus(initialStatus)
    setShouldShow(shouldShowBanner(initialStatus))

    console.log('📱 Installation Tracker Initialized:', {
      isInstalled: initialStatus.isInstalled,
      isStandalone: initialStatus.isStandalone,
      dismissCount: initialStatus.dismissCount,
      shouldShowBanner: shouldShowBanner(initialStatus)
    })

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('🎉 App installed event detected!')
      recordInstallSuccess()
      setStatus(prev => prev ? { ...prev, isInstalled: true } : null)
      setShouldShow(false)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // Listen for display mode changes
    const displayModeQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = () => {
      const isNowStandalone = checkIfInstalled()
      console.log('📱 Display mode changed. Standalone:', isNowStandalone)
      setStatus(prev => prev ? { ...prev, isStandalone: isNowStandalone } : null)
    }

    displayModeQuery.addEventListener('change', handleDisplayModeChange)

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
      displayModeQuery.removeEventListener('change', handleDisplayModeChange)
    }
  }, [])

  return {
    status,
    shouldShow,
    recordInstallAttempt,
    recordDismissal,
    recordInstallSuccess,
    logAnalyticsEvent
  }
}

/**
 * Export utility functions for use elsewhere
 */
export {
  getInstallStatus,
  checkIfInstalled,
  recordInstallAttempt,
  recordDismissal,
  recordInstallSuccess,
  logAnalyticsEvent,
  shouldShowBanner
}
