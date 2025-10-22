"""
WhatsApp Webhook Receiver - Django View
Receives incoming messages from WhatsApp and processes them with SmartAgent

This is the entry point for all incoming customer messages.
"""

import json
import logging
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings

from services.smart_whatsapp_agent import SmartWhatsAppAgent
from services.custom_whatsapp_service import CustomWhatsAppService

logger = logging.getLogger(__name__)

# Initialize agent (once per server startup)
_agent_instance = None

def get_agent():
    """Get or create agent instance"""
    global _agent_instance
    
    if _agent_instance is None:
        # Determine provider from settings
        provider = getattr(settings, 'WHATSAPP_PROVIDER', 'mock')
        mode = getattr(settings, 'WHATSAPP_MODE', 'testing')
        
        logger.info(f"Initializing SmartWhatsAppAgent: Provider={provider}, Mode={mode}")
        
        _agent_instance = SmartWhatsAppAgent(
            whatsapp_provider=provider,
            mode=mode
        )
    
    return _agent_instance

# ============================================================
# WEBHOOK VERIFICATION
# ============================================================

@csrf_exempt
@require_http_methods(["GET"])
def whatsapp_webhook_verify(request):
    """
    Webhook verification endpoint
    
    WhatsApp providers (WASender, Twilio, etc) call this to verify
    that the webhook URL is valid and active.
    
    GET Parameters:
    - hub.mode: Should be 'subscribe'
    - hub.challenge: Random token to echo back
    - hub.verify_token: Your verification token
    
    Returns:
    - Echo back the challenge token to verify
    
    Example (WASender):
        GET https://yourserver.com/api/whatsapp/webhook/
        ?hub.mode=subscribe
        &hub.challenge=1234567890
        &hub.verify_token=your_secret_token
    """
    
    # Get parameters
    mode = request.GET.get('hub.mode')
    challenge = request.GET.get('hub.challenge')
    verify_token = request.GET.get('hub.verify_token')
    
    # Get expected token from settings
    expected_token = getattr(settings, 'WHATSAPP_WEBHOOK_TOKEN', 'your_secret_token')
    
    logger.info(f"Webhook verification attempt: mode={mode}, token_provided={verify_token is not None}")
    
    # Verify
    if mode == 'subscribe' and verify_token == expected_token:
        logger.info("✓ Webhook verified successfully")
        return HttpResponse(challenge, content_type='text/plain', status=200)
    else:
        logger.error(f"✗ Webhook verification failed: mode={mode}, token_match={verify_token == expected_token}")
        return HttpResponse('Forbidden', status=403)

# ============================================================
# MESSAGE RECEIVING
# ============================================================

@csrf_exempt
@require_http_methods(["POST"])
def whatsapp_webhook_receive(request):
    """
    Receive incoming WhatsApp messages
    
    This is called every time a customer sends a message.
    
    Flow:
    1. Receive webhook payload from WhatsApp provider
    2. Parse the message
    3. Send to SmartAgent
    4. Get smart reply
    5. Send reply to customer
    6. Log interaction
    
    Different providers send different payload formats, but
    SmartAgent handles all of them automatically.
    
    Returns:
    - JSON response confirming receipt
    
    Example (WASender webhook):
        POST https://yourserver.com/api/whatsapp/webhook/
        {
            "type": "message",
            "data": {
                "from": "919876543210",
                "body": "How much is Everest trek?"
            }
        }
    """
    
    try:
        # Parse JSON payload
        payload = json.loads(request.body)
        logger.info(f"Webhook received: {json.dumps(payload, indent=2)[:200]}...")
        
        # Get agent
        agent = get_agent()
        
        # Handle with agent (auto-replies to customer)
        result = agent.handle_webhook(payload)
        
        logger.info(f"Webhook processed: {result}")
        
        # Always return 200 to acknowledge receipt
        # (even if processing failed, we don't want provider to retry)
        return JsonResponse(result, status=200)
    
    except json.JSONDecodeError:
        logger.error("Invalid JSON in webhook")
        return JsonResponse({
            "success": False,
            "error": "Invalid JSON"
        }, status=400)
    
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}", exc_info=True)
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

# ============================================================
# API ENDPOINTS - Manual Message Sending
# ============================================================

@csrf_exempt
@require_http_methods(["POST"])
def send_whatsapp_message(request):
    """
    Manually send a WhatsApp message to customer
    
    POST body:
    {
        "phone": "919876543210",
        "message": "Hello! How can we help?",
        "customer_name": "Rahul"  # optional
    }
    
    Returns:
    {
        "success": true,
        "message_id": "msg_123",
        "status": "sent"
    }
    
    Example:
        curl -X POST http://localhost:8000/api/whatsapp/send/ \\
             -H "Content-Type: application/json" \\
             -d '{
                 "phone": "919876543210",
                 "message": "How much is Everest trek?"
             }'
    """
    
    try:
        payload = json.loads(request.body)
        
        phone = payload.get('phone')
        message = payload.get('message')
        customer_name = payload.get('customer_name')
        
        if not phone or not message:
            return JsonResponse({
                "success": False,
                "error": "Missing 'phone' or 'message'"
            }, status=400)
        
        # Use agent
        agent = get_agent()
        result = agent.handle_incoming_message(
            phone=phone,
            message=message,
            customer_name=customer_name
        )
        
        return JsonResponse({
            "success": result['success'],
            "message_id": result.get('message_id'),
            "processing_time_ms": result['processing_time_ms']
        }, status=200)
    
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

# ============================================================
# BULK SENDING - Auto-Reply Campaigns
# ============================================================

@csrf_exempt
@require_http_methods(["POST"])
def send_bulk_whatsapp_messages(request):
    """
    Send auto-reply campaign to multiple customers
    
    POST body:
    {
        "customers": [
            {"phone": "919876543210", "name": "Rahul"},
            {"phone": "919876543211", "name": "Priya"}
        ],
        "message": "Hi {name}! 🏔️ Special Everest trek offer!",
        "delay_between_messages": 3
    }
    
    Returns:
    {
        "success": true,
        "total_customers": 2,
        "success_count": 2,
        "results": [...]
    }
    
    Example:
        curl -X POST http://localhost:8000/api/whatsapp/bulk-send/ \\
             -H "Content-Type: application/json" \\
             -d '{
                 "customers": [
                     {"phone": "919876543210", "name": "Rahul"},
                     {"phone": "919876543211", "name": "Priya"}
                 ],
                 "message": "Hi {name}! Join our Everest trek!"
             }'
    """
    
    try:
        payload = json.loads(request.body)
        
        customers = payload.get('customers', [])
        message = payload.get('message', '')
        delay = payload.get('delay_between_messages', 3)
        
        if not customers or not message:
            return JsonResponse({
                "success": False,
                "error": "Missing 'customers' or 'message'"
            }, status=400)
        
        # Use agent
        agent = get_agent()
        results = agent.auto_reply_campaign(
            customers=customers,
            message_template=message,
            delay_between_messages=delay
        )
        
        success_count = sum(1 for r in results if r.get('status') == 'sent')
        
        return JsonResponse({
            "success": True,
            "total_customers": len(customers),
            "success_count": success_count,
            "results": results
        }, status=200)
    
    except Exception as e:
        logger.error(f"Error sending bulk messages: {str(e)}")
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

# ============================================================
# CONVERSATION HISTORY
# ============================================================

@require_http_methods(["GET"])
def get_conversation_history(request, phone):
    """
    Get all messages with a specific customer
    
    GET /api/whatsapp/conversations/{phone}/
    
    Returns:
    {
        "phone": "919876543210",
        "total_messages": 8,
        "total_exchanges": 4,
        "messages": [...]
    }
    
    Example:
        curl http://localhost:8000/api/whatsapp/conversations/919876543210/
    """
    
    try:
        agent = get_agent()
        history = agent.get_conversation_history(phone)
        summary = agent.get_conversation_summary(phone)
        
        return JsonResponse({
            "phone": phone,
            "total_messages": summary['total_messages'],
            "total_exchanges": summary['total_exchanges'],
            "messages": history
        }, status=200)
    
    except Exception as e:
        logger.error(f"Error getting conversation: {str(e)}")
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

# ============================================================
# HEALTH CHECK
# ============================================================

@require_http_methods(["GET"])
def whatsapp_health_check(request):
    """
    Health check endpoint
    
    GET /api/whatsapp/health/
    
    Returns service status and configuration
    """
    
    try:
        agent = get_agent()
        
        return JsonResponse({
            "status": "ok",
            "service": "SmartWhatsAppAgent",
            "mode": agent.mode,
            "whatsapp_provider": agent.whatsapp.provider,
            "rag_available": agent.services_ready,
            "timestamp": str(__import__('datetime').datetime.now())
        }, status=200)
    
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "error": str(e)
        }, status=500)
