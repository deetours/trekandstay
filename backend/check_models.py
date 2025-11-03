#!/usr/bin/env python3
"""Check available models on OpenRouter"""

import requests

api_key = "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"
headers = {
    "Authorization": f"Bearer {api_key}",
}

response = requests.get("https://openrouter.ai/api/v1/models", headers=headers)

if response.status_code == 200:
    data = response.json()
    models = data.get('data', [])

    print("Available FREE models on OpenRouter:")
    print("=" * 50)

    free_models = []
    for model in models:
        if model.get('pricing', {}).get('prompt') == "0" and model.get('pricing', {}).get('completion') == "0":
            free_models.append(model)

    # Sort by name for easier reading
    free_models.sort(key=lambda x: x.get('name', ''))

    for model in free_models[:20]:  # Show first 20
        name = model.get('name', 'Unknown')
        model_id = model.get('id', 'Unknown')
        print(f"✅ {name}")
        print(f"   ID: {model_id}")
        print()

    print(f"Total FREE models: {len(free_models)}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)