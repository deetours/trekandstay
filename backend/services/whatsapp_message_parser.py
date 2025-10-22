"""
WhatsApp Message Parser Service
Parses incoming messages for intent, sentiment, language, and entities
"""

import logging
from typing import Dict, Any, List, Optional
from textblob import TextBlob
import re

logger = logging.getLogger(__name__)


class WhatsAppMessageParser:
    """
    Parse WhatsApp messages to extract:
    - Intent (price_inquiry, booking, objection, feedback, etc)
    - Sentiment (positive, neutral, negative)
    - Language (en, hi, es, etc)
    - Entities (trek names, dates, prices, etc)
    """

    # Intent patterns
    INTENT_PATTERNS = {
        "price_inquiry": r"(how much|price|cost|budget|expensive|₹|rupee|charge)",
        "booking": r"(book|reserve|confirm|register|want|interested|keen)",
        "objection": r"(but|however|afraid|worried|concerned|scared|risk|problem|issue|doubt)",
        "timing": r"(when|date|month|time|best time|duration|how long|days needed)",
        "refund": r"(cancel|refund|return|money back|compensation)",
        "feedback": r"(review|feedback|experience|great|amazing|terrible|bad|good)",
        "objection_safety": r"(safe|dangerous|risk|altitude|sickness|health|emergency)",
        "objection_ability": r"(difficult|easy|can i|am i|fit|fitness|experience|beginner)",
    }

    # Trek name patterns
    TREK_NAMES = [
        "everest",
        "manali",
        "kedarnath",
        "dudhsagar",
        "kumbhe",
        "maharashtra",
        "himalayas",
    ]

    # Sentiment keywords
    POSITIVE_WORDS = [
        "good",
        "great",
        "awesome",
        "amazing",
        "excellent",
        "love",
        "perfect",
        "interested",
        "yes",
        "sure",
    ]
    NEGATIVE_WORDS = [
        "bad",
        "terrible",
        "awful",
        "hate",
        "problem",
        "issue",
        "no",
        "don't want",
        "cancel",
    ]

    @staticmethod
    def detect_language(text: str) -> str:
        """
        Detect language of text
        Simple detection based on character patterns
        
        Returns:
            Language code (en, hi, es, etc)
        """
        # Check for Hindi characters
        if re.search(r"[\u0900-\u097F]", text):
            return "hi"
        # Check for Spanish characters
        elif re.search(r"[¿áéíóúñ¡]", text):
            return "es"
        # Check for French characters
        elif re.search(r"[àâäæçéèêëïîôùûüœ]", text):
            return "fr"
        # Default to English
        else:
            return "en"

    @staticmethod
    def classify_intent(text: str) -> Dict[str, Any]:
        """
        Classify message intent
        
        Returns:
            {
                "primary_intent": "price_inquiry",
                "secondary_intents": ["booking", "timing"],
                "confidence": 0.95
            }
        """
        text_lower = text.lower()
        detected_intents = []

        # Check patterns
        for intent, pattern in WhatsAppMessageParser.INTENT_PATTERNS.items():
            if re.search(pattern, text_lower):
                detected_intents.append(intent)

        if not detected_intents:
            return {
                "primary_intent": "general_inquiry",
                "secondary_intents": [],
                "confidence": 0.5,
            }

        # Weighted scoring for primary intent
        intent_scores = {
            "price_inquiry": 3,
            "booking": 4,
            "objection_safety": 3,
            "objection_ability": 3,
            "refund": 5,
            "timing": 2,
        }

        # Sort by priority
        primary = max(detected_intents, key=lambda x: intent_scores.get(x, 1))

        return {
            "primary_intent": primary,
            "secondary_intents": [i for i in detected_intents if i != primary],
            "confidence": min(len(detected_intents) * 0.25, 0.95),
        }

    @staticmethod
    def detect_sentiment(text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of message
        
        Returns:
            {
                "sentiment": "positive" | "neutral" | "negative",
                "polarity": 0.75,
                "subjectivity": 0.5
            }
        """
        try:
            # Use TextBlob for sentiment analysis
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity  # -1 to 1
            subjectivity = blob.sentiment.subjectivity  # 0 to 1

            # Classify sentiment
            if polarity > 0.1:
                sentiment = "positive"
            elif polarity < -0.1:
                sentiment = "negative"
            else:
                sentiment = "neutral"

            return {
                "sentiment": sentiment,
                "polarity": polarity,
                "subjectivity": subjectivity,
            }

        except Exception as e:
            logger.error(f"Error detecting sentiment: {str(e)}")
            return {
                "sentiment": "neutral",
                "polarity": 0,
                "subjectivity": 0.5,
            }

    @staticmethod
    def extract_entities(text: str) -> Dict[str, List[str]]:
        """
        Extract entities from message
        
        Returns:
            {
                "trek_names": ["Everest", "Manali"],
                "numbers": ["40000", "5"],
                "dates": ["next month", "December"],
                "prices": ["₹40k", "40000"]
            }
        """
        text_lower = text.lower()
        entities = {
            "trek_names": [],
            "numbers": [],
            "dates": [],
            "prices": [],
        }

        # Extract trek names
        for trek in WhatsAppMessageParser.TREK_NAMES:
            if trek in text_lower:
                entities["trek_names"].append(trek.capitalize())

        # Extract numbers
        numbers = re.findall(r"\b\d+\b", text)
        entities["numbers"] = numbers

        # Extract prices (₹xxx or xxx rupee)
        prices = re.findall(r"[₹Rs.]*\s*\d+[kK]?", text)
        entities["prices"] = prices

        # Extract dates
        date_patterns = [
            r"\b(january|february|march|april|may|june|july|august|september|october|november|december)\b",
            r"\b(jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b",
            r"(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})",
        ]

        for pattern in date_patterns:
            dates = re.findall(pattern, text_lower)
            entities["dates"].extend(dates)

        return entities

    @staticmethod
    def parse_message(text: str, phone_number: str = "") -> Dict[str, Any]:
        """
        Complete message parsing
        
        Args:
            text: Message text
            phone_number: Customer phone number (optional)
        
        Returns:
            {
                "original_text": "How much is Everest trek?",
                "language": "en",
                "intent": {
                    "primary_intent": "price_inquiry",
                    "secondary_intents": [],
                    "confidence": 0.9
                },
                "sentiment": {
                    "sentiment": "neutral",
                    "polarity": 0,
                    "subjectivity": 0.5
                },
                "entities": {
                    "trek_names": ["Everest"],
                    "numbers": [],
                    "dates": [],
                    "prices": []
                },
                "parsed_at": "2025-01-15T10:30:00Z"
            }
        """
        return {
            "original_text": text,
            "phone_number": phone_number,
            "language": WhatsAppMessageParser.detect_language(text),
            "intent": WhatsAppMessageParser.classify_intent(text),
            "sentiment": WhatsAppMessageParser.detect_sentiment(text),
            "entities": WhatsAppMessageParser.extract_entities(text),
            "parsed_at": __import__("datetime").datetime.now().isoformat() + "Z",
            "length": len(text),
            "word_count": len(text.split()),
        }

    @staticmethod
    def is_unsubscribe_request(text: str) -> bool:
        """Check if message is unsubscribe request"""
        unsubscribe_keywords = ["stop", "remove", "unsubscribe", "no more", "quit", "exit"]
        text_lower = text.lower().strip()

        return any(keyword in text_lower for keyword in unsubscribe_keywords)

    @staticmethod
    def get_conversation_context(text: str) -> str:
        """Get summary context of message for system prompt"""
        intent_result = WhatsAppMessageParser.classify_intent(text)
        sentiment_result = WhatsAppMessageParser.detect_sentiment(text)

        context = f"""
Customer Message Analysis:
- Intent: {intent_result['primary_intent']}
- Sentiment: {sentiment_result['sentiment']}
- Message Length: {len(text)} characters
- Language: {WhatsAppMessageParser.detect_language(text)}

This message requires a response that addresses the {intent_result['primary_intent']}.
Tone should match their {sentiment_result['sentiment']} sentiment.
        """

        return context.strip()
