"""
WhatsApp API URL Configuration
===============================

Routes for WhatsApp messaging endpoints.

Patterns:
- /api/whatsapp-api/send/ - Send message
- /api/whatsapp-api/receive/ - Receive message
- /api/whatsapp-api/health/ - Health check
- /api/whatsapp-api/webhook/ - Webhook handler
- /api/whatsapp-api/status/{message_id}/ - Message status
- /api/whatsapp-api/conversations/{phone}/ - Conversation history
- /api/whatsapp-api/statistics/ - Statistics
"""

from django.urls import path
from . import views

urlpatterns = [
    # Main endpoints
    path('send/', views.send_message, name='whatsapp_send'),
    path('receive/', views.receive_message, name='whatsapp_receive'),
    path('health/', views.health_check, name='whatsapp_health'),
    path('webhook/', views.webhook_handler, name='whatsapp_webhook'),
    
    # Status and history
    path('status/<str:message_id>/', views.get_message_status, name='whatsapp_status'),
    path('conversations/<str:phone_number>/', views.get_conversation_history, name='whatsapp_conversations'),
    
    # Statistics
    path('statistics/', views.statistics, name='whatsapp_statistics'),
]
