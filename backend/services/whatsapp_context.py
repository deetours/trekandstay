"""
WhatsApp Context Builder
Builds customer context from profile, history, and preferences
"""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class WhatsAppContextBuilder:
    """
    Builds comprehensive customer context for personalized responses
    """

    def __init__(self):
        # Mock data storage (use actual database in production)
        self.customer_profiles = {}

    def get_customer_profile(self, phone_number: str) -> Dict[str, Any]:
        """
        Get customer profile information
        
        Args:
            phone_number: Customer phone number
        
        Returns:
            {
                "phone": "919876543210",
                "name": "Rahul",
                "email": "rahul@gmail.com",
                "joined_at": "2024-06-15",
                "tier": "gold"
            }
        """
        if phone_number in self.customer_profiles:
            return self.customer_profiles[phone_number]

        # Mock profile (in production, query database)
        return {
            "phone": phone_number,
            "name": "Valued Customer",
            "email": "customer@trek.com",
            "joined_at": "2024-01-01",
            "tier": "regular",
            "contact_frequency": "occasional",
        }

    def get_booking_history(self, phone_number: str) -> Dict[str, Any]:
        """
        Get customer's booking history
        
        Returns:
            {
                "total_bookings": 3,
                "total_spent": 145000,
                "last_trek": "Manali Trek",
                "last_booking_date": "2024-12-15",
                "favorite_treks": ["Everest", "Manali"]
            }
        """
        # Mock data (query database in production)
        return {
            "total_bookings": 0,
            "total_spent": 0,
            "last_trek": None,
            "last_booking_date": None,
            "favorite_treks": [],
            "average_booking_value": 0,
        }

    def get_preferences(self, phone_number: str) -> Dict[str, Any]:
        """
        Get customer preferences
        
        Returns:
            {
                "difficulty_level": "moderate",
                "budget_range": "30-50k",
                "preferred_season": "october-november",
                "group_size": 4,
                "communication_language": "english"
            }
        """
        return {
            "difficulty_level": "moderate",
            "budget_range": "30-50k",
            "preferred_season": "all",
            "group_size": 1,
            "communication_language": "en",
            "preferred_contact_time": "flexible",
        }

    def get_lead_qualification_score(self, phone_number: str) -> Dict[str, Any]:
        """
        Calculate lead qualification score
        
        Returns:
            {
                "score": 85,  # 0-100
                "quality": "hot",  # cold, warm, hot
                "indicators": {
                    "engagement": 0.9,
                    "budget_clarity": 0.8,
                    "timeline": 0.7
                }
            }
        """
        profile = self.get_customer_profile(phone_number)
        bookings = self.get_booking_history(phone_number)

        # Calculate engagement indicator
        if bookings["total_bookings"] > 0:
            engagement = 0.9
        else:
            engagement = 0.5  # New lead

        # Calculate budget clarity
        prefs = self.get_preferences(phone_number)
        budget_clarity = 0.8 if prefs["budget_range"] else 0.4

        # Calculate timeline
        timeline = 0.7  # Default

        # Overall score
        overall_score = (engagement * 0.4 + budget_clarity * 0.4 + timeline * 0.2) * 100

        # Determine quality
        if overall_score >= 80:
            quality = "hot"
        elif overall_score >= 50:
            quality = "warm"
        else:
            quality = "cold"

        return {
            "score": int(overall_score),
            "quality": quality,
            "indicators": {
                "engagement": round(engagement, 2),
                "budget_clarity": round(budget_clarity, 2),
                "timeline": round(timeline, 2),
            },
            "recommendation": f"{quality.upper()} lead - " + (
                "High priority for immediate follow-up"
                if quality == "hot"
                else "Schedule follow-up"
                if quality == "warm"
                else "Continue nurturing"
            ),
        }

    def get_interaction_history(self, phone_number: str) -> Dict[str, Any]:
        """
        Get interaction history with customer
        
        Returns:
            {
                "total_interactions": 12,
                "last_interaction": "2025-01-15T10:30:00Z",
                "interaction_channels": ["whatsapp", "email"],
                "response_rate": 0.95,
                "average_response_time": "5 minutes"
            }
        """
        return {
            "total_interactions": 0,
            "last_interaction": None,
            "interaction_channels": ["whatsapp"],
            "response_rate": 0.0,
            "average_response_time": None,
            "messages_sent": 0,
            "messages_received": 0,
        }

    def build_full_context(self, phone_number: str) -> Dict[str, Any]:
        """
        Build complete customer context
        
        Returns:
            Comprehensive context for LLM and agents
        """
        return {
            "phone_number": phone_number,
            "profile": self.get_customer_profile(phone_number),
            "booking_history": self.get_booking_history(phone_number),
            "preferences": self.get_preferences(phone_number),
            "lead_score": self.get_lead_qualification_score(phone_number),
            "interaction_history": self.get_interaction_history(phone_number),
            "personalization_tips": self._generate_personalization_tips(phone_number),
        }

    def _generate_personalization_tips(self, phone_number: str) -> Dict[str, str]:
        """Generate tips for personalizing response"""
        profile = self.get_customer_profile(phone_number)
        bookings = self.get_booking_history(phone_number)
        prefs = self.get_preferences(phone_number)

        tips = {}

        # Name personalization
        if profile.get("name"):
            tips["name"] = f"Use '{profile['name']}' in greeting"

        # Previous trek reference
        if bookings.get("last_trek"):
            tips["last_trek"] = f"Reference their {bookings['last_trek']} experience"

        # Budget alignment
        if prefs.get("budget_range"):
            tips["budget"] = f"Focus on treks in {prefs['budget_range']} range"

        # Tier-based offering
        if profile.get("tier") == "gold":
            tips["tier"] = "Mention VIP benefits and exclusive offers"

        # Frequency
        if bookings.get("total_bookings") > 2:
            tips["loyalty"] = "Acknowledge as loyal customer, offer loyalty discount"

        return tips
