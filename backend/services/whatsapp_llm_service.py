"""
WhatsApp LLM Integration Service
Integrates OpenAI GPT with WhatsApp for human-like automatic responses
"""

import logging
from typing import Dict, Optional, List, Tuple
from datetime import datetime
import json
import os

from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage

from .whatsapp_ai_config import WhatsAppAIConfig

logger = logging.getLogger(__name__)


class WhatsAppLLMService:
    """
    Service for generating human-like responses using OpenAI GPT
    
    Features:
    - Context-aware responses
    - Multi-turn conversation support
    - RAG integration (uses provided context)
    - Safety checks
    - Cost tracking
    """

    def __init__(self):
        """Initialize LLM service"""
        self.config = WhatsAppAIConfig()
        
        try:
            self.llm = ChatOpenAI(
                model_name=self.config.LLM_MODEL,
                temperature=self.config.LLM_TEMPERATURE,
                max_tokens=self.config.LLM_MAX_TOKENS,
                openai_api_key=self.config.OPENAI_API_KEY,
                request_timeout=30,
            )
            logger.info(f"✅ LLM initialized: {self.config.LLM_MODEL}")
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {e}")
            self.llm = None

    def generate_response(
        self,
        user_message: str,
        context_docs: List[Dict] = None,
        customer_name: Optional[str] = None,
        conversation_history: List[Dict] = None,
    ) -> Dict:
        """
        Generate human-like response to customer message
        
        Args:
            user_message: Customer's message/question
            context_docs: Retrieved RAG documents for context
            customer_name: Customer name for personalization
            conversation_history: Previous messages in conversation
        
        Returns:
            Dict with:
            - response: Generated text
            - confidence: How confident the AI is (0-1)
            - tokens_used: OpenAI tokens used
            - cost: Estimated cost in USD
        """
        if not self.llm:
            return {
                "response": self.config.FALLBACK_RESPONSES["unknown_query"],
                "confidence": 0,
                "tokens_used": 0,
                "cost": 0,
                "error": "LLM not initialized"
            }

        try:
            # 1. Build context from RAG documents
            context_text = self._build_context_text(context_docs)
            
            # 2. Build conversation history
            messages = self._build_message_history(
                user_message,
                context_text,
                customer_name,
                conversation_history
            )
            
            # 3. Call LLM
            logger.info(f"Calling LLM with {len(messages)} messages")
            response = self.llm(messages)
            
            # 4. Extract and clean response
            reply_text = response.content.strip()
            
            # 5. Estimate tokens and cost
            tokens_estimate = self._estimate_tokens(messages) + len(reply_text.split())
            cost_estimate = self._calculate_cost(tokens_estimate)
            
            # 6. Calculate confidence
            confidence = self._calculate_confidence(reply_text, context_docs)
            
            logger.info(f"Generated response ({len(reply_text)} chars, confidence: {confidence:.2%})")
            
            return {
                "response": reply_text,
                "confidence": confidence,
                "tokens_used": tokens_estimate,
                "cost": cost_estimate,
                "success": True,
            }

        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                "response": self.config.FALLBACK_RESPONSES["unknown_query"],
                "confidence": 0,
                "tokens_used": 0,
                "cost": 0,
                "error": str(e),
                "success": False,
            }

    def _build_context_text(self, context_docs: Optional[List[Dict]]) -> str:
        """Build context string from RAG documents"""
        if not context_docs:
            return "No specific documents found."
        
        context_parts = []
        for i, doc in enumerate(context_docs[:self.config.RAG_TOP_K], 1):
            doc_type = doc.get("doc_type", "document")
            title = doc.get("title", f"Document {i}")
            content = doc.get("content", "")[:300]  # Limit to 300 chars per doc
            
            context_parts.append(f"\n[{doc_type.upper()} {i}] {title}\n{content}")
        
        return "\n".join(context_parts) if context_parts else "No specific documents found."

    def _build_message_history(
        self,
        user_message: str,
        context_text: str,
        customer_name: Optional[str],
        conversation_history: Optional[List[Dict]],
    ) -> List:
        """Build LangChain message history for LLM"""
        messages = []
        
        # 1. System prompt (always first)
        system_prompt = self.config.SYSTEM_PROMPT
        if customer_name:
            system_prompt += f"\n\nCustomer name: {customer_name}"
        
        messages.append(SystemMessage(content=system_prompt))
        
        # 2. Add context as reference
        context_message = f"""
CONTEXT FOR THIS CONVERSATION:
{context_text}

Use this information to answer the customer's questions accurately.
"""
        messages.append(SystemMessage(content=context_message))
        
        # 3. Previous conversation messages (if any)
        if conversation_history:
            for msg in conversation_history[-5:]:  # Last 5 messages only
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))
        
        # 4. Current user message
        messages.append(HumanMessage(content=user_message))
        
        return messages

    def _estimate_tokens(self, messages: List) -> int:
        """Rough estimate of tokens (1 token ≈ 4 characters)"""
        total_chars = sum(len(msg.content) for msg in messages)
        return int(total_chars / 4)

    def _calculate_cost(self, tokens: int) -> float:
        """
        Calculate estimated OpenAI API cost
        GPT-4: $0.03 per 1k input tokens, $0.06 per 1k output tokens
        GPT-3.5: $0.0005 per 1k input tokens, $0.0015 per 1k output tokens
        """
        if "gpt-4" in self.config.LLM_MODEL:
            # Assume 50% input, 50% output
            return (tokens * 0.03 + tokens * 0.06) / 2000
        else:
            # GPT-3.5-turbo
            return (tokens * 0.0005 + tokens * 0.0015) / 2000

    def _calculate_confidence(self, response: str, context_docs: Optional[List[Dict]]) -> float:
        """
        Calculate confidence score (0-1)
        Higher if:
        - Has context documents
        - Response is detailed
        - No fallback language detected
        """
        confidence = 0.5  # Base confidence
        
        # Boost if we have context
        if context_docs and len(context_docs) > 0:
            confidence += 0.2
        
        # Boost if response is detailed
        if len(response) > 100:
            confidence += 0.15
        elif len(response) > 50:
            confidence += 0.05
        
        # Penalize if using fallback language
        fallback_phrases = [
            "i don't know",
            "not sure",
            "let me check",
            "unclear",
            "unable to",
        ]
        if any(phrase in response.lower() for phrase in fallback_phrases):
            confidence -= 0.2
        
        return min(max(confidence, 0), 1)  # Clamp to 0-1

    def stream_response(
        self,
        user_message: str,
        context_docs: List[Dict] = None,
        customer_name: Optional[str] = None,
    ):
        """Stream response for real-time display"""
        try:
            context_text = self._build_context_text(context_docs)
            messages = self._build_message_history(user_message, context_text, customer_name, None)
            
            # Stream response
            for chunk in self.llm.stream(messages):
                yield chunk.content
                
        except Exception as e:
            logger.error(f"Error streaming response: {e}")
            yield self.config.FALLBACK_RESPONSES["unknown_query"]

    def validate_response(self, response: str) -> bool:
        """
        Safety check on response
        - No spam/gibberish
        - Reasonable length
        - Contains actual content
        """
        # Length check
        if len(response) < 10 or len(response) > 2000:
            return False
        
        # Content check - not just repeated characters
        if len(set(response)) < 5:  # Very low character diversity
            return False
        
        # Check for actual words
        words = response.split()
        if len(words) < 3:
            return False
        
        return True


class ConversationMemory:
    """
    Manages multi-turn conversation memory
    Stores conversation history for context
    """
    
    def __init__(self, max_history: int = 10):
        """Initialize conversation memory"""
        self.conversations: Dict[str, List[Dict]] = {}
        self.max_history = max_history

    def add_message(self, phone: str, role: str, content: str):
        """Add message to conversation history"""
        if phone not in self.conversations:
            self.conversations[phone] = []
        
        self.conversations[phone].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
        })
        
        # Keep only last N messages
        if len(self.conversations[phone]) > self.max_history:
            self.conversations[phone] = self.conversations[phone][-self.max_history:]

    def get_history(self, phone: str) -> List[Dict]:
        """Get conversation history for a customer"""
        return self.conversations.get(phone, [])

    def clear_history(self, phone: str):
        """Clear conversation history"""
        if phone in self.conversations:
            del self.conversations[phone]

    def get_context_summary(self, phone: str) -> str:
        """Get summary of conversation for context"""
        history = self.get_history(phone)
        if not history:
            return "No previous conversation context."
        
        summary = f"Previous {len(history)} messages in conversation:\n"
        for msg in history[-3:]:  # Last 3 messages
            summary += f"- {msg['role'].upper()}: {msg['content'][:50]}...\n"
        
        return summary


# Global instances
_llm_service = None
_conversation_memory = None


def get_llm_service() -> WhatsAppLLMService:
    """Get or create LLM service instance"""
    global _llm_service
    if _llm_service is None:
        _llm_service = WhatsAppLLMService()
    return _llm_service


def get_conversation_memory() -> ConversationMemory:
    """Get or create conversation memory instance"""
    global _conversation_memory
    if _conversation_memory is None:
        _conversation_memory = ConversationMemory()
    return _conversation_memory


if __name__ == "__main__":
    # Test the service
    print("Testing WhatsApp LLM Service...")
    print("=" * 50)
    
    llm_service = get_llm_service()
    
    # Test message
    test_context = [
        {
            "doc_type": "trek",
            "title": "Triund Trek",
            "content": "Easy 3-day trek in Himachal Pradesh. Cost: ₹5,000. Good for beginners."
        }
    ]
    
    result = llm_service.generate_response(
        user_message="How much is the Triund trek?",
        context_docs=test_context,
        customer_name="Rahul",
    )
    
    print(f"Response: {result['response']}")
    print(f"Confidence: {result['confidence']:.0%}")
    print(f"Tokens: {result['tokens_used']}")
    print(f"Cost: ₹{result['cost'] * 100:.2f}")  # Convert to Indian rupees (approx)
