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


# Signal configuration
def ready():
    """
    Called when Django app is ready
    This function should be called from apps.py ready() method
    """
    logger.info("Email signals registered successfully")
