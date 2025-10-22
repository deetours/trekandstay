#!/usr/bin/env python
"""
Test WhatsApp API Endpoints
============================

Test script to verify the whatsapp_api endpoints are working correctly.
Includes tests for send, receive, health, and webhook endpoints.
"""

import os
import sys
import django
import json
from django.test import Client
from django.urls import reverse

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
sys.path.insert(0, '/root/backend')
django.setup()

# Now import after Django setup
from django.test import TestCase

class WhatsAppAPITests:
    """Test WhatsApp API endpoints"""
    
    def __init__(self):
        self.client = Client()
        self.base_url = '/api/whatsapp-api'
        self.passed = 0
        self.failed = 0
    
    def test_health_check(self):
        """Test health check endpoint"""
        print("\n🔍 Testing health check endpoint...")
        try:
            response = self.client.get(f'{self.base_url}/health/')
            assert response.status_code == 200, f"Status code: {response.status_code}"
            data = json.loads(response.content)
            assert data['status'] == 'healthy', f"Status: {data.get('status')}"
            assert 'service' in data, "Missing 'service' field"
            print("✅ Health check: PASSED")
            self.passed += 1
        except Exception as e:
            print(f"❌ Health check: FAILED - {e}")
            self.failed += 1
    
    def test_send_message(self):
        """Test send message endpoint"""
        print("\n🔍 Testing send message endpoint...")
        try:
            payload = {
                'phone_number': '919876543210',
                'message_text': 'Test message from API',
                'message_type': 'text'
            }
            response = self.client.post(
                f'{self.base_url}/send/',
                data=json.dumps(payload),
                content_type='application/json'
            )
            assert response.status_code == 200, f"Status code: {response.status_code}"
            data = json.loads(response.content)
            assert data['success'] == True, f"Success: {data.get('success')}"
            assert 'message_id' in data, "Missing 'message_id' field"
            assert data['phone_number'] == '919876543210', "Phone number mismatch"
            print("✅ Send message: PASSED")
            self.passed += 1
        except Exception as e:
            print(f"❌ Send message: FAILED - {e}")
            self.failed += 1
    
    def test_receive_message(self):
        """Test receive message endpoint"""
        print("\n🔍 Testing receive message endpoint...")
        try:
            payload = {
                'phone_number': '919876543210',
                'message_text': 'Incoming message from customer',
                'message_id': 'msg_incoming_001'
            }
            response = self.client.post(
                f'{self.base_url}/receive/',
                data=json.dumps(payload),
                content_type='application/json'
            )
            assert response.status_code == 200, f"Status code: {response.status_code}"
            data = json.loads(response.content)
            assert data['success'] == True, f"Success: {data.get('success')}"
            assert data['status'] == 'received', f"Status: {data.get('status')}"
            print("✅ Receive message: PASSED")
            self.passed += 1
        except Exception as e:
            print(f"❌ Receive message: FAILED - {e}")
            self.failed += 1
    
    def test_webhook_handler(self):
        """Test webhook handler endpoint"""
        print("\n🔍 Testing webhook handler endpoint...")
        try:
            # Test message event
            payload = {
                'type': 'message',
                'phone_number': '919876543210',
                'message_text': 'Webhook test message'
            }
            response = self.client.post(
                f'{self.base_url}/webhook/',
                data=json.dumps(payload),
                content_type='application/json'
            )
            assert response.status_code == 200, f"Status code: {response.status_code}"
            data = json.loads(response.content)
            assert 'success' in data, "Missing 'success' field"
            print("✅ Webhook handler: PASSED")
            self.passed += 1
        except Exception as e:
            print(f"❌ Webhook handler: FAILED - {e}")
            self.failed += 1
    
    def test_message_status(self):
        """Test get message status endpoint"""
        print("\n🔍 Testing message status endpoint...")
        try:
            response = self.client.get(f'{self.base_url}/status/msg_test_123/')
            assert response.status_code == 200, f"Status code: {response.status_code}"
            data = json.loads(response.content)
            assert 'message_id' in data, "Missing 'message_id' field"
            print("✅ Message status: PASSED")
            self.passed += 1
        except Exception as e:
            print(f"❌ Message status: FAILED - {e}")
            self.failed += 1
    
    def test_conversation_history(self):
        """Test conversation history endpoint"""
        print("\n🔍 Testing conversation history endpoint...")
        try:
            response = self.client.get(f'{self.base_url}/conversations/919876543210/')
            assert response.status_code == 200, f"Status code: {response.status_code}"
            data = json.loads(response.content)
            assert 'phone_number' in data, "Missing 'phone_number' field"
            assert 'messages' in data, "Missing 'messages' field"
            print("✅ Conversation history: PASSED")
            self.passed += 1
        except Exception as e:
            print(f"❌ Conversation history: FAILED - {e}")
            self.failed += 1
    
    def test_statistics(self):
        """Test statistics endpoint"""
        print("\n🔍 Testing statistics endpoint...")
        try:
            response = self.client.get(f'{self.base_url}/statistics/')
            assert response.status_code == 200, f"Status code: {response.status_code}"
            data = json.loads(response.content)
            assert 'total_messages' in data, "Missing 'total_messages' field"
            print("✅ Statistics: PASSED")
            self.passed += 1
        except Exception as e:
            print(f"❌ Statistics: FAILED - {e}")
            self.failed += 1
    
    def run_all_tests(self):
        """Run all tests"""
        print("\n" + "="*60)
        print("🚀 WhatsApp API Endpoint Tests")
        print("="*60)
        
        self.test_health_check()
        self.test_send_message()
        self.test_receive_message()
        self.test_webhook_handler()
        self.test_message_status()
        self.test_conversation_history()
        self.test_statistics()
        
        print("\n" + "="*60)
        print(f"📊 Test Results")
        print("="*60)
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"📈 Total:  {self.passed + self.failed}")
        print(f"📊 Success Rate: {(self.passed/(self.passed+self.failed)*100):.1f}%")
        print("="*60 + "\n")


if __name__ == '__main__':
    print("\n📝 WhatsApp API Test Suite")
    print("This tests the custom WhatsApp API endpoints without starting the server")
    
    try:
        tester = WhatsAppAPITests()
        tester.run_all_tests()
    except Exception as e:
        print(f"\n❌ Test Suite Error: {e}")
        import traceback
        traceback.print_exc()
