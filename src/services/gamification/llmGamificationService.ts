/**
 * LLM-Enhanced Gamification Service
 * Integrates OpenRouter LLMs for intelligent point calculation and challenge generation
 */

import { openRouterClient } from '../llm/openRouterClient';

interface UserBehavior {
  userId: string;
  name: string;
  level: number;
  totalPoints: number;
  currentStreak: number;
  totalBookings: number;
  lastBookingAmount: number;
  reviewCount: number;
  referralCount: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lastAction: string;
  daysActive: number;
}

interface PointCalculationResult {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  reason: string;
  nextMilestone: number;
  provider: string;
}

interface ChallengeRecommendation {
  id: string;
  title: string;
  description: string;
  targetPoints: number;
  timeLimit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: number;
  matchScore: number;
  provider: string;
}

class LLMGamificationService {
  /**
   * Intelligently calculate points based on user context and behavior
   */
  async calculateSmartPoints(
    event: string,
    userBehavior: UserBehavior,
    transactionAmount?: number
  ): Promise<PointCalculationResult> {
    const systemPrompt = `You are a gamification expert designing point systems for adventure travel platforms.
Calculate points considering:
1. User tier and engagement level
2. Event type and value
3. Loyalty bonuses and streaks
4. Tier progression incentives
5. Fair but rewarding system

Respond with JSON: { base_points: number, bonus_points: number, reason: string, next_milestone: number }`;

    const prompt = `Calculate points for user event.

User Profile:
- Name: ${userBehavior.name}
- Level: ${userBehavior.level}
- Total Points: ${userBehavior.totalPoints}
- Tier: ${userBehavior.tier.toUpperCase()}
- Bookings: ${userBehavior.totalBookings}
- Streak: ${userBehavior.currentStreak} days
- Active for: ${userBehavior.daysActive} days
- Reviews: ${userBehavior.reviewCount}
- Referrals: ${userBehavior.referralCount}

Event: ${event}
${transactionAmount ? `Transaction Amount: ₹${transactionAmount}` : ''}

Calculate fair points with bonuses for:
- Loyalty (higher tier = higher multiplier)
- Streaks (consecutive days active)
- High-value actions (bookings, reviews)
- Referrals (encourage growth)

Expected base points for ${event}: 
- booking_completed: 200 base
- review_written: 50 base  
- referral_successful: 100 base
- challenge_completed: varies by difficulty
- trip_shared: 20 base

Apply multipliers based on tier and engagement.`;

    try {
      const result = await openRouterClient.executeTask(prompt, {
        type: 'point_calculation',
        priority: 'cost',
        complexity: 'simple'
      }, systemPrompt);

      const parsed = JSON.parse(result.content);

      return {
        basePoints: parsed.base_points || 100,
        bonusPoints: parsed.bonus_points || 0,
        totalPoints: (parsed.base_points || 100) + (parsed.bonus_points || 0),
        reason: parsed.reason || 'Points calculated',
        nextMilestone: parsed.next_milestone || userBehavior.totalPoints + 500,
        provider: result.provider
      };
    } catch {
      // Fallback calculation
      return this.getFallbackPointCalculation(event, userBehavior);
    }
  }

  /**
   * Fallback point calculation when LLM fails
   */
  private getFallbackPointCalculation(event: string, user: UserBehavior): PointCalculationResult {
    const basePointMap: Record<string, number> = {
      trip_view: 5,
      trip_wishlist: 10,
      trip_share: 20,
      booking_started: 50,
      booking_completed: 200,
      payment_verified: 25,
      review_written: 50,
      referral_shared: 10,
      referral_successful: 100,
      challenge_completed: 75,
      badge_earned: 30,
      level_up: 100
    };

    const basePoints = basePointMap[event] || 50;

    // Tier multipliers
    const tierMultiplier: Record<string, number> = {
      bronze: 1.0,
      silver: 1.1,
      gold: 1.2,
      platinum: 1.5
    };

    // Streak bonus (max 1.5x at 10+ day streak)
    const streakMultiplier = Math.min(1.5, 1 + user.currentStreak * 0.05);

    const totalBonus = basePoints * (tierMultiplier[user.tier] - 1 + streakMultiplier - 1);
    const totalPoints = basePoints + totalBonus;

    return {
      basePoints,
      bonusPoints: Math.round(totalBonus),
      totalPoints: Math.round(totalPoints),
      reason: `Base: ${basePoints}pts | Tier (${user.tier}): +${Math.round(basePoints * (tierMultiplier[user.tier] - 1))}pts | Streak: +${Math.round(basePoints * (streakMultiplier - 1))}pts`,
      nextMilestone: Math.ceil((user.totalPoints + totalPoints) / 100) * 100,
      provider: 'fallback'
    };
  }

  /**
   * Generate personalized challenge recommendations
   */
  async generateChallenges(
    userBehavior: UserBehavior,
    count: number = 3
  ): Promise<ChallengeRecommendation[]> {
    const systemPrompt = `You are a challenge designer for adventure travel gamification.
Design challenges that:
1. Match user skill level and experience
2. Are achievable but rewarding
3. Encourage specific behaviors (booking, reviews, referrals)
4. Have clear time-bound goals
5. Offer meaningful rewards

Respond with JSON: { challenges: [ { title, description, target_points, time_limit, difficulty, reward, match_score } ] }`;

    const prompt = `Design ${count} personalized challenges for user.

User Profile:
- Level: ${userBehavior.level}
- Tier: ${userBehavior.tier}
- Bookings: ${userBehavior.totalBookings}
- Reviews: ${userBehavior.reviewCount}
- Referrals: ${userBehavior.referralCount}
- Streak: ${userBehavior.currentStreak} days
- Preferred: ${userBehavior.lastAction || 'balanced'}

Design challenges that:
1. Encourage next action (review, referral, booking)
2. Are achievable in 7-14 days
3. Match their experience level
4. Offer 50-500 point rewards
5. Have clear descriptions

Examples:
- "Write 2 Reviews": Description about reviewing recent treks, 7 days, easy, 100 points
- "Refer 3 Friends": Description about sharing code, 14 days, medium, 300 points
- "Book 2 Treks": Encourage adventure, 30 days, hard, 500 points`;

    try {
      const result = await openRouterClient.executeTask(prompt, {
        type: 'challenge_generation',
        priority: 'cost',
        complexity: 'simple'
      }, systemPrompt);

      const parsed = JSON.parse(result.content);

      return (parsed.challenges || []).map((challenge: Record<string, string | number>, index: number) => ({
        id: `challenge_${userBehavior.userId}_${Date.now()}_${index}`,
        title: String(challenge.title),
        description: String(challenge.description),
        targetPoints: Number(challenge.target_points) || 100,
        timeLimit: String(challenge.time_limit) || '7 days',
        difficulty: (challenge.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
        reward: Number(challenge.reward) || 100,
        matchScore: Number(challenge.match_score) || 0.8,
        provider: result.provider
      }));
    } catch {
      // Fallback challenges
      return this.getFallbackChallenges(userBehavior, count);
    }
  }

  /**
   * Fallback challenges when LLM fails
   */
  private getFallbackChallenges(user: UserBehavior, count: number): ChallengeRecommendation[] {
    const challenges: ChallengeRecommendation[] = [
      {
        id: `challenge_${user.userId}_${Date.now()}_0`,
        title: 'Trek Explorer',
        description: `Book your next adventure! View 5 different treks and book at least 1 to complete this challenge.`,
        targetPoints: 200,
        timeLimit: '14 days',
        difficulty: 'easy',
        reward: 150,
        matchScore: 0.9,
        provider: 'fallback'
      },
      {
        id: `challenge_${user.userId}_${Date.now()}_1`,
        title: 'Review Master',
        description: `Share your adventure! Write 2 detailed reviews of your recent treks to earn rewards.`,
        targetPoints: 100,
        timeLimit: '7 days',
        difficulty: 'medium',
        reward: 100,
        matchScore: 0.85,
        provider: 'fallback'
      },
      {
        id: `challenge_${user.userId}_${Date.now()}_2`,
        title: 'Referral Champion',
        description: `Spread the adventure! Refer 3 friends and get rewards when they book their first trek.`,
        targetPoints: 300,
        timeLimit: '30 days',
        difficulty: 'hard',
        reward: 300,
        matchScore: 0.8,
        provider: 'fallback'
      }
    ];

    return challenges.slice(0, count);
  }

  /**
   * Generate next level recommendation
   */
  async getLevelUpRecommendation(userBehavior: UserBehavior): Promise<{ nextLevel: number; pointsNeeded: number; unlocks: string[] }> {
    const pointsPerLevel = 1000;
    const nextLevelPoints = (userBehavior.level + 1) * pointsPerLevel;
    const pointsNeeded = Math.max(0, nextLevelPoints - userBehavior.totalPoints);

    return {
      nextLevel: userBehavior.level + 1,
      pointsNeeded,
      unlocks: [
        '🏅 New badge',
        '🎁 Loyalty discount',
        '⭐ VIP support',
        `${pointsPerLevel * 0.1} bonus point multiplier`
      ]
    };
  }

  /**
   * Get badge recommendations
   */
  async recommendBadges(userBehavior: UserBehavior): Promise<Array<{ id: string; name: string; description: string; progress: number }>> {
    const badges = [
      {
        id: 'first_booking',
        name: '🎫 Explorer',
        description: 'Complete your first trek booking',
        progress: userBehavior.totalBookings > 0 ? 100 : 0
      },
      {
        id: 'five_bookings',
        name: '🏔️ Adventurer',
        description: 'Complete 5 treks',
        progress: Math.min(100, (userBehavior.totalBookings / 5) * 100)
      },
      {
        id: 'reviews_writer',
        name: '✍️ Storyteller',
        description: 'Write 10 reviews',
        progress: Math.min(100, (userBehavior.reviewCount / 10) * 100)
      },
      {
        id: 'referral_master',
        name: '🤝 Ambassador',
        description: 'Refer 5 friends',
        progress: Math.min(100, (userBehavior.referralCount / 5) * 100)
      },
      {
        id: 'streak_warrior',
        name: '🔥 Streak Master',
        description: 'Maintain 30-day activity streak',
        progress: Math.min(100, (userBehavior.currentStreak / 30) * 100)
      }
    ];

    return badges;
  }
}

export const llmGamificationService = new LLMGamificationService();
export default LLMGamificationService;
