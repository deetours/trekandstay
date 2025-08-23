from rest_framework import serializers
from .models import UserProfile, Booking, TripHistory, TripRecommendation, Lead, Author, Story, StoryImage, StoryAudio, StoryRating, Trip, Guide, Review, Wishlist, Payment, ChatFAQ, SeatLock, MessageTemplate, LeadEvent, OutboundMessage, Task

class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user', 'advance_amount', 'balance_amount', 'created_at', 'updated_at']
        extra_kwargs = {
            'destination': {'required': False, 'allow_blank': True},
            'status': {'required': False},
        }

    def create(self, validated_data):
        trip = validated_data.get('trip')
        if trip and not validated_data.get('destination'):
            validated_data['destination'] = trip.name
        if not validated_data.get('status'):
            validated_data['status'] = 'pending'
        return super().create(validated_data)

class SeatLockSerializer(serializers.ModelSerializer):
    trip_name = serializers.CharField(source='trip.name', read_only=True)

    class Meta:
        model = SeatLock
        fields = ['id', 'trip', 'trip_name', 'user', 'seats', 'expires_at', 'status', 'created_at']
        read_only_fields = ['status', 'created_at', 'user']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'booking', 'amount', 'currency', 'merchant_vpa', 'status', 'upi_txn_id', 'created_at']
        read_only_fields = ['status', 'created_at']

class TripHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TripHistory
        fields = '__all__'

class TripRecommendationSerializer(serializers.ModelSerializer):
    trip_id = serializers.SerializerMethodField()

    class Meta:
        model = TripRecommendation
        fields = ['id', 'user', 'destination', 'reason', 'trip_id']

    def get_trip_id(self, obj: TripRecommendation):
        try:
            trip = Trip.objects.filter(name=obj.destination).first()
            return trip.id if trip else None
        except Exception:
            return None

# --- New domain serializers ---
class GuideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guide
        fields = ['id', 'name', 'bio', 'image', 'specialty', 'experience']

class TripSerializer(serializers.ModelSerializer):
    guide = GuideSerializer(read_only=True)
    guide_id = serializers.PrimaryKeyRelatedField(queryset=Guide.objects.all(), source='guide', write_only=True, required=False, allow_null=True)

    class Meta:
        model = Trip
        fields = ['id', 'name', 'description', 'images', 'location', 'duration', 'spots_available', 'next_departure', 'price', 'safety_record', 'highlights', 'equipment', 'essentials', 'guide', 'guide_id', 'created_at']
        read_only_fields = ['created_at', 'guide']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'trip', 'rating', 'text', 'created_at']
        read_only_fields = ['created_at']

# --- Stories Serializers ---
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'whatsapp', 'created_at']

class StoryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryImage
        fields = ['id', 'url', 'public_id', 'created_at']

class StoryAudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryAudio
        fields = ['id', 'url', 'public_id', 'created_at']

class StoryRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryRating
        fields = ['id', 'value', 'created_at']

class StorySerializer(serializers.ModelSerializer):
    authorName = serializers.CharField(source='author.name', read_only=True)
    images = serializers.SerializerMethodField()
    audioUrl = serializers.SerializerMethodField()
    avgRating = serializers.FloatField(source='avg_value', read_only=True)
    authorId = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Story
        fields = ['id', 'title', 'destination', 'text', 'author', 'authorId', 'authorName', 'images', 'audioUrl', 'avgRating', 'status', 'rejection_reason', 'version', 'approved_at', 'approved_by', 'created_at']
        read_only_fields = ['created_at', 'author', 'status', 'rejection_reason', 'version', 'approved_at', 'approved_by']

    def get_images(self, obj: Story):
        return [img.url for img in obj.image_items.all()]

    def get_audioUrl(self, obj: Story):
        audio = obj.audio_items.first()
        return audio.url if audio else None

    def create(self, validated_data):
        author_id = validated_data.pop('authorId', None)
        if author_id is None:
            raise serializers.ValidationError({'authorId': 'This field is required.'})
        # Force pending on create
        return Story.objects.create(author_id=author_id, status='pending', **validated_data)

class WishlistSerializer(serializers.ModelSerializer):
    trip_name = serializers.CharField(source='trip.name', read_only=True)
    trip_image = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'trip', 'trip_name', 'trip_image', 'notes', 'created_at']
        read_only_fields = ['created_at']

    def get_trip_image(self, obj: Wishlist):
        try:
            imgs = obj.trip.images or []
            return imgs[0] if imgs else ''
        except Exception:
            return ''

class ChatFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatFAQ
        fields = ['id', 'question', 'answer', 'tags', 'created_at']
        read_only_fields = ['created_at']

class MessageTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageTemplate
        fields = ['id', 'name', 'category', 'body', 'variables', 'active', 'created_at']
        read_only_fields = ['created_at']

class LeadEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadEvent
        fields = ['id', 'lead', 'type', 'channel', 'payload', 'created_at']
        read_only_fields = ['created_at']

class OutboundMessageSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)

    class Meta:
        model = OutboundMessage
        fields = ['id', 'lead', 'to', 'template', 'template_name', 'rendered_body', 'status', 'retries', 'scheduled_for', 'sent_at', 'error', 'created_at']
        read_only_fields = ['status', 'retries', 'sent_at', 'error', 'created_at']

class TaskSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source='lead.name', read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'lead', 'lead_name', 'type', 'status', 'title', 'notes', 'due_at', 'completed_at', 'owner', 'created_at']
        read_only_fields = ['completed_at', 'created_at']
