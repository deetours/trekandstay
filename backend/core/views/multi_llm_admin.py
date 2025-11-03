from rest_framework.decorators import api_view
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from services.multi_llm_router import ZeroHumanMultiLLMSalesEngine
import asyncio

sales_engine = ZeroHumanMultiLLMSalesEngine()

@api_view(['GET'])
def llm_usage_dashboard(request):
    """Admin dashboard showing LLM usage statistics"""

    stats = sales_engine.get_llm_stats()

    return Response({
        'timestamp': stats['timestamp'],
        'total_calls': stats['total_calls'],
        'total_tokens_used': stats['total_tokens'],
        'cost_status': 'ZERO - All APIs on FREE tier',
        'llm_usage': {
            'writer_kimi': {
                'calls': stats['stats']['writer']['calls'],
                'tokens': stats['stats']['writer']['tokens'],
                'purpose': 'Sales Response Writing',
                'cost': 'FREE'
            },
            'analyzer_qwen': {
                'calls': stats['stats']['analyzer']['calls'],
                'tokens': stats['stats']['analyzer']['tokens'],
                'purpose': 'Intent Analysis',
                'cost': 'FREE'
            },
            'tracker_deepseek': {
                'calls': stats['stats']['tracker']['calls'],
                'tokens': stats['stats']['tracker']['tokens'],
                'purpose': 'Context Tracking',
                'cost': 'FREE'
            },
            'strategist_grok': {
                'calls': stats['stats']['strategist']['calls'],
                'tokens': stats['stats']['strategist']['tokens'],
                'purpose': 'Strategic Decisions',
                'cost': 'FREE'
            },
        },
        'availability': 'All LLMs available 24/7',
        'next_automation_run': '30 minutes',
    })

@api_view(['POST'])
def reset_llm_stats(request):
    """Reset LLM statistics"""
    sales_engine.llm_router.reset_stats()
    return Response({'success': True, 'message': 'LLM stats reset'})

@api_view(['POST'])
def test_llm_system(request):
    """Test the Multi-LLM system with a sample message"""

    test_phone = request.data.get('phone', '+919876543210')
    test_message = request.data.get('message', 'Hi! Do you have beginner treks?')

    try:
        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            sales_engine.process_incoming_message(
                phone=test_phone,
                message_text=test_message
            )
        )
        loop.close()

        return Response({
            'success': True,
            'test_result': result,
            'message': 'Test completed successfully'
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)