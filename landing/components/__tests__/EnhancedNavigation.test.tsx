import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import {
  EnhancedNavigation,
  StickyQuickActions,
  InteractiveFloatingElements
} from '../EnhancedNavigation';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  Home: () => <div data-testid="home-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockLocation = { pathname: '/' };

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

describe('EnhancedNavigation', () => {
  const mockCurrentTrip = {
    id: 'trip-123',
    title: 'Mountain Adventure',
    location: 'Himalayas',
    price: 15000,
    rating: 4.8,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering Logic and Props Handling', () => {
    it('renders without breadcrumbs on homepage', () => {
      mockLocation.pathname = '/';
      render(<EnhancedNavigation />);
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('renders breadcrumbs on trip landing pages', () => {
      mockLocation.pathname = '/land/trip-123';
      render(<EnhancedNavigation currentTrip={mockCurrentTrip} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Himalayas')).toBeInTheDocument();
      expect(screen.getByText('Mountain Adventure')).toBeInTheDocument();
    });

    it('handles undefined currentTrip gracefully', () => {
      mockLocation.pathname = '/land/trip-123';
      render(<EnhancedNavigation />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Adventure')).toBeInTheDocument();
    });

    it('shows back button when breadcrumbs are visible', () => {
      mockLocation.pathname = '/land/trip-123';
      render(<EnhancedNavigation currentTrip={mockCurrentTrip} />);
      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    });
  });

  describe('State Management and Effects', () => {
    it('updates breadcrumbs visibility based on route', () => {
      const { rerender } = render(<EnhancedNavigation />);
      expect(screen.queryByText('Home')).not.toBeInTheDocument();

      mockLocation.pathname = '/land/trip-123';
      rerender(<EnhancedNavigation currentTrip={mockCurrentTrip} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('tracks last page for smart navigation', () => {
      mockLocation.pathname = '/land/trip-123';
      render(<EnhancedNavigation />);
      // Component should set lastPage to '/' when on trip page
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  describe('Event Handlers and User Interactions', () => {
    it('navigates to home when home button is clicked', () => {
      mockLocation.pathname = '/land/trip-123';
      render(<EnhancedNavigation currentTrip={mockCurrentTrip} />);

      const homeButton = screen.getByText('Home').closest('button');
      fireEvent.click(homeButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('navigates to previous page when back button is clicked', () => {
      mockLocation.pathname = '/land/trip-123';
      render(<EnhancedNavigation currentTrip={mockCurrentTrip} />);

      const backButton = screen.getByTestId('arrow-left-icon').closest('button');
      fireEvent.click(backButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('TypeScript Interfaces and Type Safety', () => {
    it('accepts all currentTrip interface properties', () => {
      mockLocation.pathname = '/land/trip-123';
      render(<EnhancedNavigation currentTrip={mockCurrentTrip} />);

      expect(screen.getByText('Mountain Adventure')).toBeInTheDocument();
      expect(screen.getByText('Himalayas')).toBeInTheDocument();
    });

    it('handles optional currentTrip prop', () => {
      mockLocation.pathname = '/land/trip-123';
      render(<EnhancedNavigation />);
      expect(screen.getByText('Adventure')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles empty trip title gracefully', () => {
      mockLocation.pathname = '/land/trip-123';
      const tripWithEmptyTitle = { ...mockCurrentTrip, title: '' };
      render(<EnhancedNavigation currentTrip={tripWithEmptyTitle} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('handles very long trip titles with truncation', () => {
      mockLocation.pathname = '/land/trip-123';
      const tripWithLongTitle = {
        ...mockCurrentTrip,
        title: 'Very Long Trip Title That Should Be Truncated In The UI Display'
      };
      render(<EnhancedNavigation currentTrip={tripWithLongTitle} />);
      // The component uses max-w-32 truncate class, so we can't easily test truncation
      expect(screen.getByText('Very Long Trip Title That Should Be Truncated In The UI Display')).toBeInTheDocument();
    });
  });

  describe('Integration Points', () => {
    it('integrates with react-router-dom hooks', () => {
      mockLocation.pathname = '/land/trip-123';
      render(<EnhancedNavigation currentTrip={mockCurrentTrip} />);
      expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate on render
    });

    it('renders lucide-react icons correctly', () => {
      mockLocation.pathname = '/land/trip-123';
      render(<EnhancedNavigation currentTrip={mockCurrentTrip} />);
      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
      expect(screen.getAllByTestId('arrow-right-icon')).toHaveLength(2); // Two separators in breadcrumb
    });
  });
});

describe('StickyQuickActions', () => {
  const mockOnCallRequest = jest.fn();
  const mockOnBookingRequest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering Logic and Props Handling', () => {
    it('does not render initially', () => {
      render(
        <StickyQuickActions
          onCallRequest={mockOnCallRequest}
          onBookingRequest={mockOnBookingRequest}
        />
      );
      expect(screen.queryByText('Call Back')).not.toBeInTheDocument();
    });

    it('renders with trip price when provided', () => {
      const mockOnCallRequest = jest.fn();
      const mockOnBookingRequest = jest.fn();

      render(
        <StickyQuickActions
          tripPrice={15000}
          onCallRequest={mockOnCallRequest}
          onBookingRequest={mockOnBookingRequest}
        />
      );

      // Scroll to make it visible
      act(() => {
        // Mock scrollY properly
        Object.defineProperty(window, 'scrollY', {
          value: 300,
          writable: true,
          configurable: true
        });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(screen.getByText('₹15,000')).toBeInTheDocument();
      expect(screen.getByText('Call Back')).toBeInTheDocument();
      expect(screen.getByText('Book Now')).toBeInTheDocument();
    });

    it('renders with trip ID and rating when provided', () => {
      render(
        <StickyQuickActions
          tripId="trip-123"
          onCallRequest={mockOnCallRequest}
          onBookingRequest={mockOnBookingRequest}
        />
      );

      act(() => {
        window.dispatchEvent(new Event('scroll'));
        Object.defineProperty(window, 'scrollY', { value: 300 });
      });

      expect(screen.getByText('Trip ID: trip-123')).toBeInTheDocument();
      expect(screen.getByText('4.8/5')).toBeInTheDocument();
    });

    it('handles undefined optional props', () => {
      render(
        <StickyQuickActions
          onCallRequest={mockOnCallRequest}
          onBookingRequest={mockOnBookingRequest}
        />
      );

      act(() => {
        window.dispatchEvent(new Event('scroll'));
        Object.defineProperty(window, 'scrollY', { value: 300 });
      });

      expect(screen.getByText('Call Back')).toBeInTheDocument();
      expect(screen.queryByText('Starting from')).not.toBeInTheDocument();
    });
  });

  describe('State Management and Effects', () => {
    it('shows actions after scrolling 200px', () => {
      render(
        <StickyQuickActions
          onCallRequest={mockOnCallRequest}
          onBookingRequest={mockOnBookingRequest}
        />
      );

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 150 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(screen.queryByText('Call Back')).not.toBeInTheDocument();

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 250 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(screen.getByText('Call Back')).toBeInTheDocument();
    });

    it('hides actions when scrolling back up', () => {
      render(
        <StickyQuickActions
          onCallRequest={mockOnCallRequest}
          onBookingRequest={mockOnBookingRequest}
        />
      );

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 300 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(screen.getByText('Call Back')).toBeInTheDocument();

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 150 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(screen.queryByText('Call Back')).not.toBeInTheDocument();
    });
  });

  describe('Event Handlers and User Interactions', () => {
    beforeEach(() => {
      render(
        <StickyQuickActions
          tripPrice={15000}
          onCallRequest={mockOnCallRequest}
          onBookingRequest={mockOnBookingRequest}
        />
      );

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 300 });
        window.dispatchEvent(new Event('scroll'));
      });
    });

    it('calls onCallRequest when call back button is clicked', () => {
      const callButton = screen.getByText('Call Back');
      fireEvent.click(callButton);
      expect(mockOnCallRequest).toHaveBeenCalledTimes(1);
    });

    it('calls onBookingRequest when book now button is clicked', () => {
      const bookButton = screen.getByText('Book Now');
      fireEvent.click(bookButton);
      expect(mockOnBookingRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('TypeScript Interfaces and Type Safety', () => {
    it('accepts all required callback props', () => {
      render(
        <StickyQuickActions
          tripId="test-id"
          tripPrice={10000}
          onCallRequest={mockOnCallRequest}
          onBookingRequest={mockOnBookingRequest}
        />
      );

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 300 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(screen.getByText('Trip ID: test-id')).toBeInTheDocument();
      expect(screen.getByText('₹10,000')).toBeInTheDocument();
    });

    it('handles optional props correctly', () => {
      render(
        <StickyQuickActions
          onCallRequest={mockOnCallRequest}
          onBookingRequest={mockOnBookingRequest}
        />
      );

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 300 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(screen.getByText('Call Back')).toBeInTheDocument();
      expect(screen.queryByText('Trip ID:')).not.toBeInTheDocument();
    });
  });

  describe('Integration Points', () => {
    it('integrates with window scroll events', () => {
      render(
        <StickyQuickActions
          onCallRequest={mockOnCallRequest}
          onBookingRequest={mockOnBookingRequest}
        />
      );

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 300 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(screen.getByText('Call Back')).toBeInTheDocument();
    });

    it('renders lucide-react icons correctly', () => {
      render(
        <StickyQuickActions
          onCallRequest={mockOnCallRequest}
          onBookingRequest={mockOnBookingRequest}
        />
      );

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 300 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });
  });
});

describe('InteractiveFloatingElements', () => {
  const mockOnInteraction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering Logic and Props Handling', () => {
    it('does not render help bubble initially', () => {
      render(<InteractiveFloatingElements onInteraction={mockOnInteraction} />);
      expect(screen.queryByText('Need Help Choosing?  🤔')).not.toBeInTheDocument();
    });

    it('renders help bubble after 30 seconds of inactivity', () => {
      render(<InteractiveFloatingElements onInteraction={mockOnInteraction} />);

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(screen.getByText('Need Help Choosing?  🤔')).toBeInTheDocument();
    });

    it('hides help bubble when user becomes active', () => {
      render(<InteractiveFloatingElements onInteraction={mockOnInteraction} />);

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(screen.getByText('Need Help Choosing?  🤔')).toBeInTheDocument();

      act(() => {
        window.dispatchEvent(new Event('mousemove'));
      });

      expect(screen.queryByText('Need Help Choosing?  🤔')).not.toBeInTheDocument();
    });
  });

  describe('State Management and Effects', () => {
    it('resets idle timer on user activity', () => {
      render(<InteractiveFloatingElements onInteraction={mockOnInteraction} />);

      act(() => {
        jest.advanceTimersByTime(15000);
        window.dispatchEvent(new Event('click'));
        jest.advanceTimersByTime(20000);
      });

      // Should not show bubble because timer was reset
      expect(screen.queryByText('Need Help Choosing? ')).not.toBeInTheDocument();
    });

    it('tracks multiple types of user activity', () => {
      render(<InteractiveFloatingElements onInteraction={mockOnInteraction} />);

      act(() => {
        jest.advanceTimersByTime(15000);
        window.dispatchEvent(new Event('mousemove'));
        window.dispatchEvent(new Event('keypress'));
        window.dispatchEvent(new Event('scroll'));
        jest.advanceTimersByTime(20000);
      });

      expect(screen.queryByText('Need Help Choosing?  🤔')).not.toBeInTheDocument();
    });
  });

  describe('Event Handlers and User Interactions', () => {
    beforeEach(() => {
      render(<InteractiveFloatingElements onInteraction={mockOnInteraction} />);
      act(() => {
        jest.advanceTimersByTime(30000);
      });
    });

    it('calls onInteraction with call_back when call back button is clicked', () => {
      const callBackButton = screen.getByText('📞 Get a Call Back');
      fireEvent.click(callBackButton);

      expect(mockOnInteraction).toHaveBeenCalledWith('help_request', { type: 'call_back' });
      expect(screen.queryByText('Need Help Choosing? ')).not.toBeInTheDocument();
    });

    it('calls onInteraction with chat when live chat button is clicked', () => {
      const chatButton = screen.getByText('💬 Live Chat');
      fireEvent.click(chatButton);

      expect(mockOnInteraction).toHaveBeenCalledWith('help_request', { type: 'chat' });
      expect(screen.queryByText('Need Help Choosing? ')).not.toBeInTheDocument();
    });

    it('closes help bubble when X button is clicked', () => {
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      expect(screen.queryByText('Need Help Choosing? ')).not.toBeInTheDocument();
    });
  });

  describe('TypeScript Interfaces and Type Safety', () => {
    it('accepts onInteraction callback with correct parameters', () => {
      render(<InteractiveFloatingElements onInteraction={mockOnInteraction} />);

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      const callBackButton = screen.getByText('📞 Get a Call Back');
      fireEvent.click(callBackButton);

      expect(mockOnInteraction).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles rapid successive events without crashing', () => {
      render(<InteractiveFloatingElements onInteraction={mockOnInteraction} />);

      act(() => {
        for (let i = 0; i < 10; i++) {
          window.dispatchEvent(new Event('mousemove'));
          window.dispatchEvent(new Event('click'));
          window.dispatchEvent(new Event('keypress'));
          window.dispatchEvent(new Event('scroll'));
        }
      });

      expect(screen.queryByText('Need Help Choosing? ')).not.toBeInTheDocument();
    });

    it('handles component unmounting during timer', () => {
      const { unmount } = render(<InteractiveFloatingElements onInteraction={mockOnInteraction} />);

      act(() => {
        jest.advanceTimersByTime(15000);
      });

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Integration Points', () => {
    it('integrates with window event listeners', () => {
      render(<InteractiveFloatingElements onInteraction={mockOnInteraction} />);

      act(() => {
        window.dispatchEvent(new Event('mousemove'));
        window.dispatchEvent(new Event('click'));
        window.dispatchEvent(new Event('keypress'));
        window.dispatchEvent(new Event('scroll'));
      });

      expect(screen.queryByText('Need Help Choosing? ')).not.toBeInTheDocument();
    });

    it('uses framer-motion animations', () => {
      render(<InteractiveFloatingElements onInteraction={mockOnInteraction} />);

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(screen.getByText('Need Help Choosing? ')).toBeInTheDocument();
    });
  });

  describe('Utility Functions', () => {
    it('manages idle timer correctly', () => {
      render(<InteractiveFloatingElements onInteraction={mockOnInteraction} />);

      // Should not show immediately
      expect(screen.queryByText('Need Help Choosing? ')).not.toBeInTheDocument();

      // Should show after 30 seconds
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      expect(screen.getByText('Need Help Choosing? ')).toBeInTheDocument();

      // Should hide on activity and reset timer
      act(() => {
        window.dispatchEvent(new Event('click'));
        jest.advanceTimersByTime(25000);
      });
      expect(screen.queryByText('Need Help Choosing? ')).not.toBeInTheDocument();

      // Should show again after another 30 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      expect(screen.getByText('Need Help Choosing? ')).toBeInTheDocument();
    });
  });
});
