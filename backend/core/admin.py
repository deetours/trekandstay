from django.contrib import admin
from .models import UserProfile, Booking, TripHistory, TripRecommendation, Lead

admin.site.register(UserProfile)
admin.site.register(Booking)
admin.site.register(TripHistory)
admin.site.register(TripRecommendation)
admin.site.register(Lead)
