from django.contrib import admin
from .models import UserProfile, Booking, TripHistory, TripRecommendation, Lead
from .models import Guide, Trip, Review, Author, Story, StoryImage, StoryAudio, StoryRating, Wishlist, Payment, TripPlan

admin.site.register(UserProfile)
admin.site.register(Booking)
admin.site.register(TripHistory)
admin.site.register(TripRecommendation)
admin.site.register(Lead)
admin.site.register(Guide)
admin.site.register(Trip)
admin.site.register(Review)
admin.site.register(Author)
admin.site.register(Story)
admin.site.register(StoryImage)
admin.site.register(StoryAudio)
admin.site.register(StoryRating)
admin.site.register(Wishlist)
admin.site.register(Payment)
admin.site.register(TripPlan)
