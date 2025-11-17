from rest_framework.routers import DefaultRouter
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from api.views.whatsapp_view import WhatsAppViewSet
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
    TripPlanViewSet,
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
    send_whatsapp_otp,
    verify_whatsapp_otp,
    resend_whatsapp_otp,
    score_lead,
    retrain_lead_scoring_model,
    get_lead_scoring_stats,
    get_trip_recommendations,
    retrain_recommendation_engine,
    get_recommendation_stats,
    record_user_interaction,
)
from core.views import chat_retrieve, chat_complete, auth_google, capture_lead
from core.admin_views import upload_trips, list_trips_admin, delete_trip, AdminLeadViewSet, AdminWhatsAppViewSet, get_admin_dashboard_stats
from services.whatsapp_ai_webhook import (
    whatsapp_ai_webhook,
    whatsapp_ai_send_test,
    whatsapp_ai_status,
    whatsapp_ai_escalate,
    whatsapp_ai_conversation_stats,
)
from services.phase3_4_endpoints import (
    MessageTemplateViewSet as MessageTemplateAPIViewSet,
    AnalyticsViewSet,
)
from services.phase5_6_endpoints import (
    NurturingAutomationViewSet,
    AdvancedRAGViewSet,
    phase5_6_status,
)
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'views'))
from multi_llm_admin import llm_usage_dashboard, reset_llm_stats, test_llm_system
from services.multi_llm_webhook_handler import whatsapp_incoming_webhook_sync


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
router.register(r'trip-plans', TripPlanViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'triphistory', TripHistoryViewSet)
router.register(r'triprecommendations', TripRecommendationViewSet)
router.register(r'seatlocks', SeatLockViewSet)
router.register(r'message-templates', MessageTemplateViewSet)
router.register(r'lead-events', LeadEventViewSet, basename='lead-events')
router.register(r'outbound-messages', OutboundMessageViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'templates', MessageTemplateViewSet, basename='message-templates')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')
router.register(r'nurturing', NurturingAutomationViewSet, basename='nurturing')
router.register(r'rag', AdvancedRAGViewSet, basename='rag')
router.register(r'whatsapp', WhatsAppViewSet, basename='whatsapp')

urlpatterns = [
    # Traditional Token Auth (Deprecated - use JWT instead)
    path('auth/token/', obtain_auth_token, name='api_token_auth'),
    
    # JWT Authentication (NEW - Use These)
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # User Profile
    path('auth/me/', me, name='api_me'),
    
    # WhatsApp OTP Authentication
    path('auth/send-otp/', send_whatsapp_otp, name='send_whatsapp_otp'),
    path('auth/verify-otp/', verify_whatsapp_otp, name='verify_whatsapp_otp'),
    path('auth/resend-otp/', resend_whatsapp_otp, name='resend_whatsapp_otp'),
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
    # Admin Trip Management API
    path('admin/upload-trips/', upload_trips, name='upload_trips'),
    path('admin/trips/', list_trips_admin, name='list_trips_admin'),
    path('admin/trips/<int:trip_id>/', delete_trip, name='delete_trip'),
    # WhatsApp AI Agent Endpoints (NEW - Phase 2)
    path('whatsapp/ai-webhook/', whatsapp_ai_webhook, name='whatsapp_ai_webhook'),
    path('whatsapp/ai-test/', whatsapp_ai_send_test, name='whatsapp_ai_test'),
    path('whatsapp/ai-status/', whatsapp_ai_status, name='whatsapp_ai_status'),
    path('whatsapp/ai-escalate/', whatsapp_ai_escalate, name='whatsapp_ai_escalate'),
    path('whatsapp/ai-stats/', whatsapp_ai_conversation_stats, name='whatsapp_ai_stats'),
    # Message Templates API (NEW - Phase 3)
    path('templates/create/', MessageTemplateAPIViewSet.as_view({'post': 'create_template'}), name='create_template'),
    path('templates/list/', MessageTemplateAPIViewSet.as_view({'get': 'list_templates'}), name='list_templates'),
    path('templates/status-summary/', MessageTemplateAPIViewSet.as_view({'get': 'status_summary'}), name='template_status_summary'),
    path('templates/approved/', MessageTemplateAPIViewSet.as_view({'get': 'approved_templates'}), name='approved_templates'),
    path('templates/substitute-variables/', MessageTemplateAPIViewSet.as_view({'post': 'substitute_variables'}), name='substitute_variables'),
    path('templates/submit-approval/', MessageTemplateAPIViewSet.as_view({'post': 'submit_for_approval'}), name='submit_for_approval'),
    path('templates/approval-status/', MessageTemplateAPIViewSet.as_view({'get': 'approval_status'}), name='approval_status'),
    path('templates/prebuilt/', MessageTemplateAPIViewSet.as_view({'get': 'prebuilt_templates'}), name='prebuilt_templates'),
    # Analytics API (NEW - Phase 4)
    path('analytics/track-event/', AnalyticsViewSet.as_view({'post': 'track_event'}), name='track_event'),
    path('analytics/create-qr-campaign/', AnalyticsViewSet.as_view({'post': 'create_qr_campaign'}), name='create_qr_campaign'),
    path('analytics/campaign-metrics/', AnalyticsViewSet.as_view({'get': 'campaign_metrics'}), name='campaign_metrics'),
    path('analytics/define-funnel/', AnalyticsViewSet.as_view({'post': 'define_funnel'}), name='define_funnel'),
    path('analytics/funnel-analysis/', AnalyticsViewSet.as_view({'get': 'funnel_analysis'}), name='funnel_analysis'),
    path('analytics/user-attribution/', AnalyticsViewSet.as_view({'get': 'user_attribution'}), name='user_attribution'),
    path('analytics/campaign-summary/', AnalyticsViewSet.as_view({'get': 'campaign_summary'}), name='campaign_summary'),
    path('analytics/events-by-type/', AnalyticsViewSet.as_view({'get': 'events_by_type'}), name='events_by_type'),
    path('analytics/top-campaigns/', AnalyticsViewSet.as_view({'get': 'top_campaigns'}), name='top_campaigns'),
    # Phase 5 & 6 Status
    path('phase5-6/status/', phase5_6_status, name='phase5_6_status'),
    # MULTI-LLM SALES AGENT (NEW)
    path('multi-llm/webhook/', whatsapp_incoming_webhook_sync, name='multi_llm_webhook'),
    path('multi-llm/dashboard/', llm_usage_dashboard, name='llm_dashboard'),
    path('multi-llm/reset-stats/', reset_llm_stats, name='reset_llm_stats'),
    path('multi-llm/test/', test_llm_system, name='test_llm_system'),
    # MACHINE LEARNING API (NEW)
    path('ml/score-lead/<int:lead_id>/', score_lead, name='score_lead'),
    path('ml/retrain-model/', retrain_lead_scoring_model, name='retrain_model'),
    path('ml/scoring-stats/', get_lead_scoring_stats, name='scoring_stats'),
    # TRIP RECOMMENDATION API (NEW)
    path('recommendations/<int:user_id>/', get_trip_recommendations, name='get_recommendations'),
    path('recommendations/', get_trip_recommendations, name='get_my_recommendations'),
    path('recommendations/retrain/', retrain_recommendation_engine, name='retrain_recommendations'),
    path('recommendations/stats/', get_recommendation_stats, name='recommendation_stats'),
    path('recommendations/interaction/', record_user_interaction, name='record_interaction'),
]
