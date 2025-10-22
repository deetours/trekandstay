"""
WhatsApp Conversation Manager
Manages conversation history and context windows
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class WhatsAppConversationManager:
    """
    Manages WhatsApp conversation history and context
    Supports multi-turn dialogue with memory
    """

    def __init__(self):
        # In-memory storage (use database in production)
        self.conversations = {}
        self.max_history = 20  # Keep last 20 messages
        self.context_window = 10  # Use last 10 messages for context

    def create_conversation(
        self,
        phone_number: str,
        initial_message: str,
    ) -> Dict[str, Any]:
        """
        Create new conversation
        
        Args:
            phone_number: Customer phone number
            initial_message: First message
        
        Returns:
            {
                "conversation_id": "conv_xxx",
                "phone_number": "919876543210",
                "created_at": "2025-01-15T10:30:00Z",
                "first_message": "How much is Everest?"
            }
        """
        conversation_id = f"conv_{phone_number}_{datetime.now().timestamp()}"

        self.conversations[phone_number] = {
            "conversation_id": conversation_id,
            "phone_number": phone_number,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "messages": [
                {
                    "role": "user",
                    "content": initial_message,
                    "timestamp": datetime.now(),
                }
            ],
            "sentiment_trend": "neutral",
            "conversation_stage": "initial",
            "requires_human_review": False,
        }

        logger.info(f"Conversation created: {conversation_id}")
        return {
            "conversation_id": conversation_id,
            "phone_number": phone_number,
            "created_at": datetime.now().isoformat() + "Z",
            "first_message": initial_message,
        }

    def get_conversation_history(
        self,
        phone_number: str,
        limit: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get conversation history
        
        Args:
            phone_number: Customer phone number
            limit: Number of messages to return (default all)
        
        Returns:
            List of messages
        """
        if phone_number not in self.conversations:
            return []

        messages = self.conversations[phone_number]["messages"]

        if limit:
            messages = messages[-limit:]

        return messages

    def add_to_history(
        self,
        phone_number: str,
        role: str,  # "user" or "assistant"
        message: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Add message to conversation history
        
        Args:
            phone_number: Customer phone number
            role: Message sender (user/assistant)
            message: Message content
            metadata: Additional metadata
        
        Returns:
            True if successful
        """
        try:
            if phone_number not in self.conversations:
                self.create_conversation(phone_number, message)
                return True

            conv = self.conversations[phone_number]

            # Add message
            conv["messages"].append({
                "role": role,
                "content": message,
                "timestamp": datetime.now(),
                "metadata": metadata,
            })

            # Trim history if too long
            if len(conv["messages"]) > self.max_history:
                conv["messages"] = conv["messages"][-self.max_history:]

            # Update conversation timestamp
            conv["updated_at"] = datetime.now()

            logger.info(f"Message added to conversation {phone_number}")
            return True

        except Exception as e:
            logger.error(f"Error adding to history: {str(e)}")
            return False

    def build_context_window(
        self,
        phone_number: str,
        last_n_messages: Optional[int] = None,
    ) -> List[Dict[str, str]]:
        """
        Build context window for LLM
        Returns last N messages in format suitable for LLM
        
        Args:
            phone_number: Customer phone number
            last_n_messages: Number of messages to include (default from config)
        
        Returns:
            List of {role, content} dicts
        """
        if last_n_messages is None:
            last_n_messages = self.context_window

        history = self.get_conversation_history(phone_number, limit=last_n_messages)

        context = []
        for msg in history:
            context.append({
                "role": msg["role"],
                "content": msg["content"],
            })

        logger.info(f"Context window built with {len(context)} messages")
        return context

    def detect_conversation_stage(
        self,
        phone_number: str,
    ) -> str:
        """
        Detect current stage of conversation
        
        Returns:
            Stage: initial, inquiry, negotiation, decision, completed, escalated
        """
        if phone_number not in self.conversations:
            return "unknown"

        history = self.get_conversation_history(phone_number)

        if not history:
            return "initial"

        # Analyze conversation progression
        msg_count = len(history)
        last_msg = history[-1]["content"].lower() if history else ""

        # Simple heuristics
        if msg_count == 1:
            return "initial"
        elif "how much" in last_msg or "price" in last_msg:
            return "inquiry"
        elif "but" in last_msg or "worried" in last_msg:
            return "negotiation"
        elif "book" in last_msg or "confirm" in last_msg:
            return "decision"
        elif "cancel" in last_msg or "refund" in last_msg:
            return "escalated"
        else:
            return "inquiry"

    def handle_multi_turn_dialogue(
        self,
        phone_number: str,
        user_message: str,
        assistant_response: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Handle complete turn in conversation
        
        Args:
            phone_number: Customer phone number
            user_message: User's message
            assistant_response: Assistant's response
            metadata: Additional metadata
        
        Returns:
            {
                "turn_id": "turn_xxx",
                "conversation_stage": "negotiation",
                "requires_escalation": False
            }
        """
        try:
            # Add user message
            self.add_to_history(
                phone_number,
                "user",
                user_message,
                {"type": "user_input"},
            )

            # Add assistant response
            self.add_to_history(
                phone_number,
                "assistant",
                assistant_response,
                metadata,
            )

            # Detect conversation stage
            stage = self.detect_conversation_stage(phone_number)

            # Update stage in conversation
            if phone_number in self.conversations:
                self.conversations[phone_number]["conversation_stage"] = stage

            return {
                "turn_id": f"turn_{len(self.get_conversation_history(phone_number))}",
                "conversation_stage": stage,
                "requires_escalation": stage == "escalated",
            }

        except Exception as e:
            logger.error(f"Error handling multi-turn: {str(e)}")
            return {"error": str(e)}

    def get_conversation_summary(self, phone_number: str) -> Dict[str, Any]:
        """
        Get summary of conversation
        
        Returns:
            {
                "total_messages": 8,
                "conversation_stage": "decision",
                "sentiment": "positive",
                "intents": ["price_inquiry", "booking"],
                "requires_review": False
            }
        """
        if phone_number not in self.conversations:
            return {"error": "Conversation not found"}

        conv = self.conversations[phone_number]
        history = conv["messages"]

        return {
            "conversation_id": conv["conversation_id"],
            "total_messages": len(history),
            "created_at": conv["created_at"].isoformat(),
            "updated_at": conv["updated_at"].isoformat(),
            "conversation_stage": self.detect_conversation_stage(phone_number),
            "sentiment_trend": conv["sentiment_trend"],
            "requires_human_review": conv["requires_human_review"],
            "first_message": history[0]["content"] if history else None,
            "last_message": history[-1]["content"] if history else None,
        }

    def mark_for_human_review(self, phone_number: str, reason: str) -> bool:
        """Mark conversation for human agent review"""
        try:
            if phone_number in self.conversations:
                self.conversations[phone_number]["requires_human_review"] = True
                self.conversations[phone_number]["review_reason"] = reason
                logger.info(f"Conversation marked for review: {reason}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error marking for review: {str(e)}")
            return False

    def close_conversation(self, phone_number: str) -> bool:
        """Close conversation"""
        try:
            if phone_number in self.conversations:
                self.conversations[phone_number]["closed_at"] = datetime.now()
                logger.info(f"Conversation closed: {phone_number}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error closing conversation: {str(e)}")
            return False

    def get_active_conversations(self, max_age_hours: int = 24) -> List[str]:
        """Get list of active conversations"""
        active = []
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)

        for phone, conv in self.conversations.items():
            if conv["updated_at"] > cutoff_time and not conv.get("closed_at"):
                active.append(phone)

        return active
