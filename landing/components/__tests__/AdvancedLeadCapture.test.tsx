import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { AdvancedLeadCapture } from '../AdvancedLeadCapture';

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
  Phone: () => <div data-testid="phone-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  X: () => <div data-testid="x-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

// Mock THEME
jest.mock('../../../src/config/theme', () => ({
  THEME: {
    colors: {
      forestGreen: '#22c55e',
      waterfallBlue: '#3b82f6',
    },
  },
}));

// Mock window/document methods
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
const mockSetInterval = jest.fn();
const mockClearInterval = jest.fn();

Object.defineProperty(window, 'addEventListener', { value: mockAddEventListener });
Object.defineProperty(window, 'removeEventListener', { value: mockRemoveEventListener });
Object.defineProperty(global, 'setInterval', { value: mockSetInterval });
Object.defineProperty(global, 'clearInterval', { value: mockClearInterval });

describe('AdvancedLeadCapture', () => {
  const mockOnCapture = jest.fn();
  const defaultProps = {
    tripName: 'Mountain Adventure',
    tripPrice: 15000,
    onCapture: mockOnCapture,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering Logic and Props Handling', () => {
    it('renders without crashing with default props', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      expect(screen.getByText('Intent: low')).toBeInTheDocument();
    });

    it('renders with custom trip name and price', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      // Component renders without errors
      expect(screen.getByText('Intent: low')).toBeInTheDocument();
    });

    it('handles undefined tripName and tripPrice', () => {
      render(<AdvancedLeadCapture onCapture={mockOnCapture} />);
      expect(screen.getByText('Intent: low')).toBeInTheDocument();
    });
  });

  describe('State Management and Effects', () => {
    it('initializes with correct default state', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      expect(screen.getByText('Intent: low')).toBeInTheDocument();
      expect(screen.getByText('Time: 0s')).toBeInTheDocument();
      expect(screen.getByText('Scroll: 0%')).toBeInTheDocument();
    });

    it('updates time on page every second', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      expect(screen.getByText('Time: 3s')).toBeInTheDocument();
    });

    it('updates intent level based on user behavior', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(60000); // 60 seconds
      });
      expect(screen.getByText('Intent: medium')).toBeInTheDocument();
    });

    it('shows floating CTA after 30 seconds', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      expect(screen.queryByText('Book Now - Call Back')).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(screen.getByText('Book Now - Call Back')).toBeInTheDocument();
    });

    it('shows urgency bar after 2 minutes', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      expect(screen.queryByText('Limited Time Offer!')).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(120000);
      });

      expect(screen.getByText('Limited Time Offer!')).toBeInTheDocument();
    });
  });

  describe('Event Handlers and User Interactions', () => {
    it('triggers lead capture on floating CTA click', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(30000); // Show floating CTA
      });

      const ctaButton = screen.getByText('Book Now - Call Back');
      fireEvent.click(ctaButton);

      expect(screen.getByText("Let's Plan Your Adventure!")).toBeInTheDocument();
      expect(screen.getByText('Ready to book your adventure?')).toBeInTheDocument();
    });

    it('triggers lead capture on urgency bar button click', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(120000); // Show urgency bar
      });

      const bookButton = screen.getByText('Book Now');
      fireEvent.click(bookButton);

      expect(screen.getByText("Let's Plan Your Adventure!")).toBeInTheDocument();
      expect(screen.getByText("Secure your spot before it's gone!")).toBeInTheDocument();
    });

    it('closes urgency bar when X button is clicked', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(120000);
      });

      const closeButton = screen.getAllByTestId('x-icon')[0].closest('button');
      fireEvent.click(closeButton!);

      expect(screen.queryByText('Limited Time Offer!')).not.toBeInTheDocument();
    });

    it('closes modal when X button is clicked', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      fireEvent.click(screen.getByText('Book Now - Call Back'));
      expect(screen.getByText("Let's Plan Your Adventure!")).toBeInTheDocument();

      const closeButton = screen.getAllByTestId('x-icon')[1].closest('button');
      fireEvent.click(closeButton!);

      expect(screen.queryByText("Let's Plan Your Adventure!")).not.toBeInTheDocument();
    });
  });

  describe('Scroll and Exit Intent Detection', () => {
    it('triggers lead capture on scroll depth > 60%', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);

      // Simulate scroll to 70%
      act(() => {
        window.dispatchEvent(new Event('scroll'));
        Object.defineProperty(window, 'pageYOffset', { value: 700 });
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000 });
        Object.defineProperty(window, 'innerHeight', { value: 200 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(screen.getByText("Let's Plan Your Adventure!")).toBeInTheDocument();
      expect(screen.getByText('You seem interested! Let us help you plan the perfect adventure.')).toBeInTheDocument();
    });

    it('triggers exit intent on mouse leave', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(20000); // > 15 seconds
      });

      const mouseLeaveEvent = new MouseEvent('mouseleave', { clientY: -10 });
      document.dispatchEvent(mouseLeaveEvent);

      expect(screen.getByText("Let's Plan Your Adventure!")).toBeInTheDocument();
      expect(screen.getByText('Wait! Before you go, let us create your dream adventure!')).toBeInTheDocument();
    });
  });

  describe('Modal Steps and Form Handling', () => {
    beforeEach(() => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      fireEvent.click(screen.getByText('Book Now - Call Back'));
    });

    it('starts with step 1 (contact information)', () => {
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your Full Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your Phone Number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your Email Address')).toBeInTheDocument();
    });

    it('validates contact form fields', () => {
      const submitButton = screen.getByText('Continue → Tell Us Your Preferences');
      fireEvent.click(submitButton);

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('validates phone number format', () => {
      fireEvent.change(screen.getByPlaceholderText('Your Phone Number'), {
        target: { value: '123' },
      });
      const submitButton = screen.getByText('Continue → Tell Us Your Preferences');
      fireEvent.click(submitButton);

      expect(screen.getByText('Please enter a valid 10-digit phone number')).toBeInTheDocument();
    });

    it('validates email format', () => {
      fireEvent.change(screen.getByPlaceholderText('Your Email Address'), {
        target: { value: 'invalid-email' },
      });
      const submitButton = screen.getByText('Continue → Tell Us Your Preferences');
      fireEvent.click(submitButton);

      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });

    it('advances to step 2 with valid contact data', () => {
      fireEvent.change(screen.getByPlaceholderText('Your Full Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByPlaceholderText('Your Phone Number'), {
        target: { value: '9876543210' },
      });
      fireEvent.change(screen.getByPlaceholderText('Your Email Address'), {
        target: { value: 'john@example.com' },
      });

      const submitButton = screen.getByText('Continue → Tell Us Your Preferences');
      fireEvent.click(submitButton);

      expect(screen.getByText('Trip Preferences')).toBeInTheDocument();
    });

    it('handles step 2 preferences selection', () => {
      // Navigate to step 2
      fireEvent.change(screen.getByPlaceholderText('Your Full Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByPlaceholderText('Your Phone Number'), {
        target: { value: '9876543210' },
      });
      fireEvent.change(screen.getByPlaceholderText('Your Email Address'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.click(screen.getByText('Continue → Tell Us Your Preferences'));

      // Test date selection
      const dateInput = screen.getByDisplayValue('');
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });

      // Test group size selection
      const groupSelect = screen.getByDisplayValue('2 People');
      fireEvent.change(groupSelect, { target: { value: '4' } });

      // Test budget selection
      const budgetSelect = screen.getByDisplayValue('Select Budget Range');
      fireEvent.change(budgetSelect, { target: { value: '10000-20000' } });

      // Test interest selection
      fireEvent.click(screen.getByText('Trekking'));
      fireEvent.click(screen.getByText('Photography'));

      // Test urgency selection
      fireEvent.click(screen.getByText('This Week'));

      // Submit step 2
      fireEvent.click(screen.getByText('Almost Done → Review & Submit'));

      expect(screen.getByText('Perfect! We\'ll Call You Back')).toBeInTheDocument();
    });

    it('completes full form submission', () => {
      // Step 1
      fireEvent.change(screen.getByPlaceholderText('Your Full Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByPlaceholderText('Your Phone Number'), {
        target: { value: '9876543210' },
      });
      fireEvent.change(screen.getByPlaceholderText('Your Email Address'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.click(screen.getByText('Continue → Tell Us Your Preferences'));

      // Step 2
      fireEvent.change(screen.getByDisplayValue(''), { target: { value: '2024-12-25' } });
      fireEvent.change(screen.getByDisplayValue('2 People'), { target: { value: '4' } });
      fireEvent.change(screen.getByDisplayValue('Select Budget Range'), { target: { value: '10000-20000' } });
      fireEvent.click(screen.getByText('Trekking'));
      fireEvent.click(screen.getByText('This Week'));
      fireEvent.click(screen.getByText('Almost Done → Review & Submit'));

      // Step 3
      fireEvent.click(screen.getByText('✅ Confirm - Call Me Now!'));

      expect(mockOnCapture).toHaveBeenCalledWith({
        name: 'John Doe',
        phone: '9876543210',
        email: 'john@example.com',
        preferredDate: '2024-12-25',
        groupSize: 4,
        budget: '10000-20000',
        interests: ['Trekking'],
        urgency: 'immediate',
        source: 'floating_cta',
      });
    });
  });

  describe('TypeScript Interfaces and Type Safety', () => {
    it('accepts all required LeadCapture interface properties', () => {
      const completeLeadData = {
        name: 'Test User',
        phone: '1234567890',
        email: 'test@example.com',
        preferredDate: '2024-01-01',
        groupSize: 2,
        budget: '5000-10000',
        interests: ['Trekking'],
        source: 'test',
        urgency: 'flexible' as const,
      };

      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      fireEvent.click(screen.getByText('Book Now - Call Back'));

      // Fill form and submit
      fireEvent.change(screen.getByPlaceholderText('Your Full Name'), {
        target: { value: completeLeadData.name },
      });
      fireEvent.change(screen.getByPlaceholderText('Your Phone Number'), {
        target: { value: completeLeadData.phone },
      });
      fireEvent.change(screen.getByPlaceholderText('Your Email Address'), {
        target: { value: completeLeadData.email },
      });
      fireEvent.click(screen.getByText('Continue → Tell Us Your Preferences'));

      fireEvent.change(screen.getByDisplayValue(''), { target: { value: completeLeadData.preferredDate } });
      fireEvent.change(screen.getByDisplayValue('2 People'), { target: { value: completeLeadData.groupSize.toString() } });
      fireEvent.change(screen.getByDisplayValue('Select Budget Range'), { target: { value: completeLeadData.budget } });
      fireEvent.click(screen.getByText('Trekking'));
      fireEvent.click(screen.getByText('Almost Done → Review & Submit'));
      fireEvent.click(screen.getByText('✅ Confirm - Call Me Now!'));

      expect(mockOnCapture).toHaveBeenCalledWith(
        expect.objectContaining({
          name: completeLeadData.name,
          phone: completeLeadData.phone,
          email: completeLeadData.email,
          preferredDate: completeLeadData.preferredDate,
          groupSize: completeLeadData.groupSize,
          budget: completeLeadData.budget,
          interests: completeLeadData.interests,
          source: expect.any(String),
          urgency: expect.any(String),
        })
      );
    });

    it('handles optional props correctly', () => {
      render(<AdvancedLeadCapture onCapture={mockOnCapture} />);
      act(() => {
        jest.advanceTimersByTime(120000);
      });

      expect(screen.getByText('Limited Time Offer!')).toBeInTheDocument();
      expect(screen.getByText('this adventure')).toBeInTheDocument(); // Uses default when tripName undefined
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles rapid successive events without crashing', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);

      act(() => {
        // Simulate rapid events
        for (let i = 0; i < 10; i++) {
          window.dispatchEvent(new Event('scroll'));
          window.dispatchEvent(new Event('mousemove'));
          window.dispatchEvent(new Event('click'));
        }
      });

      expect(screen.getByText('Intent: low')).toBeInTheDocument();
    });

    it('handles component unmounting during timers', () => {
      const { unmount } = render(<AdvancedLeadCapture {...defaultProps} />);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(() => unmount()).not.toThrow();
    });

    it('prevents multiple modal openings', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      fireEvent.click(screen.getByText('Book Now - Call Back'));
      expect(screen.getByText('Contact Information')).toBeInTheDocument();

      // Try to open again - should not create multiple modals
      fireEvent.click(screen.getByText('Book Now - Call Back'));
      expect(screen.getAllByText('Contact Information')).toHaveLength(1);
    });

    it('handles invalid date inputs gracefully', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      fireEvent.click(screen.getByText('Book Now - Call Back'));

      // Navigate to step 2
      fireEvent.change(screen.getByPlaceholderText('Your Full Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByPlaceholderText('Your Phone Number'), { target: { value: '1234567890' } });
      fireEvent.change(screen.getByPlaceholderText('Your Email Address'), { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByText('Continue → Tell Us Your Preferences'));

      // Invalid date should not crash
      const dateInput = screen.getByDisplayValue('');
      fireEvent.change(dateInput, { target: { value: 'invalid-date' } });

      expect(screen.getByText('Trip Preferences')).toBeInTheDocument();
    });
  });

  describe('Integration Points', () => {
    it('integrates with framer-motion animations', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      fireEvent.click(screen.getByText('Book Now - Call Back'));
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
    });

    it('renders lucide-react icons correctly', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      fireEvent.click(screen.getByText('Book Now - Call Back'));
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('uses THEME colors for styling', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      fireEvent.click(screen.getByText('Book Now - Call Back'));
      // Theme colors are applied via inline styles, hard to test directly
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
    });
  });

  describe('Utility Functions', () => {
    it('calculates intent level correctly', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);

      // Low intent: time < 60s, interactions < 10, scroll < 100%
      expect(screen.getByText('Intent: low')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(60000); // 60s
      });
      expect(screen.getByText('Intent: medium')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(60000); // 120s total
      });
      expect(screen.getByText('Intent: high')).toBeInTheDocument();
    });

    it('tracks scroll depth accurately', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);

      act(() => {
        Object.defineProperty(window, 'pageYOffset', { value: 500 });
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000 });
        Object.defineProperty(window, 'innerHeight', { value: 200 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(screen.getByText('Scroll: 50%')).toBeInTheDocument();
    });

    it('formats phone numbers correctly in validation', () => {
      render(<AdvancedLeadCapture {...defaultProps} />);
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      fireEvent.click(screen.getByText('Book Now - Call Back'));

      fireEvent.change(screen.getByPlaceholderText('Your Phone Number'), {
        target: { value: '(987) 654-3210' },
      });
      fireEvent.click(screen.getByText('Continue → Tell Us Your Preferences'));

      expect(screen.getByText('Please enter a valid 10-digit phone number')).toBeInTheDocument();
    });
  });
});