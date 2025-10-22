"""
Custom WhatsApp Provider - Usage Examples
==========================================

This file contains practical examples of how to use the custom WhatsApp provider
in different scenarios. Copy and adapt these examples to your code.

Run in Django shell:
    python manage.py shell
    exec(open('examples_custom_provider.py').read())
"""

# ============================================================
# EXAMPLE 1: Basic Message Sending
# ============================================================

def example_1_basic_send():
    """Send a basic text message"""
    print("\n" + "="*70)
    print("EXAMPLE 1: Basic Message Sending")
    print("="*70)
    
    from services.custom_whatsapp_provider import CustomWhatsAppProvider
    from django.conf import settings
    
    # Initialize provider
    provider = CustomWhatsAppProvider(
        api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
        api_key=settings.CUSTOM_WHATSAPP_API_KEY
    )
    
    # Send a message
    response = provider.send_message(
        phone_number="919876543210",
        message_text="Hello from Trek & Stay! 🏔️ Your adventure awaits!"
    )
    
    print(f"Message ID: {response.message_id}")
    print(f"Status: {response.status}")
    print(f"Success: {response.success}")
    if response.error:
        print(f"Error: {response.error}")


# ============================================================
# EXAMPLE 2: Bulk Campaign Sending
# ============================================================

def example_2_bulk_campaign():
    """Send messages to multiple customers"""
    print("\n" + "="*70)
    print("EXAMPLE 2: Bulk Campaign Sending")
    print("="*70)
    
    from services.custom_whatsapp_provider import CustomWhatsAppProvider
    from django.conf import settings
    
    provider = CustomWhatsAppProvider(
        api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
        api_key=settings.CUSTOM_WHATSAPP_API_KEY
    )
    
    # List of customers
    customers = [
        "919876543210",  # Customer 1
        "919876543211",  # Customer 2
        "919876543212",  # Customer 3
    ]
    
    # Campaign message
    campaign_message = """
🎉 LIMITED TIME OFFER 🎉

Get 40% OFF on all Himachal Pradesh treks!

Available for limited time only:
✓ Kumbhe Waterfall Rappelling
✓ Manali - Tri Lakes Trek
✓ Shimla Mountain Adventure

Book Now: [Your booking link]

Reply with TREK NAME to book now!
""".strip()
    
    # Send bulk messages
    responses = provider.send_bulk(
        phone_numbers=customers,
        message_text=campaign_message,
        delay_between_messages=2  # 2 seconds between messages
    )
    
    # Print results
    successful = sum(1 for r in responses if r.success)
    failed = sum(1 for r in responses if not r.success)
    
    print(f"\nCampaign Results:")
    print(f"✓ Successful: {successful}/{len(customers)}")
    print(f"✗ Failed: {failed}/{len(customers)}")
    
    for response in responses:
        status = "✓" if response.success else "✗"
        print(f"  {status} {response.phone_number}: {response.status}")


# ============================================================
# EXAMPLE 3: Trek Booking Confirmation
# ============================================================

def example_3_booking_confirmation():
    """Send booking confirmation message"""
    print("\n" + "="*70)
    print("EXAMPLE 3: Trek Booking Confirmation")
    print("="*70)
    
    from services.custom_whatsapp_provider import CustomWhatsAppProvider
    from django.conf import settings
    
    provider = CustomWhatsAppProvider(
        api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
        api_key=settings.CUSTOM_WHATSAPP_API_KEY
    )
    
    # Booking details
    booking_data = {
        "customer_phone": "919876543210",
        "customer_name": "Raj Kumar",
        "trek_name": "Everest Base Camp Trek",
        "booking_id": "BK20250115001",
        "start_date": "2025-02-15",
        "duration": "14 Days",
        "price": "₹89,999"
    }
    
    # Create confirmation message
    confirmation_message = f"""
Hi {booking_data['customer_name']}! 👋

Your trek booking is confirmed! ✓

📋 Booking Details:
Booking ID: {booking_data['booking_id']}
Trek: {booking_data['trek_name']}
Start Date: {booking_data['start_date']}
Duration: {booking_data['duration']}
Price: {booking_data['price']}

📞 Support: Call us at +91-XXXX-XXXX-XX
📧 Email: support@trekandstay.com

Get ready for the adventure of a lifetime! 🏔️
""".strip()
    
    # Send confirmation
    response = provider.send_message(
        phone_number=booking_data['customer_phone'],
        message_text=confirmation_message
    )
    
    print(f"Booking Confirmation Sent:")
    print(f"  Customer: {booking_data['customer_name']}")
    print(f"  Booking ID: {booking_data['booking_id']}")
    print(f"  Status: {response.status}")
    print(f"  Message ID: {response.message_id}")


# ============================================================
# EXAMPLE 4: Intelligent Response with Smart Agent
# ============================================================

def example_4_smart_agent_reply():
    """Use custom provider with smart agent for auto-replies"""
    print("\n" + "="*70)
    print("EXAMPLE 4: Smart Agent Auto-Reply")
    print("="*70)
    
    from services.custom_whatsapp_provider import CustomWhatsAppProvider
    from services.smart_whatsapp_agent import SmartWhatsAppAgent
    from django.conf import settings
    
    provider = CustomWhatsAppProvider(
        api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
        api_key=settings.CUSTOM_WHATSAPP_API_KEY
    )
    
    agent = SmartWhatsAppAgent()
    
    # Simulate incoming message
    customer_message = "What are your trek options in Himachal Pradesh?"
    customer_phone = "919876543210"
    
    print(f"Customer: {customer_message}")
    
    # Get intelligent response from agent
    agent_reply = agent.handle_incoming_message(
        phone_number=customer_phone,
        message_text=customer_message
    )
    
    print(f"Agent: {agent_reply}")
    
    # Send reply via custom provider
    response = provider.send_message(
        phone_number=customer_phone,
        message_text=agent_reply
    )
    
    print(f"\nReply sent: {response.status} ({response.message_id})")


# ============================================================
# EXAMPLE 5: Media Message (with Image)
# ============================================================

def example_5_media_message():
    """Send message with media (image, document, etc.)"""
    print("\n" + "="*70)
    print("EXAMPLE 5: Media Message")
    print("="*70)
    
    from services.custom_whatsapp_provider import CustomWhatsAppProvider
    from django.conf import settings
    
    provider = CustomWhatsAppProvider(
        api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
        api_key=settings.CUSTOM_WHATSAPP_API_KEY
    )
    
    # Send image with caption
    response = provider.send_message(
        phone_number="919876543210",
        message_text="Check out this amazing view from the Everest base camp trek! 📸",
        message_type="image",
        media_url="https://example.com/trek-image.jpg"
    )
    
    print(f"Image message sent:")
    print(f"  Status: {response.status}")
    print(f"  Message ID: {response.message_id}")
    
    # Send document (PDF itinerary)
    response2 = provider.send_message(
        phone_number="919876543210",
        message_text="Here's your trek itinerary PDF. Review and confirm by replying 'CONFIRM'",
        message_type="document",
        media_url="https://example.com/itinerary.pdf"
    )
    
    print(f"Document message sent:")
    print(f"  Status: {response2.status}")
    print(f"  Message ID: {response2.message_id}")


# ============================================================
# EXAMPLE 6: Get Message Status
# ============================================================

def example_6_check_status():
    """Check the status of a sent message"""
    print("\n" + "="*70)
    print("EXAMPLE 6: Check Message Status")
    print("="*70)
    
    from services.custom_whatsapp_provider import CustomWhatsAppProvider
    from django.conf import settings
    
    provider = CustomWhatsAppProvider(
        api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
        api_key=settings.CUSTOM_WHATSAPP_API_KEY
    )
    
    # First, send a message
    send_response = provider.send_message(
        phone_number="919876543210",
        message_text="This is a test message to track status"
    )
    
    message_id = send_response.message_id
    print(f"Sent message: {message_id}")
    
    # Check status
    import time
    time.sleep(1)  # Wait a moment
    
    status = provider.get_message_status(message_id)
    print(f"Current status: {status}")


# ============================================================
# EXAMPLE 7: Get Conversation History
# ============================================================

def example_7_conversation_history():
    """Retrieve conversation history with a customer"""
    print("\n" + "="*70)
    print("EXAMPLE 7: Conversation History")
    print("="*70)
    
    from services.custom_whatsapp_provider import CustomWhatsAppProvider
    from django.conf import settings
    
    provider = CustomWhatsAppProvider(
        api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
        api_key=settings.CUSTOM_WHATSAPP_API_KEY
    )
    
    # Get last 10 messages with customer
    history = provider.get_conversation_history(
        phone_number="919876543210",
        limit=10
    )
    
    if history:
        print(f"Last {len(history)} messages:")
        for msg in history:
            sender = "Customer" if msg.get('from_user') else "Bot"
            print(f"  {sender}: {msg.get('message_text', '')[:50]}...")
    else:
        print("No conversation history found")


# ============================================================
# EXAMPLE 8: Health Check & Statistics
# ============================================================

def example_8_health_stats():
    """Check API health and get statistics"""
    print("\n" + "="*70)
    print("EXAMPLE 8: API Health & Statistics")
    print("="*70)
    
    from services.custom_whatsapp_provider import CustomWhatsAppProvider
    from django.conf import settings
    
    provider = CustomWhatsAppProvider(
        api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
        api_key=settings.CUSTOM_WHATSAPP_API_KEY
    )
    
    # Check health
    is_healthy = provider.health_check()
    print(f"API Status: {'✓ Healthy' if is_healthy else '✗ Not responding'}")
    
    # Get statistics
    stats = provider.get_statistics()
    if stats:
        print(f"\nMessaging Statistics:")
        print(f"  Total Messages: {stats.get('total_messages', 0)}")
        print(f"  Delivered: {stats.get('delivered', 0)}")
        print(f"  Failed: {stats.get('failed', 0)}")
        print(f"  Delivery Rate: {stats.get('delivery_rate', 0)*100:.1f}%")


# ============================================================
# EXAMPLE 9: Phone Number Validation
# ============================================================

def example_9_phone_validation():
    """Test phone number validation"""
    print("\n" + "="*70)
    print("EXAMPLE 9: Phone Number Validation")
    print("="*70)
    
    from services.custom_whatsapp_provider import CustomWhatsAppProvider
    from django.conf import settings
    
    provider = CustomWhatsAppProvider(
        api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
        api_key=settings.CUSTOM_WHATSAPP_API_KEY
    )
    
    test_phones = [
        "919876543210",
        "+919876543210",
        "9876543210",
        "invalid_phone",
        "12025551234",  # US number
    ]
    
    print("Phone Validation Results:")
    for phone in test_phones:
        validated = provider._validate_phone(phone)
        status = "✓" if validated else "✗"
        print(f"  {status} {phone:20} → {validated}")


# ============================================================
# EXAMPLE 10: Error Handling
# ============================================================

def example_10_error_handling():
    """Proper error handling"""
    print("\n" + "="*70)
    print("EXAMPLE 10: Error Handling")
    print("="*70)
    
    from services.custom_whatsapp_provider import CustomWhatsAppProvider
    from django.conf import settings
    
    provider = CustomWhatsAppProvider(
        api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
        api_key=settings.CUSTOM_WHATSAPP_API_KEY
    )
    
    # Test various error conditions
    test_cases = [
        ("Invalid phone", "invalid123", "Test message"),
        ("Empty message", "919876543210", ""),
        ("Very long message", "919876543210", "x" * 5000),
        ("Valid message", "919876543210", "Valid test message"),
    ]
    
    for test_name, phone, message in test_cases:
        response = provider.send_message(
            phone_number=phone,
            message_text=message
        )
        
        status = "✓" if response.success else "✗"
        error_msg = f" - {response.error}" if response.error else ""
        print(f"{status} {test_name:20} → {response.status}{error_msg}")


# ============================================================
# EXAMPLE 11: Webhook Verification
# ============================================================

def example_11_webhook_verification():
    """Verify webhook signatures for security"""
    print("\n" + "="*70)
    print("EXAMPLE 11: Webhook Verification")
    print("="*70)
    
    from services.custom_whatsapp_provider import CustomWhatsAppProvider
    from django.conf import settings
    
    provider = CustomWhatsAppProvider(
        api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
        api_key=settings.CUSTOM_WHATSAPP_API_KEY,
        webhook_secret=settings.CUSTOM_WHATSAPP_WEBHOOK_SECRET
    )
    
    # Simulate incoming webhook
    webhook_payload = {
        "phone_number": "919876543210",
        "message_text": "I want to book a trek",
        "message_id": "msg_webhook_001",
        "timestamp": "2025-01-15T10:30:00Z",
        "from_user": True
    }
    
    # Generate valid signature
    valid_signature = provider._generate_signature(webhook_payload)
    print(f"Generated Signature: {valid_signature[:32]}...")
    
    # Verify valid signature
    is_valid = provider.verify_webhook_signature(webhook_payload, valid_signature)
    print(f"Valid Signature Check: {'✓ PASS' if is_valid else '✗ FAIL'}")
    
    # Verify invalid signature
    fake_signature = "totally_invalid_signature"
    is_invalid = provider.verify_webhook_signature(webhook_payload, fake_signature)
    print(f"Invalid Signature Check: {'✓ PASS (correctly rejected)' if not is_invalid else '✗ FAIL'}")
    
    # Parse webhook
    parsed = provider.parse_webhook(webhook_payload)
    if parsed:
        print(f"\nParsed Message:")
        print(f"  From: {parsed['phone_number']}")
        print(f"  Text: {parsed['message_text']}")
        print(f"  From User: {parsed['from_user']}")


# ============================================================
# EXAMPLE 12: Using Singleton Instance
# ============================================================

def example_12_singleton_usage():
    """Use singleton instance for consistency"""
    print("\n" + "="*70)
    print("EXAMPLE 12: Singleton Provider Instance")
    print("="*70)
    
    from services.custom_whatsapp_provider import get_provider
    
    # Get provider (automatically initialized)
    provider = get_provider()
    
    # Use it multiple times - same instance
    response1 = provider.send_message("919876543210", "Message 1")
    response2 = provider.send_message("919876543211", "Message 2")
    
    print(f"Message 1: {response1.status}")
    print(f"Message 2: {response2.status}")
    print("Both using same provider instance for consistency")


# ============================================================
# RUN ALL EXAMPLES
# ============================================================

if __name__ == "__main__":
    print("""
    Custom WhatsApp Provider - Usage Examples
    ==========================================
    
    This script demonstrates 12 different ways to use the custom provider.
    """)
    
    examples = [
        ("Basic Send", example_1_basic_send),
        ("Bulk Campaign", example_2_bulk_campaign),
        ("Booking Confirmation", example_3_booking_confirmation),
        ("Smart Agent Reply", example_4_smart_agent_reply),
        ("Media Message", example_5_media_message),
        ("Check Status", example_6_check_status),
        ("Conversation History", example_7_conversation_history),
        ("Health & Stats", example_8_health_stats),
        ("Phone Validation", example_9_phone_validation),
        ("Error Handling", example_10_error_handling),
        ("Webhook Verification", example_11_webhook_verification),
        ("Singleton Usage", example_12_singleton_usage),
    ]
    
    print("\nAvailable Examples:")
    for i, (name, _) in enumerate(examples, 1):
        print(f"  {i:2d}. {name}")
    
    print("\nTo run specific examples, uncomment them below or call individually:")
    print("  python manage.py shell")
    print("  exec(open('examples_custom_provider.py').read())")
    print("  example_1_basic_send()")
    
    # Uncomment to run all:
    # for name, func in examples:
    #     try:
    #         func()
    #     except Exception as e:
    #         print(f"\nError in {name}: {str(e)}")
