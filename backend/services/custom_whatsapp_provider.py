"""
Custom WhatsApp Provider - Build Your Own API
================================

This module provides a fully customizable WhatsApp messaging provider
that you can integrate with your own backend infrastructure.

Features:
- Send text, image, document, video, and audio messages
- Receive webhooks for incoming messages
- Track message delivery status
- Handle bulk campaigns
- Built-in error handling and logging
- Extensible for your custom requirements

Usage:
    from services.custom_whatsapp_provider import CustomWhatsAppProvider
    
    provider = CustomWhatsAppProvider(
        api_endpoint="https://your-api.com",
        api_key="your-secret-key"
    )
    
    # Send message
    response = provider.send_message(
        phone_number="919876543210",
        message_text="Hello from Trek & Stay!",
        message_id="msg_123"
    )
    
    # Send bulk
    responses = provider.send_bulk(
        phone_numbers=["919876543210", "919876543211"],
        message_text="Tour available: Himachal Adventure"
    )
"""

import os
import json
import logging
import hashlib
import hmac
import time
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum
import requests

logger = logging.getLogger(__name__)

# ============================================================
# ENUMS & DATACLASSES
# ============================================================

class MessageStatus(Enum):
    """Message delivery status"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"
    SCHEDULED = "scheduled"

class MessageType(Enum):
    """Message content types"""
    TEXT = "text"
    IMAGE = "image"
    DOCUMENT = "document"
    VIDEO = "video"
    AUDIO = "audio"

@dataclass
class WhatsAppMessage:
    """WhatsApp message object"""
    phone_number: str
    message_text: str
    message_id: str
    timestamp: str
    message_type: str = "text"
    media_url: Optional[str] = None
    status: str = "pending"
    metadata: Optional[Dict] = None

    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return asdict(self)

@dataclass
class MessageResponse:
    """Response from message operation"""
    success: bool
    message_id: str
    phone_number: str
    status: str
    timestamp: str
    error: Optional[str] = None
    cost: Optional[float] = None

    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return asdict(self)

# ============================================================
# CUSTOM WHATSAPP PROVIDER
# ============================================================

class CustomWhatsAppProvider:
    """
    Custom WhatsApp Provider for Your Own Backend
    
    This provider allows you to integrate WhatsApp messaging with your
    custom backend infrastructure. You can:
    
    1. Point it to your own API endpoint
    2. Implement your own message routing logic
    3. Use your own database for tracking
    4. Integrate with your billing system
    5. Customize message handling as needed
    
    Configuration:
        - api_endpoint: Your backend API URL (required)
        - api_key: Authentication key for your API (required)
        - timeout: Request timeout in seconds (default: 30)
        - retry_count: Number of retries on failure (default: 3)
        - max_retries: Maximum retries for bulk operations (default: 5)
    
    Example:
        provider = CustomWhatsAppProvider(
            api_endpoint="https://api.trekandstay.com/whatsapp",
            api_key="your-32-char-secret-key-here"
        )
        
        response = provider.send_message(
            phone_number="919876543210",
            message_text="Greetings from Trek & Stay!",
            message_id="msg_001"
        )
        
        if response.success:
            print(f"Message sent: {response.message_id}")
        else:
            print(f"Error: {response.error}")
    """
    
    def __init__(
        self,
        api_endpoint: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: int = 30,
        retry_count: int = 3,
        max_retries: int = 5,
        webhook_secret: Optional[str] = None
    ):
        """
        Initialize Custom WhatsApp Provider
        
        Args:
            api_endpoint: Your API endpoint URL (env: CUSTOM_WHATSAPP_API_ENDPOINT)
            api_key: Your API authentication key (env: CUSTOM_WHATSAPP_API_KEY)
            timeout: Request timeout in seconds
            retry_count: Number of retries for single messages
            max_retries: Maximum retries for bulk operations
            webhook_secret: Secret for webhook verification (env: CUSTOM_WHATSAPP_WEBHOOK_SECRET)
        """
        self.api_endpoint = api_endpoint or os.getenv(
            'CUSTOM_WHATSAPP_API_ENDPOINT',
            'http://localhost:8001/api/whatsapp'
        )
        
        self.api_key = api_key or os.getenv(
            'CUSTOM_WHATSAPP_API_KEY',
            'dev-api-key-change-in-production'
        )
        
        self.webhook_secret = webhook_secret or os.getenv(
            'CUSTOM_WHATSAPP_WEBHOOK_SECRET',
            'webhook-secret-change-in-production'
        )
        
        self.timeout = timeout
        self.retry_count = retry_count
        self.max_retries = max_retries
        self.session = requests.Session()
        
        # Setup headers
        self._setup_headers()
        
        logger.info(f"CustomWhatsAppProvider initialized with endpoint: {self.api_endpoint}")
    
    def _setup_headers(self) -> Dict[str, str]:
        """Setup HTTP headers for API requests"""
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'CustomWhatsAppProvider/1.0',
            'X-API-Version': 'v1',
            'X-Timestamp': str(int(time.time()))
        })
    
    def _validate_phone(self, phone: str) -> Optional[str]:
        """
        Validate and normalize phone number
        
        Accepts formats:
        - 919876543210 (Indian format)
        - +919876543210 (International)
        - 9876543210 (without country code, assumes +91)
        
        Returns:
            Normalized phone number or None if invalid
        """
        try:
            # Remove non-digits
            cleaned = ''.join(filter(str.isdigit, phone))
            
            # Handle country code
            if cleaned.startswith('91'):
                if len(cleaned) != 12:  # Should be 91 + 10 digits
                    return None
            elif cleaned.startswith('1'):
                if len(cleaned) != 11:  # Should be 1 + 10 digits (US)
                    return None
            elif len(cleaned) == 10:
                cleaned = '91' + cleaned  # Assume India
            else:
                return None
            
            return cleaned
        except Exception as e:
            logger.warning(f"Phone validation failed for {phone}: {str(e)}")
            return None
    
    def _generate_message_id(self) -> str:
        """Generate unique message ID"""
        timestamp = str(int(time.time() * 1000))
        random_suffix = hashlib.md5(
            f"{timestamp}{os.urandom(8).hex()}".encode()
        ).hexdigest()[:8]
        return f"msg_{timestamp}_{random_suffix}"
    
    def _generate_signature(self, payload: Dict) -> str:
        """Generate HMAC signature for webhook verification"""
        message = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            self.webhook_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        retry: int = 0
    ) -> Tuple[bool, Dict]:
        """
        Make HTTP request to custom API endpoint
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint path (relative to base URL)
            data: Request payload
            retry: Current retry attempt
        
        Returns:
            Tuple of (success: bool, response_data: dict)
        """
        try:
            url = f"{self.api_endpoint.rstrip('/')}/{endpoint.lstrip('/')}"
            
            logger.debug(f"API Request: {method} {url}")
            
            if method.upper() == 'POST':
                response = self.session.post(
                    url,
                    json=data,
                    timeout=self.timeout
                )
            elif method.upper() == 'GET':
                response = self.session.get(
                    url,
                    params=data,
                    timeout=self.timeout
                )
            elif method.upper() == 'PUT':
                response = self.session.put(
                    url,
                    json=data,
                    timeout=self.timeout
                )
            else:
                return False, {"error": f"Unsupported method: {method}"}
            
            # Handle response
            if response.status_code in [200, 201, 202]:
                try:
                    return True, response.json()
                except ValueError:
                    return True, {"message": response.text}
            
            elif response.status_code == 429 and retry < self.retry_count:
                # Rate limited - retry with backoff
                wait_time = (2 ** retry) + 1
                logger.warning(f"Rate limited. Retrying in {wait_time}s...")
                time.sleep(wait_time)
                return self._make_request(method, endpoint, data, retry + 1)
            
            elif response.status_code >= 500 and retry < self.retry_count:
                # Server error - retry
                wait_time = (2 ** retry) + 1
                logger.warning(f"Server error. Retrying in {wait_time}s...")
                time.sleep(wait_time)
                return self._make_request(method, endpoint, data, retry + 1)
            
            else:
                error_msg = f"API error {response.status_code}: {response.text}"
                logger.error(error_msg)
                return False, {"error": error_msg}
        
        except requests.Timeout:
            if retry < self.retry_count:
                logger.warning(f"Timeout. Retrying...")
                return self._make_request(method, endpoint, data, retry + 1)
            return False, {"error": "Request timeout"}
        
        except requests.ConnectionError as e:
            if retry < self.retry_count:
                logger.warning(f"Connection error. Retrying...")
                time.sleep(2 ** retry)
                return self._make_request(method, endpoint, data, retry + 1)
            return False, {"error": f"Connection failed: {str(e)}"}
        
        except Exception as e:
            logger.error(f"Request error: {str(e)}")
            return False, {"error": str(e)}
    
    # ============================================================
    # MESSAGE SENDING
    # ============================================================
    
    def send_message(
        self,
        phone_number: str,
        message_text: str,
        message_id: Optional[str] = None,
        message_type: str = "text",
        media_url: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> MessageResponse:
        """
        Send single WhatsApp message
        
        Args:
            phone_number: Recipient phone number (919876543210 or +919876543210)
            message_text: Message content (max 4096 characters)
            message_id: Unique message ID (auto-generated if not provided)
            message_type: "text", "image", "document", "video", "audio"
            media_url: URL for media messages
            metadata: Additional data to track with message
        
        Returns:
            MessageResponse with success status and message_id
        
        Example:
            response = provider.send_message(
                phone_number="919876543210",
                message_text="Your trek booking is confirmed!"
            )
            
            if response.success:
                print(f"Sent: {response.message_id}")
        """
        try:
            # Validate phone number
            phone = self._validate_phone(phone_number)
            if not phone:
                return MessageResponse(
                    success=False,
                    message_id=message_id or "",
                    phone_number=phone_number,
                    status="failed",
                    timestamp=datetime.now().isoformat(),
                    error="Invalid phone number format"
                )
            
            # Generate message ID if not provided
            if not message_id:
                message_id = self._generate_message_id()
            
            # Prepare payload
            payload = {
                "phone_number": phone,
                "message_text": message_text[:4096],  # WhatsApp limit
                "message_id": message_id,
                "message_type": message_type,
                "timestamp": datetime.now().isoformat(),
                "metadata": metadata or {}
            }
            
            if media_url and message_type != "text":
                payload["media_url"] = media_url
            
            # Send via API
            success, response_data = self._make_request(
                method="POST",
                endpoint="send",
                data=payload
            )
            
            if success:
                return MessageResponse(
                    success=True,
                    message_id=message_id,
                    phone_number=phone,
                    status=response_data.get("status", "sent"),
                    timestamp=datetime.now().isoformat(),
                    cost=response_data.get("cost")
                )
            else:
                return MessageResponse(
                    success=False,
                    message_id=message_id,
                    phone_number=phone,
                    status="failed",
                    timestamp=datetime.now().isoformat(),
                    error=response_data.get("error", "Unknown error")
                )
        
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return MessageResponse(
                success=False,
                message_id=message_id or "",
                phone_number=phone_number,
                status="failed",
                timestamp=datetime.now().isoformat(),
                error=str(e)
            )
    
    def send_bulk(
        self,
        phone_numbers: List[str],
        message_text: str,
        message_type: str = "text",
        media_url: Optional[str] = None,
        delay_between_messages: int = 1
    ) -> List[MessageResponse]:
        """
        Send bulk messages to multiple recipients
        
        Args:
            phone_numbers: List of phone numbers
            message_text: Message to send to all (max 4096 chars)
            message_type: "text", "image", etc.
            media_url: Media URL if applicable
            delay_between_messages: Seconds to wait between messages (recommended: 1-2)
        
        Returns:
            List of MessageResponse objects
        
        Example:
            phones = ["919876543210", "919876543211", "919876543212"]
            responses = provider.send_bulk(
                phone_numbers=phones,
                message_text="Trek available: Himachal Adventure!"
            )
            
            successful = sum(1 for r in responses if r.success)
            print(f"Sent {successful}/{len(phones)} messages")
        """
        responses = []
        
        for idx, phone in enumerate(phone_numbers):
            # Send message
            response = self.send_message(
                phone_number=phone,
                message_text=message_text,
                message_type=message_type,
                media_url=media_url
            )
            responses.append(response)
            
            # Log progress
            if (idx + 1) % 10 == 0:
                logger.info(f"Bulk send progress: {idx + 1}/{len(phone_numbers)}")
            
            # Add delay between messages (except after last)
            if idx < len(phone_numbers) - 1 and delay_between_messages > 0:
                time.sleep(delay_between_messages)
        
        # Log summary
        successful = sum(1 for r in responses if r.success)
        logger.info(f"Bulk send complete: {successful}/{len(phone_numbers)} successful")
        
        return responses
    
    # ============================================================
    # WEBHOOK HANDLING
    # ============================================================
    
    def verify_webhook_signature(
        self,
        payload: Dict,
        signature: str
    ) -> bool:
        """
        Verify webhook signature for security
        
        Args:
            payload: Webhook payload
            signature: Signature from X-Signature header
        
        Returns:
            True if signature is valid, False otherwise
        
        Example:
            payload = request.json
            signature = request.headers.get('X-Signature')
            
            if provider.verify_webhook_signature(payload, signature):
                # Process webhook
            else:
                # Reject as unauthorized
        """
        try:
            expected_signature = self._generate_signature(payload)
            # Use constant-time comparison to prevent timing attacks
            return hmac.compare_digest(signature, expected_signature)
        except Exception as e:
            logger.error(f"Signature verification error: {str(e)}")
            return False
    
    def parse_webhook(self, payload: Dict) -> Optional[Dict]:
        """
        Parse incoming webhook payload
        
        Args:
            payload: Raw webhook payload from your API
        
        Returns:
            Parsed message data or None if invalid
        
        Expected payload format:
        {
            "phone_number": "919876543210",
            "message_text": "Hi, I'm interested in the trek",
            "message_id": "msg_123",
            "timestamp": "2025-01-15T10:30:00Z",
            "from_user": true
        }
        
        Example:
            message_data = provider.parse_webhook(request.json)
            if message_data:
                # Process incoming message
        """
        try:
            required_fields = ["phone_number", "message_text", "message_id", "timestamp"]
            
            # Validate required fields
            if not all(field in payload for field in required_fields):
                logger.warning(f"Invalid webhook payload: missing required fields")
                return None
            
            # Validate phone
            phone = self._validate_phone(payload.get("phone_number", ""))
            if not phone:
                logger.warning(f"Invalid phone in webhook: {payload.get('phone_number')}")
                return None
            
            return {
                "phone_number": phone,
                "message_text": payload.get("message_text", ""),
                "message_id": payload.get("message_id", ""),
                "timestamp": payload.get("timestamp", ""),
                "from_user": payload.get("from_user", True),
                "metadata": payload.get("metadata", {})
            }
        
        except Exception as e:
            logger.error(f"Webhook parse error: {str(e)}")
            return None
    
    # ============================================================
    # STATUS & TRACKING
    # ============================================================
    
    def get_message_status(self, message_id: str) -> Optional[MessageStatus]:
        """
        Get status of sent message
        
        Args:
            message_id: Message ID to track
        
        Returns:
            MessageStatus enum or None if not found
        """
        try:
            success, response = self._make_request(
                method="GET",
                endpoint=f"status/{message_id}"
            )
            
            if success:
                status = response.get("status", "failed")
                return MessageStatus(status)
            return None
        
        except Exception as e:
            logger.error(f"Error getting message status: {str(e)}")
            return None
    
    def get_conversation_history(
        self,
        phone_number: str,
        limit: int = 50
    ) -> Optional[List[Dict]]:
        """
        Get conversation history with a user
        
        Args:
            phone_number: User's phone number
            limit: Number of messages to retrieve (max 100)
        
        Returns:
            List of messages or None if error
        """
        try:
            phone = self._validate_phone(phone_number)
            if not phone:
                return None
            
            success, response = self._make_request(
                method="GET",
                endpoint=f"conversations/{phone}",
                data={"limit": min(limit, 100)}
            )
            
            if success:
                return response.get("messages", [])
            return None
        
        except Exception as e:
            logger.error(f"Error getting conversation history: {str(e)}")
            return None
    
    # ============================================================
    # HEALTH & MONITORING
    # ============================================================
    
    def health_check(self) -> bool:
        """
        Check if API endpoint is healthy
        
        Returns:
            True if endpoint is responding, False otherwise
        """
        try:
            success, response = self._make_request(
                method="GET",
                endpoint="health"
            )
            
            if success:
                logger.info(f"API health check passed: {response}")
                return True
            else:
                logger.warning(f"API health check failed: {response}")
                return False
        
        except Exception as e:
            logger.error(f"Health check error: {str(e)}")
            return False
    
    def get_statistics(self) -> Optional[Dict]:
        """
        Get messaging statistics
        
        Returns:
            Statistics dict with message counts, delivery rates, etc.
        """
        try:
            success, response = self._make_request(
                method="GET",
                endpoint="statistics"
            )
            
            if success:
                return response.get("stats", {})
            return None
        
        except Exception as e:
            logger.error(f"Error getting statistics: {str(e)}")
            return None

# ============================================================
# SINGLETON INSTANCE
# ============================================================

_provider_instance = None

def get_provider() -> CustomWhatsAppProvider:
    """
    Get singleton provider instance
    
    Example:
        provider = get_provider()
        provider.send_message("919876543210", "Hello!")
    """
    global _provider_instance
    
    if _provider_instance is None:
        _provider_instance = CustomWhatsAppProvider()
    
    return _provider_instance

def reset_provider():
    """Reset provider instance (useful for testing)"""
    global _provider_instance
    _provider_instance = None
