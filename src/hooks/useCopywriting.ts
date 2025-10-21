import { useState, useCallback } from 'react';
import { openRouterClient } from '../services/llm/openRouterClient';

/**
 * useCopywriting Hook - Generate intelligent email copy using LLMs
 * Handles emails, hooks, CTAs, and subject lines based on context
 */

interface CopywritingRequest {
  type: 'subject' | 'body' | 'cta' | 'hook' | 'social_post' | 'sms';
  emailType: string;
  userContext: {
    name: string;
    level?: number;
    points?: number;
    bookingCount?: number;
    lastAction?: string;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
  tone?: 'professional' | 'friendly' | 'urgent' | 'celebratory' | 'casual';
  includeEmoji?: boolean;
  maxLength?: number;
}

interface GeneratedCopy {
  content: string;
  variations: string[];
  estimatedEngagement: number;
  provider: string;
  timestamp: Date;
}

export const useCopywriting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyHistory, setCopyHistory] = useState<Array<{ request: CopywritingRequest; copy: GeneratedCopy }>>([]);

  /**
   * Generate engaging copy for different email elements
   */
  const generateCopy = useCallback(
    async (request: CopywritingRequest): Promise<GeneratedCopy | null> => {
      setLoading(true);
      setError(null);

      try {
        let systemPrompt = '';
        let prompt = '';

        switch (request.type) {
          case 'subject':
            systemPrompt = `You are a master email subject line writer for adventure travel companies.
Create subject lines that:
- Have 40-60 character length (optimal for mobile)
- Trigger curiosity or urgency
- Include power words when appropriate
- Match the user tier/engagement level
${request.includeEmoji ? '- Include relevant emoji' : ''}

Respond with JSON: { main: "subject", variations: ["alt1", "alt2", "alt3"], engagement_score: 0-100 }`;

            prompt = `Generate subject line for ${request.emailType} email.
User: ${request.userContext.name} (Level ${request.userContext.level}, ${request.userContext.bookingCount || 0} bookings)
Tone: ${request.tone || 'friendly'}
Goal: High open rate
Tier: ${request.userContext.tier || 'bronze'}`;
            break;

          case 'body':
            systemPrompt = `You are a conversion copywriter specializing in adventure travel.
Write email body that:
- Opens with benefit, not features
- Uses social proof where relevant
- Includes a single strong CTA
- Matches user psychological profile
- Adapts to user tier and engagement level
- 150-300 words

Respond with JSON: { main: "body text", variations: ["variant1", "variant2"], engagement_score: 0-100 }`;

            prompt = `Write email body for ${request.emailType}.
User: ${request.userContext.name}
Level: ${request.userContext.level}
Tier: ${request.userContext.tier}
Last Action: ${request.userContext.lastAction}
Tone: ${request.tone}
Goal: Convert action`;
            break;

          case 'cta':
            systemPrompt = `You are an expert in creating compelling calls-to-action.
Create CTAs that:
- Are action-oriented (verb + benefit)
- Feel natural, not forced
- Match the context and urgency
- Are 2-5 words
- Drive specific action

Respond with JSON: { main: "button text", variations: ["alt1", "alt2"], engagement_score: 0-100 }`;

            prompt = `Generate CTA for ${request.emailType} email.
User Tier: ${request.userContext.tier}
Context: ${request.emailType}
Goal Action: Complete booking/Write review/Share referral
Urgency: ${request.tone === 'urgent' ? 'high' : 'normal'}`;
            break;

          case 'hook':
            systemPrompt = `You are a master at writing email hooks that compel people to read.
Create opening hooks that:
- Grab attention in first line
- Create curiosity gap
- Are personalized to user tier
- Use psychological triggers
- 1-2 sentences max

Respond with JSON: { main: "hook text", variations: ["alt1", "alt2"], engagement_score: 0-100 }`;

            prompt = `Write email hook for ${request.emailType}.
User: ${request.userContext.name}
Tier: ${request.userContext.tier}
Personalization: Use user's ${request.userContext.bookingCount} bookings and ${request.userContext.points} points
Tone: ${request.tone}
Attention needed: HIGH`;
            break;

          case 'social_post':
            systemPrompt = `You are a social media copywriting expert for travel brands.
Create social posts that:
- Are 100-280 characters
- Include relevant hashtags (3-5)
- Have strong emojis
- Drive engagement
- Match the brand voice

Respond with JSON: { main: "post", variations: ["alt1", "alt2"], engagement_score: 0-100 }`;

            prompt = `Write social media post promoting ${request.emailType}.
Context: User achieved milestone/booking/badge
Hashtags: #TrekAndStay #AdventureSeekers #himalayan-treks
Tone: ${request.tone}`;
            break;

          case 'sms':
            systemPrompt = `You are an SMS copywriting expert.
Create SMS that:
- Are under 160 characters
- Have clear CTA
- Use conversational tone
- Include urgency if needed
- Feel personal, not robotic

Respond with JSON: { main: "sms", variations: ["alt1", "alt2"], engagement_score: 0-100 }`;

            prompt = `Write SMS for ${request.emailType}.
User: ${request.userContext.name}
Max length: 160 characters
Urgency: ${request.tone === 'urgent' ? 'HIGH - Payment/Action needed' : 'normal'}
Goal: Click link`;
            break;

          default:
            prompt = `Generate copy for ${request.type}`;
        }

        const result = await openRouterClient.executeTask(prompt, {
          type: 'email_copy',
          priority: 'speed',
          complexity: 'simple'
        }, systemPrompt);

        const parsed = JSON.parse(result.content);

        const generatedCopy: GeneratedCopy = {
          content: parsed.main,
          variations: parsed.variations || [],
          estimatedEngagement: parsed.engagement_score || 60,
          provider: result.provider,
          timestamp: new Date()
        };

        // Track in history
        setCopyHistory(prev => [...prev, { request, copy: generatedCopy }]);

        return generatedCopy;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Copywriting generation failed:', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Generate complete email bundle (subject + hook + body + cta)
   */
  const generateCompleteEmail = useCallback(
    async (emailType: string, userContext: CopywritingRequest['userContext'], tone: string = 'friendly') => {
      setLoading(true);
      setError(null);

      const toneType: 'professional' | 'friendly' | 'urgent' | 'celebratory' | 'casual' = tone as 'professional' | 'friendly' | 'urgent' | 'celebratory' | 'casual';

      try {
        const [subject, hook, body, cta] = await Promise.all([
          generateCopy({
            type: 'subject',
            emailType,
            userContext,
            tone: toneType,
            includeEmoji: true
          }),
          generateCopy({
            type: 'hook',
            emailType,
            userContext,
            tone: toneType
          }),
          generateCopy({
            type: 'body',
            emailType,
            userContext,
            tone: toneType
          }),
          generateCopy({
            type: 'cta',
            emailType,
            userContext,
            tone: toneType
          })
        ]);

        return {
          subject: subject?.content || 'Subject not generated',
          hook: hook?.content || '',
          body: body?.content || 'Body not generated',
          cta: cta?.content || 'Learn More',
          estimatedEngagement:
            ((subject?.estimatedEngagement || 0) +
              (body?.estimatedEngagement || 0) +
              (cta?.estimatedEngagement || 0)) /
            3
        };
      } finally {
        setLoading(false);
      }
    },
    [generateCopy]
  );

  /**
   * Get copy performance analytics
   */
  const getCopyAnalytics = useCallback(() => {
    const typeDistribution: Record<string, number> = {};
    let totalEngagement = 0;

    copyHistory.forEach(({ request, copy }) => {
      typeDistribution[request.type] = (typeDistribution[request.type] || 0) + 1;
      totalEngagement += copy.estimatedEngagement;
    });

    return {
      totalGenerated: copyHistory.length,
      typeDistribution,
      avgEngagement: totalEngagement / copyHistory.length,
      providers: Array.from(new Set(copyHistory.map(h => h.copy.provider)))
    };
  }, [copyHistory]);

  /**
   * Clear copy history
   */
  const clearHistory = useCallback(() => {
    setCopyHistory([]);
  }, []);

  return {
    generateCopy,
    generateCompleteEmail,
    getCopyAnalytics,
    clearHistory,
    copyHistory,
    loading,
    error
  };
};

export default useCopywriting;
