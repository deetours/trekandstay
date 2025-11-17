"""
Django signals for triggering emails on key events
Handles automatic email sending when bookings and payments occur
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
import logging

from core.models import Booking, Payment, UserProgress, Badge, Lead
from services.email_service import get_email_service

logger = logging.getLogger(__name__)
email_service = get_email_service()


@receiver(post_save, sender=Booking)
def send_booking_confirmation_email(sender, instance, created, **kwargs):
    """
    Send confirmation email when booking is created
    Triggered: When new booking is saved
    """
    if not created:
        return
    
    try:
        user = instance.user
        trip = instance.trip
        
        if not user.email:
            logger.warning(f"No email for user {user.id}, skipping booking confirmation")
            return
        
        booking_data = {
            'user_name': user.first_name or user.username,
            'trip_title': trip.name,
            'trip_dates': f"{trip.start_date.strftime('%B %d')} - {trip.end_date.strftime('%B %d, %Y')}",
            'total_price': instance.total_amount or trip.price * instance.seats,
            'booking_id': f"TREK{instance.id:06d}",
            'seats_booked': instance.seats,
            'trip_details_url': f"https://trekandstay.com/trips/{trip.slug}",
        }
        
        email_service.send_booking_confirmation(user.email, booking_data)
        
        # Update booking confirmation flag
        instance.confirmation_email_sent = True
        instance.save(update_fields=['confirmation_email_sent'])
        
        logger.info(f"Booking confirmation email sent to {user.email}")
        
    except Exception as e:
        logger.error(f"Error sending booking confirmation email: {str(e)}", exc_info=True)


def send_booking_confirmation_whatsapp(booking, payment):
    """
    Send WhatsApp confirmation message after payment is verified
    Called manually from views.py after payment confirmation
    """
    try:
        user = booking.user
        
        if not user.username:  # WhatsApp number stored in username
            logger.warning(f"No WhatsApp number for user {user.id}, skipping WhatsApp confirmation")
            return
        
        # Format confirmation message
        message = f"""🎉 *Booking Confirmed!*

Hi {user.first_name or user.username},

Your booking has been confirmed! Here are the details:

🏔️ *Trip:* {booking.destination}
💺 *Seats:* {booking.seats}
💰 *Advance Paid:* ₹{payment.amount}
📅 *Date:* {booking.date.strftime('%d %B %Y') if booking.date else 'TBD'}

*Booking ID:* #{booking.id}

We'll send you the complete itinerary and joining instructions soon.

For any questions, reply to this message or call us at +91-XXXXXXXXXX.

Safe travels! 🏔️✨

- Team Trek & Stay"""
        
        # Import and send WhatsApp message
        from .views import send_whatsapp_message
        send_whatsapp_message(
            phone=user.username,
            message=message,
            session_id='booking_confirmations'
        )
        
        # Update booking confirmation flag
        booking.confirmation_whatsapp_sent = True
        booking.save(update_fields=['confirmation_whatsapp_sent'])
        
        logger.info(f"Booking confirmation WhatsApp sent to {user.username}")
        
    except Exception as e:
        logger.error(f"Error sending booking confirmation WhatsApp: {str(e)}", exc_info=True)


@receiver(post_save, sender=Payment)
def send_payment_confirmation_email(sender, instance, created, **kwargs):
    """
    Send payment confirmation email when payment is completed
    Triggered: When payment status changes to completed
    """
    if not created or instance.status != 'completed':
        return
    
    try:
        booking = instance.booking
        user = booking.user
        trip = booking.trip
        
        if not user.email:
            logger.warning(f"No email for user {user.id}, skipping payment confirmation")
            return
        
        payment_data = {
            'user_name': user.first_name or user.username,
            'amount': f"₹{instance.amount:,.2f}",
            'payment_date': instance.created_at.strftime('%d %B %Y at %I:%M %p'),
            'payment_method': instance.payment_method or 'UPI',
            'transaction_id': instance.transaction_id or 'N/A',
            'trip_title': trip.name,
        }
        
        email_service.send_payment_received(user.email, payment_data)
        
        logger.info(f"Payment confirmation email sent to {user.email}")
        
    except Exception as e:
        logger.error(f"Error sending payment confirmation email: {str(e)}", exc_info=True)


@receiver(post_save, sender=UserProgress)
def send_achievement_unlocked_email(sender, instance, **kwargs):
    """
    Send achievement email when user unlocks a new badge/achievement
    Triggered: When new badge is earned
    """
    # This would be triggered when badges are added to user progress
    # Implementation depends on how badges are tracked in UserProgress
    
    try:
        user = instance.user
        
        if not user.email or not instance.badges:
            return
        
        # Get last earned badge
        if hasattr(instance, '_last_badge'):
            badge_title = instance._last_badge
            achievement_data = {
                'user_name': user.first_name or user.username,
                'achievement_title': badge_title,
                'achievement_description': f'You earned the {badge_title} achievement!',
                'points_earned': 100,  # Or fetch from badge config
                'achievement_icon': '🏆',
                'user_level': instance.level,
                'leaderboard_position': 1,  # Would need to query leaderboard
            }
            
            email_service.send_achievement_unlocked(user.email, achievement_data)
            logger.info(f"Achievement email sent to {user.email}")
            
    except Exception as e:
        logger.error(f"Error sending achievement email: {str(e)}", exc_info=True)


@receiver(post_save, sender=Lead)
def send_lead_response_email(sender, instance, created, **kwargs):
    """
    Send welcome/response email to new leads
    Triggered: When new lead is created (from form submission)
    """
    if not created:
        return
    
    try:
        if not instance.email:
            logger.warning(f"No email for lead {instance.id}, skipping lead response")
            return
        
        lead_data = {
            'user_name': instance.name,
            'user_phone': instance.phone,
            'inquiry_type': instance.stage or 'General Inquiry',
            'response_message': 'Thank you for your interest! Our team will contact you shortly.',
            'suggested_trips_url': 'https://trekandstay.com/trips',
        }
        
        email_service.send_lead_response(instance.email, lead_data)
        
        # Mark as email sent
        instance.notes = f"[{instance.created_at.strftime('%Y-%m-%d %H:%M')}] Lead response email sent\n" + (instance.notes or '')
        instance.save(update_fields=['notes'])
        
        logger.info(f"Lead response email sent to {instance.email}")
        
    except Exception as e:
        logger.error(f"Error sending lead response email: {str(e)}", exc_info=True)


# ==============================
# BOOKING AUTO-PROMOTION SIGNALS
# ==============================

@receiver(post_save, sender=Booking)
def update_trip_status_on_booking_change(sender, instance, **kwargs):
    """
    Update trip status when booking status changes
    Auto-promotes trips at 4 bookings, removes promotion at 5 bookings
    """
    if instance.trip:
        instance.trip.update_status()
        logger.info(f"Trip {instance.trip.name} status updated due to booking change")


# ==============================
# LEAD SCORING SIGNALS
# ==============================

@receiver(post_save, sender=Lead)
def auto_score_lead(sender, instance, created, **kwargs):
    """
    Automatically score a lead when it's created or significantly updated
    """
    try:
        # Only score if this is a new lead or if key fields have changed
        should_score = created

        if not created:
            # Check if any important fields changed (you might want to track this)
            # For now, we'll re-score periodically or on demand
            pass

        if should_score:
            # Initialize ML model
            import sys
            import os
            sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))
            from ml_models.lead_scoring_model import LeadScoringModel
            model = LeadScoringModel()
            model_loaded = model.load_model()

            if model_loaded:
                # Score the lead
                score = model.predict_probability(instance)

                # Save qualification score
                from core.models import LeadQualificationScore
                qual_score, created_score = LeadQualificationScore.objects.get_or_create(
                    lead=instance,
                    defaults={
                        'engagement_score': 0,
                        'intent_score': 0,
                        'fit_score': 0,
                        'urgency_score': 0,
                        'total_score': score,
                        'qualification_status': _get_status_from_score(score),
                        'scoring_reason': 'Auto-scoring on lead creation'
                    }
                )

                if not created_score:
                    # Update existing score
                    qual_score.total_score = score
                    qual_score.qualification_status = _get_status_from_score(score)
                    qual_score.scoring_reason = 'Auto-re-scoring'
                    qual_score.save()

                logger.info(f"Auto-scored lead {instance.id}: {score} ({qual_score.qualification_status})")
            else:
                logger.warning("ML model not available for auto-scoring")

    except Exception as e:
        logger.error(f"Error auto-scoring lead {instance.id}: {str(e)}")


def _get_status_from_score(score):
    """Convert numeric score to qualification status"""
    if score >= 75:
        return 'hot'
    elif score >= 40:
        return 'warm'
    else:
        return 'cold'


# Signal configuration
def ready():
    """
    Called when Django app is ready
    This function should be called from apps.py ready() method
    """
    logger.info("Email signals registered successfully")
