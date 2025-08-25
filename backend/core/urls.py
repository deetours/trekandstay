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
]
