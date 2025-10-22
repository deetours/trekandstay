"""
WhatsApp Webhook Orchestrator
Main orchestration flow for incoming WhatsApp messages
"""

import logging
from typing import Dict, Any, Optional

from .whatsapp_api import WhatsAppAPI
from .whatsapp_message_parser import WhatsAppMessageParser
from .whatsapp_safety import WhatsAppSafety
from .whatsapp_context import WhatsAppContextBuilder
from .rag_retriever import RAGRetriever
from .whatsapp_response_generator import WhatsAppResponseGenerator
from .whatsapp_conversation_manager import WhatsAppConversationManager

logger = logging.getLogger(__name__)


class WhatsAppWebhookOrchestrator:
    """
    Orchestrates complete WhatsApp message flow:
    1. Parse message
    2. Check safety
    3. Build context
    4. Retrieve RAG documents
    5. Generate response
    6. Validate
    7. Send reply
    8. Log interaction
    """

    def __init__(self):
        self.api = WhatsAppAPI()
        self.parser = WhatsAppMessageParser()
        self.safety = WhatsAppSafety()
        self.context_builder = WhatsAppContextBuilder()
        self.retriever = RAGRetriever()
        self.generator = WhatsAppResponseGenerator()
        self.conversation_manager = WhatsAppConversationManager()

    def process_incoming_message(
        self,
        phone_number: str,
        message_text: str,
        message_id: str,
    ) -> Dict[str, Any]:
        """
        Complete orchestration flow for incoming message
        
        Args:
            phone_number: Customer phone number
            message_text: Message content
            message_id: WhatsApp message ID
        
        Returns:
            {
                "status": "success",
                "message_id": "wamid.xxx",
                "response_sent": True,
                "flow_steps": {...}
            }
        """
        flow_data = {
            "phone_number": phone_number,
            "message_id": message_id,
            "steps": {},
            "errors": [],
        }

        try:
            # Step 1: Parse message (0.1s)
            logger.info(f"[1/11] Parsing message from {phone_number}")
            parsed = self.parser.parse_message(message_text, phone_number)
            flow_data["steps"]["parse"] = {
                "intent": parsed["intent"]["primary_intent"],
                "sentiment": parsed["sentiment"]["sentiment"],
                "language": parsed["language"],
            }

            # Step 2: Check for unsubscriber (0.05s)
            logger.info(f"[2/11] Checking unsubscriber status")
            unsubscriber_result = self.safety.detect_unsubscriber(message_text)
            
            if unsubscriber_result["is_unsubscriber"]:
                logger.warning(f"Unsubscribe request from {phone_number}")
                # Add to block list, don't send response
                return {
                    "status": "unsubscriber",
                    "phone_number": phone_number,
                    "action": "added_to_block_list",
                }

            # Step 3: Build customer context (0.2s)
            logger.info(f"[3/11] Building customer context")
            customer_context = self.context_builder.build_full_context(phone_number)
            flow_data["steps"]["context"] = {
                "lead_score": customer_context["lead_score"]["score"],
                "lead_quality": customer_context["lead_score"]["quality"],
            }

            # Step 4: Retrieve RAG context (0.5s)
            logger.info(f"[4/11] Retrieving RAG documents")
            trek_names = parsed["entities"]["trek_names"]
            trek_name = trek_names[0] if trek_names else None
            
            rag_context = self.retriever.get_comprehensive_context(
                query=message_text,
                trek_name=trek_name,
                include_faq=True,
                include_policy=True,
            )
            flow_data["steps"]["rag_retrieval"] = {
                "documents_found": sum(1 for v in rag_context.values() if v and v != "No relevant documents found."),
                "trek_name": trek_name,
            }

            # Step 5: Analyze ban risk (0.1s)
            logger.info(f"[5/11] Analyzing ban risk")
            ban_risk = self.safety.analyze_ban_risk(message_text)
            flow_data["steps"]["ban_risk"] = {
                "risk_score": ban_risk["risk_score"],
                "risk_level": ban_risk["risk_level"],
            }

            # Step 6: Flag for review if needed
            if ban_risk["should_block"]:
                logger.warning(f"Message blocked due to high ban risk: {phone_number}")
                return {
                    "status": "blocked",
                    "reason": "High ban risk",
                    "risk_score": ban_risk["risk_score"],
                }

            if ban_risk["should_flag"]:
                logger.warning(f"Message flagged for review: {phone_number}")
                self.conversation_manager.mark_for_human_review(
                    phone_number,
                    f"High ban risk: {ban_risk['risk_score']}/100"
                )

            # Step 7: Generate response (0.3-0.8s)
            logger.info(f"[6/11] Generating LLM response")
            response_data = self.generator.generate_response_with_rag(
                query=message_text,
                customer_data=customer_context["profile"],
                trek_name=trek_name,
                previous_messages=self.conversation_manager.get_conversation_history(phone_number),
            )

            if response_data.get("error"):
                logger.error(f"Error generating response: {response_data['error']}")
                # Send fallback response
                response_text = "Thank you for your message! I'll have an agent respond shortly. 😊"
            else:
                response_text = response_data["response"]

            flow_data["steps"]["generation"] = {
                "llm_used": response_data.get("llm_used"),
                "intent": response_data.get("intent"),
                "success": response_data.get("success", False),
            }

            # Step 8: Validate response (0.1s)
            logger.info(f"[7/11] Validating response")
            validation = self.generator.validate_response(response_text)
            flow_data["steps"]["validation"] = {
                "valid": validation["valid"],
                "issues": validation["issues"],
                "score": validation["score"],
            }

            if not validation["valid"] and validation["score"] < 0.5:
                logger.warning(f"Response validation failed, using fallback")
                response_text = "Great question! Let me connect you with our expert. Thanks for reaching out! 🏔️"

            # Step 9: Check compliance (0.05s)
            logger.info(f"[8/11] Checking compliance")
            compliance = self.safety.check_compliance(response_text)
            flow_data["steps"]["compliance"] = {
                "compliant": compliance["compliant"],
                "issues": compliance["issues"],
            }

            if not compliance["compliant"]:
                logger.warning(f"Compliance issues detected, using generic response")
                response_text = "Thank you for your interest! Our team will assist you shortly. 🙏"

            # Step 10: Send reply (0.2s)
            logger.info(f"[9/11] Sending WhatsApp message")
            send_result = self.api.send_message(
                phone_number=phone_number,
                message_text=response_text,
            )

            flow_data["steps"]["send"] = {
                "status": send_result.get("status"),
                "message_id": send_result.get("message_id"),
            }

            if send_result["status"] != "sent":
                logger.error(f"Failed to send message: {send_result.get('error')}")
                flow_data["errors"].append(f"Send failed: {send_result.get('error')}")

            # Step 11: Log interaction (0.1s)
            logger.info(f"[10/11] Logging interaction")
            self.conversation_manager.handle_multi_turn_dialogue(
                phone_number=phone_number,
                user_message=message_text,
                assistant_response=response_text,
                metadata={
                    "intent": parsed["intent"]["primary_intent"],
                    "sentiment": parsed["sentiment"]["sentiment"],
                    "llm_used": response_data.get("llm_used"),
                    "ban_risk": ban_risk["risk_score"],
                },
            )

            flow_data["steps"]["logging"] = {
                "conversation_saved": True,
            }

            logger.info(f"[11/11] Complete!")

            # Calculate total time
            flow_data["status"] = "success"
            flow_data["response_sent"] = send_result["status"] == "sent"

            logger.info(f"Message processed successfully: {phone_number}")
            return flow_data

        except Exception as e:
            logger.error(f"Error in webhook orchestration: {str(e)}")
            flow_data["status"] = "error"
            flow_data["errors"].append(str(e))
            
            # Send fallback
            try:
                self.api.send_message(
                    phone_number=phone_number,
                    message_text="Sorry, I'm having trouble processing your message. Our team will help you shortly! 🙏"
                )
            except Exception as inner_e:
                logger.error(f"Failed to send fallback: {str(inner_e)}")

            return flow_data

    def handle_webhook_event(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle incoming WhatsApp webhook event
        
        Args:
            webhook_data: Webhook payload from WhatsApp
        
        Returns:
            {
                "status": "success",
                "processed": True
            }
        """
        try:
            parsed_event = self.api.parse_webhook(webhook_data)

            if parsed_event["type"] == "message":
                # Process new message
                return self.process_incoming_message(
                    phone_number=parsed_event["phone"],
                    message_text=parsed_event["message"],
                    message_id=parsed_event["message_id"],
                )

            elif parsed_event["type"] == "status":
                # Handle delivery/read status
                logger.info(f"Message status update: {parsed_event['status']}")
                return {
                    "status": "acknowledged",
                    "type": "status_update",
                }

            else:
                logger.warning(f"Unknown webhook type: {parsed_event.get('type')}")
                return {
                    "status": "acknowledged",
                    "type": "unknown",
                }

        except Exception as e:
            logger.error(f"Error handling webhook: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
            }
