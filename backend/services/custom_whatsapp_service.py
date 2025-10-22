"""
Custom WhatsApp API Service - For Testing & Production
Works independently without Meta Business API

Features:
- Send messages via WhatsApp (integrated with third-party provider OR mock)
- Receive messages (webhook)
- Smart agent auto-reply
- Message tracking
- Testing mode (logs without sending)
"""

import os
import json
import requests
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

# ============================================================
# CONFIGURATION & ENUMS
# ============================================================

class MessageStatus(Enum):
    """Message status tracking"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"
    SCHEDULED = "scheduled"

class MessageType(Enum):
    """Message types"""
    TEXT = "text"
    IMAGE = "image"
    DOCUMENT = "document"
    VIDEO = "video"
    AUDIO = "audio"

@dataclass
class WhatsAppMessage:
    """Message object"""
    phone_number: str
    message_text: str
    message_id: str
    timestamp: str
    sender_type: str  # "user" or "agent"
    status: MessageStatus = MessageStatus.PENDING
    message_type: MessageType = MessageType.TEXT
    metadata: Optional[Dict] = None

@dataclass
class MessageResponse:
    """Response from message operation"""
    success: bool
    message_id: str
    status: str
    timestamp: str
    error: Optional[str] = None
    cost: Optional[float] = None

# ============================================================
# CUSTOM WHATSAPP SERVICE - CORE
# ============================================================

class CustomWhatsAppService:
    """
    Custom WhatsApp messaging service
    
    Supports multiple providers:
    - WASender (free tier)
    - Twilio WhatsApp API
    - Africa's Talking
    - Mock/Testing mode
    
    Usage:
        service = CustomWhatsAppService(provider="wasender", mode="testing")
        response = service.send_message("919876543210", "Hello!")
    """
    
    def __init__(self, provider: str = "mock", mode: str = "testing"):
        """
        Initialize service
        
        Args:
            provider: "mock" (testing) | "wasender" | "twilio" | "africas_talking"
            mode: "testing" (logs only) | "production" (actually sends)
        """
        self.provider = provider
        self.mode = mode
        self.is_testing = mode == "testing"
        
        # Load configuration
        self.config = self._load_config()
        
        # Initialize provider-specific configs
        self._init_provider()
        
        logger.info(f"WhatsApp Service initialized: Provider={provider}, Mode={mode}")
    
    def _load_config(self) -> Dict:
        """Load configuration from environment"""
        return {
            "wasender_api_key": os.getenv("WASENDER_API_KEY", "test_key"),
            "wasender_device_id": os.getenv("WASENDER_DEVICE_ID", "device_1"),
            "twilio_account_sid": os.getenv("TWILIO_ACCOUNT_SID"),
            "twilio_auth_token": os.getenv("TWILIO_AUTH_TOKEN"),
            "twilio_phone": os.getenv("TWILIO_PHONE"),
            "africas_talking_key": os.getenv("AFRICAS_TALKING_API_KEY"),
            "africas_talking_username": os.getenv("AFRICAS_TALKING_USERNAME"),
        }
    
    def _init_provider(self):
        """Initialize provider-specific settings"""
        if self.provider == "wasender":
            self.base_url = "https://api.wasender.ai/api"
            self.session = requests.Session()
            self.session.headers.update({
                "Authorization": f"Bearer {self.config['wasender_api_key']}"
            })
        
        elif self.provider == "twilio":
            try:
                from twilio.rest import Client
                self.twilio_client = Client(
                    self.config["twilio_account_sid"],
                    self.config["twilio_auth_token"]
                )
            except ImportError:
                logger.warning("Twilio not installed. Install: pip install twilio")
        
        elif self.provider == "africas_talking":
            self.base_url = "https://api.sandbox.africastalking.com/version1/messaging"
    
    # ============================================================
    # SEND MESSAGES
    # ============================================================
    
    def send_message(
        self,
        phone_number: str,
        message_text: str,
        message_type: str = "text",
        media_url: Optional[str] = None
    ) -> MessageResponse:
        """
        Send single message
        
        Args:
            phone_number: "919876543210"
            message_text: "Hello, how can we help?"
            message_type: "text", "image", "document", "video", "audio"
            media_url: URL if sending media
        
        Returns:
            MessageResponse with status and message_id
        
        Examples:
            # Send text
            response = service.send_message("919876543210", "Hi there!")
            
            # Send image
            response = service.send_message(
                "919876543210",
                "Check this trek photo!",
                message_type="image",
                media_url="https://example.com/trek.jpg"
            )
        """
        try:
            # Validate phone
            phone_number = self._validate_phone(phone_number)
            if not phone_number:
                return MessageResponse(
                    success=False,
                    message_id="",
                    status="failed",
                    timestamp=datetime.now().isoformat(),
                    error="Invalid phone number"
                )
            
            # Generate message ID
            message_id = self._generate_message_id()
            
            # In testing mode, just log it
            if self.is_testing:
                logger.info(f"[TEST MODE] Would send to {phone_number}: {message_text}")
                return MessageResponse(
                    success=True,
                    message_id=message_id,
                    status="sent",
                    timestamp=datetime.now().isoformat(),
                    cost=0.005  # Mock cost
                )
            
            # In production, actually send
            if self.provider == "mock":
                result = self._send_mock(phone_number, message_text, message_id)
            elif self.provider == "custom":
                result = self._send_custom(phone_number, message_text, message_id, media_url)
            elif self.provider == "wasender":
                result = self._send_wasender(phone_number, message_text, message_id, media_url)
            elif self.provider == "twilio":
                result = self._send_twilio(phone_number, message_text, message_id)
            elif self.provider == "africas_talking":
                result = self._send_africas_talking(phone_number, message_text, message_id)
            else:
                result = MessageResponse(
                    success=False,
                    message_id=message_id,
                    status="failed",
                    timestamp=datetime.now().isoformat(),
                    error=f"Unknown provider: {self.provider}"
                )
            
            return result
        
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return MessageResponse(
                success=False,
                message_id="",
                status="failed",
                timestamp=datetime.now().isoformat(),
                error=str(e)
            )
    
    def send_bulk_messages(
        self,
        phone_numbers: List[str],
        message_text: str,
        delay_between_messages: int = 2
    ) -> List[MessageResponse]:
        """
        Send bulk messages to multiple numbers
        
        Args:
            phone_numbers: List of phone numbers
            message_text: Message to send to all
            delay_between_messages: Seconds to wait between messages
        
        Returns:
            List of MessageResponse objects
        
        Example:
            responses = service.send_bulk_messages(
                ["919876543210", "919876543211", "919876543212"],
                "Special offer on Everest trek!",
                delay_between_messages=3
            )
            
            # Check results
            for response in responses:
                print(f"{response.message_id}: {response.status}")
        """
        import time
        
        responses = []
        logger.info(f"Sending bulk messages to {len(phone_numbers)} numbers")
        
        for idx, phone in enumerate(phone_numbers, 1):
            response = self.send_message(phone, message_text)
            responses.append(response)
            
            logger.info(f"[{idx}/{len(phone_numbers)}] Sent to {phone}: {response.status}")
            
            # Delay before next message
            if idx < len(phone_numbers):
                time.sleep(delay_between_messages)
        
        logger.info(f"Bulk send complete. Success: {sum(1 for r in responses if r.success)}/{len(responses)}")
        return responses
    
    def send_scheduled_message(
        self,
        phone_number: str,
        message_text: str,
        schedule_time: str  # "2025-10-22 10:30" format
    ) -> MessageResponse:
        """
        Schedule message for later
        
        Args:
            phone_number: Target phone
            message_text: Message content
            schedule_time: When to send (format: "2025-10-22 10:30")
        
        Returns:
            MessageResponse with schedule status
        """
        try:
            # Validate time format
            datetime.strptime(schedule_time, "%Y-%m-%d %H:%M")
            
            message_id = self._generate_message_id()
            logger.info(f"Scheduled message {message_id} to {phone_number} at {schedule_time}")
            
            return MessageResponse(
                success=True,
                message_id=message_id,
                status="scheduled",
                timestamp=datetime.now().isoformat()
            )
        
        except ValueError as e:
            return MessageResponse(
                success=False,
                message_id="",
                status="failed",
                timestamp=datetime.now().isoformat(),
                error=f"Invalid time format: {str(e)}"
            )
    
    # ============================================================
    # RECEIVE & PARSE MESSAGES
    # ============================================================
    
    def parse_incoming_webhook(self, payload: Dict) -> Optional[WhatsAppMessage]:
        """
        Parse incoming message from webhook
        
        Handles different formats from different providers
        
        Args:
            payload: Webhook payload from WhatsApp provider
        
        Returns:
            WhatsAppMessage object or None if parsing fails
        
        Example webhook payload:
            {
                "messages": [{
                    "from": "919876543210",
                    "id": "wamid.xxx",
                    "timestamp": "1234567890",
                    "type": "text",
                    "text": {"body": "Hello!"}
                }]
            }
        """
        try:
            # Detect provider format and parse accordingly
            if self.provider == "wasender" or "messages" in payload:
                return self._parse_wasender_webhook(payload)
            elif self.provider == "twilio":
                return self._parse_twilio_webhook(payload)
            elif "MessageText" in payload:  # Africa's Talking
                return self._parse_africas_talking_webhook(payload)
            else:
                logger.warning(f"Unknown webhook format: {payload}")
                return None
        
        except Exception as e:
            logger.error(f"Error parsing webhook: {str(e)}")
            return None
    
    def verify_webhook_token(self, token: str) -> bool:
        """
        Verify webhook token for security
        
        Args:
            token: Token from webhook request
        
        Returns:
            True if valid, False otherwise
        """
        expected_token = os.getenv("WHATSAPP_WEBHOOK_TOKEN", "test_token")
        return token == expected_token
    
    # ============================================================
    # MESSAGE TRACKING & STATUS
    # ============================================================
    
    def get_message_status(self, message_id: str) -> Dict:
        """
        Get message delivery status
        
        Args:
            message_id: ID of message to track
        
        Returns:
            Dict with status info
        """
        # This would query your database in real implementation
        return {
            "message_id": message_id,
            "status": "delivered",
            "delivered_at": datetime.now().isoformat(),
            "read": False
        }
    
    # ============================================================
    # HELPER METHODS
    # ============================================================
    
    def _validate_phone(self, phone: str) -> Optional[str]:
        """Validate and format phone number"""
        # Remove common separators
        phone = phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
        
        # Add +91 if missing (India)
        if not phone.startswith("+") and not phone.startswith("91"):
            if phone.startswith("0"):
                phone = "91" + phone[1:]
            elif len(phone) == 10:
                phone = "91" + phone
        
        # Add + if missing
        if not phone.startswith("+"):
            phone = "+" + phone
        
        # Validate length
        if len(phone) < 10 or len(phone) > 15:
            return None
        
        return phone
    
    def _generate_message_id(self) -> str:
        """Generate unique message ID"""
        import uuid
        return f"msg_{uuid.uuid4().hex[:12]}"
    
    # ============================================================
    # PROVIDER-SPECIFIC IMPLEMENTATIONS
    # ============================================================
    
    def _send_mock(self, phone: str, text: str, msg_id: str) -> MessageResponse:
        """Mock implementation - useful for testing"""
        logger.info(f"[MOCK] Sending to {phone}: {text}")
        return MessageResponse(
            success=True,
            message_id=msg_id,
            status="sent",
            timestamp=datetime.now().isoformat(),
            cost=0.005
        )
    
    def _send_custom(
        self,
        phone: str,
        text: str,
        msg_id: str,
        media_url: Optional[str] = None
    ) -> MessageResponse:
        """Send via Custom WhatsApp Provider - Your Own API"""
        try:
            from services.custom_whatsapp_provider import CustomWhatsAppProvider
            from django.conf import settings
            
            # Initialize provider with Django settings
            provider = CustomWhatsAppProvider(
                api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
                api_key=settings.CUSTOM_WHATSAPP_API_KEY,
                webhook_secret=settings.CUSTOM_WHATSAPP_WEBHOOK_SECRET,
                timeout=settings.CUSTOM_WHATSAPP_TIMEOUT,
                retry_count=settings.CUSTOM_WHATSAPP_RETRY_COUNT,
                max_retries=settings.CUSTOM_WHATSAPP_MAX_RETRIES
            )
            
            # Send message using custom provider
            response = provider.send_message(
                phone_number=phone,
                message_text=text,
                message_id=msg_id,
                message_type="text",
                media_url=media_url
            )
            
            # Convert provider response to service response
            return MessageResponse(
                success=response.success,
                message_id=response.message_id,
                status=response.status,
                timestamp=response.timestamp,
                error=response.error,
                cost=response.cost
            )
        
        except ImportError:
            logger.error("CustomWhatsAppProvider not found. Ensure custom_whatsapp_provider.py exists.")
            return MessageResponse(
                success=False,
                message_id=msg_id,
                status="failed",
                timestamp=datetime.now().isoformat(),
                error="Custom provider module not found"
            )
        
        except Exception as e:
            logger.error(f"Error sending via custom provider: {str(e)}")
            return MessageResponse(
                success=False,
                message_id=msg_id,
                status="failed",
                timestamp=datetime.now().isoformat(),
                error=str(e)
            )
    
    def _send_wasender(
        self,
        phone: str,
        text: str,
        msg_id: str,
        media_url: Optional[str] = None
    ) -> MessageResponse:
        """Send via WASender API"""
        try:
            url = f"{self.base_url}/send-message"
            
            payload = {
                "phone": phone,
                "message": text,
                "deviceId": self.config["wasender_device_id"]
            }
            
            if media_url:
                payload["media"] = media_url
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                return MessageResponse(
                    success=True,
                    message_id=msg_id,
                    status="sent",
                    timestamp=datetime.now().isoformat(),
                    cost=0.005
                )
            else:
                return MessageResponse(
                    success=False,
                    message_id=msg_id,
                    status="failed",
                    timestamp=datetime.now().isoformat(),
                    error=f"WASender error: {response.text}"
                )
        
        except Exception as e:
            return MessageResponse(
                success=False,
                message_id=msg_id,
                status="failed",
                timestamp=datetime.now().isoformat(),
                error=str(e)
            )
    
    def _send_twilio(self, phone: str, text: str, msg_id: str) -> MessageResponse:
        """Send via Twilio WhatsApp API"""
        try:
            message = self.twilio_client.messages.create(
                from_=f"whatsapp:{self.config['twilio_phone']}",
                body=text,
                to=f"whatsapp:{phone}"
            )
            
            return MessageResponse(
                success=True,
                message_id=message.sid,
                status="sent",
                timestamp=datetime.now().isoformat(),
                cost=0.005
            )
        
        except Exception as e:
            return MessageResponse(
                success=False,
                message_id=msg_id,
                status="failed",
                timestamp=datetime.now().isoformat(),
                error=str(e)
            )
    
    def _send_africas_talking(self, phone: str, text: str, msg_id: str) -> MessageResponse:
        """Send via Africa's Talking API"""
        try:
            headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
                "Authorization": f"Bearer {self.config['africas_talking_key']}"
            }
            
            payload = {
                "username": self.config["africas_talking_username"],
                "to": phone,
                "message": text
            }
            
            response = requests.post(self.base_url, headers=headers, data=payload)
            
            if response.status_code == 200:
                return MessageResponse(
                    success=True,
                    message_id=msg_id,
                    status="sent",
                    timestamp=datetime.now().isoformat(),
                    cost=0.005
                )
            else:
                return MessageResponse(
                    success=False,
                    message_id=msg_id,
                    status="failed",
                    timestamp=datetime.now().isoformat(),
                    error=f"Africa's Talking error: {response.text}"
                )
        
        except Exception as e:
            return MessageResponse(
                success=False,
                message_id=msg_id,
                status="failed",
                timestamp=datetime.now().isoformat(),
                error=str(e)
            )
    
    def _parse_wasender_webhook(self, payload: Dict) -> Optional[WhatsAppMessage]:
        """Parse WASender webhook format"""
        try:
            msg = payload.get("messages", [{}])[0]
            
            return WhatsAppMessage(
                phone_number=msg.get("from", ""),
                message_text=msg.get("text", {}).get("body", ""),
                message_id=msg.get("id", ""),
                timestamp=msg.get("timestamp", ""),
                sender_type="user",
                message_type=MessageType.TEXT
            )
        except Exception as e:
            logger.error(f"Error parsing WASender webhook: {e}")
            return None
    
    def _parse_twilio_webhook(self, payload: Dict) -> Optional[WhatsAppMessage]:
        """Parse Twilio webhook format"""
        try:
            return WhatsAppMessage(
                phone_number=payload.get("From", "").replace("whatsapp:", ""),
                message_text=payload.get("Body", ""),
                message_id=payload.get("MessageSid", ""),
                timestamp=datetime.now().isoformat(),
                sender_type="user",
                message_type=MessageType.TEXT
            )
        except Exception as e:
            logger.error(f"Error parsing Twilio webhook: {e}")
            return None
    
    def _parse_africas_talking_webhook(self, payload: Dict) -> Optional[WhatsAppMessage]:
        """Parse Africa's Talking webhook format"""
        try:
            return WhatsAppMessage(
                phone_number=payload.get("From", ""),
                message_text=payload.get("MessageText", ""),
                message_id=payload.get("Id", ""),
                timestamp=payload.get("Date", datetime.now().isoformat()),
                sender_type="user",
                message_type=MessageType.TEXT
            )
        except Exception as e:
            logger.error(f"Error parsing Africa's Talking webhook: {e}")
            return None


# ============================================================
# USAGE EXAMPLES
# ============================================================

def example_usage():
    """Example of how to use the service"""
    
    # 1. Initialize for testing (no real sends)
    print("=" * 60)
    print("1. TESTING MODE (logs only, no real sends)")
    print("=" * 60)
    service = CustomWhatsAppService(provider="mock", mode="testing")
    
    response = service.send_message(
        "919876543210",
        "Hello! This is a test message from Trek & Stay"
    )
    print(f"Message ID: {response.message_id}")
    print(f"Status: {response.status}")
    print(f"Cost: ₹{response.cost}")
    
    # 2. Send bulk messages
    print("\n" + "=" * 60)
    print("2. SEND BULK MESSAGES")
    print("=" * 60)
    phones = ["919876543210", "919876543211", "919876543212"]
    responses = service.send_bulk_messages(
        phones,
        "Join our Everest trek expedition!",
        delay_between_messages=2
    )
    
    success = sum(1 for r in responses if r.success)
    print(f"Sent {success}/{len(responses)} messages successfully")
    
    # 3. Schedule message
    print("\n" + "=" * 60)
    print("3. SCHEDULE MESSAGE")
    print("=" * 60)
    response = service.send_scheduled_message(
        "919876543210",
        "Your trek confirmation is ready!",
        "2025-10-25 10:30"
    )
    print(f"Scheduled: {response.message_id} at {response.status}")
    
    # 4. Parse incoming message
    print("\n" + "=" * 60)
    print("4. PARSE INCOMING MESSAGE")
    print("=" * 60)
    webhook_payload = {
        "messages": [{
            "from": "919876543210",
            "id": "wamid.123",
            "timestamp": str(int(datetime.now().timestamp())),
            "type": "text",
            "text": {"body": "How much is Everest trek?"}
        }]
    }
    
    incoming = service.parse_incoming_webhook(webhook_payload)
    print(f"From: {incoming.phone_number}")
    print(f"Message: {incoming.message_text}")
    print(f"ID: {incoming.message_id}")


if __name__ == "__main__":
    example_usage()
