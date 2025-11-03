"""
Trip Recommendation Engine for Trek & Stay Platform
==================================================

This module implements a hybrid recommendation system combining:
- Collaborative Filtering: User-based and Item-based recommendations
- Content-Based Filtering: Trip characteristic matching
- Hybrid Approach: Weighted combination of multiple methods

Features:
- Personalized trip suggestions based on user behavior
- Cold start handling for new users
- Real-time recommendations
- A/B testing capabilities
- Performance optimization with caching
"""

import os
import sys
import django
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler, MultiLabelBinarizer
from sklearn.decomposition import TruncatedSVD
import joblib
import json
from collections import defaultdict
import logging

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
django.setup()

from core.models import Trip, User, Booking, TripHistory, Wishlist, Review, Lead
from django.utils import timezone
from django.db.models import Count, Q, Avg, Case, When, IntegerField
from django.contrib.auth.models import User as DjangoUser

logger = logging.getLogger(__name__)


class TripRecommendationEngine:
    """Hybrid trip recommendation system"""

    def __init__(self):
        self.user_item_matrix = None
        self.trip_features_matrix = None
        self.user_similarity_matrix = None
        self.trip_similarity_matrix = None
        self.scaler = None
        self.feature_columns = []
        self.model_path = 'ml_models/recommendation_engine.pkl'
        self.matrix_path = 'ml_models/user_item_matrix.pkl'
        self.features_path = 'ml_models/trip_features.pkl'

    def collect_training_data(self):
        """
        Collect user-trip interaction data for training
        """
        print("🔍 Collecting user-trip interaction data...")

        # Get all users with interactions
        users = DjangoUser.objects.all()
        trips = Trip.objects.all()

        # Create user-item interaction matrix
        interactions = []

        for user in users:
            # Bookings (strong positive signal)
            bookings = Booking.objects.filter(user=user).select_related('trip')
            for booking in bookings:
                interactions.append({
                    'user_id': user.id,
                    'trip_id': booking.trip.id,
                    'interaction_type': 'booking',
                    'weight': 5.0,  # Highest weight
                    'timestamp': booking.created_at
                })

            # Wishlist (medium positive signal)
            wishlists = Wishlist.objects.filter(user=user).select_related('trip')
            for wishlist in wishlists:
                interactions.append({
                    'user_id': user.id,
                    'trip_id': wishlist.trip.id,
                    'interaction_type': 'wishlist',
                    'weight': 3.0,
                    'timestamp': wishlist.created_at
                })

            # Reviews (positive/negative signal)
            reviews = Review.objects.filter(user=user).select_related('trip')
            for review in reviews:
                sentiment_weight = (review.rating - 3) * 0.5  # -1.5 to +1.5
                interactions.append({
                    'user_id': user.id,
                    'trip_id': review.trip.id,
                    'interaction_type': 'review',
                    'weight': 2.0 + sentiment_weight,  # 0.5 to 3.5
                    'timestamp': review.created_at
                })

            # Trip views (weak positive signal) - from TripHistory
            trip_histories = TripHistory.objects.filter(user=user)
            for history in trip_histories:
                # Try to match by destination (approximate)
                matching_trips = Trip.objects.filter(
                    Q(location__icontains=history.destination) |
                    Q(name__icontains=history.destination)
                )
                for trip in matching_trips:
                    interactions.append({
                        'user_id': user.id,
                        'trip_id': trip.id,
                        'interaction_type': 'view',
                        'weight': 1.0,
                        'timestamp': history.date  # Approximate
                    })

        # Convert to DataFrame
        df = pd.DataFrame(interactions)

        if df.empty:
            print("⚠️ No interaction data found, generating synthetic data...")
            df = self.generate_synthetic_interactions()

        print(f"📊 Collected {len(df)} interactions from {df['user_id'].nunique()} users and {df['trip_id'].nunique()} trips")

        # Aggregate interactions by user-trip pairs
        interaction_matrix = df.groupby(['user_id', 'trip_id']).agg({
            'weight': 'sum',
            'timestamp': 'max'
        }).reset_index()

        # Recency weighting (more recent interactions get higher weight)
        max_timestamp = interaction_matrix['timestamp'].max()
        interaction_matrix['days_since'] = (max_timestamp - interaction_matrix['timestamp']).dt.days
        interaction_matrix['recency_weight'] = np.exp(-interaction_matrix['days_since'] / 30)  # 30-day half-life
        interaction_matrix['final_weight'] = interaction_matrix['weight'] * interaction_matrix['recency_weight']

        return interaction_matrix

    def generate_synthetic_interactions(self, n_interactions=1000):
        """Generate synthetic user-trip interactions for testing"""
        print("🎭 Generating synthetic interaction data...")

        users = list(DjangoUser.objects.values_list('id', flat=True))
        trips = list(Trip.objects.values_list('id', flat=True))

        if not users:
            users = [f'user_{i}' for i in range(50)]
        if not trips:
            trips = [f'trip_{i}' for i in range(21)]  # Based on our 11 trips

        interactions = []

        for _ in range(n_interactions):
            user_id = np.random.choice(users)
            trip_id = np.random.choice(trips)

            # Weighted interaction types
            interaction_type = np.random.choice(
                ['booking', 'wishlist', 'review', 'view'],
                p=[0.1, 0.3, 0.4, 0.2]  # More reviews and wishlists
            )

            # Weight based on type
            weight_map = {
                'booking': 5.0,
                'wishlist': 3.0,
                'review': 2.0,
                'view': 1.0
            }
            base_weight = weight_map[interaction_type]

            # Add some randomness
            weight = base_weight * np.random.uniform(0.8, 1.2)

            # Random timestamp in last 6 months
            days_ago = np.random.randint(0, 180)
            timestamp = timezone.now() - timedelta(days=days_ago)

            interactions.append({
                'user_id': user_id,
                'trip_id': trip_id,
                'interaction_type': interaction_type,
                'weight': weight,
                'timestamp': timestamp
            })

        return pd.DataFrame(interactions)

    def build_user_item_matrix(self, interactions_df):
        """Build user-item interaction matrix"""
        print("🔢 Building user-item interaction matrix...")

        # Create pivot table
        user_item_matrix = interactions_df.pivot_table(
            index='user_id',
            columns='trip_id',
            values='final_weight',
            aggfunc='sum',
            fill_value=0
        )

        # Normalize by user (optional - helps with different activity levels)
        # user_item_matrix = user_item_matrix.div(user_item_matrix.sum(axis=1), axis=0)

        self.user_item_matrix = user_item_matrix
        print(f"📊 User-item matrix: {user_item_matrix.shape[0]} users × {user_item_matrix.shape[1]} trips")

        return user_item_matrix

    def build_trip_features_matrix(self):
        """Build trip features matrix for content-based filtering"""
        print("🏔️ Building trip features matrix...")

        trips = Trip.objects.all()
        features_list = []

        for trip in trips:
            features = {}

            # Basic features
            features['trip_id'] = trip.id
            features['price'] = float(trip.price)
            features['duration_days'] = self.extract_duration_days(trip.duration)
            features['max_capacity'] = trip.max_capacity
            features['spots_available'] = trip.spots_available

            # Location encoding (simplified)
            features['location_maharashtra'] = 'maharashtra' in trip.location.lower()
            features['location_uttarakhand'] = 'uttarakhand' in trip.location.lower()
            features['location_himachal'] = 'himachal' in trip.location.lower()
            features['location_karnataka'] = 'karnataka' in trip.location.lower()
            features['location_goa'] = 'goa' in trip.location.lower()

            # Difficulty estimation (based on keywords and price)
            difficulty_score = 0
            difficulty_keywords = ['trek', 'peak', 'summit', 'difficult', 'challenging']
            for keyword in difficulty_keywords:
                if keyword in trip.name.lower() or keyword in (trip.description or '').lower():
                    difficulty_score += 1

            # Price-based difficulty adjustment
            if trip.price > 15000:
                difficulty_score += 1
            elif trip.price < 5000:
                difficulty_score -= 0.5

            features['difficulty_score'] = min(max(difficulty_score, 1), 5)  # 1-5 scale

            # Season suitability
            features['winter_suitable'] = 'winter' in trip.name.lower() or trip.price > 10000
            features['summer_suitable'] = trip.price < 10000
            features['monsoon_suitable'] = 'waterfall' in trip.name.lower()

            # Activity types (multi-hot encoding)
            features['has_trekking'] = 'trek' in trip.name.lower()
            features['has_camping'] = 'camp' in (trip.description or '').lower()
            features['has_waterfall'] = 'waterfall' in trip.name.lower()
            features['has_fort'] = 'fort' in trip.name.lower()
            features['has_temple'] = 'temple' in trip.name.lower()
            features['has_spiritual'] = 'spiritual' in trip.name.lower()

            # Group size preference
            features['solo_friendly'] = trip.max_capacity >= 8
            features['small_group'] = trip.max_capacity <= 5
            features['large_group'] = trip.max_capacity > 10

            # Equipment requirements (simplified)
            equipment_text = ' '.join(trip.equipment or [])
            features['requires_special_equipment'] = len(equipment_text) > 100
            features['winter_equipment'] = 'jacket' in equipment_text.lower() or 'thermal' in equipment_text.lower()

            features_list.append(features)

        features_df = pd.DataFrame(features_list)
        features_df.set_index('trip_id', inplace=True)

        # Scale numerical features
        numerical_cols = ['price', 'duration_days', 'max_capacity', 'spots_available', 'difficulty_score']
        if self.scaler is None:
            self.scaler = StandardScaler()
            features_df[numerical_cols] = self.scaler.fit_transform(features_df[numerical_cols])
        else:
            features_df[numerical_cols] = self.scaler.transform(features_df[numerical_cols])

        self.trip_features_matrix = features_df
        self.feature_columns = features_df.columns.tolist()

        print(f"🏔️ Trip features matrix: {features_df.shape[0]} trips × {features_df.shape[1]} features")

        return features_df

    def extract_duration_days(self, duration_str):
        """Extract number of days from duration string"""
        if not duration_str:
            return 3  # Default

        # Look for patterns like "3D", "5 Days", etc.
        import re
        match = re.search(r'(\d+)\s*D', duration_str, re.IGNORECASE)
        if match:
            return int(match.group(1))

        match = re.search(r'(\d+)\s*Days?', duration_str, re.IGNORECASE)
        if match:
            return int(match.group(1))

        return 3  # Default fallback

    def compute_similarities(self):
        """Compute user-user and trip-trip similarity matrices"""
        print("🔗 Computing similarity matrices...")

        # User-user similarity (collaborative filtering)
        if self.user_item_matrix.shape[0] > 1:
            self.user_similarity_matrix = cosine_similarity(self.user_item_matrix)
            self.user_similarity_matrix = pd.DataFrame(
                self.user_similarity_matrix,
                index=self.user_item_matrix.index,
                columns=self.user_item_matrix.index
            )
        else:
            self.user_similarity_matrix = pd.DataFrame()

        # Trip-trip similarity (content-based + collaborative)
        if self.trip_features_matrix.shape[0] > 1:
            # Content-based similarity
            content_similarity = cosine_similarity(self.trip_features_matrix)

            # Collaborative similarity (if we have interaction data)
            if self.user_item_matrix.shape[1] > 1:
                collab_similarity = cosine_similarity(self.user_item_matrix.T)
                # Combine content and collaborative similarity
                self.trip_similarity_matrix = 0.7 * content_similarity + 0.3 * collab_similarity
            else:
                self.trip_similarity_matrix = content_similarity

            self.trip_similarity_matrix = pd.DataFrame(
                self.trip_similarity_matrix,
                index=self.trip_features_matrix.index,
                columns=self.trip_features_matrix.index
            )
        else:
            self.trip_similarity_matrix = pd.DataFrame()

        print("✅ Similarity matrices computed")

    def get_user_based_recommendations(self, user_id, n_recommendations=5):
        """Get user-based collaborative filtering recommendations"""
        if self.user_similarity_matrix.empty or user_id not in self.user_similarity_matrix.index:
            return []

        # Find similar users
        user_similarities = self.user_similarity_matrix.loc[user_id].sort_values(ascending=False)
        similar_users = user_similarities.head(10).index.tolist()  # Top 10 similar users

        # Get trips liked by similar users
        user_trips = set()
        if user_id in self.user_item_matrix.index:
            user_trips = set(self.user_item_matrix.loc[user_id][self.user_item_matrix.loc[user_id] > 0].index)

        recommendations = defaultdict(float)

        for similar_user in similar_users:
            if similar_user == user_id:
                continue

            similarity_score = user_similarities[similar_user]
            user_ratings = self.user_item_matrix.loc[similar_user]

            for trip_id, rating in user_ratings.items():
                if rating > 0 and trip_id not in user_trips:
                    recommendations[trip_id] += similarity_score * rating

        # Sort and return top recommendations
        sorted_recommendations = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
        return [trip_id for trip_id, score in sorted_recommendations[:n_recommendations]]

    def get_item_based_recommendations(self, user_id, n_recommendations=5):
        """Get item-based collaborative filtering recommendations"""
        if user_id not in self.user_item_matrix.index or self.trip_similarity_matrix.empty:
            return []

        # Get user's liked trips
        user_ratings = self.user_item_matrix.loc[user_id]
        liked_trips = user_ratings[user_ratings > 2].index.tolist()  # Trips with rating > 2

        if not liked_trips:
            return []

        recommendations = defaultdict(float)

        for liked_trip in liked_trips:
            if liked_trip in self.trip_similarity_matrix.index:
                similar_trips = self.trip_similarity_matrix.loc[liked_trip].sort_values(ascending=False)
                user_rating = user_ratings[liked_trip]

                for similar_trip, similarity in similar_trips.head(10).items():
                    if similar_trip not in user_ratings.index or user_ratings[similar_trip] == 0:
                        recommendations[similar_trip] += similarity * user_rating

        # Sort and return top recommendations
        sorted_recommendations = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
        return [trip_id for trip_id, score in sorted_recommendations[:n_recommendations]]

    def get_content_based_recommendations(self, user_id, n_recommendations=5):
        """Get content-based recommendations"""
        if user_id not in self.user_item_matrix.index or self.trip_features_matrix.empty:
            return []

        # Get user's preferred trip characteristics
        user_ratings = self.user_item_matrix.loc[user_id]
        liked_trips = user_ratings[user_ratings > 2].index.tolist()

        if not liked_trips:
            return []

        # Average features of liked trips
        liked_features = self.trip_features_matrix.loc[liked_trips]
        user_profile = liked_features.mean()

        # Find trips similar to user profile
        all_trip_features = self.trip_features_matrix.copy()
        user_trips = user_ratings[user_ratings > 0].index
        all_trip_features = all_trip_features.drop(user_trips, errors='ignore')

        if all_trip_features.empty:
            return []

        # Compute similarity to user profile
        similarities = cosine_similarity([user_profile], all_trip_features)[0]
        similar_indices = np.argsort(similarities)[::-1]

        recommendations = []
        for idx in similar_indices[:n_recommendations]:
            trip_id = all_trip_features.index[idx]
            recommendations.append(trip_id)

        return recommendations

    def get_hybrid_recommendations(self, user_id, n_recommendations=5, weights=None):
        """Get hybrid recommendations combining multiple approaches"""
        if weights is None:
            weights = {
                'user_based': 0.3,
                'item_based': 0.3,
                'content_based': 0.4
            }

        # Get recommendations from each method
        user_based = self.get_user_based_recommendations(user_id, n_recommendations * 2)
        item_based = self.get_item_based_recommendations(user_id, n_recommendations * 2)
        content_based = self.get_content_based_recommendations(user_id, n_recommendations * 2)

        # Combine with weights
        recommendation_scores = defaultdict(float)

        for i, trip_id in enumerate(user_based):
            recommendation_scores[trip_id] += weights['user_based'] * (1 / (i + 1))

        for i, trip_id in enumerate(item_based):
            recommendation_scores[trip_id] += weights['item_based'] * (1 / (i + 1))

        for i, trip_id in enumerate(content_based):
            recommendation_scores[trip_id] += weights['content_based'] * (1 / (i + 1))

        # Sort by combined score
        sorted_recommendations = sorted(recommendation_scores.items(), key=lambda x: x[1], reverse=True)

        # Return top recommendations
        return [trip_id for trip_id, score in sorted_recommendations[:n_recommendations]]

    def get_cold_start_recommendations(self, user_preferences=None, n_recommendations=5):
        """Recommendations for new users without interaction history"""
        # Default popular trips
        popular_trips = Trip.objects.annotate(
            booking_count=Count('bookings')
        ).order_by('-booking_count')[:n_recommendations]

        return [trip.id for trip in popular_trips]

    def get_personalized_recommendations(self, user_id, user_preferences=None, n_recommendations=5):
        """Main recommendation method with fallback handling"""
        try:
            # Check if user has interaction history
            has_history = (user_id in self.user_item_matrix.index and
                          self.user_item_matrix.loc[user_id].sum() > 0)

            if has_history:
                # Use hybrid recommendations
                recommendations = self.get_hybrid_recommendations(user_id, n_recommendations)
            else:
                # Cold start recommendations
                recommendations = self.get_cold_start_recommendations(user_preferences, n_recommendations)

            # Ensure we have valid trip IDs
            valid_trips = Trip.objects.filter(id__in=recommendations).values_list('id', flat=True)
            recommendations = [trip_id for trip_id in recommendations if trip_id in valid_trips]

            # Fill with popular trips if needed
            if len(recommendations) < n_recommendations:
                popular_trips = Trip.objects.exclude(id__in=recommendations).annotate(
                    booking_count=Count('bookings')
                ).order_by('-booking_count')[:n_recommendations - len(recommendations)]

                recommendations.extend([trip.id for trip in popular_trips])

            return recommendations[:n_recommendations]

        except Exception as e:
            logger.error(f"Error getting recommendations for user {user_id}: {str(e)}")
            # Fallback to popular trips
            popular_trips = Trip.objects.annotate(
                booking_count=Count('bookings')
            ).order_by('-booking_count')[:n_recommendations]

            return [trip.id for trip in popular_trips]

    def train_model(self):
        """Train the recommendation engine"""
        print("🤖 Training Trip Recommendation Engine...")

        # Collect training data
        interactions_df = self.collect_training_data()

        # Build matrices
        self.build_user_item_matrix(interactions_df)
        self.build_trip_features_matrix()

        # Compute similarities
        self.compute_similarities()

        print("✅ Recommendation engine trained successfully")

    def save_model(self):
        """Save model and matrices"""
        print("💾 Saving recommendation engine...")

        os.makedirs('ml_models', exist_ok=True)

        # Save matrices
        joblib.dump(self.user_item_matrix, self.matrix_path)
        joblib.dump(self.trip_features_matrix, self.features_path)

        # Save similarity matrices
        joblib.dump({
            'user_similarity': self.user_similarity_matrix,
            'trip_similarity': self.trip_similarity_matrix,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns
        }, self.model_path)

        print("✅ Recommendation engine saved")

    def load_model(self):
        """Load saved model"""
        try:
            # Load matrices
            self.user_item_matrix = joblib.load(self.matrix_path)
            self.trip_features_matrix = joblib.load(self.features_path)

            # Load model components
            model_data = joblib.load(self.model_path)
            self.user_similarity_matrix = model_data['user_similarity']
            self.trip_similarity_matrix = model_data['trip_similarity']
            self.scaler = model_data['scaler']
            self.feature_columns = model_data['feature_columns']

            print("✅ Recommendation engine loaded")
            return True
        except FileNotFoundError:
            print("❌ No saved recommendation engine found")
            return False

    def retrain_model(self):
        """Retrain the recommendation engine with latest data"""
        print("🔄 Retraining recommendation engine...")
        self.train_model()
        self.save_model()
        print("✅ Recommendation engine retrained")


def main():
    """Main function to train and save the recommendation engine"""
    print("🚀 Starting Trip Recommendation Engine Training")
    print("=" * 60)

    engine = TripRecommendationEngine()
    engine.train_model()
    engine.save_model()

    print("\n🎯 Trip Recommendation Engine Ready!")
    print("Use engine.get_personalized_recommendations(user_id) to get recommendations")


if __name__ == "__main__":
    main()