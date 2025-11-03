import asyncio
import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from services.multi_llm_router import ZeroHumanMultiLLMSalesEngine

logger = logging.getLogger(__name__)
sales_engine = ZeroHumanMultiLLMSalesEngine()

@csrf_exempt
@require_http_methods(["POST"])
async def whatsapp_incoming_webhook(request):
    """
    Webhook receiver for incoming WhatsApp messages
    Processes with Multi-LLM Zero-Human sales system
    """
    try:
        data = json.loads(request.body)

        # Extract message details
        sender_phone = data.get('sender_phone')
        message_text = data.get('message')
        lead_id = data.get('lead_id')

        if not sender_phone or not message_text:
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        logger.info(f"📱 Incoming WhatsApp from {sender_phone}: {message_text}")

        # Process with Multi-LLM sales engine
        result = await sales_engine.process_incoming_message(
            phone=sender_phone,
            message_text=message_text,
            lead_id=lead_id
        )

        logger.info(f"✅ Response sent: {result['response'][:50]}...")

        return JsonResponse({
            'success': True,
            'message': 'Processed and responded',
            'response': result['response'],
            'analysis': result['analysis'],
            'tracking': result['tracking'],
            'strategy': result['strategy']
        })

    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def whatsapp_incoming_webhook_sync(request):
    """
    Synchronous version for Django (if async not supported)
    """
    try:
        data = json.loads(request.body)

        sender_phone = data.get('sender_phone')
        message_text = data.get('message')
        lead_id = data.get('lead_id')

        if not sender_phone or not message_text:
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            sales_engine.process_incoming_message(
                phone=sender_phone,
                message_text=message_text,
                lead_id=lead_id
            )
        )
        loop.close()

        return JsonResponse({
            'success': True,
            'message': 'Processed and responded',
            'response': result['response']
        })

    except Exception as e:
        logger.error(f"Sync webhook error: {e}")
        return JsonResponse({'error': str(e)}, status=500)