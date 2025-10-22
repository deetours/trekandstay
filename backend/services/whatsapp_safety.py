"""
WhatsApp Safety & Compliance Service
Detects ban risks, unsubscribers, and compliance issues
"""

import logging
import re
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class WhatsAppSafety:
    """
    Safety and compliance checks for WhatsApp messages
    Protects against bans and regulatory issues
    """

    # Ban risk triggers and their weights
    BAN_RISK_FACTORS = {
        "emoji_count_high": {
            "check": lambda text: len(re.findall(r"[😀-🙏🌀-🗿]", text)) > 8,
            "weight": 15,
            "message": "Too many emojis (>8)",
        },
        "all_caps": {
            "check": lambda text: len([c for c in text if c.isupper()]) / len(text) > 0.3 if text else False,
            "weight": 15,
            "message": "Too much CAPS (>30%)",
        },
        "repeated_keywords": {
            "check": lambda text: WhatsAppSafety._check_keyword_repetition(text),
            "weight": 12,
            "message": "Repeated keywords detected",
        },
        "excessive_links": {
            "check": lambda text: len(re.findall(r"http[s]?://|www\.", text)) > 2,
            "weight": 18,
            "message": "Too many links (>2)",
        },
        "promotional_spam": {
            "check": lambda text: WhatsAppSafety._check_promotional_spam(text),
            "weight": 20,
            "message": "Highly promotional language",
        },
        "clickbait": {
            "check": lambda text: WhatsAppSafety._check_clickbait(text),
            "weight": 15,
            "message": "Clickbait language detected",
        },
        "unsubscribe_ignored": {
            "check": lambda text: False,  # Handled separately
            "weight": 50,
            "message": "Customer unsubscribe ignored",
        },
    }

    # Unsubscribe keywords
    UNSUBSCRIBE_KEYWORDS = [
        "stop",
        "unsubscribe",
        "remove",
        "no more",
        "quit",
        "exit",
        "don't contact",
    ]

    @staticmethod
    def _check_keyword_repetition(text: str) -> bool:
        """Check if keywords are repeated too much"""
        words = text.lower().split()
        if not words:
            return False

        # Count word frequencies
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1

        # Check if any word appears more than 3 times
        return any(count > 3 for count in word_freq.values())

    @staticmethod
    def _check_promotional_spam(text: str) -> bool:
        """Check for promotional spam indicators"""
        promotional_keywords = [
            "limited time",
            "act now",
            "don't miss",
            "urgent",
            "click here",
            "buy now",
            "exclusive offer",
            "sign up now",
            "limited offer",
        ]

        text_lower = text.lower()
        count = sum(1 for keyword in promotional_keywords if keyword in text_lower)

        return count >= 3

    @staticmethod
    def _check_clickbait(text: str) -> bool:
        """Check for clickbait language"""
        clickbait_patterns = [
            r"you won't believe",
            r"shocking",
            r"unbelievable",
            r"doctors hate",
            r"this one trick",
            r"what happens next",
        ]

        return any(re.search(pattern, text.lower()) for pattern in clickbait_patterns)

    @staticmethod
    def analyze_ban_risk(message: str) -> Dict[str, Any]:
        """
        Analyze message for WhatsApp ban risk
        
        Args:
            message: Message text to analyze
        
        Returns:
            {
                "risk_score": 45,  # 0-100
                "risk_level": "medium",  # low, medium, high, critical
                "factors": [
                    {"factor": "excessive_links", "weight": 18, "triggered": True}
                ],
                "suggestions": [
                    "Remove some emojis",
                    "Use normal capitalization"
                ]
            }
        """
        risk_score = 0
        triggered_factors = []
        suggestions = []

        for factor_name, factor_data in WhatsAppSafety.BAN_RISK_FACTORS.items():
            if factor_data["check"](message):
                risk_score += factor_data["weight"]
                triggered_factors.append({
                    "factor": factor_name,
                    "weight": factor_data["weight"],
                    "message": factor_data["message"],
                })
                suggestions.append(f"⚠️ {factor_data['message']}")

        # Cap score at 100
        risk_score = min(risk_score, 100)

        # Determine risk level
        if risk_score >= 75:
            risk_level = "critical"
        elif risk_score >= 50:
            risk_level = "high"
        elif risk_score >= 25:
            risk_level = "medium"
        else:
            risk_level = "low"

        logger.info(f"Ban risk analysis: {risk_score}/100 ({risk_level})")

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "factors": triggered_factors,
            "suggestions": suggestions,
            "should_flag": risk_score >= 50,
            "should_block": risk_score >= 75,
        }

    @staticmethod
    def detect_unsubscriber(message: str) -> Dict[str, Any]:
        """
        Detect if message is an unsubscribe request
        
        Args:
            message: Message text
        
        Returns:
            {
                "is_unsubscriber": True,
                "keyword_matched": "stop",
                "confidence": 0.99
            }
        """
        message_lower = message.lower().strip()

        for keyword in WhatsAppSafety.UNSUBSCRIBE_KEYWORDS:
            if keyword in message_lower:
                return {
                    "is_unsubscriber": True,
                    "keyword_matched": keyword,
                    "confidence": 0.95,
                }

        return {
            "is_unsubscriber": False,
            "keyword_matched": None,
            "confidence": 0.95,
        }

    @staticmethod
    def validate_phone_number(phone: str) -> Dict[str, Any]:
        """
        Validate phone number format
        
        Args:
            phone: Phone number (with or without +)
        
        Returns:
            {
                "valid": True,
                "country": "IN",
                "is_whatsapp": True
            }
        """
        # Remove common prefixes and formatting
        clean_phone = re.sub(r"[^\d]", "", phone)

        # Check length (most numbers are 10-13 digits)
        if len(clean_phone) < 10 or len(clean_phone) > 15:
            return {"valid": False, "error": "Invalid phone length"}

        # Detect country code
        country_codes = {
            "91": "IN",  # India
            "1": "US",   # USA
            "44": "GB",  # UK
            "86": "CN",  # China
        }

        country = None
        for code, country_name in country_codes.items():
            if clean_phone.startswith(code):
                country = country_name
                break

        return {
            "valid": True,
            "country": country or "UNKNOWN",
            "is_whatsapp": True,  # Assume valid if format is OK
            "normalized": clean_phone,
        }

    @staticmethod
    def check_compliance(message: str) -> Dict[str, Any]:
        """
        Check for compliance issues (GDPR, WhatsApp policies, etc)
        
        Args:
            message: Message text
        
        Returns:
            {
                "compliant": True,
                "issues": [],
                "score": 1.0
            }
        """
        issues = []
        score = 1.0

        # Check for personal data
        personal_data_patterns = [
            r"\bSSN\b|\d{3}-\d{2}-\d{4}",  # SSN
            r"\b\d{13,16}\b",  # Credit card
            r"\b\d{3}-\d{2}-\d{4}\b",  # SSN format
        ]

        for pattern in personal_data_patterns:
            if re.search(pattern, message):
                issues.append("Contains potential personal data")
                score -= 0.3
                break

        # Check for prohibited content
        prohibited_words = ["illegal", "drugs", "weapon", "fake"]
        if any(word in message.lower() for word in prohibited_words):
            issues.append("Contains prohibited content")
            score -= 0.5

        # Check for privacy violations
        if "email" in message.lower() or "@" in message:
            issues.append("Contains email address (may violate privacy)")
            score -= 0.2

        return {
            "compliant": len(issues) == 0,
            "issues": issues,
            "score": max(score, 0),
        }

    @staticmethod
    def flag_for_human_review(
        message: str,
        reason: str,
        risk_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Flag message for human review
        
        Args:
            message: Message text
            reason: Reason for flagging
            risk_data: Ban risk analysis data
        
        Returns:
            {
                "flagged": True,
                "reason": "High ban risk",
                "priority": "high",
                "timestamp": "2025-01-15T10:30:00Z"
            }
        """
        from datetime import datetime

        # Determine priority based on reason
        priority_map = {
            "high_ban_risk": "high",
            "critical_ban_risk": "critical",
            "unsubscriber": "medium",
            "compliance_issue": "high",
            "personal_data": "critical",
            "default": "medium",
        }

        priority = priority_map.get(reason, priority_map["default"])

        flag_data = {
            "flagged": True,
            "reason": reason,
            "priority": priority,
            "timestamp": datetime.now().isoformat() + "Z",
            "message_preview": message[:100],
        }

        if risk_data:
            flag_data["risk_data"] = risk_data

        logger.warning(f"Message flagged for review: {reason} (Priority: {priority})")
        return flag_data

    @staticmethod
    def get_ban_risk_suggestions(risk_data: Dict[str, Any]) -> str:
        """
        Get actionable suggestions to reduce ban risk
        
        Args:
            risk_data: Ban risk analysis result
        
        Returns:
            Formatted suggestions string
        """
        if not risk_data.get("suggestions"):
            return "Message is compliant. Ready to send."

        suggestions_text = "⚠️ Message has potential issues:\n\n"
        for i, suggestion in enumerate(risk_data["suggestions"], 1):
            suggestions_text += f"{i}. {suggestion}\n"

        if risk_data.get("should_block"):
            suggestions_text += "\n❌ BLOCKED: Message is too risky. Please rewrite."
        elif risk_data.get("should_flag"):
            suggestions_text += "\n🚨 HIGH RISK: Consider revising before sending."
        else:
            suggestions_text += "\n✅ Can be sent with caution."

        return suggestions_text
