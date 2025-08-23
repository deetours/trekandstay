from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
import json
import logging
from .services import rag_service
from .firestore_service import firestore_knowledge_service
from core.models import Trip, Story

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow everyone to use chat
def chat_query(request):
    """Handle chat queries from users"""
    try:
        data = request.data
        user_query = data.get('query', '').strip()
        
        if not user_query:
            return Response({'error': 'Query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Process query through RAG
        result = rag_service.query(user_query)
        
        # Add user context if logged in
        user_info = ""
        if request.user.is_authenticated:
            user_info = f"User: {request.user.username} (logged in)"
        else:
            user_info = "Anonymous user"
            
        logger.info(f"Chat query from {user_info}: {user_query[:50]}...")
        
        return Response({
            'query': result.query,
            'response': result.response,
            'context_count': len(result.context),
            'authenticated': request.user.is_authenticated,
            'sources': [
                {
                    'title': ctx['metadata'].get('title', 'Unknown'),
                    'type': ctx['metadata'].get('type', 'general'),
                    'similarity': ctx['similarity']
                }
                for ctx in result.context[:3]  # Return top 3 sources
            ]
        })
        
    except Exception as e:
        logger.error(f"Chat query error: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initialize_knowledge_base(request):
    """Initialize the knowledge base with current trips and stories data"""
    try:
        logger.info(f"Knowledge base initialization started by user: {request.user.username}")
        
        if not request.user.is_staff:
            logger.warning(f"Non-staff user {request.user.username} attempted to initialize knowledge base")
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all trips
        trips = Trip.objects.all()
        logger.info(f"Found {trips.count()} trips")
        trips_data = []
        
        for trip in trips:
            trip_data = {
                'id': trip.id,
                'title': trip.title,
                'location': trip.location,
                'duration': trip.duration,
                'price': trip.price,
                'description': trip.description,
                'highlights': trip.highlights or [],
                'included': trip.included or [],
                'difficulty': trip.difficulty,
                'itinerary': trip.itinerary or {}
            }
            trips_data.append(trip_data)
        
        # Get all approved stories
        stories = Story.objects.filter(status='approved')
        logger.info(f"Found {stories.count()} approved stories")
        
        for story in stories:
            story_data = {
                'id': f"story_{story.id}",
                'title': story.title,
                'content': f"Travel Story: {story.title}\n"
                         f"Location: {story.location}\n"
                         f"Author: {story.author.username}\n"
                         f"Story: {story.content}",
                'type': 'story'
            }
            trips_data.append(story_data)
        
        logger.info(f"Initializing RAG service with {len(trips_data)} total documents")
        # Initialize RAG service
        rag_service.initialize_with_trips_data(trips_data)
        
        return Response({
            'success': True,
            'message': f'Knowledge base initialized with {len(trips_data)} documents',
            'trips_count': len(trips),
            'stories_count': len(stories)
        })
        
    except Exception as e:
        logger.error(f"Knowledge base initialization error: {str(e)}", exc_info=True)
        return Response({'error': 'Failed to initialize knowledge base'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def chat_health(request):
    """Health check for RAG service"""
    try:
        # Simple test query
        test_result = rag_service.query("Hello")
        
        return Response({
            'status': 'healthy',
            'service': 'RAG Chat',
            'embedding_model': 'all-MiniLM-L6-v2',
            'vector_db': 'ChromaDB',
            'llm': 'OpenRouter API',
            'firestore_connected': firestore_knowledge_service.is_connected()
        })
        
    except Exception as e:
        return Response({
            'status': 'unhealthy',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_firestore(request):
    """Force sync knowledge base with Firestore data"""
    try:
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        logger.info(f"Firestore sync started by user: {request.user.username}")
        
        # Force sync with Firestore
        sync_result = rag_service.force_sync_firestore()
        
        return Response(sync_result)
        
    except Exception as e:
        logger.error(f"Firestore sync error: {str(e)}")
        return Response({'error': 'Failed to sync with Firestore'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def firestore_stats(request):
    """Get Firestore knowledge base statistics"""
    try:
        stats = firestore_knowledge_service.get_knowledge_stats()
        
        return Response({
            'firestore_connected': firestore_knowledge_service.is_connected(),
            'firestore_stats': stats,
            'vector_db_count': rag_service.collection.count(),
            'last_sync': rag_service.last_firestore_sync.isoformat() if rag_service.last_firestore_sync else None
        })
        
    except Exception as e:
        logger.error(f"Error getting Firestore stats: {str(e)}")
        return Response({'error': 'Failed to get statistics'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_firestore_faqs(request):
    """Test endpoint to add sample FAQs to Firestore (for development)"""
    try:
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        if not firestore_knowledge_service.is_connected():
            return Response({'error': 'Firestore not connected'}, status=status.HTTP_400_BAD_REQUEST)

        # Lazy import to avoid initializing firebase_admin at module import time
        from firebase_admin import firestore

        # Check if custom FAQs are provided in request
        custom_faqs = request.data.get('custom_faqs', [])
        
        if custom_faqs:
            # Use provided FAQs
            faqs_to_add = custom_faqs
            logger.info(f"Adding {len(custom_faqs)} custom FAQs")
        else:
            # Use default sample FAQs
            faqs_to_add = [
                {
                    'question': 'What should I pack for a trek?',
                    'answer': 'Essential items include sturdy hiking boots, comfortable clothing layers, water bottle, headlamp, rain gear, first aid kit, sunscreen, hat, and energy snacks. We provide a detailed packing list after booking.',
                    'category': 'preparation',
                    'active': True,
                    'priority': 1
                },
                {
                    'question': 'How do I book a trek?',
                    'answer': 'You can book through our website by selecting your desired trek, filling in your details, and making payment via UPI, card, or bank transfer. You will receive confirmation and trip details via email/WhatsApp.',
                    'category': 'booking',
                    'active': True,
                    'priority': 1
                },
                {
                    'question': 'What is the cancellation policy?',
                    'answer': 'Cancellations made 15+ days before trek: 85% refund. 7-14 days: 70% refund. 3-6 days: 50% refund. Less than 3 days: 25% refund. Weather cancellations receive full refund or reschedule option.',
                    'category': 'policy',
                    'active': True,
                    'priority': 2
                },
                {
                    'question': 'Are treks suitable for beginners?',
                    'answer': 'Yes! We offer treks for all skill levels. Easy treks (1-2 days) are perfect for beginners, while moderate and difficult treks require more experience. Each trek description includes difficulty level and requirements.',
                    'category': 'difficulty',
                    'active': True,
                    'priority': 1
                },
                {
                    'question': 'What safety measures do you take?',
                    'answer': 'We provide experienced guides, first aid kits, safety briefings, equipment checks, emergency communication devices, and comprehensive insurance. All guides are trained in wilderness first aid and emergency procedures.',
                    'category': 'safety',
                    'active': True,
                    'priority': 1
                }
            ]
        
        # Add FAQs to Firestore
        added_count = 0
        for faq_data in faqs_to_add:
            # Add timestamp if not present
            if 'updated_at' not in faq_data:
                faq_data['updated_at'] = firestore.SERVER_TIMESTAMP
            if 'created_at' not in faq_data:
                faq_data['created_at'] = firestore.SERVER_TIMESTAMP
            
            doc_ref = firestore_knowledge_service.db.collection('faqs').add(faq_data)
            added_count += 1
        
        return Response({
            'success': True,
            'message': f'Added {added_count} FAQs to Firestore',
            'added_count': added_count,
            'type': 'custom' if custom_faqs else 'sample'
        })
        
    except Exception as e:
        logger.error(f"Error adding FAQs: {str(e)}")
        return Response({'error': 'Failed to add FAQs'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
