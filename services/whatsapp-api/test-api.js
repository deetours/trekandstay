#!/usr/bin/env node

/**
 * Simple test script to verify the WhatsApp API service
 * Run: node test-api.js (after service is running)
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4001';
const API_KEY = 'change-me';

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

async function test() {
  try {
    console.log('🔍 Testing WhatsApp API service...\n');
    
    // 1. Health check
    console.log('1. Health check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', health.data);
    
    // 2. Create session
    console.log('\n2. Creating session...');
    const session = await axios.get(`${BASE_URL}/create-session?sessionId=test`, { headers });
    console.log('✅ Session created:', session.data);
    
    if (session.data.qr) {
      console.log('📱 QR Code available - scan with your phone');
    }
    
    // 3. Check session status
    console.log('\n3. Checking session status...');
    const status = await axios.get(`${BASE_URL}/session-status?sessionId=test`, { headers });
    console.log('✅ Status:', status.data);
    
    // 4. Test webhook endpoint
    console.log('\n4. Testing webhook...');
    const webhook = await axios.post(`${BASE_URL}/webhook`, 
      { test: 'payload' }, 
      { headers: { ...headers, 'X-Webhook-Token': 'shared-secret' }}
    );
    console.log('✅ Webhook test:', webhook.data);
    
    console.log('\n🎉 All tests passed! Service is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('   - Scan QR code to connect WhatsApp');
    console.log('   - Use POST /send to send messages');
    console.log('   - Configure WEBHOOK_TARGET_URL for incoming messages');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

test();
