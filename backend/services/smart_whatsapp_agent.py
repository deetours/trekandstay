"""
Smart WhatsApp Agent - Auto-Reply System
Answers questions based on RAG + LLM without needing Meta Business API

Features:
- Receives incoming messages
- Understands intent & context
- Retrieves relevant information (RAG)
- Generates smart replies
- Tracks conversations
- Learning from interactions
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Optional, List, Tuple
from dataclasses import dataclass
import asyncio

from services.custom_whatsapp_service import (
    CustomWhatsAppService, 
    WhatsAppMessage, 
    MessageResponse
)

# Import RAG and LLM services (from previously built services)
try:
    from rag_retriever import RAGRetriever
    from whatsapp_response_generator import WhatsAppResponseGenerator
    from whatsapp_message_parser import WhatsAppMessageParser
    from whatsapp_context import WhatsAppContext
except ImportError:
    print("Warning: Some services not available. Install dependencies first.")

logger = logging.getLogger(__name__)

# ============================================================
# CONFIGURATION
# ============================================================

@dataclass
class AgentConfig:
    """Agent configuration"""
    name: str = "Trek & Stay Agent"
    response_style: str = "helpful"  # helpful, formal, casual, professional
    auto_reply_enabled: bool = True
    max_response_length: int = 1000
    typing_indicator: bool = True
    language: str = "en"
    thinking_time_seconds: int = 2

# ============================================================
# SMART AGENT - MAIN CLASS
# ============================================================

class SmartWhatsAppAgent:
    """
    Intelligent WhatsApp agent that:
    1. Receives customer messages
    2. Understands what they're asking
    3. Finds relevant information
    4. Generates smart reply
    5. Sends response
    
    All without Meta Business API!
    
    Example:
        agent = SmartWhatsAppAgent(whatsapp_provider="mock", mode="testing")
        
        # Simulate customer message
        response = agent.handle_incoming_message(
            phone="919876543210",
            message="How much is Everest trek?",
            customer_name="Rahul"
        )
        print(response.reply)
    """
    
    def __init__(
        self,
        whatsapp_provider: str = "mock",
        mode: str = "testing",
        config: Optional[AgentConfig] = None
    ):
        """
        Initialize smart agent
        
        Args:
            whatsapp_provider: "mock" | "wasender" | "twilio" | "africas_talking"
            mode: "testing" (no real sends) | "production" (sends messages)
            config: AgentConfig object for customization
        """
        self.config = config or AgentConfig()
        self.mode = mode
        self.is_testing = mode == "testing"
        
        # Initialize WhatsApp service
        self.whatsapp = CustomWhatsAppService(
            provider=whatsapp_provider,
            mode=mode
        )
        
        # Initialize RAG & LLM services
        try:
            self.rag = RAGRetriever()
            self.llm = WhatsAppResponseGenerator()
            self.parser = WhatsAppMessageParser()
            self.context = WhatsAppContext()
            self.services_ready = True
        except Exception as e:
            logger.warning(f"Some services not available: {e}")
            self.services_ready = False
        
        # Conversation memory (in-memory for now, use DB in production)
        self.conversations: Dict[str, List[Dict]] = {}
        
        logger.info(f"SmartAgent initialized: Provider={whatsapp_provider}, Mode={mode}")
    
    # ============================================================
    # MAIN AGENT METHODS
    # ============================================================
    
    def handle_incoming_message(
        self,
        phone: str,
        message: str,
        customer_name: Optional[str] = None,
        customer_id: Optional[str] = None
    ) -> Dict:
        """
        Handle incoming customer message and generate reply
        
        Complete flow:
        1. Parse message (understand intent)
        2. Retrieve context (customer info)
        3. Search knowledge base (RAG)
        4. Generate response (LLM)
        5. Send reply
        6. Log interaction
        
        Args:
            phone: Customer phone number
            message: Their message/question
            customer_name: Customer name (optional)
            customer_id: Customer ID for tracking
        
        Returns:
            Dict with full interaction details
        
        Examples:
            # Simple question
            result = agent.handle_incoming_message(
                phone="919876543210",
                message="How much is Everest trek?"
            )
            print(f"My Reply: {result['reply']}")
            
            # With customer context
            result = agent.handle_incoming_message(
                phone="919876543210",
                message="Can I get a discount?",
                customer_name="Rahul",
                customer_id="cust_123"
            )
            print(f"Processing time: {result['processing_time_ms']}ms")
        """
        start_time = datetime.now()
        
        # 1. Parse message - understand what customer is asking
        logger.info(f"[AGENT] Received from {phone}: {message}")
        
        parsed = self._parse_customer_message(message)
        logger.info(f"[ANALYSIS] Intent: {parsed['intent']}, Sentiment: {parsed['sentiment']}")
        
        # 2. Retrieve context - who is this customer?
        customer_context = self._get_customer_context(phone, customer_name, customer_id)
        logger.info(f"[CONTEXT] Customer: {customer_context['name']}, Lead Score: {customer_context['lead_score']}")
        
        # 3. Search knowledge base - find relevant information
        relevant_docs = self._search_knowledge_base(message)
        logger.info(f"[RAG] Found {len(relevant_docs)} relevant documents")
        
        # 4. Generate response - create smart reply
        reply = self._generate_response(
            customer_message=message,
            parsed_intent=parsed['intent'],
            customer_context=customer_context,
            relevant_docs=relevant_docs
        )
        logger.info(f"[GENERATION] Reply generated ({len(reply)} chars)")
        
        # 5. Send reply - actually send to customer
        send_result = self._send_reply(phone, reply)
        logger.info(f"[SEND] Status: {send_result['status']}")
        
        # 6. Log interaction - track for analytics
        self._log_interaction(
            phone=phone,
            customer_message=message,
            agent_reply=reply,
            metadata=parsed
        )
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": send_result['success'],
            "phone": phone,
            "customer_message": message,
            "agent_reply": reply,
            "intent": parsed['intent'],
            "processing_time_ms": int(processing_time * 1000),
            "message_id": send_result.get('message_id'),
            "confidence": parsed.get('confidence', 0.85),
            "timestamp": datetime.now().isoformat()
        }
    
    # ============================================================
    # PROCESSING STEPS
    # ============================================================
    
    def _parse_customer_message(self, message: str) -> Dict:
        """
        Step 1: Parse message to understand intent
        
        Returns dict with:
        - intent: what they're asking (price, booking, faq, etc)
        - sentiment: positive, negative, neutral
        - entities: extracted data (trek names, dates, etc)
        - confidence: how sure are we
        """
        try:
            if self.services_ready:
                # Use real parser
                result = self.parser.parse_message(message)
                return {
                    "intent": result['intent']['primary_intent'],
                    "sentiment": result['sentiment']['polarity'],
                    "entities": result['entities'],
                    "confidence": 0.95
                }
        except:
            pass
        
        # Fallback: simple keyword matching
        intent_keywords = {
            "price": ["cost", "price", "how much", "₹", "rupees"],
            "booking": ["book", "reserve", "confirm", "register"],
            "trek_info": ["trek", "details", "information", "about"],
            "difficulty": ["difficult", "hard", "easy", "fitness"],
            "faq": ["question", "can i", "how", "why", "what"],
            "contact": ["contact", "phone", "email", "address"]
        }
        
        message_lower = message.lower()
        detected_intent = "general_inquiry"
        
        for intent, keywords in intent_keywords.items():
            if any(kw in message_lower for kw in keywords):
                detected_intent = intent
                break
        
        return {
            "intent": detected_intent,
            "sentiment": 0,
            "entities": [],
            "confidence": 0.7
        }
    
    def _get_customer_context(
        self,
        phone: str,
        name: Optional[str],
        customer_id: Optional[str]
    ) -> Dict:
        """
        Step 2: Get customer profile and history
        
        Returns dict with customer info for personalization
        """
        try:
            if self.services_ready and customer_id:
                context = self.context.build_full_context(customer_id)
                return context
        except:
            pass
        
        # Fallback: basic info only
        return {
            "phone": phone,
            "name": name or "Friend",
            "lead_score": 50,
            "is_existing_customer": False,
            "preferences": {}
        }
    
    def _search_knowledge_base(self, message: str) -> List[Dict]:
        """
        Step 3: Search RAG knowledge base for relevant info
        
        Returns list of relevant documents about treks, prices, FAQs
        """
        try:
            if self.services_ready:
                docs = self.rag.retrieve_relevant_docs(message, top_k=3)
                return docs
        except:
            pass
        
        # Fallback: return sample documents
        return [
            {
                "title": "Everest Base Camp Trek",
                "content": "Price: ₹38,000-45,000. Duration: 14 days. Best time: Oct-Nov.",
                "score": 0.95
            }
        ]
    
    def _generate_response(
        self,
        customer_message: str,
        parsed_intent: str,
        customer_context: Dict,
        relevant_docs: List[Dict]
    ) -> str:
        """
        Step 4: Generate smart reply using LLM
        
        Combines:
        - Understanding of what they asked
        - Their context/preferences
        - Relevant information from knowledge base
        - Personalization
        
        Returns: Response text
        """
        try:
            if self.services_ready:
                response = self.llm.generate_response_with_rag(
                    query=customer_message,
                    customer_data=customer_context,
                    rag_context=relevant_docs
                )
                return response['response']
        except:
            pass
        
        # Fallback: template-based response
        name = customer_context.get("name", "Friend")
        
        templates = {
            "price": f"Hi {name}! 🏔️\n\nEverest Base Camp Trek:\n✅ Price: ₹38,000-45,000\n✅ Duration: 14 days\n✅ Best time: Oct-Nov & May-June\n\nInterested? Let me know!",
            
            "booking": f"Hi {name}! 🎉\n\nGreat choice! To book your trek:\n1. Choose your dates\n2. Confirm group size\n3. Make payment\n\nWhen would you like to go?",
            
            "faq": f"Hi {name}! 👋\n\nCommon questions about treks:\n• Fitness needed? Light cardio helps\n• Altitude sickness? We have acclimatization plan\n• Can cancel? Yes, free refund within 30 days\n\nAny other questions?",
            
            "general_inquiry": f"Hi {name}! 😊\n\nThank you for reaching out to Trek & Stay!\n\nWe organize amazing treks across India:\n🏔️ Everest, Manali, Kashmir & more\n\nHow can we help you today?"
        }
        
        return templates.get(parsed_intent, templates["general_inquiry"])
    
    def _send_reply(self, phone: str, reply: str) -> Dict:
        """
        Step 5: Send reply to customer via WhatsApp
        
        Returns dict with send status
        """
        logger.info(f"[SEND] Sending reply to {phone}")
        
        response = self.whatsapp.send_message(phone, reply)
        
        return {
            "success": response.success,
            "status": response.status,
            "message_id": response.message_id,
            "timestamp": response.timestamp,
            "error": response.error
        }
    
    def _log_interaction(
        self,
        phone: str,
        customer_message: str,
        agent_reply: str,
        metadata: Dict
    ):
        """
        Step 6: Log interaction for analytics and learning
        
        In real app, would save to database
        """
        # Initialize conversation if new
        if phone not in self.conversations:
            self.conversations[phone] = []
        
        # Add messages to conversation history
        self.conversations[phone].append({
            "timestamp": datetime.now().isoformat(),
            "from": "customer",
            "message": customer_message,
            "metadata": metadata
        })
        
        self.conversations[phone].append({
            "timestamp": datetime.now().isoformat(),
            "from": "agent",
            "message": agent_reply
        })
        
        logger.info(f"[LOG] Interaction logged for {phone}. Total: {len(self.conversations[phone])} messages")
    
    # ============================================================
    # CONVERSATION HISTORY
    # ============================================================
    
    def get_conversation_history(self, phone: str) -> List[Dict]:
        """Get all messages with a customer"""
        return self.conversations.get(phone, [])
    
    def get_conversation_summary(self, phone: str) -> Dict:
        """Get summary of conversation"""
        history = self.get_conversation_history(phone)
        
        return {
            "phone": phone,
            "total_messages": len(history),
            "total_exchanges": len(history) // 2,
            "first_message": history[0] if history else None,
            "last_message": history[-1] if history else None
        }
    
    # ============================================================
    # BATCH PROCESSING - AUTO-REPLY CAMPAIGNS
    # ============================================================
    
    def auto_reply_campaign(
        self,
        customers: List[Dict],
        message_template: str,
        delay_between_messages: int = 3
    ) -> List[Dict]:
        """
        Send personalized auto-reply campaign to multiple customers
        
        Args:
            customers: List of {"phone": "...", "name": "..."}
            message_template: Template with {name}, {trek}, etc
            delay_between_messages: Seconds between sends
        
        Returns:
            List of results
        
        Example:
            customers = [
                {"phone": "919876543210", "name": "Rahul"},
                {"phone": "919876543211", "name": "Priya"},
            ]
            
            results = agent.auto_reply_campaign(
                customers,
                "Hi {name}! 🏔️ Join our Everest trek expedition!",
                delay_between_messages=5
            )
        """
        import time
        
        results = []
        logger.info(f"Starting auto-reply campaign for {len(customers)} customers")
        
        for idx, customer in enumerate(customers, 1):
            phone = customer.get("phone")
            name = customer.get("name", "Friend")
            
            # Personalize message
            personalized_msg = message_template.format(name=name)
            
            # Send
            response = self.whatsapp.send_message(phone, personalized_msg)
            
            result = {
                "phone": phone,
                "name": name,
                "status": response.status,
                "message_id": response.message_id
            }
            results.append(result)
            
            logger.info(f"[{idx}/{len(customers)}] Sent to {name}: {response.status}")
            
            # Delay before next
            if idx < len(customers):
                time.sleep(delay_between_messages)
        
        logger.info(f"Campaign complete. Success: {sum(1 for r in results if r['status'] == 'sent')}/{len(customers)}")
        return results
    
    # ============================================================
    # WEBHOOK HANDLER - For receiving messages
    # ============================================================
    
    def handle_webhook(self, payload: Dict) -> Dict:
        """
        Handle incoming webhook from WhatsApp provider
        
        This is the entry point when customer sends a message
        
        Args:
            payload: Webhook payload from WhatsApp provider
        
        Returns:
            Response confirming receipt
        
        Example (Flask):
            @app.route('/webhook/whatsapp', methods=['POST'])
            def webhook():
                payload = request.get_json()
                result = agent.handle_webhook(payload)
                return jsonify(result)
        """
        try:
            # Parse incoming message
            incoming = self.whatsapp.parse_incoming_webhook(payload)
            
            if not incoming:
                logger.error("Failed to parse webhook")
                return {"success": False, "error": "Parse failed"}
            
            logger.info(f"Webhook received from {incoming.phone_number}")
            
            # Handle the message
            result = self.handle_incoming_message(
                phone=incoming.phone_number,
                message=incoming.message_text
            )
            
            return {
                "success": True,
                "message_id": result.get('message_id'),
                "processing_time_ms": result.get('processing_time_ms')
            }
        
        except Exception as e:
            logger.error(f"Error handling webhook: {str(e)}")
            return {"success": False, "error": str(e)}


# ============================================================
# USAGE EXAMPLES
# ============================================================

def example_single_message():
    """Example: Handle single customer message"""
    print("=" * 70)
    print("EXAMPLE 1: Single Customer Message")
    print("=" * 70)
    
    agent = SmartWhatsAppAgent(whatsapp_provider="mock", mode="testing")
    
    result = agent.handle_incoming_message(
        phone="919876543210",
        message="How much does Everest trek cost?",
        customer_name="Rahul"
    )
    
    print(f"✓ Received: {result['customer_message']}")
    print(f"✓ Intent Detected: {result['intent']}")
    print(f"✓ Processing Time: {result['processing_time_ms']}ms")
    print(f"\n📱 Agent Reply:\n{result['agent_reply']}")

def example_auto_reply_campaign():
    """Example: Auto-reply campaign"""
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Auto-Reply Campaign")
    print("=" * 70)
    
    agent = SmartWhatsAppAgent(whatsapp_provider="mock", mode="testing")
    
    customers = [
        {"phone": "919876543210", "name": "Rahul"},
        {"phone": "919876543211", "name": "Priya"},
        {"phone": "919876543212", "name": "Arjun"},
    ]
    
    results = agent.auto_reply_campaign(
        customers,
        "Hi {name}! 🏔️ Special offer: Everest trek at ₹35,000! Limited time only.",
        delay_between_messages=2
    )
    
    print(f"\nCampaign Results:")
    for result in results:
        print(f"  • {result['name']}: {result['status']}")

def example_conversation_history():
    """Example: Track conversation with customer"""
    print("\n" + "=" * 70)
    print("EXAMPLE 3: Conversation History")
    print("=" * 70)
    
    agent = SmartWhatsAppAgent(whatsapp_provider="mock", mode="testing")
    phone = "919876543210"
    
    # Simulate multiple messages
    messages = [
        "How much is Everest?",
        "Can I get a group discount?",
        "When's the next batch?"
    ]
    
    for msg in messages:
        agent.handle_incoming_message(phone=phone, message=msg, customer_name="Rahul")
    
    # Get history
    history = agent.get_conversation_history(phone)
    summary = agent.get_conversation_summary(phone)
    
    print(f"\nConversation Summary:")
    print(f"  • Phone: {summary['phone']}")
    print(f"  • Total Messages: {summary['total_messages']}")
    print(f"  • Exchanges: {summary['total_exchanges']}")
    print(f"\nLast few messages:")
    for msg in history[-4:]:
        sender = "You" if msg['from'] == "agent" else "Customer"
        print(f"  {sender}: {msg['message'][:50]}...")


if __name__ == "__main__":
    example_single_message()
    example_auto_reply_campaign()
    example_conversation_history()
