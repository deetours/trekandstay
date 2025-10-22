"""
WhatsApp API Endpoints
======================

Custom WhatsApp provider endpoints for sending and receiving messages.
All endpoints return JSON responses.

Endpoints:
- POST /api/whatsapp-api/send/ - Send a message
- POST /api/whatsapp-api/receive/ - Receive a message
- GET /api/whatsapp-api/health/ - Health check
- POST /api/whatsapp-api/webhook/ - Webhook handler
- GET /api/whatsapp-api/status/{message_id}/ - Check message status
- GET /api/whatsapp-api/conversations/{phone}/ - Get conversation history
"""

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json
import logging
from datetime import datetime
import uuid
from functools import wraps

logger = logging.getLogger(__name__)


# ============================================================
# DECORATORS
# ============================================================

def handle_json_request(view_func):
    """Decorator to handle JSON request bodies"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        try:
            if request.method in ['POST', 'PUT']:
                request.data = json.loads(request.body) if request.body else {}
            else:
                request.data = {}
            return view_func(request, *args, **kwargs)
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON in request body'
            }, status=400)
    return wrapper


# ============================================================
# MAIN ENDPOINTS
# ============================================================

@csrf_exempt
@require_http_methods(["POST"])
@handle_json_request
def send_message(request):
    """
    POST /api/whatsapp-api/send/
    
    Send a WhatsApp message to a customer.
    
    Request:
    {
        "phone_number": "919876543210",
        "message_text": "Hello!",
        "message_type": "text" (optional),
        "media_url": "https://..." (optional)
    }
    
    Response:
    {
        "success": true,
        "message_id": "msg_abc123",
        "phone_number": "919876543210",
        "status": "sent",
        "timestamp": "2025-01-15T10:30:00Z"
    }
    """
    try:
        data = request.data
        
        phone_number = data.get('phone_number', '').strip()
        message_text = data.get('message_text', '').strip()
        message_id = data.get('message_id')
        message_type = data.get('message_type', 'text')
        media_url = data.get('media_url')
        
        # Validate input
        if not phone_number:
            return JsonResponse({
                'success': False,
                'error': 'phone_number is required'
            }, status=400)
        
        if not message_text and message_type == 'text':
            return JsonResponse({
                'success': False,
                'error': 'message_text is required'
            }, status=400)
        
        # Generate message ID if not provided
        if not message_id:
            message_id = f"msg_{uuid.uuid4().hex[:12]}"
        
        # Log the message
        logger.info(f"📨 WhatsApp OUT: {phone_number} | Type: {message_type} | Text: {message_text[:50]}")
        
        # TODO: Implement actual WhatsApp sending here
        # Example integrations:
        # - Twilio: twilio_client.messages.create(...)
        # - WASender: requests.post(wasender_api, ...)
        # - Meta: requests.post(meta_api, ...)
        
        # For now, just log and return success
        # In production, this would actually send the message
        
        return JsonResponse({
            'success': True,
            'message_id': message_id,
            'phone_number': phone_number,
            'status': 'sent',
            'timestamp': datetime.now().isoformat(),
            'message_type': message_type,
            'message': message_text[:100]
        })
    
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@handle_json_request
def receive_message(request):
    """
    POST /api/whatsapp-api/receive/
    
    Receive incoming message from customer.
    
    Request:
    {
        "phone_number": "919876543210",
        "message_text": "Tell me about treks",
        "message_id": "msg_123"
    }
    
    Response:
    {
        "success": true,
        "status": "received",
        "message_id": "msg_123"
    }
    """
    try:
        data = request.data
        
        phone_number = data.get('phone_number', '').strip()
        message_text = data.get('message_text', '').strip()
        message_id = data.get('message_id')
        
        if not phone_number:
            return JsonResponse({
                'success': False,
                'error': 'phone_number is required'
            }, status=400)
        
        if not message_text:
            return JsonResponse({
                'success': False,
                'error': 'message_text is required'
            }, status=400)
        
        # Log incoming message
        logger.info(f"📥 WhatsApp IN: {phone_number} | Text: {message_text[:50]}")
        
        # TODO: Process incoming message
        # - Save to database
        # - Trigger smart agent for auto-reply
        # - Send notification to admin
        
        return JsonResponse({
            'success': True,
            'status': 'received',
            'message_id': message_id or f"msg_{uuid.uuid4().hex[:12]}"
        })
    
    except Exception as e:
        logger.error(f"Error receiving message: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    GET /api/whatsapp-api/health/
    
    Check if the WhatsApp API is healthy and operational.
    
    Response:
    {
        "status": "healthy",
        "service": "Custom WhatsApp API",
        "version": "1.0",
        "timestamp": "2025-01-15T10:30:00Z"
    }
    """
    return JsonResponse({
        'status': 'healthy',
        'service': 'Custom WhatsApp API',
        'version': '1.0',
        'timestamp': datetime.now().isoformat(),
        'uptime': 'running'
    })


@csrf_exempt
@require_http_methods(["POST"])
@handle_json_request
def webhook_handler(request):
    """
    POST /api/whatsapp-api/webhook/
    
    Handle webhook events from WhatsApp provider.
    
    Supports event types:
    - message: Incoming message
    - delivery: Message delivered
    - read: Message read
    - status: Status update
    
    Request:
    {
        "type": "message",
        "phone_number": "919876543210",
        "message_text": "Hello",
        "timestamp": "2025-01-15T10:30:00Z"
    }
    
    Response:
    {
        "success": true,
        "status": "processed"
    }
    """
    try:
        data = request.data
        event_type = data.get('type', 'unknown')
        
        logger.info(f"🔔 Webhook Event: {event_type}")
        
        if event_type == 'message':
            # Process incoming message
            return receive_message(request)
        
        elif event_type == 'delivery':
            # Handle delivery confirmation
            message_id = data.get('message_id')
            logger.info(f"✓ Message delivered: {message_id}")
            return JsonResponse({
                'success': True,
                'status': 'processed',
                'type': 'delivery'
            })
        
        elif event_type == 'read':
            # Handle read receipt
            message_id = data.get('message_id')
            logger.info(f"✓✓ Message read: {message_id}")
            return JsonResponse({
                'success': True,
                'status': 'processed',
                'type': 'read'
            })
        
        elif event_type == 'status':
            # Handle status update
            status = data.get('status')
            logger.info(f"ℹ Status update: {status}")
            return JsonResponse({
                'success': True,
                'status': 'processed',
                'type': 'status'
            })
        
        else:
            return JsonResponse({
                'success': False,
                'error': f'Unknown event type: {event_type}'
            }, status=400)
    
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_message_status(request, message_id):
    """
    GET /api/whatsapp/status/{message_id}/
    
    Get the delivery status of a sent message.
    
    Response:
    {
        "message_id": "msg_123",
        "status": "delivered",
        "timestamp": "2025-01-15T10:30:00Z"
    }
    """
    try:
        # TODO: Query database for message status
        # For now, return mock status
        
        return JsonResponse({
            'message_id': message_id,
            'status': 'delivered',
            'timestamp': datetime.now().isoformat(),
            'phone_number': 'unknown'
        })
    
    except Exception as e:
        logger.error(f"Error getting status: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_conversation_history(request, phone_number):
    """
    GET /api/whatsapp/conversations/{phone_number}/
    
    Get conversation history with a customer.
    
    Query params:
    - limit: Number of messages to return (default: 50)
    
    Response:
    {
        "phone_number": "919876543210",
        "messages": [
            {
                "message_id": "msg_001",
                "text": "Hello",
                "from_user": true,
                "timestamp": "2025-01-15T10:30:00Z"
            }
        ]
    }
    """
    try:
        limit = int(request.GET.get('limit', 50))
        limit = min(limit, 100)  # Cap at 100
        
        # TODO: Query database for conversation history
        # For now, return empty list
        
        return JsonResponse({
            'phone_number': phone_number,
            'messages': [],
            'count': 0,
            'limit': limit
        })
    
    except Exception as e:
        logger.error(f"Error getting history: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def statistics(request):
    """
    GET /api/whatsapp/statistics/
    
    Get WhatsApp messaging statistics.
    
    Response:
    {
        "total_messages": 1523,
        "sent": 1450,
        "delivered": 1400,
        "failed": 23,
        "delivery_rate": 0.956
    }
    """
    try:
        # TODO: Calculate from database
        # For now, return mock stats
        
        return JsonResponse({
            'total_messages': 1523,
            'sent': 1450,
            'delivered': 1400,
            'failed': 23,
            'delivery_rate': 0.956,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
