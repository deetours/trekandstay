"""
WhatsApp AI Configuration & Setup
Configure OpenAI, Vector DB, and RAG system for human-like conversations
"""

import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class WhatsAppAIConfig:
    """Central configuration for WhatsApp AI system"""

    # ==========================================
    # LLM CONFIGURATION (OpenAI)
    # ==========================================
    
    # OpenAI API Key
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # Model configuration
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4-turbo-preview")  # or "gpt-3.5-turbo"
    LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.7"))
    LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "500"))
    
    # Embedding model for RAG
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    
    # ==========================================
    # VECTOR DATABASE CONFIGURATION (Pinecone)
    # ==========================================
    
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
    PINECONE_ENV = os.getenv("PINECONE_ENV", "us-east-1")
    PINECONE_INDEX = os.getenv("PINECONE_INDEX", "trek-and-stay-prod")
    PINECONE_NAMESPACE = os.getenv("PINECONE_NAMESPACE", "main")
    
    # ==========================================
    # RAG CONFIGURATION
    # ==========================================
    
    # Number of documents to retrieve for context
    RAG_TOP_K = int(os.getenv("RAG_TOP_K", "5"))
    
    # Minimum similarity score to use a document
    RAG_MIN_SCORE = float(os.getenv("RAG_MIN_SCORE", "0.3"))
    
    # ==========================================
    # SYSTEM PROMPTS
    # ==========================================
    
    SYSTEM_PROMPT = """You are Trek & Stay customer support AI - a friendly, knowledgeable adventure assistant.

Your personality:
- Friendly and enthusiastic about trekking adventures
- Helpful and patient with customer questions
- Knowledgeable about all Trek & Stay offerings
- Professional yet conversational
- Always mention Trek & Stay by name when relevant

Your capabilities:
1. Answer questions about treks and trips
2. Provide pricing and availability information
3. Help with bookings and reservations
4. Answer FAQs about policies and requirements
5. Provide personalized recommendations based on difficulty level
6. Handle complaints professionally and escalate when needed

Important rules:
- ONLY use information from the provided context documents
- If you don't know the answer, say "Let me check with our team" instead of making up information
- Always be honest about limitations
- For complex issues, suggest connecting with a human agent
- Use the customer's name if provided to make it personal
- Keep responses concise (under 300 characters) for WhatsApp
- Use emojis sparingly but appropriately (🏔️ ⛰️ 🥾 🎒 etc)
- If payment/booking info is needed, provide clear next steps

Language: Hindi + English mix is OK, but prioritize customer's language
Tone: Professional but friendly, like a tour buddy
"""

    # ==========================================
    # FALLBACK RESPONSES
    # ==========================================
    
    FALLBACK_RESPONSES = {
        "unknown_query": "I'm not sure about that. Could you rephrase your question or let me connect you with our team?",
        "price_question": "For detailed pricing, visit trek-and-stay.com or ask our team directly.",
        "booking_help": "To book a trek, visit our website or let me know which trek interests you!",
        "contact": "You can reach us at +91-XXXX-XXXX or support@trek-and-stay.com",
        "escalation": "This requires personalized attention. Let me connect you with our team!",
    }

    # ==========================================
    # INTENT CONFIGURATION
    # ==========================================
    
    # Intent detection keywords
    INTENTS = {
        "price": ["cost", "price", "how much", "₹", "rupees", "amount", "expensive"],
        "booking": ["book", "reserve", "confirm", "register", "booking", "when can i"],
        "trek_info": ["trek", "details", "information", "about", "describe", "tell me"],
        "difficulty": ["difficult", "hard", "easy", "fitness level", "beginner"],
        "duration": ["how long", "days", "nights", "duration"],
        "location": ["where", "location", "region", "state", "city"],
        "dates": ["when", "date", "available", "month", "season"],
        "faq": ["question", "can i", "how", "why", "what", "help"],
        "contact": ["contact", "phone", "email", "address", "reach"],
        "complaint": ["complaint", "issue", "problem", "refund", "cancel"],
        "recommendation": ["suggest", "recommend", "best", "suitable", "for me"],
    }

    # ==========================================
    # SENTIMENT ANALYSIS
    # ==========================================
    
    # Sentiment keywords for basic analysis
    POSITIVE_KEYWORDS = ["great", "love", "awesome", "thanks", "excellent", "perfect"]
    NEGATIVE_KEYWORDS = ["bad", "poor", "disappointed", "angry", "frustrated", "hate"]

    # ==========================================
    # MESSAGE LIMITS & THROTTLING
    # ==========================================
    
    # Max messages per user per hour
    MAX_MESSAGES_PER_HOUR = int(os.getenv("MAX_MESSAGES_PER_HOUR", "20"))
    
    # Max concurrent conversations
    MAX_CONCURRENT_CONVOS = int(os.getenv("MAX_CONCURRENT_CONVOS", "10"))
    
    # ==========================================
    # LOGGING & MONITORING
    # ==========================================
    
    LOG_ALL_INTERACTIONS = os.getenv("LOG_ALL_INTERACTIONS", "true").lower() == "true"
    TRACK_METRICS = os.getenv("TRACK_METRICS", "true").lower() == "true"

    @classmethod
    def validate_config(cls) -> bool:
        """Validate that all required API keys are configured"""
        issues = []
        
        if not cls.OPENAI_API_KEY:
            issues.append("❌ OPENAI_API_KEY not set in environment")
        
        if not cls.PINECONE_API_KEY:
            issues.append("❌ PINECONE_API_KEY not set in environment")
        
        if issues:
            logger.warning("Configuration Issues Found:")
            for issue in issues:
                logger.warning(f"  {issue}")
            return False
        
        logger.info("✅ WhatsApp AI Configuration Valid!")
        return True

    @classmethod
    def get_config_status(cls) -> dict:
        """Get current configuration status"""
        return {
            "openai_configured": bool(cls.OPENAI_API_KEY),
            "pinecone_configured": bool(cls.PINECONE_API_KEY),
            "llm_model": cls.LLM_MODEL,
            "embedding_model": cls.EMBEDDING_MODEL,
            "rag_enabled": bool(cls.PINECONE_API_KEY),
            "system_prompt_chars": len(cls.SYSTEM_PROMPT),
            "intents_count": len(cls.INTENTS),
        }


# ==========================================
# LLM INITIALIZATION
# ==========================================

def get_openai_client():
    """Get OpenAI client"""
    try:
        from openai import OpenAI
        
        if not WhatsAppAIConfig.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured")
        
        return OpenAI(api_key=WhatsAppAIConfig.OPENAI_API_KEY)
    except ImportError:
        logger.error("OpenAI library not installed")
        return None


def get_embeddings_client():
    """Get embeddings client"""
    try:
        from langchain.embeddings.openai import OpenAIEmbeddings
        
        if not WhatsAppAIConfig.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured")
        
        return OpenAIEmbeddings(
            model=WhatsAppAIConfig.EMBEDDING_MODEL,
            openai_api_key=WhatsAppAIConfig.OPENAI_API_KEY
        )
    except ImportError:
        logger.error("LangChain library not installed")
        return None


def get_pinecone_client():
    """Get Pinecone client"""
    try:
        from pinecone import Pinecone
        
        if not WhatsAppAIConfig.PINECONE_API_KEY:
            raise ValueError("PINECONE_API_KEY not configured")
        
        pc = Pinecone(api_key=WhatsAppAIConfig.PINECONE_API_KEY)
        return pc.Index(WhatsAppAIConfig.PINECONE_INDEX)
    except ImportError:
        logger.error("Pinecone library not installed")
        return None
    except Exception as e:
        logger.error(f"Error initializing Pinecone: {e}")
        return None


if __name__ == "__main__":
    # Test configuration
    print("WhatsApp AI Configuration Status:")
    print("=" * 50)
    
    config_status = WhatsAppAIConfig.get_config_status()
    for key, value in config_status.items():
        print(f"{key}: {value}")
    
    print("\n" + "=" * 50)
    is_valid = WhatsAppAIConfig.validate_config()
    print(f"\nConfiguration Valid: {is_valid}")
