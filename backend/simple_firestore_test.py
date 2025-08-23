#!/usr/bin/env python
"""
Simple script to add Maharashtra 5-day trip itinerary to Firestore
"""

import json
import os

def load_itinerary_json():
    """Load the itinerary from JSON file"""
    try:
        with open('maharashtra_5day_itinerary.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {e}")
        return None

def test_firestore_connection():
    """Test Firestore connection without Django"""
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        
        # Check if already initialized
        try:
            app = firebase_admin.get_app()
            print("✅ Firebase app already initialized")
        except ValueError:
            # Initialize with default credentials
            firebase_admin.initialize_app()
            print("✅ Firebase app initialized with default credentials")
        
        # Get Firestore client
        db = firestore.client()
        print("✅ Firestore client created")
        
        return db
        
    except Exception as e:
        print(f"❌ Error connecting to Firestore: {e}")
        print("💡 Make sure you have:")
        print("   1. Firebase Admin SDK installed: pip install firebase-admin")
        print("   2. Service account key file or default credentials set up")
        print("   3. GOOGLE_APPLICATION_CREDENTIALS environment variable set")
        return None

def add_itinerary_to_firestore(db, itinerary_data):
    """Add itinerary to Firestore"""
    try:
        # Add document to trips collection
        doc_ref = db.collection('trips').document('maharashtra-waterfall-edition-5d')
        doc_ref.set(itinerary_data, merge=True)
        
        print("🎉 Successfully added itinerary to Firestore!")
        
        # Verify document exists
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            print(f"✅ Document verified in Firestore")
            print(f"📄 Trip Title: {data.get('title', 'N/A')}")
            print(f"🗓️  Dates: {data.get('dates', 'N/A')}")
            print(f"🌊 Total Waterfalls: {data.get('total_waterfalls', 'N/A')}")
            return True
        else:
            print("❌ Document not found after creation")
            return False
            
    except Exception as e:
        print(f"❌ Error adding to Firestore: {e}")
        return False

def main():
    print("🔄 Testing Firestore Connection and Adding Maharashtra 5-Day Itinerary")
    print("=" * 70)
    
    # Load itinerary data
    itinerary_data = load_itinerary_json()
    if not itinerary_data:
        print("❌ Failed to load itinerary JSON file")
        return
    
    print("✅ Itinerary JSON loaded successfully")
    
    # Test Firestore connection
    db = test_firestore_connection()
    if not db:
        print("❌ Could not connect to Firestore")
        print("\n📋 Manual Steps:")
        print("1. Go to Firebase Console → Your Project → Settings → Service Accounts")
        print("2. Generate new private key and download the JSON file")
        print("3. Set environment variable: GOOGLE_APPLICATION_CREDENTIALS=path/to/your/key.json")
        print("4. Or manually add the JSON data to Firestore using the provided JSON file")
        return
    
    # Add itinerary to Firestore
    success = add_itinerary_to_firestore(db, itinerary_data)
    
    if success:
        print("\n🎉 SUCCESS! Your Maharashtra 5-Day Trip itinerary is now in Firestore!")
        print("\n🤖 Your chatbot can now answer questions like:")
        print("   • 'What waterfalls are visited on Day 2?'")
        print("   • 'How long is the trek to Devkund waterfall?'")
        print("   • 'What time does the trip start?'")
        print("   • 'Which day has the longest trek?'")
        print("   • 'What is included in the 5-day trip?'")
    else:
        print("\n❌ Failed to add itinerary to Firestore")
        print("💡 You can manually import the JSON file to Firestore:")
        print("   1. Go to Firebase Console → Firestore Database")
        print("   2. Go to 'trips' collection")
        print("   3. Add document with ID: maharashtra-waterfall-edition-5d")
        print("   4. Import the data from maharashtra_5day_itinerary.json")
    
    print("=" * 70)

if __name__ == "__main__":
    main()
