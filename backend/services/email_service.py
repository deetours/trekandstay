"""
Email notification service with SendGrid integration
Handles all transactional emails for Trek & Stay
"""

from typing import Dict, List, Optional
import logging
from django.conf import settings

# Email templates for different events
EMAIL_TEMPLATES = {
    'booking_confirmation': {
        'subject': '🎉 Your Trek & Stay Adventure is Confirmed!',
        'template_id': 'd-booking-confirmation-v1',
        'description': 'Sent when a booking is successfully created'
    },
    'payment_received': {
        'subject': '✅ Payment Received - Your Adventure Awaits!',
        'template_id': 'd-payment-received-v1',
        'description': 'Sent when payment is successfully processed'
    },
    'trip_reminder': {
        'subject': '🏔️ Your Trek Starts Soon - Final Details Inside!',
        'template_id': 'd-trip-reminder-v1',
        'description': 'Sent 7 days before trip departure'
    },
    'achievement_unlocked': {
        'subject': '🏆 Achievement Unlocked - You\'re Awesome!',
        'template_id': 'd-achievement-unlocked-v1',
        'description': 'Sent when user earns a new badge or achievement'
    },
    'referral_reward': {
        'subject': '🎁 Referral Reward Earned!',
        'template_id': 'd-referral-reward-v1',
        'description': 'Sent when a referral is converted to booking'
    },
    'lead_response': {
        'subject': 'Your Trek & Stay Inquiry - We\'re Ready to Help!',
        'template_id': 'd-lead-response-v1',
        'description': 'Sent to leads who submit inquiry forms'
    },
    'promotion': {
        'subject': '🌟 Exclusive Offer Just for You!',
        'template_id': 'd-promotion-v1',
        'description': 'Promotional emails for special offers'
    },
    'welcome': {
        'subject': '👋 Welcome to Trek & Stay - Your Adventure Starts Here!',
        'template_id': 'd-welcome-v1',
        'description': 'Sent to new users who sign up'
    }
}

logger = logging.getLogger(__name__)


class EmailService:
    """Handles email operations with SendGrid"""
    
    def __init__(self):
        """Initialize SendGrid service"""
        self.api_key = getattr(settings, 'SENDGRID_API_KEY', None)
        self.from_email = getattr(settings, 'SENDGRID_FROM_EMAIL', 'noreply@trekandstay.com')
        self.enabled = bool(self.api_key)
        
        if self.enabled:
            try:
                from sendgrid import SendGridAPIClient
                self.client = SendGridAPIClient(self.api_key)
            except ImportError:
                logger.warning("SendGrid client not installed. Email functionality disabled.")
                self.enabled = False
    
    def send_booking_confirmation(self, user_email: str, booking_data: Dict) -> bool:
        """Send booking confirmation email"""
        return self._send_email(
            template_name='booking_confirmation',
            recipient_email=user_email,
            dynamic_data={
                'user_name': booking_data.get('user_name'),
                'trip_title': booking_data.get('trip_title'),
                'trip_dates': booking_data.get('trip_dates'),
                'total_price': booking_data.get('total_price'),
                'booking_id': booking_data.get('booking_id'),
                'seats_booked': booking_data.get('seats_booked'),
                'trip_details_url': booking_data.get('trip_details_url'),
                'contact_whatsapp': getattr(settings, 'WHATSAPP_BUSINESS_NUMBER', ''),
            }
        )
    
    def send_payment_received(self, user_email: str, payment_data: Dict) -> bool:
        """Send payment received email"""
        return self._send_email(
            template_name='payment_received',
            recipient_email=user_email,
            dynamic_data={
                'user_name': payment_data.get('user_name'),
                'amount': payment_data.get('amount'),
                'payment_date': payment_data.get('payment_date'),
                'payment_method': payment_data.get('payment_method'),
                'transaction_id': payment_data.get('transaction_id'),
                'trip_title': payment_data.get('trip_title'),
            }
        )
    
    def send_trip_reminder(self, user_email: str, trip_data: Dict) -> bool:
        """Send trip reminder email"""
        return self._send_email(
            template_name='trip_reminder',
            recipient_email=user_email,
            dynamic_data={
                'user_name': trip_data.get('user_name'),
                'trip_title': trip_data.get('trip_title'),
                'departure_date': trip_data.get('departure_date'),
                'departure_time': trip_data.get('departure_time'),
                'meeting_location': trip_data.get('meeting_location'),
                'packing_list_url': trip_data.get('packing_list_url'),
                'guide_contact': trip_data.get('guide_contact'),
            }
        )
    
    def send_achievement_unlocked(self, user_email: str, achievement_data: Dict) -> bool:
        """Send achievement unlocked email"""
        return self._send_email(
            template_name='achievement_unlocked',
            recipient_email=user_email,
            dynamic_data={
                'user_name': achievement_data.get('user_name'),
                'achievement_title': achievement_data.get('achievement_title'),
                'achievement_description': achievement_data.get('achievement_description'),
                'points_earned': achievement_data.get('points_earned'),
                'achievement_icon': achievement_data.get('achievement_icon'),
                'user_level': achievement_data.get('user_level'),
                'leaderboard_position': achievement_data.get('leaderboard_position'),
            }
        )
    
    def send_referral_reward(self, user_email: str, referral_data: Dict) -> bool:
        """Send referral reward email"""
        return self._send_email(
            template_name='referral_reward',
            recipient_email=user_email,
            dynamic_data={
                'user_name': referral_data.get('user_name'),
                'referred_name': referral_data.get('referred_name'),
                'reward_points': referral_data.get('reward_points'),
                'reward_description': referral_data.get('reward_description'),
                'total_referrals': referral_data.get('total_referrals'),
                'next_reward_threshold': referral_data.get('next_reward_threshold'),
            }
        )
    
    def send_lead_response(self, user_email: str, lead_data: Dict) -> bool:
        """Send lead response email"""
        return self._send_email(
            template_name='lead_response',
            recipient_email=user_email,
            dynamic_data={
                'user_name': lead_data.get('user_name'),
                'user_phone': lead_data.get('user_phone'),
                'inquiry_type': lead_data.get('inquiry_type'),
                'support_contact': getattr(settings, 'WHATSAPP_BUSINESS_NUMBER', ''),
                'response_message': lead_data.get('response_message'),
                'suggested_trips_url': lead_data.get('suggested_trips_url'),
            }
        )
    
    def send_promotional_email(self, user_email: str, promo_data: Dict) -> bool:
        """Send promotional email"""
        return self._send_email(
            template_name='promotion',
            recipient_email=user_email,
            dynamic_data={
                'user_name': promo_data.get('user_name'),
                'promo_title': promo_data.get('promo_title'),
                'promo_description': promo_data.get('promo_description'),
                'discount_percentage': promo_data.get('discount_percentage'),
                'offer_code': promo_data.get('offer_code'),
                'expiry_date': promo_data.get('expiry_date'),
                'cta_url': promo_data.get('cta_url'),
            }
        )
    
    def send_welcome_email(self, user_email: str, user_data: Dict) -> bool:
        """Send welcome email to new users"""
        return self._send_email(
            template_name='welcome',
            recipient_email=user_email,
            dynamic_data={
                'user_name': user_data.get('user_name'),
                'welcome_message': 'Welcome to Trek & Stay! Start exploring amazing adventures.',
                'first_trip_url': user_data.get('first_trip_url'),
                'getting_started_url': user_data.get('getting_started_url'),
            }
        )
    
    def _send_email(
        self,
        template_name: str,
        recipient_email: str,
        dynamic_data: Dict,
        cc_emails: Optional[List[str]] = None
    ) -> bool:
        """
        Send email using SendGrid with dynamic template
        
        Args:
            template_name: Name of template (key in EMAIL_TEMPLATES)
            recipient_email: Recipient email address
            dynamic_data: Template variables
            cc_emails: Optional CC email addresses
            
        Returns:
            True if email sent successfully, False otherwise
        """
        if not self.enabled:
            logger.warning(f"Email service disabled. Skipping email to {recipient_email}")
            return False
        
        if template_name not in EMAIL_TEMPLATES:
            logger.error(f"Unknown email template: {template_name}")
            return False
        
        try:
            from sendgrid.helpers.mail import Mail, To, Cc
            
            template_config = EMAIL_TEMPLATES[template_name]
            
            mail = Mail(
                from_email=self.from_email,
                to_emails=To(recipient_email),
                subject=template_config['subject'],
                is_multiple=False
            )
            
            # Set dynamic template
            mail.template_id = template_config['template_id']
            
            # Add dynamic template data
            mail.dynamic_template_data = dynamic_data
            
            # Add CC recipients if provided
            if cc_emails:
                for cc_email in cc_emails:
                    mail.add_cc(Cc(cc_email))
            
            # Send email
            response = self.client.send(mail)
            
            if response.status_code in [200, 201, 202]:
                logger.info(
                    f"Email sent successfully to {recipient_email}",
                    extra={'template': template_name, 'status': response.status_code}
                )
                return True
            else:
                logger.error(
                    f"Failed to send email to {recipient_email}: {response.status_code}",
                    extra={'template': template_name}
                )
                return False
                
        except Exception as e:
            logger.error(
                f"Exception sending email to {recipient_email}: {str(e)}",
                extra={'template': template_name},
                exc_info=True
            )
            return False
    
    def send_bulk_emails(
        self,
        template_name: str,
        recipients: List[Dict]
    ) -> Dict[str, int]:
        """
        Send emails to multiple recipients
        
        Args:
            template_name: Email template to use
            recipients: List of dicts with 'email' and 'dynamic_data' keys
            
        Returns:
            Dict with 'sent' and 'failed' counts
        """
        results = {'sent': 0, 'failed': 0}
        
        for recipient in recipients:
            email = recipient.get('email')
            data = recipient.get('dynamic_data', {})
            
            if self._send_email(template_name, email, data):
                results['sent'] += 1
            else:
                results['failed'] += 1
        
        return results


# Singleton instance
email_service = EmailService()


def get_email_service() -> EmailService:
    """Get email service instance"""
    return email_service
