from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg
import cloudinary.uploader as cloud_uploader
from .models import UserProfile, Booking, TripHistory, TripRecommendation, Lead, Author, Story, StoryImage, StoryAudio, StoryRating
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
)

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

class TripHistoryViewSet(viewsets.ModelViewSet):
    queryset = TripHistory.objects.all()
    serializer_class = TripHistorySerializer

class TripRecommendationViewSet(viewsets.ModelViewSet):
    queryset = TripRecommendation.objects.all()
    serializer_class = TripRecommendationSerializer

# --- Stories ViewSets ---
class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all().order_by('-id')
    serializer_class = AuthorSerializer

class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.all().order_by('-created_at')
    serializer_class = StorySerializer

    def list(self, request, *args, **kwargs):
        qs = Story.objects.all().annotate(avg_value=Avg('ratings__value')).order_by('-created_at')
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page or qs, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        story = self.get_object()
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
        value = int(request.data.get('value', 0))
        if value < 1 or value > 5:
            return Response({'detail': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
        rating = StoryRating.objects.create(story=story, value=value)
        return Response(StoryRatingSerializer(rating).data, status=status.HTTP_201_CREATED)
