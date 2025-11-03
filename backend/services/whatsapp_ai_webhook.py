"""
WhatsApp Webhook Endpoint with Enhanced LLM Agent Integration
Receives WhatsApp messages -> Processes with AI -> Sends responses
"""

import logging
import json
from typing import Dict, Optional
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from core.models import Lead, LeadEvent, OutboundMessage
from .enhanced_smart_agent import get_enhanced_agent
from .whatsapp_ai_config import WhatsAppAIConfig

logger = logging.getLogger(__name__)


@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def whatsapp_ai_webhook(request):
    """
    WhatsApp webhook endpoint for incoming messages
    
    POST: Receive messages from customers
    GET: Verify webhook with WhatsApp
    
    Integration with enhanced LLM agent for human-like responses
    """
    
    if request.method == 'GET':
        # Webhook verification
        return _handle_webhook_verification(request)
    
    elif request.method == 'POST':
        # Incoming message
        return _handle_incoming_message(request)


def _handle_webhook_verification(request) -> Response:
    """Handle WhatsApp webhook verification"""
    verify_token = request.query_params.get('hub.verify_token')
    challenge = request.query_params.get('hub.challenge')
    
    # Verify token - in production, use environment variable
    WEBHOOK_VERIFY_TOKEN = os.getenv('WHATSAPP_WEBHOOK_VERIFY_TOKEN', 'trek_and_stay_verify')
    
    if verify_token != WEBHOOK_VERIFY_TOKEN:
        logger.warning(f"Invalid webhook token: {verify_token}")
        return Response(
            {'error': 'Invalid verification token'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    logger.info("✅ WhatsApp webhook verified")
    return Response(challenge, status=status.HTTP_200_OK)


def _handle_incoming_message(request) -> Response:
    """Handle incoming WhatsApp message"""
    try:
        data = request.data
        
        # Extract message data
        message_data = _extract_message_data(data)
        if not message_data:
            logger.warning(f"Could not extract message data: {data}")
            return Response({'status': 'ok'}, status=status.HTTP_200_OK)
        
        # Get enhanced agent
        agent = get_enhanced_agent()
        
        # Process message
        result = agent.process_customer_message(
            phone=message_data['phone'],
            message=message_data['text'],
            customer_name=message_data.get('customer_name'),
        )
        
        # Log result
        if result['success']:
            logger.info(f"✅ Message processed: {result['phone']} - Confidence: {result['confidence']:.0%}")
            
            # Send response via WhatsApp
            send_result = _send_whatsapp_response(
                phone=result['phone'],
                response=result['response'],
            )
            
            if send_result['success']:
                logger.info(f"✅ Response sent to {result['phone']}")
            else:
                logger.error(f"❌ Failed to send response: {send_result.get('error')}")
        else:
            logger.error(f"❌ Failed to process message: {result.get('error')}")
        
        # Always return 200 to acknowledge receipt
        return Response({'status': 'ok'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"❌ Webhook error: {e}", exc_info=True)
        return Response({'status': 'ok'}, status=status.HTTP_200_OK)  # Still return 200


def _extract_message_data(data: Dict) -> Optional[Dict]:
    """Extract message information from WhatsApp webhook payload"""
    try:
        # Navigate webhook structure
        # WhatsApp sends: data['entry'][0]['changes'][0]['value']['messages'][0]
        entry = data.get('entry', [{}])[0]
        changes = entry.get('changes', [{}])[0]
        value = changes.get('value', {})
        messages = value.get('messages', [])
        
        if not messages:
            return None
        
        message = messages[0]
        message_type = message.get('type', 'text')
        
        # Extract based on message type
        if message_type == 'text':
            text = message.get('text', {}).get('body', '')
        elif message_type == 'button':
            text = message.get('button', {}).get('text', '')
        elif message_type == 'interactive':
            # Interactive button response
            interactive = message.get('interactive', {})
            button_reply = interactive.get('button_reply', {})
            text = button_reply.get('title', '')
        else:
            text = ''
        
        if not text:
            logger.warning(f"No text content in message: {message_type}")
            return None
        
        # Extract phone and contact info
        from_number = message.get('from', '')
        contact_data = value.get('contacts', [{}])[0]
        contact_name = contact_data.get('profile', {}).get('name', f'Customer {from_number[-4:]}')
        
        return {
            'phone': from_number,
            'text': text.strip(),
            'message_type': message_type,
            'customer_name': contact_name,
            'message_id': message.get('id', ''),
            'timestamp': message.get('timestamp', ''),
        }
        
    except Exception as e:
        logger.error(f"Error extracting message data: {e}")
        return None


def _send_whatsapp_response(phone: str, response: str) -> Dict:
    """Send response back to customer via WhatsApp"""
    try:
        # Get WhatsApp provider
        from services.custom_whatsapp_provider import CustomWhatsAppProvider
        
        provider = CustomWhatsAppProvider()
        result = provider.send_message(phone, response)
        
        return {
            'success': result.get('success', False),
            'message_id': result.get('message_id', ''),
            'error': result.get('error', ''),
        }
        
    except Exception as e:
        logger.error(f"Error sending WhatsApp response: {e}")
        return {
            'success': False,
            'error': str(e),
        }


@api_view(['POST'])
@permission_classes([AllowAny])
def whatsapp_ai_send_test(request):
    """
    Test endpoint to manually send a WhatsApp message
    
    POST /api/whatsapp/ai-send-test/
    Body: {
        "phone": "919876543210",
        "message": "Hello, how are you?",
        "customer_name": "Test User"
    }
    """
    try:
        phone = request.data.get('phone')
        message = request.data.get('message')
        customer_name = request.data.get('customer_name')
        
        if not phone or not message:
            return Response(
                {'error': 'phone and message required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get agent and process
        agent = get_enhanced_agent()
        result = agent.process_customer_message(
            phone=phone,
            message=message,
            customer_name=customer_name,
        )
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in test endpoint: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def whatsapp_ai_status(request):
    """
    Check WhatsApp AI system status
    
    GET /api/whatsapp/ai-status/
    """
    config = WhatsAppAIConfig()
    config_status = config.get_config_status()
    is_valid = config.validate_config()
    
    return Response({
        'system_healthy': is_valid,
        'configuration': config_status,
        'timestamp': timezone.now().isoformat(),
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def whatsapp_ai_escalate(request):
    """
    Manually escalate a conversation
    
    POST /api/whatsapp/ai-escalate/
    Body: {
        "phone": "919876543210",
        "reason": "Customer requested human agent"
    }
    """
    try:
        phone = request.data.get('phone')
        reason = request.data.get('reason', 'Manual escalation')
        
        if not phone:
            return Response(
                {'error': 'phone required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        agent = get_enhanced_agent()
        result = agent.handle_escalation(
            phone=phone,
            reason=reason,
        )
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error escalating: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def whatsapp_ai_conversation_stats(request):
    """
    Get statistics for a conversation
    
    GET /api/whatsapp/ai-stats/?phone=919876543210
    """
    try:
        phone = request.query_params.get('phone')
        
        if not phone:
            return Response(
                {'error': 'phone required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        agent = get_enhanced_agent()
        stats = agent.get_conversation_stats(phone)
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Import os at top
import os
