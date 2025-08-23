/**
 * Safe Analytics Component Wrapper
 * 
 * This wrapper catches the "Component analytics has not been registered yet" error
 * and provides a fallback UI instead of crashing the application.
 */

import React, { ComponentType, ReactNode } from 'react';

interface SafeAnalyticsProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

interface ErrorState {
  hasError: boolean;
  isAnalyticsError: boolean;
}

class SafeAnalytics extends React.Component<SafeAnalyticsProps, ErrorState> {
  constructor(props: SafeAnalyticsProps) {
    super(props);
    this.state = { hasError: false, isAnalyticsError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    // Check if it's the specific analytics registration error
    const isAnalyticsError = !!(
      error.message?.includes('Component analytics has not been registered') ||
      error.message?.includes('analytics') ||
      error.stack?.includes('analytics')
    );
    
    return {
      hasError: true,
      isAnalyticsError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.state.isAnalyticsError) {
      console.warn('Analytics component error caught (safe to ignore):', error.message);
    } else {
      console.error('SafeAnalytics caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.state.isAnalyticsError) {
      // Show analytics loading placeholder for analytics errors
      return this.props.fallback || (
        <div className={`bg-emerald-50 rounded-xl p-6 border border-emerald-200 ${this.props.className || ''}`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
            <div className="text-emerald-800 font-semibold mb-1">Analytics Loading</div>
            <div className="text-emerald-600 text-sm">Initializing analytics components...</div>
          </div>
        </div>
      );
    }

    if (this.state.hasError) {
      // Show generic error for non-analytics errors
      return this.props.fallback || (
        <div className={`bg-red-50 rounded-xl p-6 border border-red-200 ${this.props.className || ''}`}>
          <div className="text-center">
            <div className="text-red-800 font-semibold mb-1">Component Error</div>
            <div className="text-red-600 text-sm">Please refresh the page</div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap any component with safe analytics handling
 */
// eslint-disable-next-line react-refresh/only-export-components
export function withSafeAnalytics<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: ReactNode
) {
  return function SafeAnalyticsWrapper(props: P) {
    return (
      <SafeAnalytics fallback={fallback}>
        <WrappedComponent {...props} />
      </SafeAnalytics>
    );
  };
}

export default SafeAnalytics;
