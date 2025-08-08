from rest_framework.routers import DefaultRouter
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    UserProfileViewSet,
    BookingViewSet,
    TripHistoryViewSet,
    TripRecommendationViewSet,
    LeadViewSet,
    AuthorViewSet,
    StoryViewSet,
)


router = DefaultRouter()
router.register(r'userprofiles', UserProfileViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'triphistory', TripHistoryViewSet)
router.register(r'triprecommendations', TripRecommendationViewSet)
router.register(r'leads', LeadViewSet)
router.register(r'stories/authors', AuthorViewSet)
router.register(r'stories', StoryViewSet)

urlpatterns = [
    path('auth/token/', obtain_auth_token, name='api_token_auth'),
    path('', include(router.urls)),
]
