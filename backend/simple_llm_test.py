#!/usr/bin/env python3
"""
Simple Multi-LLM Test - Test OpenRouter API calls without Django
"""

import os
import json
import requests
from datetime import datetime

class SimpleMultiLLMTest:
    """Test OpenRouter API calls directly"""

    def __init__(self):
        self.base_url = "https://openrouter.ai/api/v1"
        self.api_key = "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"

    def test_llm_call(self, model_name, model_id, prompt, description):
        """Test a single LLM call"""
        print(f"\n🧪 Testing {model_name} - {description}")
        print("-" * 50)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://trekandstay.com",
            "X-Title": "Trek & Stay - AI Sales Agent",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model_id,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 500
        }

        try:
            print(f"Calling {model_id}...")
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                content = data['choices'][0]['message']['content']
                usage = data.get('usage', {})

                print("✅ SUCCESS!")
                print(f"Response: {content[:200]}...")
                print(f"Tokens used: {usage.get('total_tokens', 'N/A')}")
                return True
            else:
                print(f"❌ FAILED: {response.status_code}")
                print(f"Error: {response.text[:200]}")
                return False

        except Exception as e:
            print(f"❌ EXCEPTION: {str(e)}")
            return False

def main():
    print("🚀 SIMPLE MULTI-LLM TEST")
    print("=" * 50)

    tester = SimpleMultiLLMTest()

    # Test each LLM
    tests = [
        ("Kimi K 1.5", "kimi-k1.5", "Write a short WhatsApp message about a trek offer", "Sales Response Writing"),
        ("Qwen", "qwen/qwen-2-7b-instruct", "Analyze this message: 'Hi, do you have beginner treks?' and respond with JSON containing intent, sentiment, buy_readiness", "Intent Analysis"),
        ("Deepseek", "deepseek/deepseek-chat", "Track this conversation: Customer asked about treks, we showed options, they asked price. What stage are they in?", "Context Tracking"),
        ("Grok Beta", "xai/grok-beta", "Give sales strategy for a lead with 70% buy readiness in JSON format", "Strategic Decisions"),
    ]

    results = []
    for model_name, model_id, prompt, description in tests:
        success = tester.test_llm_call(model_name, model_id, prompt, description)
        results.append((model_name, success))

    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)

    passed = sum(1 for _, success in results if success)
    total = len(results)

    for model_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {model_name}")

    print(f"\nResults: {passed}/{total} LLMs working")
    print(f"Cost: $0 (All FREE on OpenRouter)")

    if passed == total:
        print("\n🎉 ALL LLMs WORKING! Ready for production!")
    else:
        print(f"\n⚠️  {total - passed} LLMs failed. Check model IDs.")

if __name__ == "__main__":
    main()