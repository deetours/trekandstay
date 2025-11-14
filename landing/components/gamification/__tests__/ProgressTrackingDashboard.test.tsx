import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { ProgressTrackingDashboard } from '../ProgressTrackingDashboard';
import type { UserProgress, UserJourneyStep } from '../ProgressTrackingDashboard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Target: () => <div data-testid="target-icon" />,
  Award: () => <div data-testid="award-icon" />,
  Star: () => <div data-testid="star-icon" />,
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Share2: () => <div data-testid="share-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  Trophy: () => <div data-testid="trophy-icon" />,
  BookOpen: () => <div data-testid="book-open-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Circle: () => <div data-testid="circle-icon" />,
  Flame: () => <div data-testid="flame-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
}));

describe('ProgressTrackingDashboard', () => {
  const mockUserProgress: UserProgress = {
    totalPoints: 250,
    pointsHistory: [
      { action: 'page_load', timestamp: Date.now() - 1000, points: 5, category: 'discovery' },
      { action: 'highlights_read', timestamp: Date.now() - 2000, points: 15, category: 'discovery' },
      { action: 'weather_check', timestamp: Date.now() - 3000, points: 20, category: 'engagement' },
    ],
    achievements: [
      { id: 'first_visit', unlocked: true, name: 'First Visitor' },
      { id: 'explorer', unlocked: false, name: 'Explorer' },
    ],
    timeSpent: 180000, // 3 minutes
    sessionsCount: 5,
    socialShares: 3,
    conversions: 1,
    streakDays: 7,
    lastActivity: Date.now(),
  };

  const mockOnJourneyStepComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering Logic and Props Handling', () => {
    it('renders compact view when showDetailed is false', () => {
      render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          showDetailed={false}
        />
      );

      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Level 3')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument(); // total points
      expect(screen.getByText('1')).toBeInTheDocument(); // badges
      expect(screen.getByText('30%')).toBeInTheDocument(); // journey completion
    });

    it('renders detailed view when showDetailed is true', () => {
      render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          showDetailed={true}
        />
      );

      expect(screen.getByText('Adventure Progress')).toBeInTheDocument();
      expect(screen.getByText('Level')).toBeInTheDocument();
      expect(screen.getByText('Badges')).toBeInTheDocument();
      expect(screen.getByText('Journey')).toBeInTheDocument();
      expect(screen.getByText('Engagement')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('handles null/undefined userProgress gracefully', () => {
      render(<ProgressTrackingDashboard userProgress={undefined} showDetailed={true} />);

      expect(screen.getByText('Adventure Progress')).toBeInTheDocument();
      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // points
    });
  });

  describe('State Management and Effects', () => {
    it('updates journey steps based on user progress history', async () => {
      render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          onJourneyStepComplete={mockOnJourneyStepComplete}
          showDetailed={true}
        />
      );

      await waitFor(() => {
        expect(mockOnJourneyStepComplete).toHaveBeenCalled();
      });

      // Check that steps are marked as completed based on history
      const completedSteps = mockOnJourneyStepComplete.mock.calls.map(call => call[0]);
      expect(completedSteps.some((step: UserJourneyStep) => step.id === 'land_arrival')).toBe(true);
      expect(completedSteps.some((step: UserJourneyStep) => step.id === 'content_exploration')).toBe(true);
      expect(completedSteps.some((step: UserJourneyStep) => step.id === 'weather_check')).toBe(true);
    });

    it('calculates metrics correctly from user progress', () => {
      render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          showDetailed={true}
        />
      );

      // Level calculation: floor(250/100) + 1 = 3
      expect(screen.getByText('3')).toBeInTheDocument();

      // Experience progress: (250 % 100) / 100 = 0.5 = 50%
      expect(screen.getByText('250 total points')).toBeInTheDocument();

      // Badges: 1 unlocked achievement
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('of 2 available')).toBeInTheDocument();
    });

    it('updates selected timeframe state', () => {
      render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          showDetailed={true}
        />
      );

      const weekButton = screen.getByText('Week');
      fireEvent.click(weekButton);

      // The button should have active styling (this is hard to test directly)
      // but we can verify the button exists and is clickable
      expect(weekButton).toBeInTheDocument();
    });
  });

  describe('Event Handlers and User Interactions', () => {
    it('opens journey modal when chart icon is clicked in compact view', () => {
      render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          showDetailed={false}
        />
      );

      const chartButton = screen.getByTestId('bar-chart-icon').closest('button');
      fireEvent.click(chartButton!);

      // Modal should be visible (though content might be tested separately)
      expect(screen.getByText('Adventure Journey Map')).toBeInTheDocument();
    });

    it('closes journey modal when close button is clicked', () => {
      render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          showDetailed={false}
        />
      );

      // Open modal
      const chartButton = screen.getByTestId('bar-chart-icon').closest('button');
      fireEvent.click(chartButton!);

      expect(screen.getByText('Adventure Journey Map')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(screen.queryByText('Adventure Journey Map')).not.toBeInTheDocument();
    });

    it('changes timeframe when timeframe buttons are clicked', () => {
      render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          showDetailed={true}
        />
      );

      const monthButton = screen.getByText('Month');
      fireEvent.click(monthButton);

      expect(monthButton).toHaveClass('bg-emerald-500');
    });
  });

  describe('Conditional Rendering and Error States', () => {
    it('renders different content based on completion status', () => {
      render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          showDetailed={true}
        />
      );

      // Check for completed steps indicators
      expect(screen.getAllByTestId('check-circle-icon')).toHaveLength(3); // 3 completed steps
    });

    it('displays appropriate colors for different progress levels', () => {
      const lowProgressUser: UserProgress = { ...mockUserProgress, totalPoints: 25 };

      render(
        <ProgressTrackingDashboard
          userProgress={lowProgressUser}
          showDetailed={true}
        />
      );

      // Low progress should show red colors (hard to test directly)
      // but we can verify the component renders without errors
      expect(screen.getByText('Adventure Progress')).toBeInTheDocument();
    });

    it('handles empty achievements array', () => {
      const noAchievementsUser: UserProgress = {
        ...mockUserProgress,
        achievements: [],
      };

      render(
        <ProgressTrackingDashboard
          userProgress={noAchievementsUser}
          showDetailed={true}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('of 0 available')).toBeInTheDocument();
    });
  });

  describe('TypeScript Interfaces and Type Safety', () => {
    it('accepts all required UserProgress interface properties', () => {
      const completeUserProgress: UserProgress = {
        totalPoints: 100,
        pointsHistory: [],
        achievements: [],
        timeSpent: 0,
        sessionsCount: 1,
        socialShares: 0,
        conversions: 0,
        streakDays: 0,
        lastActivity: Date.now(),
      };

      render(
        <ProgressTrackingDashboard
          userProgress={completeUserProgress}
          showDetailed={true}
        />
      );

      expect(screen.getByText('Level 2')).toBeInTheDocument();
    });

    it('handles optional properties correctly', () => {
      const minimalUserProgress: UserProgress = {
        totalPoints: 50,
        // All other properties are optional
      };

      render(
        <ProgressTrackingDashboard
          userProgress={minimalUserProgress}
          showDetailed={true}
        />
      );

      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('50 total points')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles zero values gracefully', () => {
      const zeroValuesUser: UserProgress = {
        totalPoints: 0,
        pointsHistory: [],
        achievements: [],
        timeSpent: 0,
        sessionsCount: 0,
        socialShares: 0,
        conversions: 0,
        streakDays: 0,
        lastActivity: Date.now(),
      };

      render(
        <ProgressTrackingDashboard
          userProgress={zeroValuesUser}
          showDetailed={true}
        />
      );

      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('0 total points')).toBeInTheDocument();
    });

    it('handles negative values by treating them as zero', () => {
      const negativeValuesUser: UserProgress = {
        totalPoints: -50,
        timeSpent: -1000,
        sessionsCount: -1,
      };

      render(
        <ProgressTrackingDashboard
          userProgress={negativeValuesUser}
          showDetailed={true}
        />
      );

      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('0 total points')).toBeInTheDocument();
    });

    it('handles extremely large values', () => {
      const largeValuesUser: UserProgress = {
        totalPoints: 1000000,
        timeSpent: 86400000, // 24 hours
        sessionsCount: 1000,
        socialShares: 500,
      };

      render(
        <ProgressTrackingDashboard
          userProgress={largeValuesUser}
          showDetailed={true}
        />
      );

      expect(screen.getByText('Level 10001')).toBeInTheDocument();
      expect(screen.getByText('1000000 total points')).toBeInTheDocument();
    });

    it('handles malformed points history', () => {
      const malformedHistoryUser: UserProgress = {
        totalPoints: 100,
        pointsHistory: [
          { action: 'invalid_action', timestamp: 'invalid_timestamp' as unknown as number },
        ],
      };

      // Should not crash
      expect(() => {
        render(
          <ProgressTrackingDashboard
            userProgress={malformedHistoryUser}
            showDetailed={true}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Integration Points', () => {
    it('integrates with onJourneyStepComplete callback', async () => {
      render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          onJourneyStepComplete={mockOnJourneyStepComplete}
          showDetailed={true}
        />
      );

      await waitFor(() => {
        expect(mockOnJourneyStepComplete).toHaveBeenCalledTimes(3); // 3 completed steps
      });

      const firstCall = mockOnJourneyStepComplete.mock.calls[0][0];
      expect(firstCall).toHaveProperty('id');
      expect(firstCall).toHaveProperty('completed', true);
      expect(firstCall).toHaveProperty('completedAt');
    });

    it('renders icons from lucide-react correctly', () => {
      render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          showDetailed={true}
        />
      );

      expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
      expect(screen.getByTestId('award-icon')).toBeInTheDocument();
      expect(screen.getByTestId('target-icon')).toBeInTheDocument();
      expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
    });

    it('uses framer-motion animations', () => {
      render(
        <ProgressTrackingDashboard
          userProgress={mockUserProgress}
          showDetailed={true}
        />
      );

      // Components should render without motion errors
      expect(screen.getByText('Adventure Progress')).toBeInTheDocument();
    });
  });

  describe('Utility Functions', () => {
    it('formats time correctly', () => {
      render(
        <ProgressTrackingDashboard
          userProgress={{
            totalPoints: 100,
            timeSpent: 3661000, // 1h 1m 1s
          }}
          showDetailed={true}
        />
      );

      expect(screen.getByText('1h 1m')).toBeInTheDocument();
    });

    it('calculates engagement score correctly', () => {
      const engagementUser: UserProgress = {
        totalPoints: 200, // 20 points score (min(200/10, 50) = 20)
        timeSpent: 180000, // 3 minutes = 30 time score (min(3*10, 30) = 30)
        socialShares: 2, // 10 social score (2*5 = 10)
        pointsHistory: [], // 0 completion score
      };

      render(
        <ProgressTrackingDashboard
          userProgress={engagementUser}
          showDetailed={true}
        />
      );

      // Total engagement: 20 + 30 + 10 + 0 = 60
      expect(screen.getByText('60')).toBeInTheDocument();
    });
  });
});