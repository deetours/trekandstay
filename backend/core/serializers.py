from rest_framework import serializers
from .models import UserProfile, Booking, TripHistory, TripRecommendation, Lead, Author, Story, StoryImage, StoryAudio, StoryRating

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

class TripHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TripHistory
        fields = '__all__'

class TripRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripRecommendation
        fields = '__all__'

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
        fields = ['id', 'title', 'destination', 'text', 'author', 'authorId', 'authorName', 'images', 'audioUrl', 'avgRating', 'created_at']
        read_only_fields = ['created_at', 'author']

    def get_images(self, obj: Story):
        return [img.url for img in obj.image_items.all()]

    def get_audioUrl(self, obj: Story):
        audio = obj.audio_items.first()
        return audio.url if audio else None

    def create(self, validated_data):
        author_id = validated_data.pop('authorId', None)
        if author_id is None:
            raise serializers.ValidationError({'authorId': 'This field is required.'})
        return Story.objects.create(author_id=author_id, **validated_data)
