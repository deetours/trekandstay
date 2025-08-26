#!/usr/bin/env python3
"""
Script to add Adventure Maharashtra 5 Days Trek to Firestore
"""

import json
import os
import sys
from datetime import datetime

# Try to import Firebase modules
try:
    from firebase_admin import credentials, firestore, initialize_app
    firebase_available = True
    print("✅ Firebase Admin SDK available")
except ImportError:
    firebase_available = False
    print("❌ Firebase Admin SDK not available")

def add_maharashtra_trek_to_firestore():
    """Add the Adventure Maharashtra 5 Days Trek to Firestore"""
    
    trip_data = {
        "name": "Adventure Maharashtra 5 Days Trek",
        "slug": "adventure-maharashtra-5days-trek",
        "location": "Maharashtra (Sahyadris)",
        "duration": "5D / 4N",
        "spotsAvailable": 25,
        "nextDeparture": "2024-09-18",
        "safetyRecord": "Excellent",
        "price": 9500,
        "bookingAdvance": 2000,
        "difficulty": "Moderate to Difficult",
        "category": "adventure",
        "highlights": [
            "Jivdhan Fort Trek - Historical Sahyadri Fort",
            "Reverse Waterfall at Naneghat - Nature's Wonder",
            "Bhairavgad Fort - Thrilling Vertical Rock Patches",
            "Ratangad Fort - Views of Kalsubai Peak",
            "Sandan Valley - Maharashtra's Grand Canyon",
            "Adventure Rappelling Experience",
            "Professional Trek Leadership",
            "Multi-fort Adventure Circuit"
        ],
        "itinerary": [
            "Day 1 (18th/25th Sept): Evening 4:00 PM departure from Bengaluru. Overnight journey to Pune/Satara by train/tempo traveller. Bonding & ice-breaking sessions.",
            "Day 2 (19th/26th Sept): Early arrival in Pune/Satara. Road transfer (~4h) to trek base. Jivdhan Fort Trek (8km, 4+4, Moderate difficulty). Visit Reverse Waterfall near Naneghat. Tent/dorm stay.",
            "Day 3 (20th/27th Sept): Bhairavgad Fort Trek (12km, 6+6, Difficult). Thrilling vertical rock patches and exposed ridges with safety precautions. Expert trek leaders guidance.",
            "Day 4 (21st/28th Sept): Ratangad Fort Trek (12km, 6+6, Moderate). Views of Kalsubai Peak and Bhandardara region. Explore Nedhe, caves and scenic landscapes. Sandan Valley exploration with rappelling and boulder hopping. Evening departure from Nasik.",
            "Day 5 (22nd/29th Sept): Morning arrival in Bengaluru with unforgettable memories of Maharashtra's adventurous trails."
        ],
        "batchDates": [
            "September 18th - 22nd, 2024",
            "September 25th - 29th, 2024"
        ],
        "equipment": [
            "Trekking shoes + extra slippers",
            "10L backpack for trek essentials",
            "Trekking outfits + 5-day clothing",
            "Raincoat / poncho / umbrella",
            "Blanket / thermals / jacket",
            "Sunglasses, sunscreen & cap",
            "Water bottle & energy snacks",
            "Power bank & torch",
            "Trekking pole (recommended)"
        ],
        "essentials": [
            "ID card (mandatory)",
            "Basic medicines + personal prescriptions",
            "Leech & mosquito repellents",
            "Toiletries & towel"
        ],
        "safety": [
            "Experienced trek leaders with safety certification",
            "Basic first-aid support and emergency response",
            "All safety precautions for vertical rock climbing",
            "Weather monitoring and route assessment",
            "Emergency evacuation protocols"
        ],
        "guide": {
            "name": "Expert Sahyadri Trek Team",
            "experience": "Specialized in Maharashtra fort treks and adventure activities",
            "bio": "Professional team with extensive experience in Sahyadri mountain range, fort trekking, and adventure sports including rappelling and rock climbing."
        },
        "reviews": [],
        "images": [
            "https://images.pexels.com/photos/29613184/pexels-photo-29613184.jpeg",
            "https://images.pexels.com/photos/27743006/pexels-photo-27743006.jpeg",
            "https://images.pexels.com/photos/213872/pexels-photo-213872.jpeg",
            "https://images.pexels.com/photos/33041/antelope-canyon-lower-canyon-arizona.jpg"
        ],
        "tags": [
            "adventure",
            "forts",
            "maharashtra",
            "sahyadris",
            "multi-day",
            "rappelling",
            "difficult-trek",
            "monsoon",
            "historical"
        ],
        "includes": [
            "Accommodation: Tent stay / dormitory / shared room",
            "Transportation: Train / tempo traveller / mini bus / bus (as per group size)",
            "Food: 3 breakfasts + 3 dinners (Veg)",
            "Trek entry fees & guide charges",
            "Experienced trek leaders & basic first-aid support"
        ],
        "excludes": [
            "GST & Travel Insurance",
            "All lunches (self-sponsored)",
            "Medical expenses beyond first aid",
            "Off-road vehicle charges (if applicable)",
            "Anything not mentioned in inclusions"
        ],
        "contactNumber": "9902937730",
        "active": True,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    
    if not firebase_available:
        print("❌ Firebase not available. Here's the trip data to manually add:")
        print(json.dumps(trip_data, indent=2, default=str))
        return False
    
    try:
        # Initialize Firebase (if not already done)
        try:
            initialize_app()
            print("✅ Firebase initialized")
        except ValueError:
            print("✅ Firebase already initialized")
        
        # Get Firestore client
        db = firestore.client()
        
        # Add document to trips collection
        doc_ref = db.collection('trips').document(trip_data['slug'])
        doc_ref.set(trip_data)
        
        print("🎉 Successfully added Adventure Maharashtra 5 Days Trek to Firestore!")
        print(f"📄 Document ID: {trip_data['slug']}")
        print(f"🏔️  Location: {trip_data['location']}")
        print(f"💰 Price: ₹{trip_data['price']}")
        print(f"📅 Batch Dates: {', '.join(trip_data['batchDates'])}")
        print(f"🏷️  Tags: {', '.join(trip_data['tags'])}")
        
        # Verify document exists
        doc = doc_ref.get()
        if doc.exists:
            print("✅ Document verified in Firestore")
            return True
        else:
            print("❌ Document verification failed")
            return False
            
    except Exception as e:
        print(f"❌ Error adding trip to Firestore: {e}")
        return False

def main():
    print("🏔️ Adding Adventure Maharashtra 5 Days Trek to Firebase")
    print("=" * 60)
    
    success = add_maharashtra_trek_to_firestore()
    
    if success:
        print("\n🎉 SUCCESS! Your Adventure Maharashtra 5 Days Trek is now in Firestore!")
        print("\n🌐 The trip will now appear:")
        print("   • On your Destinations page")
        print("   • In the Featured Adventures section")
        print("   • Available for booking")
        print("   • Searchable by tags: adventure, forts, maharashtra")
        
        print("\n💡 Trip highlights:")
        print("   • Multi-fort adventure circuit")
        print("   • Jivdhan, Bhairavgad, and Ratangad forts")
        print("   • Reverse waterfall and Sandan Valley")
        print("   • Professional adventure guidance")
        print("   • Rappelling and rock climbing")
    else:
        print("\n❌ Failed to add trip to Firestore")
        print("💡 Manual alternative:")
        print("   1. Go to Firebase Console → Firestore Database")
        print("   2. Go to 'trips' collection")
        print("   3. Add document with ID: adventure-maharashtra-5days-trek")
        print("   4. Copy the JSON data shown above")
    
    print("=" * 60)

if __name__ == "__main__":
    main()