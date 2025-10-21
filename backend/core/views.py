from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import transaction, models
from django.db.models import Avg
from django.utils import timezone
import cloudinary.uploader as cloud_uploader
from .models import UserProfile, Booking, TripHistory, TripRecommendation, Lead, Author, Story, StoryImage, StoryAudio, StoryRating, Trip, Guide, Review, Wishlist, Payment, ChatFAQ, SeatLock, MessageTemplate, LeadEvent, OutboundMessage, Task, PaymentVerificationLog, TransactionAudit, UserProgress, PointTransaction, Badge, BadgeUnlock, GamificationEvent, Challenge, UserChallengeProgress, LeadQualificationScore, LeadQualificationRule, LeadPrioritizationQueue
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


# ============================================
# PAYMENT VERIFICATION API ENDPOINTS
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def create_payment(request):
    """
    Create a payment record for a booking.
    Generates a reference number and UPI deep link.
    
    POST /api/payments/create/
    {
        "booking_id": 123,
        "amount": 5000,
        "customer_vpa": "customer@upi" (optional)
    }
    """
    try:
        booking_id = request.data.get('booking_id')
        amount = request.data.get('amount')
        customer_vpa = request.data.get('customer_vpa', '')
        
        if not booking_id or not amount:
            return Response({
                'error': 'booking_id and amount are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify booking exists
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({
                'error': 'Booking not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check for existing pending payment
        existing_payment = Payment.objects.filter(
            booking=booking,
            status__in=['pending', 'initiated', 'waiting']
        ).first()
        
        if existing_payment:
            return Response({
                'message': 'Payment already exists',
                'payment': PaymentSerializer(existing_payment).data
            }, status=status.HTTP_200_OK)
        
        # Create reference number
        reference_number = f"TAS{int(timezone.now().timestamp())}"
        
        # Calculate expiry (24 hours from now)
        expires_at = timezone.now() + timedelta(hours=24)
        
        # Create payment record
        payment = Payment.objects.create(
            booking=booking,
            amount=amount,
            customer_vpa=customer_vpa,
            reference_number=reference_number,
            expires_at=expires_at,
            status='pending'
        )
        
        # Calculate initial risk score
        payment.calculate_risk_score()
        payment.save()
        
        # Create audit trail
        TransactionAudit.objects.create(
            payment=payment,
            event_type='created',
            new_value='pending',
            details={'amount': float(amount)}
        )
        
        # Generate UPI deep link
        merchant_vpa = 'trekandstay@ybl'
        merchant_name = 'Trek and Stay Adventures'
        note = f"Advance booking - {booking.destination}"
        
        upi_link = f"upi://pay?pa={merchant_vpa}&pn={merchant_name}&am={int(amount)}&cu=INR&tn={note}&tr={reference_number}"
        
        logger.info(f"Payment created: {reference_number} for booking {booking_id}")
        
        return Response({
            'success': True,
            'payment': PaymentSerializer(payment).data,
            'upi_link': upi_link,
            'reference_number': reference_number,
            'expires_at': expires_at.isoformat()
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Payment creation error: {str(e)}")
        return Response({
            'error': 'Failed to create payment'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def initiate_payment(request):
    """
    Mark payment as initiated (user clicked pay button).
    Starts the verification timer.
    
    POST /api/payments/{payment_id}/initiate/
    """
    try:
        payment_id = request.data.get('payment_id')
        customer_vpa = request.data.get('customer_vpa', '')
        
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already expired
        if payment.is_expired():
            payment.status = 'expired'
            payment.save()
            return Response({
                'error': 'Payment window has expired. Please create a new payment.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payment.status = 'initiated'
        payment.payment_initiated_at = timezone.now()
        if customer_vpa:
            payment.customer_vpa = customer_vpa
        payment.save()
        
        # Create audit trail
        TransactionAudit.objects.create(
            payment=payment,
            event_type='status_changed',
            old_value='pending',
            new_value='initiated'
        )
        
        logger.info(f"Payment initiated: {payment.reference_number}")
        
        return Response({
            'success': True,
            'payment': PaymentSerializer(payment).data,
            'expires_at': payment.expires_at.isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Payment initiation error: {str(e)}")
        return Response({
            'error': 'Failed to initiate payment'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def submit_payment_proof(request):
    """
    User submits payment proof (screenshot or manual confirmation).
    Automatically marks as 'waiting' for verification.
    
    POST /api/payments/{payment_id}/submit-proof/
    {
        "upi_txn_id": "UPI123456789",
        "customer_vpa": "customer@upi",
        "proof_image_url": "https://..."  (optional)
    }
    """
    try:
        payment_id = request.data.get('payment_id')
        upi_txn_id = request.data.get('upi_txn_id', '')
        customer_vpa = request.data.get('customer_vpa', '')
        proof_image_url = request.data.get('proof_image_url', '')
        
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check expiry
        if payment.is_expired():
            payment.status = 'expired'
            payment.save()
            return Response({
                'error': 'Payment window has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update payment with submission details
        payment.upi_txn_id = upi_txn_id
        payment.customer_vpa = customer_vpa
        payment.status = 'waiting'
        payment.save()
        
        # Create verification log for manual review
        verification_log = PaymentVerificationLog.objects.create(
            payment=payment,
            method='user_proof',
            status='pending',
            proof_document=proof_image_url,
            notes=f"UPI TXN: {upi_txn_id}"
        )
        
        # Create audit trail
        TransactionAudit.objects.create(
            payment=payment,
            event_type='status_changed',
            old_value='initiated',
            new_value='waiting',
            details={'upi_txn_id': upi_txn_id}
        )
        
        # Send WhatsApp notification to admin/team
        try:
            booking = payment.booking
            admin_message = f"""
🔔 Payment Proof Received

Reference: {payment.reference_number}
Amount: ₹{payment.amount}
UPI TXN: {upi_txn_id}
Customer VPA: {customer_vpa}

Booking: {booking.destination}
Status: Awaiting verification

Please verify at admin dashboard.
            """
            # You would send this to your team via WhatsApp or email
        except Exception as e:
            logger.warning(f"Failed to send admin notification: {str(e)}")
        
        logger.info(f"Payment proof submitted: {payment.reference_number}")
        
        return Response({
            'success': True,
            'message': 'Payment proof received. We will verify it shortly.',
            'payment': PaymentSerializer(payment).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Payment proof submission error: {str(e)}")
        return Response({
            'error': 'Failed to submit payment proof'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """
    Admin endpoint to verify a payment.
    Only staff/admin users can verify payments.
    
    POST /api/payments/{payment_id}/verify/
    {
        "verified": true,
        "notes": "Payment verified manually",
        "confirmation_method": "manual/bank_api/sms"
    }
    """
    try:
        if not request.user.is_staff:
            return Response({
                'error': 'Only staff can verify payments'
            }, status=status.HTTP_403_FORBIDDEN)
        
        payment_id = request.data.get('payment_id')
        verified = request.data.get('verified', False)
        notes = request.data.get('notes', '')
        confirmation_method = request.data.get('confirmation_method', 'manual')
        
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if verified:
            payment.verification_status = 'verified'
            payment.status = 'verified'
            payment.verified_by = request.user
            payment.verification_timestamp = timezone.now()
            payment.verification_notes = notes
            payment.save()
            
            # Create verification log
            PaymentVerificationLog.objects.create(
                payment=payment,
                method=confirmation_method,
                status='verified',
                verified_by=request.user,
                notes=notes
            )
            
            # Create audit trail
            TransactionAudit.objects.create(
                payment=payment,
                event_type='verified',
                new_value='verified',
                details={'verified_by': request.user.username},
                created_by=request.user
            )
            
            logger.info(f"Payment verified: {payment.reference_number} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Payment verified successfully',
                'payment': PaymentSerializer(payment).data
            }, status=status.HTTP_200_OK)
        else:
            payment.verification_status = 'rejected'
            payment.status = 'failed'
            payment.verified_by = request.user
            payment.verification_timestamp = timezone.now()
            payment.verification_notes = notes
            payment.save()
            
            # Create verification log
            PaymentVerificationLog.objects.create(
                payment=payment,
                method=confirmation_method,
                status='rejected',
                verified_by=request.user,
                notes=notes
            )
            
            logger.warning(f"Payment rejected: {payment.reference_number} - {notes}")
            
            return Response({
                'success': True,
                'message': 'Payment rejected',
                'payment': PaymentSerializer(payment).data
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Payment verification error: {str(e)}")
        return Response({
            'error': 'Failed to verify payment'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_booking_after_payment(request):
    """
    Confirm booking and create order after payment is verified.
    Sends confirmation email and WhatsApp.
    
    POST /api/payments/{payment_id}/confirm-booking/
    """
    try:
        payment_id = request.data.get('payment_id')
        
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if payment.verification_status != 'verified':
            return Response({
                'error': 'Payment is not verified'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        booking = payment.booking
        
        # Update booking status
        booking.status = 'confirmed'
        booking.save()
        
        payment.booking_confirmed = True
        payment.payment_confirmed_at = timezone.now()
        payment.status = 'confirmed'
        payment.save()
        
        # Create audit trail
        TransactionAudit.objects.create(
            payment=payment,
            event_type='booked',
            new_value='confirmed',
            details={'booking_id': booking.id}
        )
        
        # Send confirmation email
        try:
            send_booking_confirmation_email(booking, payment)
            payment.confirmation_email_sent = True
            payment.save()
        except Exception as e:
            logger.warning(f"Failed to send confirmation email: {str(e)}")
        
        # Send WhatsApp confirmation
        try:
            send_booking_confirmation_whatsapp(booking, payment)
            payment.confirmation_whatsapp_sent = True
            payment.save()
        except Exception as e:
            logger.warning(f"Failed to send WhatsApp confirmation: {str(e)}")
        
        logger.info(f"Booking confirmed: {booking.id} - Payment {payment.reference_number}")
        
        return Response({
            'success': True,
            'message': 'Booking confirmed successfully',
            'booking': BookingSerializer(booking).data,
            'payment': PaymentSerializer(payment).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Booking confirmation error: {str(e)}")
        return Response({
            'error': 'Failed to confirm booking'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_payments(request):
    """
    Get all pending payments for verification dashboard.
    Only staff can access.
    
    GET /api/payments/pending/
    """
    try:
        if not request.user.is_staff:
            return Response({
                'error': 'Only staff can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get pending payments sorted by risk level
        payments = Payment.objects.filter(
            verification_status='pending'
        ).select_related('booking').order_by('-risk_score', '-created_at')
        
        # Group by risk level
        high_risk = payments.filter(risk_level__in=['high', 'fraud'])
        medium_risk = payments.filter(risk_level='medium')
        low_risk = payments.filter(risk_level='low')
        
        return Response({
            'high_risk': PaymentSerializer(high_risk, many=True).data,
            'medium_risk': PaymentSerializer(medium_risk, many=True).data,
            'low_risk': PaymentSerializer(low_risk, many=True).data,
            'total_pending': payments.count(),
            'high_risk_count': high_risk.count(),
            'total_amount_pending': float(payments.aggregate(total=models.Sum('amount'))['total'] or 0)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Get pending payments error: {str(e)}")
        return Response({
            'error': 'Failed to retrieve pending payments'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_payment_status(request):
    """
    Check payment status (for user to poll).
    
    GET /api/payments/{payment_id}/status/
    """
    try:
        payment_id = request.query_params.get('payment_id')
        reference_number = request.query_params.get('reference')
        
        try:
            if payment_id:
                payment = Payment.objects.get(id=payment_id)
            elif reference_number:
                payment = Payment.objects.get(reference_number=reference_number)
            else:
                return Response({
                    'error': 'payment_id or reference is required'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check expiry
        if payment.is_expired() and payment.status != 'confirmed':
            payment.status = 'expired'
            payment.save()
        
        return Response({
            'payment': PaymentSerializer(payment).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Get payment status error: {str(e)}")
        return Response({
            'error': 'Failed to retrieve payment status'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Helper functions for email and WhatsApp
def send_booking_confirmation_email(booking, payment):
    """Send booking confirmation email"""
    # This would integrate with SendGrid or similar
    pass

def send_booking_confirmation_whatsapp(booking, payment):
    """Send booking confirmation via WhatsApp"""
    # This would integrate with WhatsApp Business API
    pass


# ============================================
# GAMIFICATION API ENDPOINTS
# ============================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_progress(request):
    """
    Get or update user progress/gamification data.
    
    GET /api/user/progress/
    Returns: {
        points, level, badges, totalBookings, streak, challenges
    }
    
    POST /api/user/progress/update-event/
    Accepts: {
        event_type: 'trip_view' | 'booking_completed' | etc,
        trip_id: 123 (optional),
        booking_id: 456 (optional),
        metadata: {} (optional)
    }
    """
    try:
        # Get or create user progress
        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            defaults={
                'points': 0,
                'level': 1,
                'badges': [],
                'completed_challenges': []
            }
        )
        
        if request.method == 'GET':
            # Get user progress with full details
            from .serializers import UserProgressSerializer
            
            # Get active challenges
            active_challenges = UserChallengeProgress.objects.filter(
                user=request.user,
                completed=False,
                challenge__is_active=True
            ).select_related('challenge')
            
            challenge_data = [
                {
                    'id': cp.challenge.id,
                    'name': cp.challenge.name,
                    'current_progress': cp.current_progress,
                    'target': cp.challenge.target_count,
                    'reward': cp.challenge.reward_points,
                    'completed': cp.completed
                }
                for cp in active_challenges
            ]
            
            # Get recent badges
            recent_badges = BadgeUnlock.objects.filter(
                user=request.user
            ).order_by('-unlocked_at')[:5]
            
            return Response({
                'success': True,
                'progress': {
                    'points': progress.points,
                    'level': progress.level,
                    'totalEarnedPoints': progress.total_earned_points,
                    'badges': progress.badges,
                    'completedChallenges': progress.completed_challenges,
                    'dailyStreak': progress.daily_streak,
                    'totalBookings': progress.total_bookings,
                    'totalTripViews': progress.total_trip_views,
                    'totalShares': progress.total_shares,
                    'totalReviews': progress.total_reviews,
                },
                'activeChallenges': challenge_data,
                'recentBadges': [
                    {
                        'id': b.badge_id,
                        'unlockedAt': b.unlocked_at.isoformat()
                    }
                    for b in recent_badges
                ],
                'pointsToNextLevel': progress.calculate_level() - progress.level
            }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"User progress error: {str(e)}")
        return Response({
            'error': 'Failed to retrieve user progress'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def track_gamification_event(request):
    """
    Track a gamification event and award points.
    
    POST /api/gamification/track-event/
    {
        "event_type": "trip_view",
        "user_id": 123 (optional - for auth users),
        "guest_id": "guest_123" (for anonymous users),
        "trip_id": 456 (optional),
        "booking_id": 789 (optional),
        "metadata": { "custom": "data" }
    }
    """
    try:
        event_type = request.data.get('event_type')
        user_id = request.data.get('user_id')
        guest_id = request.data.get('guest_id')
        trip_id = request.data.get('trip_id')
        booking_id = request.data.get('booking_id')
        metadata = request.data.get('metadata', {})
        
        if not event_type:
            return Response({
                'error': 'event_type is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user if authenticated
        user = None
        if request.user.is_authenticated:
            user = request.user
        elif user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                pass
        
        # Get related objects
        trip = None
        booking = None
        if trip_id:
            try:
                trip = Trip.objects.get(id=trip_id)
            except Trip.DoesNotExist:
                pass
        if booking_id:
            try:
                booking = Booking.objects.get(id=booking_id)
            except Booking.DoesNotExist:
                pass
        
        # Point allocation based on event type
        points_map = {
            'trip_view': 5,
            'trip_bookmark': 10,
            'booking_started': 15,
            'booking_completed': 200,
            'review_written': 50,
            'trip_shared': 20,
            'referral_sent': 100,
            'daily_login': 10,
            'lead_submitted': 25,
            'challenge_completed': 150,
        }
        
        points_awarded = points_map.get(event_type, 0)
        badges_unlocked = []
        
        # Create gamification event record
        gam_event = GamificationEvent.objects.create(
            user=user,
            guest_id=guest_id or '',
            event_type=event_type,
            trip=trip,
            booking=booking,
            points_awarded=points_awarded,
            metadata=metadata
        )
        
        # Award points if user exists
        if user:
            progress, _ = UserProgress.objects.get_or_create(user=user)
            
            # Update event counters
            if event_type == 'trip_view':
                progress.total_trip_views += 1
            elif event_type == 'booking_completed':
                progress.total_bookings += 1
            elif event_type == 'review_written':
                progress.total_reviews += 1
            elif event_type == 'trip_shared':
                progress.total_shares += 1
            
            # Update daily streak
            today = timezone.now().date()
            if progress.last_activity_date != today:
                if progress.last_activity_date == (today - timezone.timedelta(days=1)):
                    progress.daily_streak += 1
                else:
                    progress.daily_streak = 1
                progress.last_activity_date = today
            
            # Award points and check for level up
            leveled_up = progress.add_points(points_awarded, event_type)
            
            # Check badge unlocks
            badges_unlocked = check_badge_unlocks(user, progress)
            
            if badges_unlocked:
                gam_event.badges_unlocked = [b.id for b in badges_unlocked]
                gam_event.save(update_fields=['badges_unlocked'])
            
            # Update challenge progress
            update_user_challenges(user, event_type)
            
            logger.info(f"Gamification event: {user.username} - {event_type} +{points_awarded}pts (L{progress.level})")
        
        return Response({
            'success': True,
            'pointsAwarded': points_awarded,
            'badgesUnlocked': [b.id for b in badges_unlocked],
            'eventId': gam_event.id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Gamification tracking error: {str(e)}")
        return Response({
            'error': 'Failed to track event'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leaderboard(request):
    """
    Get global leaderboard.
    
    GET /api/gamification/leaderboard/?limit=100&timeframe=alltime
    Timeframe: 'week' | 'month' | 'alltime'
    """
    try:
        limit = min(int(request.query_params.get('limit', 100)), 1000)
        timeframe = request.query_params.get('timeframe', 'alltime')
        
        query = UserProgress.objects.select_related('user').order_by('-points')
        
        # Filter by timeframe
        if timeframe == 'week':
            week_ago = timezone.now() - timezone.timedelta(days=7)
            query = query.filter(updated_at__gte=week_ago)
        elif timeframe == 'month':
            month_ago = timezone.now() - timezone.timedelta(days=30)
            query = query.filter(updated_at__gte=month_ago)
        
        leaderboard = query[:limit]
        
        # Add ranking
        data = []
        for idx, entry in enumerate(leaderboard, 1):
            data.append({
                'rank': idx,
                'userId': entry.user.id,
                'username': entry.user.username,
                'points': entry.points,
                'level': entry.level,
                'badgeCount': len(entry.badges),
                'totalBookings': entry.total_bookings,
            })
        
        # Get user's ranking
        user_rank = UserProgress.objects.filter(
            points__gt=request.user.progress.points
        ).count() + 1
        
        return Response({
            'success': True,
            'leaderboard': data,
            'userRank': user_rank,
            'timeframe': timeframe
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Leaderboard error: {str(e)}")
        return Response({
            'error': 'Failed to retrieve leaderboard'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_badges(request):
    """
    Get all available badges and user's badge progress.
    
    GET /api/gamification/badges/
    """
    try:
        all_badges = Badge.objects.all()
        user_badges = BadgeUnlock.objects.filter(user=request.user).values_list('badge_id', flat=True)
        
        badges_data = []
        for badge in all_badges:
            badges_data.append({
                'id': badge.id,
                'name': badge.name,
                'description': badge.description,
                'icon': badge.icon_name,
                'points': badge.points_reward,
                'rarity': badge.rarity,
                'unlocked': badge.id in user_badges,
                'category': badge.category,
            })
        
        return Response({
            'success': True,
            'badges': badges_data,
            'unlockedCount': len(user_badges)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Get badges error: {str(e)}")
        return Response({
            'error': 'Failed to retrieve badges'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_challenge_reward(request):
    """
    Claim reward for completed challenge.
    
    POST /api/gamification/challenges/{challenge_id}/claim/
    """
    try:
        challenge_id = request.data.get('challenge_id')
        
        try:
            progress = UserChallengeProgress.objects.get(
                user=request.user,
                challenge_id=challenge_id
            )
        except UserChallengeProgress.DoesNotExist:
            return Response({
                'error': 'Challenge progress not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not progress.completed:
            return Response({
                'error': 'Challenge not completed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if progress.reward_claimed:
            return Response({
                'error': 'Reward already claimed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Award points
        user_progress = UserProgress.objects.get(user=request.user)
        user_progress.add_points(progress.challenge.reward_points, 'challenge_completed')
        
        # Mark reward as claimed
        progress.reward_claimed = True
        progress.claimed_at = timezone.now()
        progress.save()
        
        return Response({
            'success': True,
            'pointsAwarded': progress.challenge.reward_points,
            'message': 'Challenge reward claimed!'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Claim challenge reward error: {str(e)}")
        return Response({
            'error': 'Failed to claim reward'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================
# GAMIFICATION HELPER FUNCTIONS
# ============================================

def check_badge_unlocks(user, progress):
    """Check if user has unlocked any new badges"""
    unlocked_badges = []
    already_unlocked = set(BadgeUnlock.objects.filter(user=user).values_list('badge_id', flat=True))
    
    # Define unlock conditions
    conditions = {
        'explorer': lambda p: p.total_trip_views >= 5,
        'early-bird': lambda p: p.total_bookings >= 1,  # Would need booking date check in real scenario
        'social-butterfly': lambda p: p.total_shares >= 3,
        'photographer': lambda p: p.total_reviews >= 10,  # Placeholder
        'summit-master': lambda p: p.total_bookings >= 5,
        'loyal-adventurer': lambda p: p.total_bookings >= 10,
        'level-5': lambda p: p.level >= 5,
        'points-500': lambda p: p.points >= 500,
        'points-1000': lambda p: p.points >= 1000,
    }
    
    for badge_id, condition in conditions.items():
        if badge_id not in already_unlocked and condition(progress):
            try:
                badge = Badge.objects.get(id=badge_id)
                BadgeUnlock.objects.create(user=user, badge_id=badge_id)
                progress.badges.append(badge_id)
                unlocked_badges.append(badge)
            except Badge.DoesNotExist:
                pass
    
    if unlocked_badges:
        progress.save(update_fields=['badges'])
    
    return unlocked_badges


def update_user_challenges(user, event_type):
    """Update user's challenge progress based on event"""
    active_challenges = UserChallengeProgress.objects.filter(
        user=user,
        completed=False,
        challenge__event_type=event_type,
        challenge__is_active=True
    )
    
    for progress in active_challenges:
        progress.current_progress += 1
        
        if progress.current_progress >= progress.challenge.target_count:
            progress.completed = True
            progress.completed_at = timezone.now()
        
        progress.save()
        
        logger.info(f"Challenge progress: {user.username} - {progress.challenge.id}: {progress.current_progress}/{progress.challenge.target_count}")


# ============================================
# LEAD QUALIFICATION SYSTEM
# ============================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lead_qualification_score(request, lead_id):
    """Get or recalculate lead qualification score"""
    try:
        lead = Lead.objects.get(id=lead_id)
        
        if request.method == 'GET':
            score_obj, created = LeadQualificationScore.objects.get_or_create(lead=lead)
            return Response({
                'lead_id': lead.id,
                'lead_name': lead.name,
                'total_score': score_obj.total_score,
                'qualification_status': score_obj.qualification_status,
                'engagement_score': score_obj.engagement_score,
                'intent_score': score_obj.intent_score,
                'fit_score': score_obj.fit_score,
                'urgency_score': score_obj.urgency_score,
                'scoring_reason': score_obj.scoring_reason,
                'last_scored_at': score_obj.last_scored_at
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'POST':
            # Recalculate score
            score_obj, created = LeadQualificationScore.objects.get_or_create(lead=lead)
            new_score = score_obj.calculate_score()
            
            # Log the scoring
            logger.info(f"Lead {lead.name} rescored: {new_score} ({score_obj.qualification_status})")
            
            return Response({
                'success': True,
                'total_score': new_score,
                'qualification_status': score_obj.qualification_status,
                'message': f"Lead scored: {new_score} - {score_obj.qualification_status.upper()}"
            }, status=status.HTTP_200_OK)
    
    except Lead.DoesNotExist:
        return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Lead qualification error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lead_priority_queue(request):
    """Get prioritized lead queue for sales team"""
    try:
        from .models import LeadPrioritizationQueue
        
        # Get all active leads in priority queue
        queue_items = LeadPrioritizationQueue.objects.filter(
            is_active=True,
            resolution_status='pending'
        ).select_related('lead', 'assigned_to')[:50]
        
        lead_queue = []
        for item in queue_items:
            score_obj = LeadQualificationScore.objects.filter(lead=item.lead).first()
            lead_queue.append({
                'queue_id': item.id,
                'lead_id': item.lead.id,
                'lead_name': item.lead.name,
                'lead_phone': item.lead.phone,
                'lead_email': item.lead.email,
                'priority_level': item.priority_level,
                'qualification_status': score_obj.qualification_status if score_obj else 'unknown',
                'qualification_score': score_obj.total_score if score_obj else 0,
                'assigned_to': item.assigned_to.username if item.assigned_to else 'Unassigned',
                'follow_up_date': item.follow_up_date,
                'last_follow_up': item.last_follow_up,
                'follow_up_count': item.follow_up_count,
                'queue_position': item.queue_position
            })
        
        return Response({
            'total_leads': len(lead_queue),
            'leads': lead_queue
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Priority queue error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_lead_to_sales_rep(request):
    """Assign lead to sales representative"""
    try:
        from .models import LeadPrioritizationQueue
        
        lead_id = request.data.get('lead_id')
        sales_rep_id = request.data.get('sales_rep_id')
        follow_up_date = request.data.get('follow_up_date')
        
        if not lead_id or not sales_rep_id:
            return Response({'error': 'lead_id and sales_rep_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        lead = Lead.objects.get(id=lead_id)
        sales_rep = User.objects.get(id=sales_rep_id)
        
        # Update or create priority queue entry
        queue_item, created = LeadPrioritizationQueue.objects.get_or_create(lead=lead)
        queue_item.assigned_to = sales_rep
        queue_item.assigned_at = timezone.now()
        if follow_up_date:
            queue_item.follow_up_date = follow_up_date
        queue_item.save()
        
        # Update lead assignment
        lead.assigned_to = sales_rep
        lead.save(update_fields=['assigned_to'])
        
        logger.info(f"Lead {lead.name} assigned to {sales_rep.username}")
        
        return Response({
            'success': True,
            'message': f"Lead assigned to {sales_rep.first_name or sales_rep.username}"
        }, status=status.HTTP_200_OK)
    
    except Lead.DoesNotExist:
        return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'Sales representative not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Lead assignment error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_lead_follow_up(request):
    """Log follow-up with lead"""
    try:
        from .models import LeadPrioritizationQueue
        
        lead_id = request.data.get('lead_id')
        follow_up_notes = request.data.get('notes', '')
        next_follow_up = request.data.get('next_follow_up_date')
        
        if not lead_id:
            return Response({'error': 'lead_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        lead = Lead.objects.get(id=lead_id)
        queue_item = LeadPrioritizationQueue.objects.get(lead=lead)
        
        # Update follow-up tracking
        queue_item.last_follow_up = timezone.now()
        queue_item.follow_up_count += 1
        if next_follow_up:
            queue_item.follow_up_date = next_follow_up
        queue_item.save()
        
        # Update lead contact timestamp
        lead.touch_contact()
        if follow_up_notes:
            lead.notes = (lead.notes or '') + f"\n[{timezone.now().strftime('%Y-%m-%d %H:%M')}] {follow_up_notes}"
            lead.save(update_fields=['notes'])
        
        logger.info(f"Follow-up logged for lead {lead.name} (Count: {queue_item.follow_up_count})")
        
        return Response({
            'success': True,
            'follow_up_count': queue_item.follow_up_count,
            'last_follow_up': queue_item.last_follow_up,
            'message': f"Follow-up logged (Total: {queue_item.follow_up_count})"
        }, status=status.HTTP_200_OK)
    
    except Lead.DoesNotExist:
        return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Follow-up update error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resolve_lead_qualification(request):
    """Mark lead as converted or lost"""
    try:
        from .models import LeadPrioritizationQueue
        
        lead_id = request.data.get('lead_id')
        resolution_status = request.data.get('resolution_status')  # 'converted' or 'lost'
        resolution_notes = request.data.get('notes', '')
        
        if not lead_id or resolution_status not in ['converted', 'lost']:
            return Response({'error': 'lead_id and valid resolution_status required'}, status=status.HTTP_400_BAD_REQUEST)
        
        lead = Lead.objects.get(id=lead_id)
        queue_item = LeadPrioritizationQueue.objects.get(lead=lead)
        
        # Mark as resolved
        queue_item.resolution_status = resolution_status
        queue_item.resolved_at = timezone.now()
        queue_item.is_active = False
        queue_item.save()
        
        # Update lead status
        lead.status = 'converted' if resolution_status == 'converted' else 'lost'
        if resolution_notes:
            lead.notes = (lead.notes or '') + f"\n[{timezone.now().strftime('%Y-%m-%d %H:%M')}] RESOLUTION: {resolution_notes}"
        lead.save()
        
        logger.info(f"Lead {lead.name} marked as {resolution_status}")
        
        return Response({
            'success': True,
            'lead_status': lead.status,
            'resolution_status': resolution_status,
            'message': f"Lead marked as {resolution_status.upper()}"
        }, status=status.HTTP_200_OK)
    
    except Lead.DoesNotExist:
        return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Lead resolution error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

