"""
WhatsApp Response Generator Service
Generates LLM-powered responses using RAG context
Routes to best LLM based on query complexity
"""

import os
import logging
from typing import Dict, Any, Optional
import requests
from .rag_retriever import RAGRetriever
from .whatsapp_message_parser import WhatsAppMessageParser

logger = logging.getLogger(__name__)


class WhatsAppResponseGenerator:
    """
    Generates intelligent WhatsApp responses
    Uses RAG for context and routes to appropriate LLM
    """

    def __init__(self):
        self.retriever = RAGRetriever()
        self.parser = WhatsAppMessageParser()
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY")
        self.openrouter_base = "https://openrouter.ai/api/v1"

    def route_to_llm(
        self,
        intent: str,
        complexity: str,
        query: str,
    ) -> str:
        """
        Route query to best LLM based on task characteristics
        
        Args:
            intent: Message intent (price_inquiry, objection_safety, etc)
            complexity: low, medium, high
            query: Original query
        
        Returns:
            LLM model name to use
        """
        # Simple routing logic
        if complexity == "high" or "reasoning" in intent:
            return "kimi/k2"  # Reasoning model
        elif complexity == "medium":
            return "grok-4"  # Balanced model
        elif "safety" in intent or "refund" in intent:
            return "claude-3-opus"  # Careful model for sensitive topics
        else:
            return "qwen/qwen-3-32b"  # Fast model for simple queries

    def build_system_prompt(
        self,
        customer_data: Optional[Dict[str, Any]] = None,
        message_context: Optional[str] = None,
    ) -> str:
        """
        Build system prompt for LLM
        
        Args:
            customer_data: Customer profile information
            message_context: Analysis of current message
        
        Returns:
            System prompt string
        """
        system_prompt = """You are a friendly and helpful Trek and Stay customer support agent.
Your role is to provide accurate, personalized responses about trek booking inquiries.

GUIDELINES:
1. Be warm, friendly, and engaging (use appropriate emojis)
2. Provide accurate information based on context provided
3. Always include a clear Call-to-Action (CTA)
4. Personalize responses based on customer preferences
5. Address concerns directly and empathetically
6. Mention special offers when relevant
7. Keep responses concise but informative (2-3 paragraphs max)
8. Use customer's name if available
9. Never make up information - use provided context
10. Suggest next steps or additional resources

RESPONSE FORMAT:
- Start with engaging greeting
- Address their main question/concern
- Provide relevant details
- Include special offer or urgency if applicable
- End with clear CTA

"""

        if customer_data:
            system_prompt += f"\nCUSTOMER INFO:\n"
            if customer_data.get("name"):
                system_prompt += f"- Name: {customer_data['name']}\n"
            if customer_data.get("previous_treks"):
                system_prompt += f"- Previous Treks: {customer_data['previous_treks']}\n"
            if customer_data.get("budget"):
                system_prompt += f"- Budget: {customer_data['budget']}\n"
            if customer_data.get("preferences"):
                system_prompt += f"- Preferences: {customer_data['preferences']}\n"

        if message_context:
            system_prompt += f"\nCURRENT MESSAGE CONTEXT:\n{message_context}\n"

        return system_prompt

    def build_user_prompt(
        self,
        query: str,
        rag_context: Dict[str, str],
        previous_messages: Optional[list] = None,
    ) -> str:
        """
        Build user prompt with RAG context
        
        Args:
            query: Customer query
            rag_context: Retrieved documents context
            previous_messages: Previous conversation messages
        
        Returns:
            User prompt with context
        """
        prompt = f"Customer Question: {query}\n\n"

        # Add RAG context
        prompt += "RELEVANT CONTEXT:\n"
        for key, value in rag_context.items():
            if value and value != "No content available from retrieved documents.":
                prompt += f"\n{key.upper()}:\n{value}\n"

        # Add conversation history if available
        if previous_messages:
            prompt += "\nPREVIOUS CONVERSATION:\n"
            for msg in previous_messages[-3:]:  # Last 3 messages
                role = "Customer" if msg.get("role") == "user" else "Agent"
                prompt += f"{role}: {msg.get('content', '')}\n"

        prompt += "\nProvide a helpful response to the customer's question."

        return prompt

    def generate_response_with_rag(
        self,
        query: str,
        customer_data: Optional[Dict[str, Any]] = None,
        trek_name: Optional[str] = None,
        previous_messages: Optional[list] = None,
    ) -> Dict[str, Any]:
        """
        Generate LLM response with RAG context
        
        Args:
            query: Customer message
            customer_data: Customer information
            trek_name: Specific trek being asked about
            previous_messages: Previous conversation
        
        Returns:
            {
                "response": "Generated message text",
                "llm_used": "kimi/k2",
                "tokens_used": 150,
                "cost": 0.002,
                "confidence": 0.95
            }
        """
        try:
            # Parse message
            parsed = self.parser.parse_message(query)
            intent = parsed["intent"]["primary_intent"]
            sentiment = parsed["sentiment"]["sentiment"]

            # Determine complexity
            complexity = self._estimate_complexity(intent, query)

            # Route to best LLM
            llm_model = self.route_to_llm(intent, complexity, query)

            # Retrieve RAG context
            rag_context = self.retriever.get_comprehensive_context(
                query=query,
                trek_name=trek_name,
                include_faq=True,
                include_policy=True,
            )

            # Build prompts
            message_context = self.parser.get_conversation_context(query)
            system_prompt = self.build_system_prompt(customer_data, message_context)
            user_prompt = self.build_user_prompt(query, rag_context, previous_messages)

            # Call OpenRouter LLM
            response_data = self._call_openrouter(
                model=llm_model,
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )

            if response_data.get("error"):
                logger.error(f"LLM error: {response_data['error']}")
                return {
                    "response": "I apologize, I'm having trouble processing your request. Please try again.",
                    "error": response_data.get("error"),
                    "llm_used": llm_model,
                }

            # Extract response
            response_text = response_data.get("choices", [{}])[0].get("message", {}).get("content", "")

            # Add personalization
            response_text = self._add_personalization(response_text, customer_data)

            # Add CTA
            response_text = self._add_cta(response_text, intent)

            return {
                "response": response_text,
                "llm_used": llm_model,
                "tokens_used": response_data.get("usage", {}).get("total_tokens", 0),
                "intent": intent,
                "sentiment": sentiment,
                "complexity": complexity,
                "success": True,
            }

        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return {
                "response": "I apologize for the error. Please contact our support team.",
                "error": str(e),
                "success": False,
            }

    def _call_openrouter(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
    ) -> Dict[str, Any]:
        """Call OpenRouter LLM API"""
        try:
            headers = {
                "Authorization": f"Bearer {self.openrouter_key}",
                "Content-Type": "application/json",
            }

            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.7,
                "max_tokens": 500,
            }

            response = requests.post(
                f"{self.openrouter_base}/chat/completions",
                json=payload,
                headers=headers,
                timeout=30,
            )

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"OpenRouter API error: {response.text}")
                return {"error": response.text}

        except Exception as e:
            logger.error(f"Error calling OpenRouter: {str(e)}")
            return {"error": str(e)}

    def _estimate_complexity(self, intent: str, query: str) -> str:
        """Estimate query complexity"""
        complexity_indicators = {
            "high": ["refund", "cancel", "problem", "issue", "broken"],
            "medium": ["objection", "worried", "concern"],
            "low": ["price", "timing", "general"],
        }

        for level, keywords in complexity_indicators.items():
            if any(keyword in intent.lower() for keyword in keywords):
                return level

        # Default based on query length
        if len(query) > 150:
            return "high"
        elif len(query) > 50:
            return "medium"
        else:
            return "low"

    def _add_personalization(
        self,
        response: str,
        customer_data: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Add personalization to response"""
        if not customer_data:
            return response

        # Add customer name
        if customer_data.get("name"):
            response = response.replace("Customer", customer_data["name"])

        # Add previous trek reference
        if customer_data.get("previous_treks"):
            prev_trek = customer_data["previous_treks"][0] if isinstance(customer_data["previous_treks"], list) else customer_data["previous_treks"]
            response = response.replace("trek", f"trek (like your {prev_trek})")

        return response

    def _add_cta(self, response: str, intent: str) -> str:
        """Add Call-to-Action to response"""
        cta_map = {
            "price_inquiry": "\n\n💰 Ready to book? Reply YES and I'll send you the booking link!",
            "booking": "\n\n✅ Let's confirm your trek! Reply with your preferred dates.",
            "objection_safety": "\n\n🔒 Convinced now? Let's get you booked!",
            "refund": "\n\n📋 Let's process your refund. What's the best way to contact you?",
            "feedback": "\n\n😊 Thanks for sharing! Anything else I can help with?",
        }

        cta = cta_map.get(intent, "\n\n🚀 How can I help you further?")
        return response + cta

    def validate_response(self, response: str) -> Dict[str, Any]:
        """
        Validate generated response
        
        Returns:
            {
                "valid": True,
                "issues": [],
                "score": 0.95
            }
        """
        issues = []
        score = 1.0

        # Check for hallucinations
        if "I don't know" not in response and len(response) < 20:
            issues.append("Response too short")
            score -= 0.2

        # Check for CTA
        if not any(cta in response for cta in ["book", "reply", "contact", "chat", "let", "click"]):
            issues.append("Missing call-to-action")
            score -= 0.1

        # Check for professionalism
        profanity_words = ["damn", "hell", "crap"]  # Basic check
        if any(word in response.lower() for word in profanity_words):
            issues.append("Inappropriate language")
            score -= 0.3

        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "score": max(score, 0.5),
        }
