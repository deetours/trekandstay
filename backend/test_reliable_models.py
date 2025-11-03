#!/usr/bin/env python3
"""Test more reliable free models"""

import requests

api_key = "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"
headers = {
    "Authorization": f"Bearer {api_key}",
}

response = requests.get("https://openrouter.ai/api/v1/models", headers=headers)

if response.status_code == 200:
    data = response.json()
    models = data.get('data', [])

    # Test these reliable free models
    reliable_free_models = [
        'meta-llama/llama-3.3-70b-instruct:free',
        'meta-llama/llama-3.2-3b-instruct:free',
        'google/gemma-2-9b-it:free',
        'deepseek/deepseek-chat-v3.1:free',
        'qwen/qwen-2.5-72b-instruct:free',
        'arliai/qwq-32b-arliai-rpr-v1:free',
        'cognitivecomputations/dolphin3.0-mistral-24b:free'
    ]

    print("Testing reliable FREE models:")
    print("=" * 50)

    for model_id in reliable_free_models:
        # Find the model details
        model_info = None
        for model in models:
            if model.get('id') == model_id:
                model_info = model
                break

        if model_info:
            name = model_info.get('name', 'Unknown')
            print(f"\n🧪 Testing: {name}")
            print(f"   ID: {model_id}")

            # Test a simple call
            test_payload = {
                "model": model_id,
                "messages": [{"role": "user", "content": "Say 'Hello World' in exactly 2 words."}],
                "max_tokens": 10
            }

            try:
                test_response = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=test_payload,
                    timeout=10
                )

                if test_response.status_code == 200:
                    result = test_response.json()
                    content = result.get('choices', [{}])[0].get('message', {}).get('content', '')
                    print(f"   ✅ WORKING: {content.strip()}")
                else:
                    print(f"   ❌ FAILED: {test_response.status_code} - {test_response.text[:100]}")

            except Exception as e:
                print(f"   ❌ ERROR: {str(e)}")
        else:
            print(f"\n❓ Model not found: {model_id}")

else:
    print(f"Error: {response.status_code}")
    print(response.text)