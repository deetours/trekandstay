import axios, { AxiosInstance } from 'axios';
import { openRouterClient } from '../llm/openRouterClient';

/**
 * Mailjet Email Service with LLM-Powered Intelligent Copywriting
 * Supports HTML and text emails with AI-generated copies
 */

interface MailjetConfig {
  apiKey: string;
  apiSecret: string;
  fromEmail: string;
  fromName: string;
}

interface EmailTemplate {
  type: 'lead_welcome' | 'booking_confirmation' | 'payment_reminder' | 'trip_reminder' | 'review_request' | 'referral_bonus' | 'challenge_update' | 'promotional';
  userId: string;
  userData: {
    name: string;
    email: string;
    bookingCount?: number;
    points?: number;
    level?: number;
    tripName?: string;
    tripDate?: string;
    amount?: number;
    discountCode?: string;
  };
  context?: Record<string, string | number | boolean | object>;
}

interface GeneratedEmail {
  subject: string;
  body: string;
  cta: string;
  ctaUrl: string;
  tone: 'professional' | 'friendly' | 'urgent' | 'celebratory';
  estimatedOpenRate: number;
  provider: string;
}

interface SentEmail {
  messageId: string;
  email: string;
  status: 'sent' | 'failed';
  sentAt: Date;
  trackingId: string;
}

class MailjetService {
  private apiKey: string;
  private apiSecret: string;
  private fromEmail: string;
  private fromName: string;
  private client: AxiosInstance;
  private emailHistory: SentEmail[] = [];
  private costTracker = {
    api: 0,
    llm: 0
  };

  constructor(config?: MailjetConfig) {
    this.apiKey = config?.apiKey || process.env.MAILJET_API_KEY || '';
    this.apiSecret = config?.apiSecret || process.env.MAILJET_API_SECRET || '';
    this.fromEmail = config?.fromEmail || process.env.MAILJET_FROM_EMAIL || 'noreply@trekandstay.com';
    this.fromName = config?.fromName || 'Trek and Stay Adventures';

    if (!this.apiKey || !this.apiSecret) {
      console.warn('⚠️  Mailjet credentials not found. Set MAILJET_API_KEY and MAILJET_API_SECRET environment variables.');
    }

    const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');

    this.client = axios.create({
      baseURL: 'https://api.mailjet.com/v3.1',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Generate smart email copy using LLM based on email type and user context
   */
  private async generateSmartCopy(template: EmailTemplate): Promise<GeneratedEmail> {
    const systemPrompt = `You are a world-class email copywriter specializing in customer engagement for adventure travel companies.
Generate emails that:
1. Personalize to user level/status (beginner, regular, VIP)
2. Include relevant incentives (points, discounts, badges)
3. Have compelling CTAs
4. Match the user's psychological profile
5. Drive specific actions (booking, review, referral)

Always respond in JSON format with: subject, body, cta, ctaUrl, tone, estimatedOpenRate (0-100)`;

    let prompt = '';

    switch (template.type) {
      case 'lead_welcome':
        prompt = `Generate a welcome email for a new lead.
User: ${template.userData.name}
Background: First interaction with Trek and Stay
Goal: Convert lead to booking
Include: Value proposition, limited-time offer, social proof
Response tone: Friendly and exciting`;
        break;

      case 'booking_confirmation':
        prompt = `Generate booking confirmation email.
User: ${template.userData.name}
Trip: ${template.userData.tripName}
Date: ${template.userData.tripDate}
Amount: ₹${template.userData.amount}
Goal: Confirm booking, build excitement, drive referrals
Incentive: ${template.userData.points} points earned + referral bonus
Response tone: Celebratory and professional`;
        break;

      case 'payment_reminder':
        prompt = `Generate payment reminder email.
User: ${template.userData.name}
Trip: ${template.userData.tripName}
Status: Payment pending for 2 hours
Goal: Urgently complete payment
Incentive: Extra 50 points if paid within 2 hours
Response tone: Urgent but supportive`;
        break;

      case 'trip_reminder':
        prompt = `Generate trip reminder email.
User: ${template.userData.name}
Trip: ${template.userData.tripName}
Date: ${template.userData.tripDate}
Booking: Confirmed for ${template.userData.bookingCount || 1} person(s)
Goal: Prepare for trip, increase excitement
Include: Itinerary summary, what to pack, meeting point
Response tone: Exciting and informative`;
        break;

      case 'review_request':
        prompt = `Generate review request email.
User: ${template.userData.name}
Trip: ${template.userData.tripName}
Completed: Just finished trek
Goal: Get 5-star review
Incentive: 100 bonus points for review
Response tone: Grateful and encouraging`;
        break;

      case 'referral_bonus':
        prompt = `Generate referral bonus email.
User: ${template.userData.name}
Referral: Friend just booked a trek
Bonus: ₹1000 referral credit earned
Goal: Motivate more referrals
Show: Referral link, tracking dashboard
Response tone: Celebratory`;
        break;

      case 'challenge_update':
        prompt = `Generate challenge update email.
User: ${template.userData.name}
Level: ${template.userData.level}
Points: ${template.userData.points}
Goal: Encourage engagement with new challenges
Include: Current challenges, leaderboard position, rewards
Response tone: Motivating`;
        break;

      case 'promotional':
        prompt = `Generate promotional email.
User: ${template.userData.name}
Discount: ${template.userData.discountCode}
Goal: Drive bookings
Urgency: Limited time offer (48 hours)
Response tone: Compelling and urgent`;
        break;

      default:
        prompt = `Generate email for Trek and Stay customer.`;
    }

    try {
      const result = await openRouterClient.executeTask(prompt, {
        type: 'email_copy',
        priority: 'cost',
        complexity: 'simple'
      }, systemPrompt);

      this.costTracker.llm += result.cost;

      // Parse JSON response
      const parsed = JSON.parse(result.content);

      return {
        subject: parsed.subject || 'Trek and Stay - Your Adventure Awaits!',
        body: parsed.body || '',
        cta: parsed.cta || 'Learn More',
        ctaUrl: parsed.ctaUrl || 'https://trekandstay.com',
        tone: parsed.tone || 'friendly',
        estimatedOpenRate: parsed.estimatedOpenRate || 45,
        provider: result.provider
      };
    } catch (error) {
      console.error('LLM copy generation failed:', error);
      // Fallback to template
      return this.getFallbackCopy(template);
    }
  }

  /**
   * Fallback copy when LLM fails
   */
  private getFallbackCopy(template: EmailTemplate): GeneratedEmail {
    const fallbacks: Record<string, GeneratedEmail> = {
      lead_welcome: {
        subject: `Welcome to Trek and Stay, ${template.userData.name}! 🏔️`,
        body: `Hi ${template.userData.name},\n\nThanks for your interest in exploring amazing treks with us!\n\nWe have exclusive offers for new adventurers. Get ₹2,000 off your first booking today.`,
        cta: 'Explore Treks',
        ctaUrl: 'https://trekandstay.com/treks',
        tone: 'friendly',
        estimatedOpenRate: 40,
        provider: 'fallback'
      },
      booking_confirmation: {
        subject: `🎉 Your Trek is Booked, ${template.userData.name}!`,
        body: `Your booking for ${template.userData.tripName} on ${template.userData.tripDate} is confirmed!\n\nYou've earned ${template.userData.points} points. Share your booking and earn more rewards!`,
        cta: 'Share & Earn Points',
        ctaUrl: 'https://trekandstay.com/referral',
        tone: 'celebratory',
        estimatedOpenRate: 60,
        provider: 'fallback'
      },
      review_request: {
        subject: `How was your ${template.userData.tripName} adventure?`,
        body: `Hi ${template.userData.name},\n\nWe'd love to hear about your experience! Write a review and earn 100 bonus points.`,
        cta: 'Write Review',
        ctaUrl: 'https://trekandstay.com/reviews',
        tone: 'friendly',
        estimatedOpenRate: 35,
        provider: 'fallback'
      }
    };

    return fallbacks[template.type] || fallbacks.lead_welcome;
  }

  /**
   * Send email with intelligent LLM-generated copy
   */
  async sendEmail(template: EmailTemplate): Promise<SentEmail> {
    try {
      // Generate smart email copy
      console.log(`📝 Generating smart copy for: ${template.type}`);
      const emailCopy = await this.generateSmartCopy(template);

      // Prepare email content
      const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c1b 100%); color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .cta-button { background: #2d5016; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Trek and Stay Adventures</h1>
    </div>
    <div class="content">
      <h2>Hi ${template.userData.name}!</h2>
      <p>${emailCopy.body.replace(/\n/g, '</p><p>')}</p>
      <a href="${emailCopy.ctaUrl}" class="cta-button">${emailCopy.cta}</a>
    </div>
    <div class="footer">
      <p>© 2025 Trek and Stay. All rights reserved.</p>
      <p><a href="https://trekandstay.com/unsubscribe">Unsubscribe</a> | <a href="https://trekandstay.com/preferences">Preferences</a></p>
    </div>
  </div>
</body>
</html>`;

      // Send via Mailjet
      const response = await this.client.post('/send', {
        Messages: [
          {
            From: {
              Email: this.fromEmail,
              Name: this.fromName
            },
            To: [
              {
                Email: template.userData.email,
                Name: template.userData.name
              }
            ],
            Subject: emailCopy.subject,
            HTMLPart: emailBody,
            TextPart: emailCopy.body,
            CustomID: `${template.type}-${template.userId}-${Date.now()}`,
            TrackOpen: true,
            TrackClick: true
          }
        ]
      });

      const messageId = response.data.Messages[0].ID;
      const trackingId = response.data.Messages[0].CustomID;

      const sentEmail: SentEmail = {
        messageId,
        email: template.userData.email,
        status: 'sent',
        sentAt: new Date(),
        trackingId
      };

      this.emailHistory.push(sentEmail);

      console.log(`✅ Email sent to ${template.userData.email}`);
      console.log(`   Subject: ${emailCopy.subject}`);
      console.log(`   Tone: ${emailCopy.tone} | Est. Open Rate: ${emailCopy.estimatedOpenRate}%`);
      console.log(`   LLM Provider: ${emailCopy.provider}\n`);

      return sentEmail;
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to send email:`, errorMessage);
      return {
        messageId: '',
        email: template.userData.email,
        status: 'failed',
        sentAt: new Date(),
        trackingId: ''
      };
    }
  }

  /**
   * Send batch emails
   */
  async sendBatch(templates: EmailTemplate[]): Promise<SentEmail[]> {
    const results: SentEmail[] = [];

    console.log(`\n📧 [Batch Email Sending] Processing ${templates.length} emails...\n`);

    for (let i = 0; i < templates.length; i++) {
      const result = await this.sendEmail(templates[i]);
      results.push(result);
      
      // Rate limiting - wait 200ms between emails
      if (i < templates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    console.log(`\n📊 [Batch Summary]`);
    console.log(`✅ Sent: ${successCount}/${templates.length}`);
    console.log(`💰 Total LLM Cost: $${this.costTracker.llm.toFixed(4)}`);

    return results;
  }

  /**
   * Get email statistics
   */
  getStats() {
    const totalSent = this.emailHistory.length;
    const successCount = this.emailHistory.filter(e => e.status === 'sent').length;

    return {
      totalSent,
      successCount,
      failureCount: totalSent - successCount,
      successRate: ((successCount / totalSent) * 100).toFixed(2) + '%',
      llmCostTotal: this.costTracker.llm.toFixed(4),
      averageCostPerEmail: (this.costTracker.llm / totalSent).toFixed(6)
    };
  }

  /**
   * Print email statistics
   */
  printStats(): void {
    const stats = this.getStats();
    console.log('\n📧 [Email Statistics]');
    console.log(`Total Sent: ${stats.totalSent}`);
    console.log(`Success: ${stats.successCount}`);
    console.log(`Failed: ${stats.failureCount}`);
    console.log(`Success Rate: ${stats.successRate}`);
    console.log(`LLM Cost: $${stats.llmCostTotal}`);
    console.log(`Avg Cost/Email: $${stats.averageCostPerEmail}\n`);
  }
}

export const mailjetService = new MailjetService();
export default MailjetService;
