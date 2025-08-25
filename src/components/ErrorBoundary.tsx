import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if this is the analytics registration error
    if (error.message?.includes('Component analytics has not been registered')) {
      console.warn('Analytics component registration error - this is safe to ignore');
    }
  }

  public render() {
    if (this.state.hasError) {
      // Check if it's the analytics error specifically
      if (this.state.error?.message?.includes('Component analytics has not been registered')) {
        // For analytics errors, just show a placeholder
        return this.props.fallback || (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-center text-gray-500">
              <div className="text-sm font-medium">Analytics Loading</div>
              <div className="text-xs text-gray-400 mt-1">Charts will appear once initialized</div>
            </div>
          </div>
        );
      }

      // For other errors, show a more helpful fallback in development
      const isDev = !!import.meta.env.DEV;
      if (isDev) {
        return this.props.fallback || (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="font-semibold">Something went wrong</div>
            <div className="text-sm mt-1">Please refresh the page.</div>
            {this.state.error && (
              <details className="mt-3 whitespace-pre-wrap break-words text-xs text-red-800" open>
                <summary className="cursor-pointer text-red-600">Error details (dev only)</summary>
                <div className="mt-2">
                  <div><span className="font-medium">Message:</span> {this.state.error.message}</div>
                  { (this.state.error as unknown as { stack?: string }).stack && (
                    <pre className="mt-2 overflow-auto max-h-48">{(this.state.error as unknown as { stack?: string }).stack}</pre>
                  )}
                </div>
              </details>
            )}
          </div>
        );
      }

      // Production: simple fallback
      return this.props.fallback || (
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-center text-red-600">
            <div className="text-sm font-medium">Something went wrong</div>
            <div className="text-xs text-red-400 mt-1">Please refresh the page</div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
