from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import transaction, models
from django.db.models import Avg
from django.utils import timezone
import cloudinary.uploader as cloud_uploader
from .models import UserProfile, Booking, TripHistory, TripRecommendation, Lead, Author, Story, StoryImage, StoryAudio, StoryRating, Trip, Guide, Review, Wishlist, Payment, ChatFAQ, SeatLock, MessageTemplate, LeadEvent, OutboundMessage, Task
from .serializers import (
    UserProfileSerializer,
    BookingSerializer,
    TripHistorySerializer,
    TripRecommendationSerializer,
    LeadSerializer,
    AuthorSerializer,
    StorySerializer,
    StoryImageSerializer,
    StoryAudioSerializer,
    StoryRatingSerializer,
    TripSerializer,
    GuideSerializer,
    ReviewSerializer,
    WishlistSerializer,
    PaymentSerializer,
    ChatFAQSerializer,
    SeatLockSerializer,
    MessageTemplateSerializer,
    LeadEventSerializer,
    OutboundMessageSerializer,
    TaskSerializer,
)
from django.views.decorators.csrf import csrf_exempt
import os, re, math, json, requests
# --- added for embeddings hybrid ---
from .embeddings import semantic_search
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
try:
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests
except Exception:
    google_id_token = None
from .services import enqueue_template_message, change_lead_stage, merge_leads, run_abandoned_scan
from django.conf import settings
from django.db.models import Q
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all().order_by('-created_at')
    serializer_class = LeadSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user and user.is_authenticated:
            return qs.filter(user=user)
        return qs.none()

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        seat_lock_id = self.request.data.get('seat_lock')
        trip_id = self.request.data.get('trip')
        seats = int(self.request.data.get('seats') or 1)
        with transaction.atomic():
            trip = None
            if trip_id:
                trip = Trip.objects.select_for_update().filter(id=trip_id).first()
            seat_lock = None
            if seat_lock_id:
                try:
                    seat_lock = SeatLock.objects.select_for_update().get(id=seat_lock_id, user=user)
                except SeatLock.DoesNotExist:
                    raise ValueError('Invalid seat lock')
                # validate lock
                if seat_lock.status != 'active' or seat_lock.expires_at <= timezone.now():
                    raise ValueError('Seat lock expired')
                if trip and seat_lock.trip_id != trip.id:
                    raise ValueError('Seat lock trip mismatch')
                seats = seat_lock.seats
            amount = serializer.validated_data.get('amount')
            if not amount and trip:
                amount = trip.price * seats
            advance_ratio = 0.3
            advance_amount = round(float(amount) * advance_ratio, 2)
            balance_amount = round(float(amount) - advance_amount, 2)
            booking = serializer.save(user=user, trip=trip, seats=seats, advance_amount=advance_amount, balance_amount=balance_amount, amount=amount)
            # auto payment record for advance
            pay = Payment.objects.create(booking=booking, amount=advance_amount)
            # enqueue payment confirmation outbound message (Phase 1)
            try:
                if user and user.username:
                    template = MessageTemplate.objects.filter(name='payment_confirmation').first()
                    body = f"Payment link generated for booking #{booking.id} advance ₹{advance_amount}" if not template else template.body.replace('{{amount}}', str(advance_amount)).replace('{{booking_id}}', str(booking.id)).replace('{{trip_name}}', trip.name if trip else booking.destination)
                    OutboundMessage.objects.create(lead=None, to=user.username, template=template, rendered_body=body)
            except Exception:
                pass
            # mark seat lock released (kept but status)
            if seat_lock:
                seat_lock.status = 'released'
                seat_lock.save(update_fields=['status'])

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        trip_id = data.get('trip')
        trip_obj = None
        if trip_id:
            try:
                trip_obj = Trip.objects.filter(id=trip_id).first()
            except Exception:
                trip_obj = None
        if trip_obj and not data.get('destination'):
            data['destination'] = trip_obj.name
        if trip_obj and not data.get('amount'):
            data['amount'] = trip_obj.price
        if not data.get('status'):
            data['status'] = 'pending'
        logger.warning('DEBUG Booking create incoming data=%s user=%s', dict(data), request.user)
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            logger.error('DEBUG Booking validation errors=%s', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        logger.warning('DEBUG Booking created id=%s', serializer.instance.id)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get booking statistics for dashboard"""
        user = request.user
        bookings = self.get_queryset()
        
        stats = {
            'total': bookings.count(),
            'pending': bookings.filter(status='pending').count(),
            'confirmed': bookings.filter(status='confirmed').count(),
            'cancelled': bookings.filter(status='cancelled').count(),
            'completed': bookings.filter(status='completed').count(),
        }
        
        # Recent bookings
        recent = bookings.order_by('-created_at')[:5]
        
        return Response({
            'stats': stats,
            'recent_bookings': BookingSerializer(recent, many=True).data
        })

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        if booking.status == 'pending':
            booking.status = 'cancelled'
            booking.save(update_fields=['status'])
            return Response({'message': 'Booking cancelled successfully'})
        return Response({'error': 'Cannot cancel confirmed bookings'}, 
                       status=status.HTTP_400_BAD_REQUEST)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # filter by user's bookings
        qs = super().get_queryset()
        return qs.filter(booking__user=self.request.user)

    @action(detail=False, methods=['post'], url_path='create-upi-intent')
    def create_upi_intent(self, request):
        """
        Creates a Payment record for a booking and returns basic UPI payload the client can use
        to open a UPI intent URL and display a QR. This does not integrate with a PSP; it's a
        lightweight server record to reconcile later.
        Payload: { booking: <id>, amount: <decimal>, merchant_vpa?: string }
        """
        booking_id = request.data.get('booking')
        amount = request.data.get('amount')
        merchant_vpa = request.data.get('merchant_vpa') or 'trekandstay@ybl'
        if not booking_id or not amount:
            return Response({'detail': 'booking and amount are required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

        payment = Payment.objects.create(booking=booking, amount=amount, merchant_vpa=merchant_vpa)
        upi_url = f"upi://pay?pa={merchant_vpa}&pn=TrekAndStay&am={payment.amount}&cu=INR&tn=Booking%20{booking.id}"
        return Response({
            'payment': PaymentSerializer(payment).data,
            'upi': {
                'intent': upi_url,
                'vpa': merchant_vpa,
            }
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm_payment(self, request, pk=None):
        """
        Mark payment as paid, store optional upi_txn_id, and set booking status to 'confirmed'.
        Triggers WhatsApp confirmation via creating a Lead entry. The client can also call the
        /api/whatsapp/send/ endpoint afterward to notify the user.
        Payload: { upi_txn_id?: string, phone?: string }
        """
        payment = self.get_object()
        if payment.status == 'paid':
            return Response({'detail': 'Already confirmed'}, status=status.HTTP_200_OK)
        upi_txn_id = request.data.get('upi_txn_id', '')
        phone = request.data.get('phone')
        payment.status = 'paid'
        payment.upi_txn_id = upi_txn_id
        payment.save()

        # update booking
        booking = payment.booking
        booking.status = 'confirmed'
        booking.save()

        # Auto-create trip history if not exists
        try:
            if not TripHistory.objects.filter(user=request.user, destination=booking.destination, date=booking.date).exists():
                TripHistory.objects.create(user=request.user, destination=booking.destination, date=booking.date)
        except Exception:
            pass

        # Simple heuristic recommendations: pick 2 other trips same location prefix or random
        try:
            base_qs = Trip.objects.exclude(name=booking.destination)
            loc_prefix = booking.destination.split()[0]
            similar = base_qs.filter(location__icontains=loc_prefix)[:2]
            if not similar:
                similar = base_qs.order_by('-created_at')[:2]
            for t in similar:
                TripRecommendation.objects.get_or_create(
                    user=request.user,
                    destination=t.name,
                    defaults={'reason': f"Because you booked {booking.destination}", 'trip': t}
                )
        except Exception:
            pass

        # Create a lead for audit trail
        try:
            Lead.objects.create(
                name=request.user.username if request.user.is_authenticated else 'Payment Lead',
                phone=phone or '',
                source='whatsapp',
                is_whatsapp=True,
                message=f"Payment received for booking #{booking.id}, amount ₹{payment.amount}",
            )
        except Exception:
            pass

        return Response({'status': 'paid', 'booking_status': booking.status})

# --- New domain viewsets ---
class GuideViewSet(viewsets.ModelViewSet):
    queryset = Guide.objects.all().order_by('name')
    serializer_class = GuideSerializer

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().order_by('-created_at')
    serializer_class = TripSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer

# --- Stories ViewSets ---
class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all().order_by('-id')
    serializer_class = AuthorSerializer

class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.all().order_by('-created_at')
    serializer_class = StorySerializer

    def get_queryset(self):
        qs = super().get_queryset().annotate(avg_value=Avg('ratings__value')).order_by('-created_at')
        user = self.request.user
        include_pending = self.request.query_params.get('include_pending')
        if user.is_authenticated and user.is_staff and include_pending:
            return qs  # admin sees all when include_pending flag
        # public: only approved
        return qs.filter(status='approved')

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        orig_title = instance.title
        orig_dest = instance.destination
        orig_text = instance.text
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        story = serializer.save()  # status cannot be changed directly (read-only)
        content_changed = (
            (orig_title != story.title) or
            (orig_dest != story.destination) or
            (orig_text != story.text)
        )
        if content_changed and story.status == 'approved':
            # Reset to pending on content edits after approval
            story.status = 'pending'
            story.version = (story.version or 1) + 1
            story.approved_at = None
            story.approved_by = None
            story.rejection_reason = ''
            story.save(update_fields=['status', 'version', 'approved_at', 'approved_by', 'rejection_reason'])
        return Response(self.get_serializer(story).data)

    def retrieve(self, request, *args, **kwargs):
        story = self.get_object()
        # Restrict visibility if not approved
        if story.status != 'approved':
            user = request.user
            if not (user.is_authenticated and user.is_staff):
                return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        story.avg_value = story.ratings.aggregate(Avg('value')).get('value__avg')
        serializer = self.get_serializer(story)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='images')
    def upload_image(self, request, pk=None):
        story = self.get_object()
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            up = cloud_uploader.upload(file, folder=f"stories/{story.id}", resource_type='image')
            img = StoryImage.objects.create(story=story, url=up.get('secure_url'), public_id=up.get('public_id'))
            return Response(StoryImageSerializer(img).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='audio')
    def upload_audio(self, request, pk=None):
        story = self.get_object()
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            up = cloud_uploader.upload_large(file, folder=f"stories/{story.id}", resource_type='video')
            audio = StoryAudio.objects.create(story=story, url=up.get('secure_url'), public_id=up.get('public_id'))
            return Response(StoryAudioSerializer(audio).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        story = self.get_object()
        if story.status != 'approved':
            return Response({'detail': 'Cannot rate unapproved story'}, status=status.HTTP_403_FORBIDDEN)
        value = int(request.data.get('value', 0))
        if value < 1 or value > 5:
            return Response({'detail': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
        rating = StoryRating.objects.create(story=story, value=value)
        return Response(StoryRatingSerializer(rating).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='approve', permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        story = self.get_object()
        story.status = 'approved'
        story.rejection_reason = ''
        story.approved_by = request.user
        from django.utils import timezone
        story.approved_at = timezone.now()
        story.save(update_fields=['status', 'rejection_reason', 'approved_by', 'approved_at'])
        return Response(StorySerializer(story).data)

    @action(detail=True, methods=['post'], url_path='reject', permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        story = self.get_object()
        reason = request.data.get('reason') or 'Rejected'
        story.status = 'rejected'
        story.rejection_reason = reason[:250]
        story.save(update_fields=['status', 'rejection_reason'])
        return Response(StorySerializer(story).data)

class WishlistViewSet(viewsets.ModelViewSet):
    queryset = Wishlist.objects.all().order_by('-created_at')
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- New ViewSets for TripHistory and TripRecommendation ---
class TripHistoryViewSet(viewsets.ModelViewSet):
    queryset = TripHistory.objects.all().order_by('-date')
    serializer_class = TripHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TripRecommendationViewSet(viewsets.ModelViewSet):
    queryset = TripRecommendation.objects.all().order_by('-id')
    serializer_class = TripRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate personalized recommendations based on user activity"""
        user = request.user
        
        # Get user's booking history for preferences
        user_bookings = Booking.objects.filter(user=user)
        user_wishlist = Wishlist.objects.filter(user=user)
        
        # Simple recommendation logic based on user activity
        recommendations = []
        
        # If user has bookings, recommend similar trips
        if user_bookings.exists():
            # Get trips user hasn't booked
            booked_trip_ids = user_bookings.values_list('trip_id', flat=True)
            available_trips = Trip.objects.exclude(id__in=booked_trip_ids)[:3]
            
            for trip in available_trips:
                recommendation = TripRecommendation.objects.create(
                    user=user,
                    destination=trip.name,
                    reason=f"Based on your previous bookings, you might enjoy {trip.location}",
                    trip_id=trip.id
                )
                recommendations.append(recommendation)
        else:
            # New user - recommend popular trips
            popular_trips = Trip.objects.all()[:3]
            for trip in popular_trips:
                recommendation = TripRecommendation.objects.create(
                    user=user,
                    destination=trip.name,
                    reason="Popular destination perfect for first-time adventurers",
                    trip_id=trip.id
                )
                recommendations.append(recommendation)
        
        return Response({
            'message': f'Generated {len(recommendations)} recommendations',
            'recommendations': TripRecommendationSerializer(recommendations, many=True).data
        })

# --- New ViewSets for Lead management ---
class MessageTemplateViewSet(viewsets.ModelViewSet):
    queryset = MessageTemplate.objects.all().order_by('-created_at')
    serializer_class = MessageTemplateSerializer

class LeadEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LeadEventSerializer
    def get_queryset(self):
        lead_id = self.request.query_params.get('lead')
        qs = LeadEvent.objects.all()
        if lead_id:
            qs = qs.filter(lead_id=lead_id)
        return qs.order_by('-created_at')

class OutboundMessageViewSet(viewsets.ModelViewSet):
    queryset = OutboundMessage.objects.all().order_by('-created_at')
    serializer_class = OutboundMessageSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        msg = self.get_object()
        if msg.status not in ['failed']:
            return Response({'detail': 'Only failed messages can be retried'}, status=400)
        msg.status = 'queued'
        msg.error = ''
        msg.retries = 0
        msg.save(update_fields=['status', 'error', 'retries'])
        return Response({'detail': 'Requeued'})

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer
    http_method_names = ['get','post','patch','delete']

    def get_queryset(self):
        qs = super().get_queryset()
        lead_id = self.request.query_params.get('lead')
        if lead_id:
            qs = qs.filter(lead_id=lead_id)
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

# --- Inbound custom WhatsApp simulation (Phase 1) ---
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def custom_whatsapp_inbound(request):
    """Simulate inbound message: {"from":"+91...","text":"hi"} """
    phone = (request.data.get('from') or '').strip()
    text = (request.data.get('text') or '').strip()
    if not phone:
        return Response({'detail': 'from required'}, status=400)
    lead = Lead.objects.filter(phone=phone).first()
    created = False
    if not lead:
        lead = Lead.objects.create(name='Unknown', phone=phone, source='whatsapp', is_whatsapp=True, message=text, stage='new', metadata={'phone': phone})
        created = True
    # update stage simple rule
    if lead.stage == 'new':
        change_lead_stage(lead, 'engaged', 'first inbound message')
    lead.last_contact_at = timezone.now()
    lead.save(update_fields=['last_contact_at'])
    LeadEvent.objects.create(lead=lead, type='inbound_msg', payload={'text': text})
    if created:
        enqueue_template_message(lead, phone, 'welcome_first_contact', {
            'first_name': 'Traveler',
            'trip_name': lead.metadata.get('interest_trip','')
        })
    return Response({'status': 'recorded', 'lead_id': lead.id})

# --- Queue processor helper (synchronous simple) ---
@api_view(['POST'])
@permission_classes([AllowAny])
def process_outbound_queue(request):
    limit = int(request.data.get('limit') or 20)
    now = timezone.now()
    count = 0
    for msg in OutboundMessage.objects.select_for_update().filter(status='queued').filter(models.Q(scheduled_for__lte=now) | models.Q(scheduled_for__isnull=True))[:limit]:
        msg.status = 'sending'
        msg.save(update_fields=['status'])
        try:
            # simulate send success
            msg.status = 'sent'
            msg.sent_at = timezone.now()
            msg.save(update_fields=['status', 'sent_at'])
            LeadEvent.objects.create(lead=msg.lead, type='outbound_msg', payload={'body': msg.rendered_body})
            count += 1
        except Exception as e:
            msg.status = 'failed'
            msg.error = str(e)[:250]
            msg.retries += 1
            msg.save(update_fields=['status', 'error', 'retries'])
    return Response({'processed': count})

# --- Minimal WhatsApp Send endpoint: queues outbound message ---
@api_view(['POST'])
@permission_classes([AllowAny])
def whatsapp_send(request):
    """Queue a simple WhatsApp text by creating an OutboundMessage.
    Payload: {"phone": "+91...", "message": "text", "lead_id"?: number}
    """
    phone = (request.data.get('phone') or request.data.get('to') or '').strip()
    text = (request.data.get('message') or request.data.get('text') or '').strip()
    lead_id = request.data.get('lead_id')
    if not (phone and text):
        return Response({'detail': 'phone and message are required'}, status=400)
    lead = None
    if lead_id:
        try:
            lead = Lead.objects.get(id=lead_id)
        except Lead.DoesNotExist:
            lead = None
    msg = OutboundMessage.objects.create(lead=lead, to=phone, template=None, rendered_body=text)
    return Response({'status': 'queued', 'id': msg.id})

# --- Production WhatsApp Webhook (auto lead creation & enrichment) ---
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def whatsapp_webhook(request):
    """Handle Meta WhatsApp webhook simplified.
    Expected minimal JSON (already parsed upstream):
    {
      "from": "+91...",
      "text": "user message",
      "name": "Optional Name"
    }
    Creates/updates Lead; enriches basic intent; schedules next action.
    """
    phone = (request.data.get('from') or '').strip()
    text = (request.data.get('text') or '').strip()
    if not phone:
        return Response({'detail': 'from required'}, status=400)
    name = (request.data.get('name') or 'WhatsApp Lead').strip() or 'WhatsApp Lead'
    lead = Lead.objects.filter(phone=phone).first()
    created = False
    if not lead:
        lead = Lead.objects.create(
            name=name,
            phone=phone,
            source='whatsapp',
            is_whatsapp=True,
            message=text[:500],
            stage='new',
            metadata={'raw_first_message': text}
        )
        created = True
    else:
        # Append message to notes for quick view (truncate)
        combined = (lead.message or '') + f"\n{text}" if text else lead.message
        lead.message = (combined or '')[-4000:]
        lead.save(update_fields=['message'])
    # naive enrichment: detect trip keywords by name substring
    if text:
        trip_hit = Trip.objects.filter(name__iregex=r"(" + re.escape(text.split(' ')[0]) + r")").first()
        if trip_hit and (not lead.trip_id):
            lead.trip = trip_hit
            lead.metadata['interest_trip'] = trip_hit.name
            lead.save(update_fields=['trip', 'metadata'])
    # stage bump on first inbound after creation
    if created:
        change_lead_stage(lead, 'engaged', 'auto-engage on first inbound')
        # schedule follow-up in 2h
        lead.next_action_at = timezone.now() + timezone.timedelta(hours=2)
        lead.save(update_fields=['next_action_at'])
        LeadEvent.objects.create(lead=lead, type='created_auto', payload={'channel': 'whatsapp'})
        enqueue_template_message(lead, phone, 'welcome_first_contact', {
            'first_name': name.split(' ')[0],
            'trip_name': lead.metadata.get('interest_trip','')
        })
    else:
        lead.last_contact_at = timezone.now()
        lead.save(update_fields=['last_contact_at'])
        LeadEvent.objects.create(lead=lead, type='inbound_msg', payload={'text': text})
    # Identity merge: if anon lead exists with same anon_id passed in payload -> merge
    try:
        anon_id = (request.data.get('anon_id') or '').strip()
        if anon_id:
            anon_lead = Lead.objects.filter(metadata__anon_id=anon_id).exclude(id=lead.id).first()
            if anon_lead:
                merge_leads(lead, anon_lead)
    except Exception:
        pass
    return Response({'status': 'ok', 'lead_id': lead.id, 'new': created})

@api_view(['POST'])
@permission_classes([AllowAny])
def merge_identity(request):
    """Merge two leads by id (primary_id, secondary_id) or by (phone, anon_id)."""
    primary_id = request.data.get('primary_id')
    secondary_id = request.data.get('secondary_id')
    phone = (request.data.get('phone') or '').strip()
    anon_id = (request.data.get('anon_id') or '').strip()
    primary = None
    secondary = None
    if primary_id and secondary_id:
        primary = Lead.objects.filter(id=primary_id).first()
        secondary = Lead.objects.filter(id=secondary_id).first()
    elif phone and anon_id:
        primary = Lead.objects.filter(phone=phone).first()
        secondary = Lead.objects.filter(metadata__anon_id=anon_id).exclude(id=primary.id if primary else None).first()
    if not (primary and secondary):
        return Response({'detail':'Could not resolve both leads'}, status=400)
    merged = merge_leads(primary, secondary)
    return Response({'merged': merged, 'primary_id': primary.id})

@api_view(['POST'])
@permission_classes([AllowAny])
def trigger_abandoned_scan(request):
    count = run_abandoned_scan()
    return Response({'created_tasks': count})

# --- Generic tracking ingestion (Phase A) ---
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def track_events(request):
    """Ingest anonymous/engagement events.
    Body: {"events":[{type, ts?, anon_id, session_id, trip_id?, route_label?, url?, utm?:{source}, ...}]}
    Simplified Phase A: handles view_trip & click_book.
    """
    events = request.data.get('events') or []
    if not isinstance(events, list):
        return Response({'detail': 'events must be list'}, status=400)
    results = []
    for ev in events[:50]:  # cap batch size
        try:
            etype = (ev.get('type') or '').strip()
            if etype not in ['view_trip','click_book','route_select','exit_intent','booking_open','booking_close','booking_abandoned']:
                continue  # ignore unknown for now
            anon_id = (ev.get('anon_id') or '').strip()
            if not anon_id:
                continue
            trip_id = ev.get('trip_id')
            source = (ev.get('utm',{}) or {}).get('source') or 'web'
            # resolve lead by anon_id or existing phone/email later
            lead = Lead.objects.filter(metadata__anon_id=anon_id).first()
            created = False
            if not lead:
                lead = Lead.objects.create(name='Anonymous', source='web', stage='new', intent_score=0, metadata={'anon_id': anon_id, 'counters': {'trip_views':0,'book_clicks':0,'route_selects':0}, 'events': []})
                created = True
            meta = lead.metadata or {}
            counters = meta.get('counters') or {'trip_views':0,'book_clicks':0,'route_selects':0,'booking_opens':0,'booking_abandoned':0,'exit_intents':0}
            # increment counters
            if etype == 'view_trip':
                counters['trip_views'] += 1
            elif etype == 'click_book':
                counters['book_clicks'] += 1
            elif etype == 'route_select':
                counters['route_selects'] += 1
            elif etype == 'booking_open':
                counters['booking_opens'] += 1
                meta['last_booking_open_ts'] = ev.get('ts') or timezone.now().isoformat()
            elif etype == 'booking_abandoned':
                counters['booking_abandoned'] += 1
                meta['last_abandoned_ts'] = ev.get('ts') or timezone.now().isoformat()
            elif etype == 'exit_intent':
                counters['exit_intents'] = counters.get('exit_intents',0) + 1
            meta['counters'] = counters
            # append event (trim to last 30)
            ev_record = {'t': etype, 'ts': ev.get('ts') or timezone.now().isoformat(), 'trip': trip_id}
            events_list = meta.get('events') or []
            events_list.append(ev_record)
            if len(events_list) > 30:
                events_list = events_list[-30:]
            meta['events'] = events_list
            # first touch
            if 'first_touch' not in meta:
                meta['first_touch'] = {'ts': ev_record['ts'], 'source': source}
            meta['last_touch'] = {'ts': ev_record['ts'], 'source': source}
            # simple scoring adjustments
            score = lead.intent_score or 0
            if etype == 'view_trip' and counters['trip_views'] == 1:
                score += 5
            if etype == 'click_book':
                score += 10
            if etype == 'route_select' and counters['route_selects'] <= 3:
                score += 3
            if etype == 'booking_open':
                score += 4 if counters['booking_opens'] <= 2 else 1
            if etype == 'booking_abandoned':
                score += 2  # mild signal they were deep
            if etype == 'exit_intent':
                score += 1
            lead.intent_score = min(score, 255)
            lead.metadata = meta
            # stage promotion: new -> engaged if book click
            if etype in ['click_book','booking_open'] and lead.stage == 'new':
                change_lead_stage(lead, 'engaged', 'auto-engage book click')
            lead.save(update_fields=['intent_score','metadata','stage','updated_at'])
            if created:
                LeadEvent.objects.create(lead=lead, type='created_auto', payload={'via':'track','first_event': etype})
            results.append({'lead_id': lead.id, 'score': lead.intent_score, 'stage': lead.stage})
        except Exception as e:  # swallow individual event errors
            continue
    return Response({'ingested': len(results), 'items': results})

# --- Modified Retrieval with hybrid semantic + keyword ---
@api_view(['POST'])
@permission_classes([AllowAny])
def chat_retrieve(request):
    query = (request.data.get('query') or '').strip()
    top_k = int(request.data.get('top_k') or 5)
    if not query:
        return Response({'results': []})
    tokens = [t.lower() for t in re.findall(r"[\w']+", query) if len(t) > 2]

    def score(text: str, weight: float = 1.0):
        txt = (text or '').lower()
        if not txt:
            return 0.0
        freq = sum(txt.count(tok) for tok in tokens)
        return weight * freq / (1 + math.log(len(txt) + 10))

    docs = []
    for trip in Trip.objects.all()[:300]:
        snippet = (trip.description or '')[:400]
        s = score(trip.name, 3) + score(snippet, 1.2)
        if s > 0:
            docs.append({'id': f'trip:{trip.id}', 'type': 'trip', 'kw_score': s, 'title': trip.name, 'snippet': snippet})
    for story in Story.objects.all()[:300]:
        snippet = (story.text or '')[:400]
        s = score(story.title, 2) + score(snippet, 1.0)
        if s > 0:
            docs.append({'id': f'story:{story.id}', 'type': 'story', 'kw_score': s, 'title': story.title, 'snippet': snippet})
    for faq in ChatFAQ.objects.all()[:300]:
        snippet = (faq.answer or '')[:300]
        s = score(faq.question, 3) + score(snippet, 1.0)
        if s > 0:
            docs.append({'id': f'faq:{faq.id}', 'type': 'faq', 'kw_score': s, 'title': faq.question, 'snippet': snippet})

    # semantic layer
    semantic = semantic_search(query, top_k=top_k * 3)
    # map to id key
    sem_map = {(f"{r['object_type']}", r['object_id']): r for r in semantic}

    # merge scoring
    merged = []
    for d in docs:
        key = (d['type'], int(d['id'].split(':')[1]))
        vec_score = sem_map.get(key, {}).get('score_vec', 0.0)
        # hybrid weighting
        hybrid = 0.65 * vec_score + 0.35 * (d['kw_score'] / (d['kw_score'] + 5))
        d['score'] = hybrid
        d['vec_score'] = vec_score
        merged.append(d)
    # add purely semantic items not in keyword docs
    existing_keys = { (m['type'], int(m['id'].split(':')[1])) for m in merged }
    for key, r in sem_map.items():
        if key not in existing_keys:
            oid = r['object_id']
            merged.append({'id': f'{key[0]}:{oid}', 'type': key[0], 'title': r['text'][:60], 'snippet': r['text'][:400], 'score': 0.65 * r['score_vec'], 'vec_score': r['score_vec'], 'kw_score': 0})

    merged.sort(key=lambda x: x['score'], reverse=True)
    return Response({'results': merged[:top_k]})

SYSTEM_PROMPT = """You are Trek & Stay assistant. Be concise. Use only provided context. Cite sources like [Trip #id] or [FAQ #id]. If action is needed (wishlist, booking), output ONLY a JSON object: {\"tool\":\"name\",\"args\":{...}} with required ids. If info missing, ask user. Otherwise answer normally."""

# simple tool executor
TOOLS = {}

def tool(name):
    def wrap(fn):
        TOOLS[name] = fn
        return fn
    return wrap

@tool('add_to_wishlist')
def _add_to_wishlist(user, args):
    if not user or not user.is_authenticated:
        return {'error': 'auth_required'}
    trip_id = int(args.get('trip_id', 0))
    if not trip_id:
        return {'error': 'trip_id_required'}
    try:
        trip = Trip.objects.get(id=trip_id)
    except Trip.DoesNotExist:
        return {'error': 'trip_not_found'}
    Wishlist.objects.get_or_create(user=user, trip=trip)
    return {'status': 'ok', 'message': f'Added trip {trip_id} to wishlist'}

@tool('remove_from_wishlist')
def _remove_from_wishlist(user, args):
    if not user or not user.is_authenticated:
        return {'error': 'auth_required'}
    trip_id = int(args.get('trip_id', 0))
    if not trip_id:
        return {'error': 'trip_id_required'}
    Wishlist.objects.filter(user=user, trip_id=trip_id).delete()
    return {'status': 'ok', 'message': f'Removed trip {trip_id} from wishlist'}

@tool('list_wishlist')
def _list_wishlist(user, args):
    if not user or not user.is_authenticated:
        return {'error': 'auth_required'}
    items = [{'trip_id': w.trip_id, 'trip_name': w.trip.name} for w in Wishlist.objects.filter(user=user)[:50]]
    return {'status': 'ok', 'items': items}

@tool('book_trip')
def _book_trip(user, args):
    if not user or not user.is_authenticated:
        return {'error': 'auth_required'}
    trip_id = int(args.get('trip_id', 0))
    date = args.get('start_date')
    if not (trip_id and date):
        return {'error': 'missing_params'}
    try:
        trip = Trip.objects.get(id=trip_id)
    except Trip.DoesNotExist:
        return {'error': 'trip_not_found'}
    booking = Booking.objects.create(user=user, destination=trip.name, date=date, status='pending', amount=trip.price)
    return {'status': 'ok', 'booking_id': booking.id}

@tool('list_bookings')
def _list_bookings(user, args):
    if not user or not user.is_authenticated:
        return {'error': 'auth_required'}
    items = [{'id': b.id, 'destination': b.destination, 'date': b.date, 'status': b.status} for b in Booking.objects.filter(user=user).order_by('-id')[:50]]
    return {'status': 'ok', 'items': items}

@tool('cancel_booking')
def _cancel_booking(user, args):
    if not user or not user.is_authenticated:
        return {'error': 'auth_required'}
    booking_id = int(args.get('booking_id', 0))
    if not booking_id:
        return {'error': 'booking_id_required'}
    try:
        b = Booking.objects.get(id=booking_id, user=user)
    except Booking.DoesNotExist:
        return {'error': 'not_found'}
    b.status = 'cancelled'
    b.save()
    return {'status': 'ok', 'message': f'Cancelled booking {booking_id}'}

@api_view(['POST'])
@permission_classes([AllowAny])
def chat_complete(request):
    data = request.data
    messages_in = data.get('messages') or []
    use_retrieval = bool(data.get('use_retrieval', True))
    top_k = int(data.get('top_k') or 5)
    query = ''
    for m in reversed(messages_in):
        if m.get('role') == 'user':
            query = m.get('content','')
            break
    retrieved = []
    if use_retrieval and query:
        sub = chat_retrieve(request)
        retrieved = sub.data.get('results', []) if hasattr(sub, 'data') else []

    context_blocks = []
    for d in retrieved:
        context_blocks.append(f"[{d['id']}] {d['title']}: {d['snippet'][:350]}")
    context_text = '\n'.join(context_blocks)

    openrouter_key = os.getenv('OPENROUTER_API_KEY', '')
    model = os.getenv('OPENROUTER_MODEL', 'qwen/qwen-2.5-32b-instruct')
    user_messages = []
    for m in messages_in:
        role = m.get('role')
        if role not in ['user','assistant','system']:
            continue
        user_messages.append({'role': role, 'content': m.get('content','')})
    user_messages = [{'role': 'system', 'content': SYSTEM_PROMPT + (f"\n\nContext:\n{context_text}" if context_text else '')}] + user_messages

    # detect tool JSON last user message (client may pass through model output)
    tool_result = None
    last_assistant = next((m for m in reversed(messages_in) if m.get('role')=='assistant'), None)
    tool_call = None
    if last_assistant:
        txt = last_assistant.get('content','').strip()
        if txt.startswith('{') and txt.endswith('}'):
            try:
                parsed = json.loads(txt)
                if 'tool' in parsed and 'args' in parsed:
                    tool_call = parsed
            except Exception:
                pass
    if tool_call:
        name = tool_call['tool']
        fn = TOOLS.get(name)
        if fn:
            tool_result = fn(request.user, tool_call.get('args') or {})
            # append tool result for second LLM pass summarization
            user_messages.append({'role': 'assistant', 'content': f"TOOL_RESULT {json.dumps(tool_result)}"})
        else:
            tool_result = {'error': 'unknown_tool'}

    if not openrouter_key:
        return Response({'answer': 'LLM key not configured', 'sources': retrieved, 'tool_result': tool_result}, status=200)

    try:
        resp = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {openrouter_key}',
                'Content-Type': 'application/json',
            },
            json={
                'model': model,
                'messages': user_messages,
                'temperature': 0.4,
                'max_tokens': 700,
            }, timeout=40
        )
        if resp.status_code >= 400:
            return Response({'answer': f'Upstream error {resp.status_code}', 'sources': retrieved, 'tool_result': tool_result}, status=200)
        data_json = resp.json()
        answer = data_json.get('choices',[{}])[0].get('message',{}).get('content','')
    except Exception as e:
        answer = f'Error contacting model: {e}'

    return Response({'answer': answer, 'sources': retrieved, 'tool_result': tool_result})

# --- Auth helpers ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    try:
        profile = UserProfile.objects.get(user=user)
        completed_trips = profile.completed_trips or 0
        adventure_points = profile.adventure_points or 0
    except UserProfile.DoesNotExist:
        completed_trips = 0
        adventure_points = 0
    
    return Response({
        'id': user.id,
        'username': user.username,
        'name': user.first_name or user.username,
        'email': user.email,
        'is_staff': user.is_staff,
        'completedTrips': completed_trips,
        'adventurePoints': adventure_points,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """
    Dashboard summary endpoint providing aggregated user data
    """
    user = request.user
    
    # Get user profile data
    try:
        profile = UserProfile.objects.get(user=user)
        completed_trips = profile.completed_trips or 0
        adventure_points = profile.adventure_points or 0
    except UserProfile.DoesNotExist:
        completed_trips = 0
        adventure_points = 0
    
    # Get counts
    bookings_count = Booking.objects.filter(user=user).count()
    pending_bookings = Booking.objects.filter(user=user, status='pending').count()
    confirmed_bookings = Booking.objects.filter(user=user, status='confirmed').count()
    wishlist_count = Wishlist.objects.filter(user=user).count()
    recommendations_count = TripRecommendation.objects.filter(user=user).count()
    
    # Recent activity
    recent_bookings = Booking.objects.filter(user=user).order_by('-created_at')[:3]
    recent_wishlist = Wishlist.objects.filter(user=user).order_by('-created_at')[:3]
    
    return Response({
        'user': {
            'id': user.id,
            'name': user.first_name or user.username,
            'email': user.email,
            'completedTrips': completed_trips,
            'adventurePoints': adventure_points,
        },
        'stats': {
            'totalBookings': bookings_count,
            'pendingBookings': pending_bookings,
            'confirmedBookings': confirmed_bookings,
            'wishlistCount': wishlist_count,
            'recommendationsCount': recommendations_count,
            'completedTrips': completed_trips,
            'adventurePoints': adventure_points,
        },
        'recentActivity': {
            'bookings': BookingSerializer(recent_bookings, many=True).data,
            'wishlist': WishlistSerializer(recent_wishlist, many=True).data,
        }
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def auth_google(request):
    """Exchange Google ID token (credential) for local auth token.
    Payload: {"credential": "<google_jwt>"}
    """
    cred = request.data.get('credential')
    if not cred:
        return Response({'detail': 'credential required'}, status=400)
    if google_id_token is None:
        return Response({'detail': 'google-auth not installed'}, status=500)
    try:
        idinfo = google_id_token.verify_oauth2_token(cred, google_requests.Request())
        email = idinfo.get('email')
        if not email:
            return Response({'detail': 'email missing in token'}, status=400)
        user, _ = User.objects.get_or_create(username=email.split('@')[0], defaults={'email': email})
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': {'id': user.id, 'username': user.username, 'email': user.email}})
    except Exception as e:
        return Response({'detail': f'invalid token: {e}'}, status=400)

class SeatLockViewSet(viewsets.ModelViewSet):
    queryset = SeatLock.objects.all().order_by('-created_at')
    serializer_class = SeatLockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def perform_create(self, serializer):
        # not used directly; use acquire action
        raise RuntimeError('Use acquire action')

    @action(detail=False, methods=['post'], url_path='acquire')
    def acquire(self, request):
        trip_id = request.data.get('trip')
        seats = int(request.data.get('seats') or 1)
        if not trip_id:
            return Response({'detail': 'trip is required'}, status=status.HTTP_400_BAD_REQUEST)
        if seats < 1:
            return Response({'detail': 'seats must be >=1'}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            try:
                trip = Trip.objects.select_for_update().get(id=trip_id)
            except Trip.DoesNotExist:
                return Response({'detail': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)
            if trip.spots_available < seats:
                return Response({'detail': 'Not enough spots available'}, status=status.HTTP_409_CONFLICT)
            trip.spots_available -= seats
            trip.save(update_fields=['spots_available'])
            lock = SeatLock.objects.create(
                trip=trip,
                user=request.user,
                seats=seats,
                expires_at=timezone.now() + timezone.timedelta(minutes=5)
            )
            return Response(SeatLockSerializer(lock).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='refresh')
    def refresh(self, request, pk=None):
        try:
            lock = SeatLock.objects.get(id=pk, user=request.user)
        except SeatLock.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        if lock.status != 'active' or lock.expires_at <= timezone.now():
            return Response({'detail': 'Cannot refresh expired/released lock'}, status=status.HTTP_410_GONE)
        lock.expires_at = timezone.now() + timezone.timedelta(minutes=5)
        lock.save(update_fields=['expires_at'])
        return Response(SeatLockSerializer(lock).data)

    @action(detail=True, methods=['post'], url_path='release')
    def release(self, request, pk=None):
        try:
            lock = SeatLock.objects.select_for_update().get(id=pk, user=request.user)
        except SeatLock.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        with transaction.atomic():
            if lock.status == 'active':
                lock.status = 'released'
                lock.save(update_fields=['status'])
                lock.trip.spots_available = models.F('spots_available') + lock.seats
                lock.trip.save(update_fields=['spots_available'])
        return Response({'status': lock.status})


# =================== WhatsApp Integration ===================

@api_view(['POST'])
@csrf_exempt  
@permission_classes([AllowAny])
def whatsapp_incoming_webhook(request):
    """
    Receives incoming WhatsApp messages from WhatsApp API service
    """
    # Verify webhook token
    auth_token = request.headers.get('X-Webhook-Token')
    expected_token = getattr(settings, 'WHATSAPP_WEBHOOK_SECRET', 'shared-secret')
    
    if auth_token != expected_token:
        logger.warning(f"Unauthorized WhatsApp webhook attempt")
        return Response({'error': 'Unauthorized'}, status=401)
    
    try:
        payload = request.data
        session_id = payload.get('sessionId')
        from_number = payload.get('from', '').replace('@c.us', '')
        message_body = payload.get('body', '')
        message_type = payload.get('type')
        timestamp = payload.get('timestamp')
        message_id = payload.get('id')
        
        logger.info(f"WhatsApp message from {from_number}: {message_body}")
        
        # Create or get existing lead
        lead = create_or_update_lead_from_whatsapp(
            phone=from_number,
            message=message_body,
            session_id=session_id,
            message_id=message_id
        )
        
        # Process the message and trigger automation
        process_whatsapp_message(lead, message_body, message_type)
        
        return Response({'status': 'processed', 'lead_id': lead.id})
        
    except Exception as e:
        logger.error(f"WhatsApp webhook error: {str(e)}")
        return Response({'error': 'Processing failed'}, status=500)


def create_or_update_lead_from_whatsapp(phone, message, session_id, message_id=None):
    """
    Create or update lead from WhatsApp interaction
    """
    # Clean phone number
    clean_phone = re.sub(r'\D', '', phone)  # Remove non-digits
    
    # Try to find existing lead by phone or WhatsApp number
    lead = Lead.objects.filter(
        Q(phone=clean_phone) | 
        Q(whatsapp_number=clean_phone) | 
        Q(phone=phone) | 
        Q(whatsapp_number=phone)
    ).first()
    
    if not lead:
        # Create new lead
        lead = Lead.objects.create(
            phone=clean_phone,
            whatsapp_number=clean_phone,
            source='whatsapp',
            stage='inquiry',
            metadata={
                'first_message': message,
                'whatsapp_session': session_id,
                'contact_method': 'whatsapp',
                'first_contact': timezone.now().isoformat()
            }
        )
        
        # Create welcome task
        Task.objects.create(
            lead=lead,
            type='initial_contact',
            status='pending',
            due_at=timezone.now() + timedelta(hours=1),
            description=f'Follow up on WhatsApp inquiry: "{message[:50]}..."'
        )
        
        logger.info(f"Created new lead from WhatsApp: {lead.id}")
        
    else:
        # Update existing lead
        lead.metadata = lead.metadata or {}
        lead.metadata['last_whatsapp_message'] = message
        lead.metadata['last_whatsapp_contact'] = timezone.now().isoformat()
        lead.whatsapp_number = clean_phone  # Ensure WhatsApp number is set
        lead.save()
        
        logger.info(f"Updated existing lead from WhatsApp: {lead.id}")
    
    # Log the interaction
    LeadEvent.objects.create(
        lead=lead,
        event_type='whatsapp_message_received',
        metadata={
            'message': message,
            'session_id': session_id,
            'message_id': message_id,
            'platform': 'whatsapp',
            'from_number': phone
        }
    )
    
    return lead


def process_whatsapp_message(lead, message, message_type):
    """
    Analyze message and trigger appropriate responses
    """
    message_lower = message.lower()
    
    # Intent detection (simple keyword-based)
    if any(keyword in message_lower for keyword in ['book', 'booking', 'reserve', 'trip']):
        # Booking intent
        send_whatsapp_message(
            lead.whatsapp_number,
            "🏔️ Great! I'd love to help you with your booking. Which destination interests you?\n\n" +
            "Reply with:\n1️⃣ Mountain Adventures\n2️⃣ Beach Escapes\n3️⃣ Cultural Tours\n4️⃣ Wildlife Safari",
            session_id='customer_support'
        )
        if lead.stage == 'inquiry':
            change_lead_stage(lead, 'interested', 'Expressed booking interest via WhatsApp')
        
    elif any(keyword in message_lower for keyword in ['price', 'cost', 'how much', 'pricing']):
        # Pricing inquiry
        send_whatsapp_message(
            lead.whatsapp_number, 
            "💰 I'll send you our latest pricing! What type of experience and dates are you considering?\n\n" +
            "Our packages typically range from $299-$1999 depending on duration and destination.",
            session_id='customer_support'
        )
        if lead.stage == 'inquiry':
            change_lead_stage(lead, 'interested', 'Requested pricing via WhatsApp')
        
    elif any(keyword in message_lower for keyword in ['help', 'support', 'question', 'info']):
        # Support request
        send_whatsapp_message(
            lead.whatsapp_number,
            "🤝 I'm here to help! What can I assist you with today?\n\n" +
            "I can help with:\n• Trip bookings\n• Pricing information\n• Destination details\n• Payment options",
            session_id='customer_support'
        )
        
    elif any(keyword in message_lower for keyword in ['hi', 'hello', 'hey', 'good morning', 'good evening']):
        # Greeting
        if lead.stage == 'inquiry' or not lead.metadata.get('welcomed'):
            send_whatsapp_message(
                lead.whatsapp_number,
                f"👋 Hello! Welcome to our travel adventure service!\n\n" +
                "We specialize in creating unforgettable travel experiences. How can I help you explore the world today?",
                session_id='customer_support'
            )
            lead.metadata = lead.metadata or {}
            lead.metadata['welcomed'] = True
            lead.save()
        
    else:
        # Generic acknowledgment for other messages
        if lead.stage == 'inquiry' and not lead.metadata.get('first_response_sent'):
            send_whatsapp_message(
                lead.whatsapp_number,
                "🌟 Thanks for reaching out! We create amazing travel experiences and adventures.\n\n" +
                "How can I help you today? Feel free to ask about destinations, pricing, or bookings!",
                session_id='customer_support'
            )
            lead.metadata = lead.metadata or {}
            lead.metadata['first_response_sent'] = True
            lead.save()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_whatsapp_message_endpoint(request):
    """
    Internal endpoint for sending WhatsApp messages from admin/staff
    """
    try:
        phone = request.data.get('phone')
        message = request.data.get('message')
        session_id = request.data.get('session_id', 'customer_support')
        message_type = request.data.get('type', 'text')
        
        if not phone or not message:
            return Response({'error': 'Phone and message required'}, status=400)
        
        result = send_whatsapp_message(phone, message, session_id, message_type, **request.data)
        
        # Log the outbound message
        lead = Lead.objects.filter(Q(phone=phone) | Q(whatsapp_number=phone)).first()
        if lead:
            LeadEvent.objects.create(
                lead=lead,
                event_type='whatsapp_message_sent',
                metadata={
                    'message': message,
                    'session_id': session_id,
                    'sent_by': request.user.username,
                    'platform': 'whatsapp'
                }
            )
        
        return Response({'success': True, 'result': result})
        
    except Exception as e:
        logger.error(f"Failed to send WhatsApp message: {str(e)}")
        return Response({'error': str(e)}, status=500)


def send_whatsapp_message(phone, message, session_id='customer_support', message_type='text', **kwargs):
    """
    Send WhatsApp message via WhatsApp API service
    """
    # Get WhatsApp API settings
    api_url = getattr(settings, 'WHATSAPP_API_URL', 'http://localhost:4001')
    api_key = getattr(settings, 'WHATSAPP_API_KEY', 'change-me')
    
    # Clean phone number
    clean_phone = re.sub(r'\D', '', str(phone))
    
    payload = {
        'sessionId': session_id,
        'to': clean_phone,
        'type': message_type,
        'message': message,
        **kwargs
    }
    
    headers = {
        'X-API-Key': api_key,
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(
            f"{api_url}/send",
            json=payload,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        
        result = response.json()
        logger.info(f"WhatsApp message sent to {clean_phone}: {message[:50]}...")
        return result
        
    except requests.RequestException as e:
        logger.error(f"Failed to send WhatsApp message to {clean_phone}: {str(e)}")
        raise


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def whatsapp_sessions_status(request):
    """
    Get status of all WhatsApp sessions
    """
    try:
        api_url = getattr(settings, 'WHATSAPP_API_URL', 'http://localhost:4001')
        api_key = getattr(settings, 'WHATSAPP_API_KEY', 'change-me')
        
        sessions = ['customer_support', 'sales', 'payments', 'notifications']
        status_data = []
        
        for session_id in sessions:
            try:
                response = requests.get(
                    f"{api_url}/session-status?sessionId={session_id}",
                    headers={'X-API-Key': api_key},
                    timeout=10
                )
                if response.status_code == 200:
                    status_data.append(response.json())
                else:
                    status_data.append({
                        'sessionId': session_id,
                        'status': 'error',
                        'ready': False
                    })
            except:
                status_data.append({
                    'sessionId': session_id,
                    'status': 'unavailable',
                    'ready': False
                })
        
        return Response({'sessions': status_data})
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def capture_lead(request):
    """
    Capture lead from interactive popup with trip preferences
    """
    try:
        data = request.data
        
        # Extract lead data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        whatsapp = data.get('whatsapp', '').strip()
        budget = data.get('budget', [5000, 50000])
        preferred_dates = data.get('preferredDates', {})
        interested_trips = data.get('interested_trips', [])
        lead_source = data.get('leadSource', 'popup')
        current_page = data.get('currentPage', 'unknown')
        
        # Validation
        if not all([name, email, whatsapp]):
            return Response({
                'error': 'Name, email, and WhatsApp number are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Email validation
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return Response({
                'error': 'Please provide a valid email address'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # WhatsApp validation (10-digit Indian number)
        whatsapp_clean = re.sub(r'\D', '', whatsapp)
        if len(whatsapp_clean) != 10 or not whatsapp_clean.startswith(('6', '7', '8', '9')):
            return Response({
                'error': 'Please provide a valid 10-digit mobile number'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for existing lead
        existing_lead = Lead.objects.filter(
            Q(email=email) | Q(whatsapp_number=whatsapp_clean)
        ).first()
        
        if existing_lead:
            # Update existing lead with new preferences
            existing_lead.name = name
            existing_lead.metadata = existing_lead.metadata or {}
            existing_lead.metadata.update({
                'budget_range': budget,
                'preferred_dates': preferred_dates,
                'interested_trips': interested_trips,
                'lead_source': lead_source,
                'capture_page': current_page,
                'last_popup_submission': timezone.now().isoformat()
            })
            existing_lead.save()
            lead = existing_lead
        else:
            # Create new lead
            lead = Lead.objects.create(
                name=name,
                email=email,
                phone=whatsapp_clean,
                whatsapp_number=whatsapp_clean,
                source=f'popup_{current_page}',
                stage='interested',
                metadata={
                    'budget_range': budget,
                    'preferred_dates': preferred_dates,
                    'interested_trips': interested_trips,
                    'lead_source': lead_source,
                    'capture_page': current_page,
                    'popup_submission': timezone.now().isoformat()
                }
            )
        
        # Create lead event
        LeadEvent.objects.create(
            lead=lead,
            event_type='popup_form_submission',
            metadata={
                'form_data': {
                    'budget_range': budget,
                    'preferred_dates': preferred_dates,
                    'interested_trips': interested_trips,
                    'source_page': current_page
                },
                'submission_timestamp': timezone.now().isoformat()
            }
        )
        
        # Send welcome WhatsApp message
        try:
            welcome_message = f"""Hi {name}! 👋

Thank you for your interest in Trek and Stay adventures! 

Based on your preferences:
💰 Budget: ₹{budget[0]:,} - ₹{budget[1]:,}
{f'📅 Dates: {preferred_dates.get("startDate", "Flexible")}' if preferred_dates.get('startDate') else '📅 Dates: Flexible'}

Our travel expert will connect with you shortly to:
✅ Share personalized trip recommendations
✅ Provide detailed itineraries
✅ Assist with booking and planning

Reply anytime if you have questions! 🏔️

- Team Trek and Stay"""
            
            send_whatsapp_message(
                phone=whatsapp_clean,
                message=welcome_message,
                session_id='lead_capture'
            )
            
        except Exception as e:
            logger.warning(f"Failed to send welcome WhatsApp message: {str(e)}")
        
        # Send follow-up template message if available
        try:
            template = MessageTemplate.objects.filter(
                name='lead_capture_followup',
                active=True
            ).first()
            
            if template:
                enqueue_template_message(
                    lead_id=lead.id,
                    template_name='lead_capture_followup',
                    variables={
                        'name': name,
                        'budget_min': budget[0],
                        'budget_max': budget[1],
                        'trip_count': len(interested_trips)
                    },
                    scheduled_for=timezone.now() + timedelta(minutes=5)
                )
        except Exception as e:
            logger.warning(f"Failed to enqueue follow-up message: {str(e)}")
        
        return Response({
            'success': True,
            'message': 'Lead captured successfully',
            'lead_id': lead.id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Lead capture error: {str(e)}")
        return Response({
            'error': 'Failed to process lead capture'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
