"""
Enhanced Smart WhatsApp Agent with LLM Integration
Extends the basic agent with human-like GPT responses
"""

import logging
from typing import Dict, Optional, List
from datetime import datetime

from .whatsapp_llm_service import get_llm_service, get_conversation_memory
from .rag_retriever import RAGRetriever
from .whatsapp_ai_config import WhatsAppAIConfig
from core.models import Lead, LeadEvent, OutboundMessage
from django.utils import timezone

logger = logging.getLogger(__name__)


class EnhancedSmartWhatsAppAgent:
    """
    Enhanced WhatsApp agent with real LLM integration
    
    Flow:
    1. Receive customer message
    2. Parse intent
    3. Retrieve RAG context
    4. Call OpenAI GPT-4
    5. Send response
    6. Log interaction + update lead
    
    Example:
        agent = EnhancedSmartWhatsAppAgent()
        result = agent.process_customer_message(
            phone="919876543210",
            message="How much is the Triund trek?",
            lead_id=123,
        )
        print(result['response'])
    """

    def __init__(self):
        """Initialize enhanced agent"""
        self.llm_service = get_llm_service()
        self.memory = get_conversation_memory()
        self.rag = RAGRetriever()
        self.config = WhatsAppAIConfig()
        
        logger.info("✅ Enhanced Smart WhatsApp Agent initialized")

    def process_customer_message(
        self,
        phone: str,
        message: str,
        lead_id: Optional[int] = None,
        customer_name: Optional[str] = None,
    ) -> Dict:
        """
        Process incoming customer message and generate response
        
        Args:
            phone: Customer phone number
            message: Their message/question
            lead_id: Associated lead ID (from database)
            customer_name: Customer name
        
        Returns:
            Dict with response and metadata
        """
        start_time = datetime.now()
        
        try:
            # 1. Get or create lead
            lead = self._get_or_create_lead(phone, customer_name, lead_id)
            
            # 2. Get conversation history
            history = self.memory.get_history(phone)
            
            # 3. Retrieve RAG context
            rag_docs = self._retrieve_context(message)
            
            # 4. Generate response using LLM
            llm_result = self.llm_service.generate_response(
                user_message=message,
                context_docs=rag_docs,
                customer_name=customer_name or (lead.name if lead else "Friend"),
                conversation_history=history,
            )
            
            if not llm_result.get("success", False):
                response_text = self.config.FALLBACK_RESPONSES["unknown_query"]
                confidence = 0
            else:
                response_text = llm_result["response"]
                confidence = llm_result["confidence"]
            
            # 5. Validate response
            if not self.llm_service.validate_response(response_text):
                response_text = self.config.FALLBACK_RESPONSES["unknown_query"]
                confidence = 0.3
            
            # 6. Log interaction
            self._log_interaction(
                lead=lead,
                phone=phone,
                customer_message=message,
                agent_response=response_text,
                confidence=confidence,
                rag_docs=rag_docs,
            )
            
            # 7. Add to memory
            self.memory.add_message(phone, "user", message)
            self.memory.add_message(phone, "assistant", response_text)
            
            # 8. Calculate metrics
            processing_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            
            result = {
                "success": True,
                "phone": phone,
                "customer_message": message,
                "response": response_text,
                "confidence": confidence,
                "processing_time_ms": processing_time_ms,
                "tokens_used": llm_result.get("tokens_used", 0),
                "cost_usd": llm_result.get("cost", 0),
                "rag_docs_used": len(rag_docs),
                "lead_id": lead.id if lead else None,
            }
            
            logger.info(f"✅ Message processed: {result['processing_time_ms']}ms, Confidence: {confidence:.0%}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error processing message: {e}", exc_info=True)
            return {
                "success": False,
                "phone": phone,
                "error": str(e),
                "response": self.config.FALLBACK_RESPONSES["unknown_query"],
                "confidence": 0,
            }

    def _get_or_create_lead(
        self,
        phone: str,
        name: Optional[str],
        lead_id: Optional[int],
    ) -> Optional[object]:
        """Get existing lead or create new one"""
        try:
            if lead_id:
                return Lead.objects.get(id=lead_id)
            
            # Try to find by phone
            lead = Lead.objects.filter(phone=phone).first()
            if lead:
                # Update last contact
                lead.is_whatsapp = True
                lead.last_contact_at = timezone.now()
                lead.save(update_fields=['is_whatsapp', 'last_contact_at'])
                return lead
            
            # Create new lead
            lead = Lead.objects.create(
                phone=phone,
                name=name or f"Customer {phone[-4:]}",
                source="whatsapp",
                is_whatsapp=True,
                stage="new",
                last_contact_at=timezone.now(),
            )
            logger.info(f"Created new lead: {lead.id}")
            return lead
            
        except Exception as e:
            logger.error(f"Error getting/creating lead: {e}")
            return None

    def _retrieve_context(self, message: str) -> List[Dict]:
        """Retrieve relevant documents from RAG"""
        try:
            docs = self.rag.retrieve_relevant_docs(
                query=message,
                top_k=self.config.RAG_TOP_K,
            )
            
            # Format documents for LLM
            formatted_docs = []
            for doc_id, score, metadata in docs:
                if score >= self.config.RAG_MIN_SCORE:
                    formatted_docs.append({
                        "doc_id": doc_id,
                        "content": metadata.get("content", ""),
                        "doc_type": metadata.get("doc_type", "article"),
                        "title": metadata.get("title", ""),
                        "score": score,
                    })
            
            logger.info(f"Retrieved {len(formatted_docs)} RAG documents (min_score: {self.config.RAG_MIN_SCORE})")
            return formatted_docs
            
        except Exception as e:
            logger.error(f"Error retrieving RAG context: {e}")
            return []

    def _log_interaction(
        self,
        lead: Optional[object],
        phone: str,
        customer_message: str,
        agent_response: str,
        confidence: float,
        rag_docs: List[Dict],
    ):
        """Log interaction to database for analytics"""
        try:
            if not lead:
                return
            
            # Create lead event
            LeadEvent.objects.create(
                lead=lead,
                type="inbound_msg",
                channel="custom_whatsapp",
                payload={
                    "text": customer_message,
                    "confidence": confidence,
                    "rag_docs": len(rag_docs),
                    "processed_by": "llm_agent",
                }
            )
            
            # Create outbound message log
            OutboundMessage.objects.create(
                lead=lead,
                to=phone,
                rendered_body=agent_response,
                status="sent",
                sent_at=timezone.now(),
            )
            
            # Update lead metadata
            metadata = lead.metadata or {}
            metadata["last_ai_response"] = {
                "timestamp": datetime.now().isoformat(),
                "confidence": confidence,
                "rag_docs": len(rag_docs),
            }
            lead.metadata = metadata
            lead.save(update_fields=['metadata'])
            
            logger.info(f"Logged interaction for lead {lead.id}")
            
        except Exception as e:
            logger.error(f"Error logging interaction: {e}")

    def handle_escalation(
        self,
        phone: str,
        reason: str,
        lead_id: Optional[int] = None,
    ) -> Dict:
        """
        Escalate conversation to human agent
        
        Reasons:
        - confidence too low
        - customer requested human
        - complex issue
        """
        try:
            lead = None
            if lead_id:
                lead = Lead.objects.get(id=lead_id)
            else:
                lead = Lead.objects.filter(phone=phone).first()
            
            if lead:
                # Create escalation event
                LeadEvent.objects.create(
                    lead=lead,
                    type="system",
                    channel="custom_whatsapp",
                    payload={
                        "event": "escalation",
                        "reason": reason,
                    }
                )
                
                # Mark for manual review
                lead.metadata = lead.metadata or {}
                lead.metadata["escalation_pending"] = True
                lead.metadata["escalation_reason"] = reason
                lead.save(update_fields=['metadata'])
            
            logger.warning(f"Escalation triggered: {reason} (Lead: {lead.id if lead else 'N/A'})")
            
            return {
                "success": True,
                "escalated": True,
                "reason": reason,
                "lead_id": lead.id if lead else None,
            }
            
        except Exception as e:
            logger.error(f"Error handling escalation: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def get_conversation_stats(self, phone: str) -> Dict:
        """Get statistics for a conversation"""
        history = self.memory.get_history(phone)
        
        user_msgs = [m for m in history if m['role'] == 'user']
        agent_msgs = [m for m in history if m['role'] == 'assistant']
        
        return {
            "phone": phone,
            "total_messages": len(history),
            "user_messages": len(user_msgs),
            "agent_messages": len(agent_msgs),
            "conversation_duration_seconds": 0,  # Could calculate from timestamps
            "has_history": len(history) > 0,
        }


# Singleton instance
_agent_instance = None


def get_enhanced_agent() -> EnhancedSmartWhatsAppAgent:
    """Get or create enhanced agent instance"""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = EnhancedSmartWhatsAppAgent()
    return _agent_instance


if __name__ == "__main__":
    # Test the enhanced agent
    print("Testing Enhanced Smart WhatsApp Agent")
    print("=" * 60)
    
    agent = get_enhanced_agent()
    
    # Simulate customer messages
    test_messages = [
        ("919876543210", "How much is the Everest trek?", "Rahul"),
        ("919876543211", "I want to book a trek for next month", "Priya"),
        ("919876543212", "What's the difficulty level of Triund?", "Amit"),
    ]
    
    for phone, msg, name in test_messages:
        print(f"\n👤 {name}: {msg}")
        print("-" * 60)
        
        result = agent.process_customer_message(
            phone=phone,
            message=msg,
            customer_name=name,
        )
        
        if result["success"]:
            print(f"🤖 Agent: {result['response']}")
            print(f"✅ Confidence: {result['confidence']:.0%}")
            print(f"⏱️ Time: {result['processing_time_ms']}ms")
        else:
            print(f"❌ Error: {result.get('error', 'Unknown error')}")
        
        # Show stats
        stats = agent.get_conversation_stats(phone)
        print(f"📊 Messages in conversation: {stats['total_messages']}")
