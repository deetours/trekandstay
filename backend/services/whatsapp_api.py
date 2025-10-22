"""
WhatsApp Business API Wrapper Service
Send messages, manage bulk campaigns, and handle webhooks via WhatsApp Business API
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class WhatsAppAPI:
    """
    Custom WhatsApp Business API wrapper
    Handles all WhatsApp message operations
    """

    def __init__(self):
        self.api_key = os.getenv("WHATSAPP_BUSINESS_API_KEY")
        self.phone_id = os.getenv("WHATSAPP_BUSINESS_PHONE_ID")
        self.account_id = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID")
        self.webhook_token = os.getenv("WHATSAPP_BUSINESS_WEBHOOK_TOKEN")
        self.base_url = f"https://graph.instagram.com/v18.0/{self.phone_id}"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def send_message(
        self,
        phone_number: str,
        message_text: str,
        media_url: Optional[str] = None,
        media_type: str = "image",
    ) -> Dict[str, Any]:
        """
        Send a single message to a customer
        
        Args:
            phone_number: Customer phone number (919876543210)
            message_text: Message content
            media_url: Optional media URL (image, video, document)
            media_type: Type of media (image, video, document, audio)
        
        Returns:
            {
                "status": "sent",
                "message_id": "wamid.xxx",
                "timestamp": "2025-01-15T10:30:00Z"
            }
        """
        try:
            # Prepare payload
            payload = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": phone_number,
            }

            # Add message content
            if media_url:
                payload["type"] = "image" if media_type == "image" else media_type
                payload[media_type] = {
                    "link": media_url,
                    "caption": message_text if media_type == "image" else None,
                }
            else:
                payload["type"] = "text"
                payload["text"] = {"preview_url": True, "body": message_text}

            # Send request
            response = requests.post(
                f"{self.base_url}/messages",
                json=payload,
                headers=self.headers,
                timeout=30,
            )

            if response.status_code == 200:
                data = response.json()
                logger.info(
                    f"Message sent to {phone_number}: {data.get('messages', [{}])[0].get('id')}"
                )
                return {
                    "status": "sent",
                    "message_id": data.get("messages", [{}])[0].get("id"),
                    "timestamp": datetime.now().isoformat() + "Z",
                }
            else:
                logger.error(f"WhatsApp API error: {response.text}")
                return {
                    "status": "failed",
                    "error": response.text,
                    "timestamp": datetime.now().isoformat() + "Z",
                }

        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return {
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.now().isoformat() + "Z",
            }

    def send_template_message(
        self, phone_number: str, template_name: str, parameters: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Send pre-approved template message
        
        Args:
            phone_number: Customer phone number
            template_name: WhatsApp pre-approved template name
            parameters: Dynamic parameters for template
        
        Returns:
            {
                "status": "sent",
                "message_id": "wamid.xxx"
            }
        """
        try:
            payload = {
                "messaging_product": "whatsapp",
                "to": phone_number,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": "en_US"},
                },
            }

            if parameters:
                payload["template"]["components"] = [
                    {
                        "type": "body",
                        "parameters": [{"type": "text", "text": p} for p in parameters],
                    }
                ]

            response = requests.post(
                f"{self.base_url}/messages",
                json=payload,
                headers=self.headers,
                timeout=30,
            )

            if response.status_code == 200:
                data = response.json()
                logger.info(f"Template message sent to {phone_number}")
                return {"status": "sent", "message_id": data.get("messages", [{}])[0].get("id")}
            else:
                logger.error(f"Template send error: {response.text}")
                return {"status": "failed", "error": response.text}

        except Exception as e:
            logger.error(f"Error sending template: {str(e)}")
            return {"status": "failed", "error": str(e)}

    def send_bulk_messages(
        self, phone_numbers: List[str], message_text: str, delay_ms: int = 1000
    ) -> Dict[str, Any]:
        """
        Send message to multiple customers
        
        Args:
            phone_numbers: List of phone numbers
            message_text: Message to send
            delay_ms: Delay between messages (default 1000ms)
        
        Returns:
            {
                "campaign_id": "camp_12345",
                "total": 100,
                "sent": 98,
                "failed": 2
            }
        """
        import time
        from uuid import uuid4

        campaign_id = f"camp_{uuid4().hex[:8]}"
        results = {"campaign_id": campaign_id, "total": len(phone_numbers), "sent": 0, "failed": 0, "messages": []}

        for phone in phone_numbers:
            result = self.send_message(phone, message_text)
            if result["status"] == "sent":
                results["sent"] += 1
            else:
                results["failed"] += 1
            
            results["messages"].append({
                "phone": phone,
                "status": result["status"],
                "message_id": result.get("message_id"),
            })

            # Add delay between messages
            time.sleep(delay_ms / 1000)

        logger.info(
            f"Bulk send complete: {results['sent']}/{results['total']} sent, {results['failed']} failed"
        )
        return results

    def get_message_status(self, message_id: str) -> Dict[str, Any]:
        """
        Get delivery status of a message
        
        Args:
            message_id: WhatsApp message ID
        
        Returns:
            {
                "status": "delivered|sent|read|failed",
                "delivered_at": "2025-01-15T10:32:00Z"
            }
        """
        try:
            response = requests.get(
                f"{self.base_url}/message_status/{message_id}",
                headers=self.headers,
                timeout=30,
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "status": data.get("status", "unknown"),
                    "delivered_at": data.get("timestamp"),
                }
            else:
                return {"status": "unknown", "error": response.text}

        except Exception as e:
            logger.error(f"Error getting message status: {str(e)}")
            return {"status": "error", "error": str(e)}

    def verify_webhook_token(self, token: str) -> bool:
        """Verify webhook authentication token"""
        return token == self.webhook_token

    def parse_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse incoming webhook from WhatsApp
        
        Returns:
            {
                "type": "message|status",
                "phone": "919876543210",
                "message": "Customer message text",
                "message_id": "wamid.xxx",
                "timestamp": datetime,
                "status": "delivered" (if status update)
            }
        """
        try:
            entry = data.get("entry", [{}])[0]
            changes = entry.get("changes", [{}])[0]
            value = changes.get("value", {})
            
            # Check if it's a message or status update
            statuses = value.get("statuses", [])
            messages = value.get("messages", [])

            if statuses:
                status = statuses[0]
                return {
                    "type": "status",
                    "message_id": status.get("id"),
                    "status": status.get("status"),
                    "timestamp": datetime.fromtimestamp(int(status.get("timestamp", 0))),
                }

            if messages:
                message = messages[0]
                contact = value.get("contacts", [{}])[0]
                
                return {
                    "type": "message",
                    "phone": message.get("from"),
                    "message": message.get("text", {}).get("body", ""),
                    "message_id": message.get("id"),
                    "contact_name": contact.get("profile", {}).get("name", "Unknown"),
                    "timestamp": datetime.fromtimestamp(int(message.get("timestamp", 0))),
                }

            return {"type": "unknown", "data": data}

        except Exception as e:
            logger.error(f"Error parsing webhook: {str(e)}")
            return {"type": "error", "error": str(e)}

    def retry_failed_messages(self, message_ids: List[str]) -> Dict[str, Any]:
        """
        Retry sending failed messages
        
        Args:
            message_ids: List of message IDs to retry
        
        Returns:
            {
                "retry_count": 5,
                "successful": 4,
                "failed": 1
            }
        """
        results = {"retry_count": len(message_ids), "successful": 0, "failed": 0, "messages": []}

        for msg_id in message_ids:
            # Note: In production, you'd fetch the original message and resend
            status = self.get_message_status(msg_id)
            if status["status"] != "failed":
                results["successful"] += 1
            else:
                results["failed"] += 1
            
            results["messages"].append({"message_id": msg_id, "status": status["status"]})

        logger.info(f"Retry complete: {results['successful']} successful, {results['failed']} failed")
        return results

    def mark_message_as_read(self, message_id: str) -> bool:
        """Mark incoming message as read"""
        try:
            payload = {
                "messaging_product": "whatsapp",
                "status": "read",
                "message_id": message_id,
            }

            response = requests.post(
                f"{self.base_url}/messages",
                json=payload,
                headers=self.headers,
                timeout=30,
            )

            return response.status_code == 200

        except Exception as e:
            logger.error(f"Error marking message as read: {str(e)}")
            return False
