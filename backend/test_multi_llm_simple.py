#!/usr/bin/env python3
"""Simple synchronous test of the Multi-LLM Router"""

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

def test_multi_llm_router():
    """Test the Multi-LLM Router with reliable free models"""

    print("\n" + "="*60)
    print("🧠 MULTI-LLM ROUTER TEST - RELIABLE FREE MODELS")
    print("="*60)

    # Initialize router
    router = MultiLLMRouter()

    print("\n📊 Configured LLMs:")
    for llm_type, config in router.llms.items():
        print(f"  {llm_type.upper()}: {config.name}")
        print(f"    Model: {config.model}")
        print(f"    Purpose: {config.purpose}")
        print()

    # Test each LLM individually
    print("🧪 TESTING INDIVIDUAL LLMs:")
    print("-" * 40)

    # Test WRITER
    print("\n1️⃣  TESTING WRITER (Llama 3.3 70B)")
    try:
        response = router.call_writer(
            prompt="Hi, I'm interested in a trek for beginners",
            context="Customer is new to trekking, budget-conscious"
        )
        print(f"✅ Response: {response[:100]}...")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test ANALYZER
    print("\n2️⃣  TESTING ANALYZER (Qwen 2.5 72B)")
    try:
        analysis = router.call_analyzer("Looking for cheap trek under 3000 rupees for 2 days")
        print(f"✅ Intent: {analysis.get('intent')}")
        print(f"✅ Buy Readiness: {analysis.get('buy_readiness')}/10")
        print(f"✅ Sentiment: {analysis.get('sentiment')}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test TRACKER
    print("\n3️⃣  TESTING TRACKER (Gemma 2 9B)")
    try:
        tracking = router.call_tracker(
            lead_data={'id': 1, 'name': 'Test User', 'stage': 'inquiry'},
            conversation_history=[]
        )
        print(f"✅ Journey Stage: {tracking.get('journey_stage')}")
        print(f"✅ Next Action: {tracking.get('next_best_action')}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test STRATEGIST
    print("\n4️⃣  TESTING STRATEGIST (Dolphin 3.0 Mistral 24B)")
    try:
        strategy = router.call_strategist(
            lead_data={'id': 1, 'stage': 'consideration', 'intent_score': 60},
            analytics={'buy_readiness': 7, 'sentiment': 'positive'}
        )
        print(f"✅ Lead Score: {strategy.get('lead_score')}/100")
        print(f"✅ Strategy: {strategy.get('strategy')}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Show usage stats
    print("\n📈 USAGE STATISTICS:")
    print("-" * 40)
    stats = router.get_usage_stats()
    print(f"Total Calls: {stats['total_calls']}")
    print(f"Total Tokens: {stats['total_tokens']}")
    print("\nPer-LLM Stats:")
    for llm_type, stat in stats['stats'].items():
        print(f"  {llm_type}: {stat['calls']} calls, {stat['tokens']} tokens")

    print("\n🎉 Multi-LLM Router test completed!")
    print("All models are using FREE OpenRouter endpoints ✅")

if __name__ == "__main__":
    test_multi_llm_router()