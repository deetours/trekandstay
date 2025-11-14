import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('ErrorBoundary', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  const ThrowAnalyticsError = () => {
    throw new Error('Component analytics has not been registered');
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  describe('Rendering Logic and Props Handling', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders custom fallback when provided', () => {
      const fallback = <div>Custom fallback</div>;

      render(
        <ErrorBoundary fallback={fallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    });

    it('renders default fallback when no custom fallback provided', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Please refresh the page.')).toBeInTheDocument();
    });
  });

  describe('State Management and Effects', () => {
    it('initializes with hasError false', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('updates state when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('catches and logs general errors', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('handles analytics registration errors specially', () => {
      render(
        <ErrorBoundary>
          <ThrowAnalyticsError />
        </ErrorBoundary>
      );

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Analytics component registration error - this is safe to ignore'
      );

      expect(screen.getByText('Analytics Loading')).toBeInTheDocument();
      expect(screen.getByText('Charts will appear once initialized')).toBeInTheDocument();
    });

    it('shows error details in development mode', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).import.meta.env.DEV = true;

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error details (dev only)')).toBeInTheDocument();
      expect(screen.getByText('Message: Test error')).toBeInTheDocument();
    });

    it('shows simplified error in production mode', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).import.meta.env.DEV = false;

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Error details (dev only)')).not.toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('TypeScript Interfaces and Type Safety', () => {
    it('accepts children prop', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('accepts fallback prop', () => {
      const fallback = <div>Fallback content</div>;

      render(
        <ErrorBoundary fallback={fallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Fallback content')).toBeInTheDocument();
    });

    it('handles undefined children', () => {
      render(<ErrorBoundary />);

      // Should render nothing when no children
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles errors with undefined message', () => {
      const ThrowUndefinedMessageError = () => {
        const error = new Error();
        error.message = undefined as unknown as string;
        throw error;
      };

      render(
        <ErrorBoundary>
          <ThrowUndefinedMessageError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles errors without stack trace', () => {
      const ThrowNoStackError = () => {
        const error = new Error('No stack error');
        delete (error as unknown as { stack?: string }).stack;
        throw error;
      };

      render(
        <ErrorBoundary>
          <ThrowNoStackError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByText('Stack:')).not.toBeInTheDocument();
    });

    it('handles multiple errors gracefully', () => {
      const MultipleErrors = () => {
        throw new Error('First error');
      };

      const { rerender } = render(
        <ErrorBoundary>
          <MultipleErrors />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Try to render again with another error
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles error in error boundary itself', () => {
      // This is hard to test directly, but we can verify the component doesn't crash
      const ErrorInFallback = () => {
        throw new Error('Fallback error');
      };

      const fallbackWithError = <ErrorInFallback />;

      // Should still render something even if fallback throws
      expect(() => {
        render(
          <ErrorBoundary fallback={fallbackWithError}>
            <ThrowError />
          </ErrorBoundary>
        );
      }).not.toThrow();
    });
  });

  describe('Integration Points', () => {
    it('integrates with React error boundaries', () => {
      // Test that it properly implements React's Error Boundary API
      const errorBoundary = new ErrorBoundary({});

      // Test getDerivedStateFromError
      const newState = ErrorBoundary.getDerivedStateFromError(new Error('Test'));
      expect(newState).toEqual({
        hasError: true,
        error: expect.any(Error),
      });

      // Test componentDidCatch
      const mockError = new Error('Test error');
      const mockErrorInfo = { componentStack: 'Test stack' };

      errorBoundary.componentDidCatch(mockError, mockErrorInfo);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        mockError,
        mockErrorInfo
      );
    });

    it('handles React component errors', () => {
      // Test with a component that throws in render
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles React component errors in children', () => {
      // Test with nested components
      const NestedError = () => (
        <div>
          <ThrowError />
        </div>
      );

      render(
        <ErrorBoundary>
          <NestedError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Utility Functions', () => {
    it('getDerivedStateFromError returns correct state', () => {
      const error = new Error('Test error');
      const state = ErrorBoundary.getDerivedStateFromError(error);

      expect(state).toEqual({
        hasError: true,
        error,
      });
    });

    it('componentDidCatch logs errors appropriately', () => {
      const errorBoundary = new ErrorBoundary({});
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'Test stack' };

      errorBoundary.componentDidCatch(error, errorInfo);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        error,
        errorInfo
      );
    });

    it('componentDidCatch handles analytics errors specially', () => {
      const errorBoundary = new ErrorBoundary({});
      const analyticsError = new Error('Component analytics has not been registered');
      const errorInfo = { componentStack: 'Test stack' };

      errorBoundary.componentDidCatch(analyticsError, errorInfo);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Analytics component registration error - this is safe to ignore'
      );
    });
  });
});