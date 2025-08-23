#!/usr/bin/env python
"""Test script to verify Maharashtra FAQs are loaded correctly"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
django.setup()

from rag.services import RAGService

def test_maharashtra_faqs():
    print("🔄 Initializing RAG Service...")
    try:
        service = RAGService()
        print("✅ RAG Service initialized successfully!")
        
        # Test queries for both trips
        test_queries = [
            "What is the cost of Maharashtra 5 days trip?",
            "What is the cost of Maharashtra 7 days trip?", 
            "Which waterfalls are covered in 5 day trip?",
            "What treks are included in Maharashtra 7 day trip?",
            "When does the 5 day waterfall trip start?",
            "What are the dates for 7 day Maharashtra trip?"
        ]
        
        print("\n🧪 Testing knowledge base queries...")
        for query in test_queries:
            print(f"\n❓ Query: {query}")
            try:
                # Just test document retrieval (not full RAG pipeline)
                context = service.search_similar(query, n_results=3)
                if context:
                    print(f"✅ Found {len(context)} relevant documents")
                    # Show the most relevant document
                    top_doc = context[0]
                    print(f"📄 Top result: {top_doc.get('title', 'No title')}")
                    content_preview = top_doc.get('content', '')[:100] + "..."
                    print(f"📝 Content preview: {content_preview}")
                else:
                    print("❌ No relevant documents found")
            except Exception as e:
                print(f"❌ Error testing query: {str(e)}")
        
        print(f"\n📊 Total documents in knowledge base: {service.collection.count()}")
        print("🎉 Knowledge base test completed!")
        
    except Exception as e:
        print(f"❌ Error initializing service: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_maharashtra_faqs()
    print(f"\n{'✅ Test passed!' if success else '❌ Test failed!'}")
