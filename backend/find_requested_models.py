#!/usr/bin/env python3
"""Check specific models mentioned by user"""

import requests

api_key = "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"
headers = {
    "Authorization": f"Bearer {api_key}",
}

response = requests.get("https://openrouter.ai/api/v1/models", headers=headers)

if response.status_code == 200:
    data = response.json()
    models = data.get('data', [])

    # Models the user specifically wanted
    target_models = {
        'kimi': ['kimi', 'k1.5', 'kimi-k'],
        'qwen': ['qwen', 'qwq'],
        'deepseek': ['deepseek'],
        'grok': ['grok']
    }

    print("Searching for your requested models:")
    print("=" * 50)

    found_models = {}

    for model in models:
        name = model.get('name', '').lower()
        model_id = model.get('id', '')

        for target, keywords in target_models.items():
            if any(keyword in name for keyword in keywords):
                if target not in found_models:
                    found_models[target] = []
                found_models[target].append({
                    'name': model.get('name'),
                    'id': model_id,
                    'free': model.get('pricing', {}).get('prompt') == "0"
                })

    for target, matches in found_models.items():
        print(f"\n🔍 {target.upper()} models found:")
        for match in matches:
            status = "✅ FREE" if match['free'] else "💰 PAID"
            print(f"   {status} {match['name']}")
            print(f"      ID: {match['id']}")

    # Show all DeepSeek models since user wanted DeepSeek
    print("\n📋 All DeepSeek models:")
    for model in models:
        if 'deepseek' in model.get('name', '').lower():
            free = model.get('pricing', {}).get('prompt') == "0"
            status = "✅ FREE" if free else "💰 PAID"
            print(f"   {status} {model.get('name')}")
            print(f"      ID: {model.get('id')}")

else:
    print(f"Error: {response.status_code}")
    print(response.text)