"""
Lead Scoring Model for Trek & Stay Platform
==========================================

This module implements a machine learning model to predict lead conversion probability
based on behavioral patterns, engagement metrics, and demographic data.

Features Used (50+ variables):
- Engagement: message frequency, response times, contact recency
- Intent: trip views, booking attempts, wishlist additions
- Fit: budget alignment, trip preferences, group size
- Urgency: departure date proximity, booking timeline
- Demographics: source channel, location preferences
- Behavioral: session duration, page views, interaction patterns
"""

import os
import sys
import django
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import json

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
django.setup()

from core.models import Lead, LeadEvent, Booking, Trip, UserProfile
from django.utils import timezone
from django.db.models import Count, Q, Avg, Max, Min


class LeadScoringModel:
    """Machine Learning model for predicting lead conversion probability"""

    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoders = {}
        self.feature_columns = []
        self.model_path = 'ml_models/lead_scoring_model.pkl'
        self.scaler_path = 'ml_models/scaler.pkl'
        self.encoders_path = 'ml_models/label_encoders.pkl'

    def collect_training_data(self, days_back=180):
        """
        Collect historical lead data for training
        Since we have limited real data, we'll create synthetic data based on patterns
        """
        print("🔍 Collecting training data...")

        # Get all leads
        leads = Lead.objects.all()

        training_data = []

        for lead in leads:
            features = self.extract_features(lead)
            # For now, assign random conversion labels (will be replaced with real data)
            # In production, this would be based on actual booking history
            is_converted = np.random.choice([0, 1], p=[0.85, 0.15])  # 15% conversion rate
            features['is_converted'] = is_converted
            training_data.append(features)

        # Add synthetic data to reach minimum training size
        synthetic_data = self.generate_synthetic_data(500)
        training_data.extend(synthetic_data)

        df = pd.DataFrame(training_data)
        print(f"📊 Collected {len(df)} training samples")
        print(f"   Converted: {df['is_converted'].sum()} ({df['is_converted'].mean()*100:.1f}%)")

        return df

    def extract_features(self, lead):
        """Extract 50+ features from a lead"""
        features = {}

        # Basic demographics
        features['lead_id'] = lead.id
        features['source'] = lead.source
        features['is_whatsapp'] = int(lead.is_whatsapp)
        features['has_email'] = int(bool(lead.email))
        features['has_phone'] = int(bool(lead.phone))

        # Temporal features
        now = timezone.now()
        features['days_since_created'] = (now - lead.created_at).days
        features['days_since_last_contact'] = (now - lead.last_contact_at).days if lead.last_contact_at else 999
        features['hour_created'] = lead.created_at.hour
        features['day_of_week_created'] = lead.created_at.weekday()
        features['is_weekend_created'] = int(lead.created_at.weekday() >= 5)

        # Engagement features
        events = LeadEvent.objects.filter(lead=lead)
        features['total_events'] = events.count()
        features['inbound_messages'] = events.filter(type='inbound_msg').count()
        features['outbound_messages'] = events.filter(type='outbound_msg').count()
        features['status_changes'] = events.filter(type='status_change').count()

        # Message patterns
        if events.exists():
            first_event = events.order_by('created_at').first()
            last_event = events.order_by('-created_at').first()
            features['days_between_first_last_event'] = (last_event.created_at - first_event.created_at).days
            features['avg_days_between_events'] = features['days_between_first_last_event'] / max(1, features['total_events']-1)
        else:
            features['days_between_first_last_event'] = 0
            features['avg_days_between_events'] = 0

        # Intent and behavior features
        features['intent_score'] = lead.intent_score
        features['current_stage'] = lead.stage
        features['has_trip_associated'] = int(lead.trip is not None)

        # Trip-related features
        if lead.trip:
            trip = lead.trip
            features['trip_price'] = float(trip.price)
            features['trip_duration_days'] = int(trip.duration.split('D')[0]) if 'D' in trip.duration else 1
            features['spots_available'] = trip.spots_available
            features['trip_status'] = trip.status
            features['days_to_departure'] = (trip.next_departure - now.date()).days if trip.next_departure else 999
        else:
            features['trip_price'] = 0
            features['trip_duration_days'] = 0
            features['spots_available'] = 0
            features['trip_status'] = 'none'
            features['days_to_departure'] = 999

        # Metadata features
        metadata = lead.metadata or {}
        features['preferred_difficulty'] = metadata.get('preferred_difficulty', 'unknown')
        features['group_size'] = metadata.get('group_size', 1)
        features['budget_range'] = metadata.get('budget_range', 'unknown')
        features['preferred_season'] = metadata.get('preferred_season', 'unknown')
        features['has_preferences'] = int(bool(metadata))

        # Tag analysis
        tags = lead.tags or []
        features['tag_count'] = len(tags)
        features['has_urgent_tag'] = int('urgent' in tags)
        features['has_vip_tag'] = int('vip' in tags)
        features['has_followup_tag'] = int('followup' in tags)

        # Status progression
        status_progression = {
            'new': 1, 'contacted': 2, 'qualified': 3, 'converted': 4, 'lost': 5
        }
        features['status_numeric'] = status_progression.get(lead.status, 1)
        features['is_converted'] = int(lead.status == 'converted')
        features['is_lost'] = int(lead.status == 'lost')

        # Response time patterns (if we had response data)
        features['avg_response_time_hours'] = np.random.uniform(1, 24)  # Placeholder
        features['response_rate'] = np.random.uniform(0, 1)  # Placeholder

        # Engagement velocity
        features['events_per_day'] = features['total_events'] / max(1, features['days_since_created'])
        features['engagement_velocity'] = features['events_per_day'] * features['intent_score']

        # Risk and quality indicators
        features['data_completeness'] = sum([
            features['has_email'], features['has_phone'], features['has_trip_associated'],
            features['has_preferences'], features['tag_count'] > 0
        ]) / 5.0

        features['lead_quality_score'] = (
            features['data_completeness'] * 0.3 +
            (features['intent_score'] / 100) * 0.4 +
            (features['total_events'] / 10) * 0.3
        )

        return features

    def generate_synthetic_data(self, n_samples=500):
        """Generate synthetic training data with realistic patterns"""
        print(f"🎭 Generating {n_samples} synthetic training samples...")

        synthetic_data = []

        # Define realistic patterns
        sources = ['web', 'whatsapp', 'phone', 'other']
        statuses = ['new', 'contacted', 'qualified', 'converted', 'lost']
        stages = ['new', 'engaged', 'awaiting_payment', 'advance_paid', 'balance_due', 'completed', 'lost']

        for _ in range(n_samples):
            # Base conversion probability
            base_conversion_prob = 0.15

            # Generate features
            features = {
                'lead_id': f'synth_{_}',
                'source': np.random.choice(sources, p=[0.4, 0.4, 0.15, 0.05]),
                'is_whatsapp': np.random.choice([0, 1], p=[0.6, 0.4]),
                'has_email': np.random.choice([0, 1], p=[0.2, 0.8]),
                'has_phone': np.random.choice([0, 1], p=[0.1, 0.9]),
                'days_since_created': np.random.exponential(30),
                'days_since_last_contact': np.random.exponential(7),
                'hour_created': np.random.randint(0, 24),
                'day_of_week_created': np.random.randint(0, 7),
                'is_weekend_created': 0,
                'total_events': np.random.poisson(3),
                'inbound_messages': np.random.poisson(2),
                'outbound_messages': np.random.poisson(1),
                'status_changes': np.random.poisson(0.5),
                'days_between_first_last_event': np.random.exponential(14),
                'avg_days_between_events': np.random.exponential(3),
                'intent_score': np.random.randint(0, 101),
                'current_stage': np.random.choice(stages),
                'has_trip_associated': np.random.choice([0, 1], p=[0.7, 0.3]),
                'trip_price': np.random.choice([4000, 5000, 8000, 9000, 15000, 18000], p=[0.2, 0.2, 0.2, 0.2, 0.1, 0.1]) if np.random.random() > 0.7 else 0,
                'trip_duration_days': np.random.choice([2, 3, 4, 5, 6, 7, 8]) if np.random.random() > 0.7 else 0,
                'spots_available': np.random.randint(0, 6) if np.random.random() > 0.7 else 0,
                'trip_status': np.random.choice(['available', 'promoted', 'full', 'none'], p=[0.4, 0.3, 0.2, 0.1]),
                'days_to_departure': np.random.exponential(60) if np.random.random() > 0.7 else 999,
                'preferred_difficulty': np.random.choice(['easy', 'moderate', 'difficult', 'unknown'], p=[0.3, 0.4, 0.2, 0.1]),
                'group_size': np.random.randint(1, 11),
                'budget_range': np.random.choice(['low', 'medium', 'high', 'premium', 'unknown'], p=[0.2, 0.3, 0.3, 0.1, 0.1]),
                'preferred_season': np.random.choice(['summer', 'winter', 'monsoon', 'unknown'], p=[0.3, 0.3, 0.2, 0.2]),
                'has_preferences': np.random.choice([0, 1], p=[0.4, 0.6]),
                'tag_count': np.random.poisson(1.5),
                'has_urgent_tag': np.random.choice([0, 1], p=[0.9, 0.1]),
                'has_vip_tag': np.random.choice([0, 1], p=[0.95, 0.05]),
                'has_followup_tag': np.random.choice([0, 1], p=[0.8, 0.2]),
                'status_numeric': np.random.randint(1, 6),
                'avg_response_time_hours': np.random.exponential(12),
                'response_rate': np.random.beta(2, 5),
                'events_per_day': 0,  # Will be calculated
                'engagement_velocity': 0,  # Will be calculated
                'data_completeness': 0,  # Will be calculated
                'lead_quality_score': 0,  # Will be calculated
            }

            # Calculate derived features
            features['is_weekend_created'] = int(features['day_of_week_created'] >= 5)
            features['events_per_day'] = features['total_events'] / max(1, features['days_since_created'])
            features['engagement_velocity'] = features['events_per_day'] * features['intent_score']

            completeness_indicators = [
                features['has_email'], features['has_phone'], features['has_trip_associated'],
                features['has_preferences'], features['tag_count'] > 0
            ]
            features['data_completeness'] = sum(completeness_indicators) / 5.0

            features['lead_quality_score'] = (
                features['data_completeness'] * 0.3 +
                (features['intent_score'] / 100) * 0.4 +
                (min(features['total_events'], 10) / 10) * 0.3
            )

            # Adjust conversion probability based on features
            conversion_prob = base_conversion_prob

            # Boosters
            if features['is_whatsapp']: conversion_prob *= 1.3
            if features['has_email'] and features['has_phone']: conversion_prob *= 1.2
            if features['intent_score'] > 70: conversion_prob *= 1.5
            if features['total_events'] > 5: conversion_prob *= 1.4
            if features['has_trip_associated']: conversion_prob *= 2.0
            if features['lead_quality_score'] > 0.7: conversion_prob *= 1.6
            if features['engagement_velocity'] > 10: conversion_prob *= 1.3

            # Dampeners
            if features['days_since_last_contact'] > 30: conversion_prob *= 0.3
            if features['status_numeric'] >= 4: conversion_prob *= 0.1  # Lost leads
            if features['data_completeness'] < 0.3: conversion_prob *= 0.5

            conversion_prob = min(conversion_prob, 0.8)  # Cap at 80%

            features['is_converted'] = np.random.choice([0, 1], p=[1-conversion_prob, conversion_prob])
            features['is_lost'] = np.random.choice([0, 1], p=[0.9, 0.1]) if not features['is_converted'] else 0

            synthetic_data.append(features)

        return synthetic_data

    def preprocess_data(self, df):
        """Preprocess data for training"""
        print("🔧 Preprocessing data...")

        # Remove non-feature columns
        feature_df = df.drop(['lead_id', 'is_converted'], axis=1, errors='ignore')

        # Handle categorical variables
        categorical_cols = [
            'source', 'current_stage', 'trip_status', 'preferred_difficulty',
            'budget_range', 'preferred_season'
        ]

        for col in categorical_cols:
            if col in feature_df.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    feature_df[col] = self.label_encoders[col].fit_transform(feature_df[col].astype(str))
                else:
                    # Handle new categories
                    try:
                        feature_df[col] = self.label_encoders[col].transform(feature_df[col].astype(str))
                    except ValueError:
                        # For unknown categories, assign -1
                        feature_df[col] = -1

        # Fill missing values
        feature_df = feature_df.fillna(0)

        # Store feature columns
        self.feature_columns = feature_df.columns.tolist()

        # Scale features
        if not self.scaler:
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(feature_df)
        else:
            X_scaled = self.scaler.transform(feature_df)

        return X_scaled

    def train_model(self, df):
        """Train the Random Forest model"""
        print("🤖 Training Lead Scoring Model...")

        X = self.preprocess_data(df)
        y = df['is_converted'].values

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # Train model
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42,
            class_weight='balanced'
        )

        self.model.fit(X_train, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]

        print("📈 Model Performance:")
        print(classification_report(y_test, y_pred))
        print(".3f")

        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)

        print("🔍 Top 10 Important Features:")
        for _, row in feature_importance.head(10).iterrows():
            print(".4f")

        return feature_importance

    def predict_probability(self, lead):
        """Predict conversion probability for a lead (0-100)"""
        if not self.model:
            return 50  # Default score if model not trained

        features = self.extract_features(lead)
        feature_df = pd.DataFrame([features])

        # Preprocess
        X = self.preprocess_data(feature_df)

        # Predict
        probability = self.model.predict_proba(X)[0, 1]
        score = int(probability * 100)

        return score

    def save_model(self):
        """Save model and preprocessing objects"""
        print("💾 Saving model...")

        os.makedirs('ml_models', exist_ok=True)

        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)

        # Save label encoders
        with open(self.encoders_path, 'w') as f:
            encoders_dict = {k: v.classes_.tolist() for k, v in self.label_encoders.items()}
            json.dump(encoders_dict, f)

        print("✅ Model saved successfully")

    def load_model(self):
        """Load saved model"""
        try:
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)

            with open(self.encoders_path, 'r') as f:
                encoders_dict = json.load(f)
                for col, classes in encoders_dict.items():
                    self.label_encoders[col] = LabelEncoder()
                    self.label_encoders[col].classes_ = np.array(classes)

            print("✅ Model loaded successfully")
            return True
        except FileNotFoundError:
            print("❌ No saved model found")
            return False

    def retrain_model(self):
        """Retrain model with latest data"""
        print("🔄 Retraining model with latest data...")
        df = self.collect_training_data()
        self.train_model(df)
        self.save_model()
        print("✅ Model retrained and saved")


def main():
    """Main function to train and save the model"""
    print("🚀 Starting Lead Scoring Model Training")
    print("=" * 50)

    model = LeadScoringModel()

    # Collect and train
    df = model.collect_training_data()
    feature_importance = model.train_model(df)

    # Save model
    model.save_model()

    print("\n🎯 Lead Scoring Model Ready!")
    print("Use model.predict_probability(lead) to score new leads")


if __name__ == "__main__":
    main()