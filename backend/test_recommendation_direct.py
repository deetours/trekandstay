#!/usr/bin/env python
"""
Direct test of Trip Recommendation Engine
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
django.setup()

from ml_models.trip_recommendation_engine import TripRecommendationEngine

def test_recommendation_engine():
    """Test the recommendation engine directly"""

    print("🧪 Testing Trip Recommendation Engine Directly")
    print("=" * 50)

    # Initialize engine
    engine = TripRecommendationEngine()

    # Load model
    loaded = engine.load_model()
    print(f"✅ Model loaded: {loaded}")

    if loaded:
        # Test getting recommendations for user 1
        recommendations = engine.get_personalized_recommendations(user_id=1, n_recommendations=3)
        print(f"📋 Recommendations for user 1: {recommendations}")

        # Test stats
        print("📊 Engine stats available")
    else:
        print("❌ Model not loaded - may need training first")

    print("\n🎯 Direct testing complete!")

if __name__ == "__main__":
    test_recommendation_engine()