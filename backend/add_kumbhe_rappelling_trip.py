#!/usr/bin/env python
"""
Script to add Kumbhe Waterfall Rappelling trip to Firestore
"""

import os
import sys
import json
from datetime import datetime

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')

try:
    import django
    django.setup()
    from rag.firestore_service import firestore_knowledge_service
    django_available = True
except ImportError:
    print("⚠️  Django not available, using direct Firebase setup")
    django_available = False
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        
        # Initialize Firebase if not already done
        try:
            firebase_admin.get_app()
        except ValueError:
            firebase_admin.initialize_app()
        
        db = firestore.client()
    except Exception as e:
        print(f"❌ Failed to initialize Firebase: {e}")
        sys.exit(1)

def load_trip_data():
    """Load the trip data from JSON file"""
    json_path = os.path.join(os.path.dirname(__file__), 'kumbhe_waterfall_rappelling.json')
    
    if not os.path.exists(json_path):
        print(f"❌ Trip JSON file not found: {json_path}")
        return None
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ Loaded trip data: {data['name']}")
        return data
    except Exception as e:
        print(f"❌ Failed to load trip data: {e}")
        return None

def add_trip_to_firestore():
    """Add Kumbhe Waterfall Rappelling trip to Firestore"""
    
    # Load trip data
    trip_data = load_trip_data()
    if not trip_data:
        return False
    
    try:
        # Get database connection
        if django_available:
            if firestore_knowledge_service.is_connected():
                db = firestore_knowledge_service.db
                print("✅ Using Django Firestore service")
            else:
                print("❌ Firestore service not connected")
                return False
        else:
            print("✅ Using direct Firebase connection")
        
        # Add document to trips collection
        doc_ref = db.collection('trips').document(trip_data['slug'])
        doc_ref.set(trip_data, merge=True)
        
        print("🎉 Successfully added Kumbhe Waterfall Rappelling trip to Firestore!")
        
        # Verify document exists
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            print(f"✅ Document verified in Firestore")
            print(f"📄 Trip Name: {data.get('name', 'N/A')}")
            print(f"📍 Location: {data.get('location', 'N/A')}")
            print(f"💰 Price: ₹{data.get('price', 'N/A')}")
            print(f"🏷️  Category: {data.get('category', 'N/A')}")
            print(f"🏃‍♂️ Difficulty: {data.get('difficulty', 'N/A')}")
            print(f"📅 Duration: {data.get('duration', 'N/A')}")
            return True
        else:
            print("❌ Document not found after creation")
            return False
            
    except Exception as e:
        print(f"❌ Error adding to Firestore: {e}")
        return False

def main():
    print("=" * 80)
    print("🚁 Adding Kumbhe Waterfall Rappelling Trip to Firestore")
    print("=" * 80)
    
    success = add_trip_to_firestore()
    
    if success:
        print("\n🎉 SUCCESS! Kumbhe Waterfall Rappelling trip is now in your web app!")
        print("\n✨ Features added:")
        print("   • Professional waterfall rappelling experience")
        print("   • 5-day adventure with multiple waterfalls")
        print("   • Expert safety equipment and guides")
        print("   • Camping and trekking experience")
        print("   • Perfect for adventure enthusiasts")
        
        print("\n🌐 The trip will now appear:")
        print("   • On your Destinations page")
        print("   • In the Featured Adventures section")
        print("   • Available for booking")
        print("   • Searchable by category 'adventure'")
        
        print("\n💡 Trip highlights:")
        print("   • Waterfall rappelling at Kumbhe")
        print("   • Nanemachi, Satsada, Shevate waterfalls")
        print("   • Iconic Devkund waterfall trek")
        print("   • Professional safety equipment included")
        print("   • Expert rappelling instructors")
    else:
        print("\n❌ Failed to add trip to Firestore")
        print("💡 Manual alternative:")
        print("   1. Go to Firebase Console → Firestore Database")
        print("   2. Go to 'trips' collection")
        print("   3. Add document with ID: kumbhe-waterfall-rappelling-5d")
        print("   4. Import data from kumbhe_waterfall_rappelling.json")
    
    print("=" * 80)

if __name__ == "__main__":
    main()
