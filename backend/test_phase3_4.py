#!/usr/bin/env python
"""
Phase 3 & 4 Test Suite: Message Templates & Analytics
Tests for template management, variable substitution, and analytics tracking.
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from services.message_template_service import (
    get_message_template_service,
    TemplateCategory,
    TemplateApprovalStatus,
    PrebuiltTemplates
)
from services.analytics_engine import (
    get_analytics_engine,
    TrackingEventType,
    AttributionModel
)


def test_create_template():
    """Test 1: Create a custom message template"""
    print("\n✓ Test 1: Create Custom Template")
    service = get_message_template_service()
    
    template = service.create_template(
        template_name="test_trek_booking",
        category=TemplateCategory.TRANSACTIONAL,
        body="Booking confirmed! Trek: {{1}}, Date: {{2}}, Price: {{3}}",
        footer="Trek & Stay Team",
        variables=["1", "2", "3"]
    )
    
    assert template["name"] == "test_trek_booking"
    assert template["status"] == "draft"
    assert template["variable_count"] == 3
    print(f"  ✓ Created template: {template['template_id']}")
    return template


def test_variable_substitution():
    """Test 2: Substitute variables in template"""
    print("\n✓ Test 2: Variable Substitution")
    service = get_message_template_service()
    
    # Create template
    service.create_template(
        template_name="booking_message",
        category=TemplateCategory.TRANSACTIONAL,
        body="Hi {{1}}, your {{2}} trek on {{3}} costs {{4}}"
    )
    
    # Substitute variables
    message, error = service.substitute_variables(
        "booking_message",
        {"1": "John", "2": "Everest", "3": "Nov 15", "4": "₹45000"}
    )
    
    assert error is None
    assert "John" in message
    assert "Everest" in message
    print(f"  ✓ Message: {message}")
    return message


def test_template_approval_workflow():
    """Test 3: Template approval workflow"""
    print("\n✓ Test 3: Template Approval Workflow")
    service = get_message_template_service()
    
    # Create template
    service.create_template(
        template_name="approval_test",
        category=TemplateCategory.PROMOTIONAL,
        body="Special trek offer: {{1}}% discount!"
    )
    
    # Submit for approval
    result = service.submit_for_approval(
        "approval_test",
        "meta_business_123"
    )
    
    assert result["success"] is True
    approval_id = result["approval_id"]
    print(f"  ✓ Submitted: {approval_id}")
    
    # Check status
    status = service.check_approval_status(approval_id)
    assert status["status"] == "submitted"
    print(f"  ✓ Status: {status['status']}")
    
    # Update to approved
    update = service.update_approval_status(
        approval_id,
        TemplateApprovalStatus.APPROVED,
        meta_template_id="meta_template_456"
    )
    
    assert update["new_status"] == "approved"
    print(f"  ✓ Approved: {update['new_status']}")
    
    return approval_id


def test_prebuilt_templates():
    """Test 4: Prebuilt template definitions"""
    print("\n✓ Test 4: Prebuilt Templates")
    
    templates = {
        "booking": PrebuiltTemplates.get_booking_confirmation_template(),
        "payment": PrebuiltTemplates.get_payment_reminder_template(),
        "trip": PrebuiltTemplates.get_trip_update_template(),
        "support": PrebuiltTemplates.get_support_response_template(),
        "referral": PrebuiltTemplates.get_referral_template()
    }
    
    for name, template in templates.items():
        assert template["template_name"]
        assert template["body"]
        print(f"  ✓ Loaded: {name}")
    
    return templates


def test_track_events():
    """Test 5: Track user interaction events"""
    print("\n✓ Test 5: Track Events")
    engine = get_analytics_engine()
    
    # Track QR scan
    event1 = engine.track_event(
        TrackingEventType.QR_SCANNED,
        user_id="user_123",
        campaign_id="camp_001",
        metadata={"device_id": "device_001"}
    )
    assert event1["tracked"] is True
    print(f"  ✓ Tracked QR scan: {event1['event_id']}")
    
    # Track lead creation
    event2 = engine.track_event(
        TrackingEventType.LEAD_CREATED,
        user_id="user_123",
        campaign_id="camp_001",
        metadata={"lead_id": "lead_001"}
    )
    print(f"  ✓ Tracked lead: {event2['event_id']}")
    
    # Track booking completion
    event3 = engine.track_event(
        TrackingEventType.BOOKING_COMPLETED,
        user_id="user_123",
        campaign_id="camp_001",
        metadata={"amount": 5000}
    )
    print(f"  ✓ Tracked booking: {event3['event_id']}")
    
    return [event1, event2, event3]


def test_qr_campaign_creation():
    """Test 6: Create and track QR campaign"""
    print("\n✓ Test 6: QR Campaign Creation")
    engine = get_analytics_engine()
    
    start = datetime.now()
    end = start + timedelta(days=30)
    
    result = engine.create_qr_campaign(
        campaign_id="camp_qr_001",
        campaign_name="Everest Trek QR Campaign",
        trip_id="trip_123",
        qr_data={"url": "https://trek.link/everest", "placement": "poster"},
        start_date=start,
        end_date=end,
        budget=10000
    )
    
    assert result["success"] is True
    print(f"  ✓ Created campaign: {result['campaign_id']}")
    
    # Get metrics
    metrics = engine.get_qr_campaign_metrics("camp_qr_001")
    assert metrics["campaign_id"] == "camp_qr_001"
    print(f"  ✓ Campaign budget: ₹{metrics.get('budget', 'N/A')}")
    
    return result


def test_conversion_funnel():
    """Test 7: Define and analyze conversion funnel"""
    print("\n✓ Test 7: Conversion Funnel")
    engine = get_analytics_engine()
    
    # Define funnel
    result = engine.define_conversion_funnel(
        funnel_name="booking_funnel",
        steps=[
            TrackingEventType.QR_SCANNED,
            TrackingEventType.LEAD_CREATED,
            TrackingEventType.BOOKING_STARTED,
            TrackingEventType.BOOKING_COMPLETED
        ],
        time_window_hours=48
    )
    
    assert result["success"] is True
    print(f"  ✓ Created funnel with {result['steps']} steps")
    
    # Analyze funnel
    analysis = engine.analyze_conversion_funnel("booking_funnel")
    assert "steps" in analysis
    print(f"  ✓ Analyzed funnel: {len(analysis['steps'])} steps")
    
    return result


def test_attribution_models():
    """Test 8: Attribution modeling"""
    print("\n✓ Test 8: Attribution Models")
    engine = get_analytics_engine()
    
    # Create user journey
    user_id = "user_attr_001"
    engine.track_event(
        TrackingEventType.QR_SCANNED,
        user_id=user_id,
        campaign_id="camp_1",
        metadata={"source": "poster"}
    )
    engine.track_event(
        TrackingEventType.PAGE_VISIT,
        user_id=user_id,
        campaign_id="camp_2",
        metadata={"source": "email"}
    )
    engine.track_event(
        TrackingEventType.BOOKING_COMPLETED,
        user_id=user_id,
        campaign_id="camp_2",
        metadata={"amount": 8000}
    )
    
    # Test different attribution models
    models = [
        AttributionModel.FIRST_TOUCH,
        AttributionModel.LAST_TOUCH,
        AttributionModel.LINEAR,
        AttributionModel.TIME_DECAY,
        AttributionModel.POSITION_BASED
    ]
    
    for model in models:
        attribution = engine.calculate_attribution(user_id, model)
        assert "touchpoints" in attribution
        print(f"  ✓ {model.value}: {len(attribution['touchpoints'])} touchpoints")
    
    return models


def test_campaign_summary():
    """Test 9: Campaign summary and reporting"""
    print("\n✓ Test 9: Campaign Summary")
    engine = get_analytics_engine()
    
    summary = engine.get_campaign_summary()
    assert "total_campaigns" in summary
    assert "campaigns" in summary
    print(f"  ✓ Total campaigns: {summary['total_campaigns']}")
    print(f"  ✓ Total revenue: ₹{summary['total_revenue']}")
    
    return summary


def test_event_tracking_stats():
    """Test 10: Event tracking statistics"""
    print("\n✓ Test 10: Event Tracking Stats")
    engine = get_analytics_engine()
    
    # All events should be tracked
    assert len(engine.events) > 0
    
    # Count by type
    event_types = {}
    for event in engine.events:
        event_type = event["event_type"]
        event_types[event_type] = event_types.get(event_type, 0) + 1
    
    print(f"  ✓ Total events tracked: {len(engine.events)}")
    print(f"  ✓ Event types: {len(event_types)}")
    
    for event_type, count in event_types.items():
        print(f"    - {event_type}: {count}")
    
    return event_types


def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("🚀 PHASE 3 & 4 TEST SUITE - Message Templates & Analytics")
    print("="*60)
    
    tests = [
        ("Template Creation", test_create_template),
        ("Variable Substitution", test_variable_substitution),
        ("Approval Workflow", test_template_approval_workflow),
        ("Prebuilt Templates", test_prebuilt_templates),
        ("Event Tracking", test_track_events),
        ("QR Campaign", test_qr_campaign_creation),
        ("Conversion Funnel", test_conversion_funnel),
        ("Attribution Models", test_attribution_models),
        ("Campaign Summary", test_campaign_summary),
        ("Event Statistics", test_event_tracking_stats),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            test_func()
            passed += 1
        except Exception as e:
            print(f"  ✗ FAILED: {str(e)}")
            failed += 1
    
    print("\n" + "="*60)
    print(f"📊 RESULTS: {passed} PASSED, {failed} FAILED")
    print("="*60)
    
    if failed == 0:
        print("\n✅ ALL TESTS PASSED!")
    else:
        print(f"\n❌ {failed} test(s) failed")
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
