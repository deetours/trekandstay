#!/usr/bin/env python3
"""Debug LLM responses to fix JSON parsing"""

import os
import sys
import django
from pathlib import Path

# Setup Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
django.setup()

from services.multi_llm_router import MultiLLMRouter

def debug_llm_responses():
    """Debug the actual responses from LLMs to fix parsing"""

    print("\n" + "="*60)
    print("🔍 DEBUGGING LLM RESPONSES")
    print("="*60)

    router = MultiLLMRouter()

    # Test ANALYZER response
    print("\n📊 ANALYZER RESPONSE DEBUG:")
    try:
        response = router._call_openrouter('analyzer', [{
            "role": "user",
            "content": "Looking for cheap trek under 3000 rupees for 2 days"
        }])
        print(f"Raw Response: {response}")
        print(f"Response Type: {type(response)}")
    except Exception as e:
        print(f"Error: {e}")

    # Test TRACKER response
    print("\n📊 TRACKER RESPONSE DEBUG:")
    try:
        response = router._call_openrouter('tracker', [{
            "role": "user",
            "content": "Analyze lead journey"
        }])
        print(f"Raw Response: {response[:200]}...")
        print(f"Response Type: {type(response)}")
    except Exception as e:
        print(f"Error: {e}")

    # Test STRATEGIST response
    print("\n📊 STRATEGIST RESPONSE DEBUG:")
    try:
        response = router._call_openrouter('strategist', [{
            "role": "user",
            "content": "Strategic analysis needed"
        }])
        print(f"Raw Response: {response[:200]}...")
        print(f"Response Type: {type(response)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_llm_responses()