"""
Admin API Views for Trip Management
Simple file upload endpoint for non-technical users
"""
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.utils.text import slugify
from django.utils import timezone
from django.db.models import Q, Count, Sum
from datetime import timedelta
from core.models import Trip, Lead, LeadEvent, Task, OutboundMessage, Payment, Booking
from services.whatsapp_api import WhatsAppAPI
import re


# Admin API Serializers
class AdminLeadSerializer(serializers.ModelSerializer):
    events = serializers.SerializerMethodField()
    tasks = serializers.SerializerMethodField()
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'status', 'stage',
            'source', 'is_whatsapp', 'intent_score', 'last_contact_at',
            'assigned_to', 'tags', 'metadata', 'created_at',
            'events', 'tasks', 'messages'
        ]

    def get_events(self, obj):
        events = obj.events.all()[:20]  # Last 20 events
        return AdminLeadEventSerializer(events, many=True).data

    def get_tasks(self, obj):
        tasks = obj.tasks.all()
        return AdminTaskSerializer(tasks, many=True).data

    def get_messages(self, obj):
        messages = obj.outbound_messages.all()[:10]  # Last 10 messages
        return AdminOutboundMessageSerializer(messages, many=True).data


class AdminLeadEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadEvent
        fields = ['id', 'type', 'channel', 'payload', 'created_at']


class AdminTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'type', 'status', 'title', 'notes', 'due_at', 'completed_at', 'owner']


class AdminOutboundMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutboundMessage
        fields = ['id', 'to', 'rendered_body', 'status', 'sent_at', 'error']


# Admin API ViewSets
class AdminLeadViewSet(viewsets.ModelViewSet):
    """API for admin lead management - replaces Firebase"""
    queryset = Lead.objects.all()
    serializer_class = AdminLeadSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        """Filter leads by stage, status, assigned user"""
        queryset = Lead.objects.all()

        # Filters
        stage = self.request.query_params.get('stage')
        status_filter = self.request.query_params.get('status')
        assigned_to = self.request.query_params.get('assigned_to')
        search = self.request.query_params.get('search')

        if stage:
            queryset = queryset.filter(stage=stage)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if assigned_to:
            queryset = queryset.filter(assigned_to__id=assigned_to)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )

        return queryset.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        """Get all leads with real-time stats"""
        response = super().list(request, *args, **kwargs)

        # Add stats
        total_leads = Lead.objects.count()
        hot_leads = Lead.objects.filter(qualification_score__qualification_status='hot').count()
        warm_leads = Lead.objects.filter(qualification_score__qualification_status='warm').count()

        response.data = {
            'leads': response.data,
            'stats': {
                'total': total_leads,
                'hot': hot_leads,
                'warm': warm_leads,
                'cold': total_leads - hot_leads - warm_leads,
            }
        }
        return response

    def retrieve(self, request, *args, **kwargs):
        """Get single lead with full context"""
        lead = self.get_object()
        serializer = self.get_serializer(lead)

        # Add related data
        data = serializer.data
        data['events'] = AdminLeadEventSerializer(
            lead.events.all()[:20], many=True
        ).data
        data['tasks'] = AdminTaskSerializer(
            lead.tasks.all(), many=True
        ).data
        data['messages'] = AdminOutboundMessageSerializer(
            lead.outbound_messages.all()[:10], many=True
        ).data

        return Response(data)

    def update(self, request, *args, **kwargs):
        """Update lead and create audit trail"""
        lead = self.get_object()
        old_stage = lead.stage

        response = super().update(request, *args, **kwargs)

        # Create event if stage changed
        if old_stage != lead.stage:
            LeadEvent.objects.create(
                lead=lead,
                type='status_change',
                payload={
                    'old_stage': old_stage,
                    'new_stage': lead.stage,
                    'changed_by': request.user.username
                }
            )

        return response


class AdminWhatsAppViewSet(viewsets.ViewSet):
    """WhatsApp conversation management for admin"""
    permission_classes = [IsAdminUser]

    @api_view(['GET'])
    def get_conversations(request):
        """Get all active conversations"""
        leads = Lead.objects.filter(is_whatsapp=True).order_by('-last_contact_at')

        conversations = []
        for lead in leads:
            last_message = lead.events.filter(
                type__in=['inbound_msg', 'outbound_msg']
            ).order_by('-created_at').first()

            conversations.append({
                'lead_id': lead.id,
                'name': lead.name,
                'phone': lead.phone,
                'last_message': last_message.payload.get('text') if last_message else '',
                'last_contact': lead.last_contact_at.isoformat() if lead.last_contact_at else None,
                'stage': lead.stage,
                'unread_count': lead.events.filter(
                    type='inbound_msg',
                    payload__read=False
                ).count()
            })

        return Response({
            'conversations': conversations,
            'total': len(conversations)
        })

    @api_view(['GET'])
    def get_conversation_messages(request, lead_id):
        """Get all messages for a conversation"""
        try:
            lead = Lead.objects.get(id=lead_id)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead not found'}, status=404)

        events = lead.events.filter(
            type__in=['inbound_msg', 'outbound_msg']
        ).order_by('created_at')

        messages = []
        for event in events:
            messages.append({
                'id': event.id,
                'type': 'inbound' if event.type == 'inbound_msg' else 'outbound',
                'text': event.payload.get('text', ''),
                'timestamp': event.created_at.isoformat(),
                'status': event.payload.get('status', 'delivered')
            })

        return Response({
            'lead': AdminLeadSerializer(lead).data,
            'messages': messages
        })

    @api_view(['POST'])
    def send_message(request, lead_id):
        """Send WhatsApp message to lead"""
        try:
            lead = Lead.objects.get(id=lead_id)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead not found'}, status=404)

        text = request.data.get('text')
        if not text:
            return Response({'error': 'Message text required'}, status=400)

        # Create outbound message
        message = OutboundMessage.objects.create(
            lead=lead,
            to=lead.phone,
            rendered_body=text,
            status='queued'
        )

        # Send via WhatsApp API
        try:
            api = WhatsAppAPI()
            result = api.send_message(lead.phone, text)

            if result.get('success'):
                message.status = 'sent'
                message.sent_at = timezone.now()
            else:
                message.status = 'failed'
                message.error = result.get('error', 'Unknown error')
        except Exception as e:
            message.status = 'failed'
            message.error = str(e)

        message.save()

        return Response({
            'success': True,
            'message': AdminOutboundMessageSerializer(message).data
        })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_admin_dashboard_stats(request):
    """Get comprehensive admin dashboard statistics"""
    from django.utils import timezone
    from datetime import timedelta

    # Time periods
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    # Lead stats
    total_leads = Lead.objects.count()
    new_leads_today = Lead.objects.filter(created_at__date=today).count()
    new_leads_week = Lead.objects.filter(created_at__date__gte=week_ago).count()

    # Qualification stats
    hot_leads = Lead.objects.filter(
        qualification_score__qualification_status='hot'
    ).count()
    warm_leads = Lead.objects.filter(
        qualification_score__qualification_status='warm'
    ).count()
    cold_leads = Lead.objects.filter(
        qualification_score__qualification_status='cold'
    ).count()

    # Conversion stats
    converted_leads = Lead.objects.filter(stage='completed').count()
    conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0

    # WhatsApp stats
    whatsapp_leads = Lead.objects.filter(is_whatsapp=True).count()
    messages_sent = OutboundMessage.objects.filter(
        created_at__date=today,
        status='sent'
    ).count()

    # Payment stats
    total_revenue = Payment.objects.filter(
        status='verified'
    ).aggregate(Sum('amount'))['amount__sum'] or 0

    # Task stats
    open_tasks = Task.objects.filter(status='open').count()
    overdue_tasks = Task.objects.filter(
        status='open',
        due_at__lt=timezone.now()
    ).count()

    return Response({
        'leads': {
            'total': total_leads,
            'new_today': new_leads_today,
            'new_week': new_leads_week,
            'hot': hot_leads,
            'warm': warm_leads,
            'cold': cold_leads,
            'converted': converted_leads,
            'conversion_rate': round(conversion_rate, 2),
        },
        'whatsapp': {
            'total_leads': whatsapp_leads,
            'messages_sent_today': messages_sent,
        },
        'revenue': {
            'total': float(total_revenue),
            'verified_payments': Payment.objects.filter(status='verified').count(),
        },
        'tasks': {
            'open': open_tasks,
            'overdue': overdue_tasks,
        }
    })


def parse_trip_text(content: str):
    """Parse simple text format into trip dictionaries"""
    trips = []
    current_trip = {}
    
    lines = content.split('\n')
    
    for line in lines:
        line = line.strip()
        
        # Skip comments and empty lines
        if not line or line.startswith('#'):
            continue
        
        # New trip marker
        if line == '---TRIP---':
            if current_trip:
                trips.append(current_trip)
            current_trip = {}
            continue
        
        # Parse key-value pairs
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip().upper()
            value = value.strip()
            
            if key == 'NAME':
                current_trip['name'] = value
            elif key == 'LOCATION':
                current_trip['location'] = value
            elif key == 'PRICE':
                try:
                    current_trip['price'] = float(value)
                except ValueError:
                    current_trip['price'] = 5000
            elif key == 'DURATION':
                current_trip['duration'] = value
                # Extract days if possible
                try:
                    days = int(value.split()[0])
                    current_trip['duration_days'] = days
                except:
                    current_trip['duration_days'] = 2
            elif key == 'DIFFICULTY':
                current_trip['difficulty'] = value
            elif key == 'CATEGORY':
                current_trip['category'] = value
            elif key == 'DESCRIPTION':
                current_trip['description'] = value
            elif key == 'HIGHLIGHTS':
                # Split by pipe |
                highlights = [h.strip() for h in value.split('|')]
                current_trip['highlights'] = highlights
            elif key == 'AVAILABLE_SEATS':
                try:
                    current_trip['available_seats'] = int(value)
                except ValueError:
                    current_trip['available_seats'] = 15
            elif key == 'IMAGE':
                current_trip['image'] = value
    
    # Add last trip
    if current_trip:
        trips.append(current_trip)
    
    return trips


@api_view(['POST'])
@permission_classes([IsAdminUser])
def upload_trips(request):
    """
    Upload trips from a simple text file
    
    POST /api/admin/upload-trips/
    Body: multipart/form-data with 'file' field
    """
    if 'file' not in request.FILES:
        return Response(
            {'success': False, 'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    uploaded_file = request.FILES['file']
    
    # Read file content
    try:
        content = uploaded_file.read().decode('utf-8')
    except UnicodeDecodeError:
        return Response(
            {'success': False, 'error': 'Invalid file encoding. Please use UTF-8 text file.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Parse trips
    try:
        trips_data = parse_trip_text(content)
    except Exception as e:
        return Response(
            {'success': False, 'error': f'Failed to parse file: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not trips_data:
        return Response(
            {'success': False, 'error': 'No trips found in file. Please check the format.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create/update trips in database
    created_count = 0
    updated_count = 0
    errors = []
    trip_results = []
    
    for trip_data in trips_data:
        if 'name' not in trip_data:
            errors.append('Skipped trip without name')
            continue
        
        try:
            # Check if trip already exists by name
            existing = Trip.objects.filter(name=trip_data['name']).first()
            
            # Prepare trip data matching the actual Django model
            trip_obj_data = {
                'name': trip_data.get('name', 'Unnamed Trip'),
                'location': trip_data.get('location', 'Karnataka'),
                'price': trip_data.get('price', 5000),
                'duration': trip_data.get('duration', '2 Days'),
                'spots_available': trip_data.get('available_seats', 15),
                'description': trip_data.get('description', ''),
                'highlights': trip_data.get('highlights', []),
                'images': [trip_data.get('image', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800')],
            }
            
            if existing:
                # Update existing trip
                for key, value in trip_obj_data.items():
                    setattr(existing, key, value)
                existing.save()
                updated_count += 1
                trip_results.append({'name': trip_obj_data['name'], 'status': 'updated'})
            else:
                # Create new trip
                Trip.objects.create(**trip_obj_data)
                created_count += 1
                trip_results.append({'name': trip_obj_data['name'], 'status': 'created'})
        
        except Exception as e:
            errors.append(f"Error creating {trip_data.get('name', 'unknown')}: {str(e)}")
    
    return Response({
        'success': True,
        'created': created_count,
        'updated': updated_count,
        'errors': errors,
        'trips': trip_results,
        'total': created_count + updated_count
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_trips_admin(request):
    """Get all trips for admin management"""
    trips = Trip.objects.all().order_by('-created_at')
    
    trips_data = []
    for trip in trips:
        trips_data.append({
            'id': trip.id,
            'name': trip.name,
            'location': trip.location,
            'price': float(trip.price),
            'duration': trip.duration,
            'spots_available': trip.spots_available,
            'description': trip.description[:100] if trip.description else '',
            'created_at': trip.created_at.isoformat() if hasattr(trip, 'created_at') else None,
        })
    
    return Response(trips_data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_trip(request, trip_id):
    """Delete a trip"""
    try:
        trip = Trip.objects.get(id=trip_id)
        trip_name = trip.name
        trip.delete()
        return Response({
            'success': True,
            'message': f'Trip "{trip_name}" deleted successfully'
        })
    except Trip.DoesNotExist:
        return Response(
            {'success': False, 'error': 'Trip not found'},
            status=status.HTTP_404_NOT_FOUND
        )
