from django.core.management.base import BaseCommand
from ml_models.trip_recommendation_engine import TripRecommendationEngine

class Command(BaseCommand):
    help = 'Train the trip recommendation engine'

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Starting Trip Recommendation Engine Training')
        )

        # Initialize and train the engine
        engine = TripRecommendationEngine()
        engine.train_model()

        self.stdout.write(
            self.style.SUCCESS('✅ Trip Recommendation Engine trained successfully!')
        )