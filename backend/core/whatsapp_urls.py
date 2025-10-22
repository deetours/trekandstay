"""
WhatsApp API URLs
Register all WhatsApp webhook and API endpoints
"""

from django.urls import path
from core.whatsapp_webhook import (
    whatsapp_webhook_verify,
    whatsapp_webhook_receive,
    send_whatsapp_message,
    send_bulk_whatsapp_messages,
    get_conversation_history,
    whatsapp_health_check
)

urlpatterns = [
    # Webhook verification (GET request from provider)
    path('webhook/', whatsapp_webhook_verify, name='whatsapp_webhook_verify'),
    
    # Webhook receiver (POST request from provider with incoming messages)
    path('webhook/', whatsapp_webhook_receive, name='whatsapp_webhook_receive'),
    
    # Send single message
    path('send/', send_whatsapp_message, name='send_message'),
    
    # Send bulk messages (auto-reply campaign)
    path('bulk-send/', send_bulk_whatsapp_messages, name='send_bulk_messages'),
    
    # Get conversation history
    path('conversations/<str:phone>/', get_conversation_history, name='conversation_history'),
    
    # Health check
    path('health/', whatsapp_health_check, name='whatsapp_health'),
]
