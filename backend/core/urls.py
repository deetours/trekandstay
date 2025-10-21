from rest_framework.routers import DefaultRouter
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    UserProfileViewSet,
    BookingViewSet,
    LeadViewSet,
    AuthorViewSet,
    StoryViewSet,
    TripViewSet,
    GuideViewSet,
    ReviewViewSet,
    me,
    dashboard_summary,
    WishlistViewSet,
    PaymentViewSet,
    TripHistoryViewSet,
    TripRecommendationViewSet,
    SeatLockViewSet,
    MessageTemplateViewSet,
    LeadEventViewSet,
    OutboundMessageViewSet,
    TaskViewSet,
    custom_whatsapp_inbound,
    process_outbound_queue,
    whatsapp_send,
    whatsapp_webhook,
    track_events,
    merge_identity,
    trigger_abandoned_scan,
    whatsapp_incoming_webhook,
    send_whatsapp_message_endpoint,
    whatsapp_sessions_status,
    create_payment,
    initiate_payment,
    submit_payment_proof,
    verify_payment,
    confirm_booking_after_payment,
    get_pending_payments,
    get_payment_status,
    user_progress,
    track_gamification_event,
    get_leaderboard,
    get_badges,
    claim_challenge_reward,
    lead_qualification_score,
    lead_priority_queue,
    assign_lead_to_sales_rep,
    update_lead_follow_up,
    resolve_lead_qualification,
)
from core.views import chat_retrieve, chat_complete, auth_google, capture_lead


router = DefaultRouter()
router.register(r'userprofiles', UserProfileViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'leads', LeadViewSet)
router.register(r'stories/authors', AuthorViewSet)
router.register(r'stories', StoryViewSet)
router.register(r'trips', TripViewSet)
router.register(r'guides', GuideViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'wishlist', WishlistViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'triphistory', TripHistoryViewSet)
router.register(r'triprecommendations', TripRecommendationViewSet)
router.register(r'seatlocks', SeatLockViewSet)
router.register(r'message-templates', MessageTemplateViewSet)
router.register(r'lead-events', LeadEventViewSet, basename='lead-events')
router.register(r'outbound-messages', OutboundMessageViewSet)
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('auth/token/', obtain_auth_token, name='api_token_auth'),
    path('auth/me/', me, name='api_me'),
    path('dashboard/summary/', dashboard_summary, name='dashboard_summary'),
    path('', include(router.urls)),
    path('chat/retrieve/', chat_retrieve, name='chat_retrieve'),
    path('chat/complete/', chat_complete, name='chat_complete'),
    path('auth/google/', auth_google, name='auth_google'),
    path('auth/register/', auth_google, name='auth_register_placeholder'),  # placeholder until real register view
    path('custom-wa/inbound/', custom_whatsapp_inbound, name='custom_whatsapp_inbound'),
    path('messages/process-queue/', process_outbound_queue, name='process_outbound_queue'),
    path('whatsapp/send/', whatsapp_send, name='whatsapp_send'),
    path('whatsapp/webhook/', whatsapp_webhook, name='whatsapp_webhook'),
    path('track/', track_events, name='track_events'),
    path('leads/merge-identity/', merge_identity, name='merge_identity'),
    path('automation/scan-abandoned/', trigger_abandoned_scan, name='trigger_abandoned_scan'),
    # New WhatsApp API Integration
    path('whatsapp/incoming/', whatsapp_incoming_webhook, name='whatsapp_incoming_webhook'),
    path('whatsapp/send-message/', send_whatsapp_message_endpoint, name='send_whatsapp_message'),
    path('whatsapp/sessions/', whatsapp_sessions_status, name='whatsapp_sessions_status'),
    path('leads/capture/', capture_lead, name='capture_lead'),
    # Payment Verification API
    path('payments/create/', create_payment, name='create_payment'),
    path('payments/<int:payment_id>/initiate/', initiate_payment, name='initiate_payment'),
    path('payments/<int:payment_id>/submit-proof/', submit_payment_proof, name='submit_payment_proof'),
    path('payments/<int:payment_id>/verify/', verify_payment, name='verify_payment'),
    path('payments/<int:payment_id>/confirm-booking/', confirm_booking_after_payment, name='confirm_booking_after_payment'),
    path('payments/pending/', get_pending_payments, name='get_pending_payments'),
    path('payments/status/', get_payment_status, name='get_payment_status'),
    # Gamification API
    path('user/progress/', user_progress, name='user_progress'),
    path('gamification/track-event/', track_gamification_event, name='track_gamification_event'),
    path('gamification/leaderboard/', get_leaderboard, name='get_leaderboard'),
    path('gamification/badges/', get_badges, name='get_badges'),
    path('gamification/challenges/<int:challenge_id>/claim/', claim_challenge_reward, name='claim_challenge_reward'),
    # Lead Qualification API
    path('leads/<int:lead_id>/qualification/', lead_qualification_score, name='lead_qualification_score'),
    path('leads/qualification/priority-queue/', lead_priority_queue, name='lead_priority_queue'),
    path('leads/qualification/assign/', assign_lead_to_sales_rep, name='assign_lead_to_sales_rep'),
    path('leads/qualification/follow-up/', update_lead_follow_up, name='update_lead_follow_up'),
    path('leads/qualification/resolve/', resolve_lead_qualification, name='resolve_lead_qualification'),
]
