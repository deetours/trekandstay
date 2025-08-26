#!/usr/bin/env python3
"""
Script to verify Adventure Maharashtra 5 Days Trek in Firestore
"""

import json
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

def verify_maharashtra_trek():
    """Verify the Adventure Maharashtra 5 Days Trek exists in Firestore"""
    
    if not firebase_available:
        print("❌ Firebase not available for verification")
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
        
        # Check if document exists
        doc_ref = db.collection('trips').document('adventure-maharashtra-5days-trek')
        doc = doc_ref.get()
        
        if doc.exists:
            trip_data = doc.to_dict()
            print("🎉 Adventure Maharashtra 5 Days Trek found in Firestore!")
            print(f"📄 Document ID: {doc.id}")
            print(f"🏔️  Name: {trip_data.get('name', 'N/A')}")
            print(f"📍 Location: {trip_data.get('location', 'N/A')}")
            print(f"💰 Price: ₹{trip_data.get('price', 'N/A')}")
            print(f"📅 Duration: {trip_data.get('duration', 'N/A')}")
            print(f"👥 Spots Available: {trip_data.get('spotsAvailable', 'N/A')}")
            print(f"🏷️  Difficulty: {trip_data.get('difficulty', 'N/A')}")
            print(f"📞 Contact: {trip_data.get('contactNumber', 'N/A')}")
            
            # Check batch dates
            batch_dates = trip_data.get('batchDates', [])
            if batch_dates:
                print(f"📅 Batch Dates:")
                for date in batch_dates:
                    print(f"   • {date}")
            
            # Check highlights
            highlights = trip_data.get('highlights', [])
            if highlights:
                print(f"✨ Trip Highlights:")
                for highlight in highlights[:3]:  # Show first 3
                    print(f"   • {highlight}")
                if len(highlights) > 3:
                    print(f"   ... and {len(highlights)-3} more highlights")
            
            return True
        else:
            print("❌ Adventure Maharashtra 5 Days Trek NOT found in Firestore")
            print("💡 The trip needs to be added to the database")
            return False
            
    except Exception as e:
        print(f"❌ Error verifying trip in Firestore: {e}")
        return False

def list_all_trips():
    """List all trips currently in Firestore"""
    
    if not firebase_available:
        print("❌ Firebase not available")
        return
    
    try:
        db = firestore.client()
        trips_ref = db.collection('trips')
        docs = trips_ref.stream()
        
        trip_count = 0
        print("\n📋 All trips currently in Firestore:")
        print("=" * 50)
        
        for doc in docs:
            trip_data = doc.to_dict()
            trip_count += 1
            print(f"{trip_count}. {doc.id}")
            print(f"   Name: {trip_data.get('name', 'N/A')}")
            print(f"   Price: ₹{trip_data.get('price', 'N/A')}")
            print(f"   Location: {trip_data.get('location', 'N/A')}")
            print()
        
        print(f"📊 Total trips found: {trip_count}")
        
    except Exception as e:
        print(f"❌ Error listing trips: {e}")

def add_maharashtra_trek_if_missing():
    """Add the trip if it's missing from Firestore"""
    
    trip_data = {
        "name": "🏞️ Adventure Maharashtra 5 Days Trek",
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
            "Jivdhan Fort Trek - Historical Sahyadri Fort with steep climbs",
            "Reverse Waterfall at Naneghat - Nature's wonder with upward flow",
            "Bhairavgad Fort Trek - Thrilling vertical rock patches and ridges",
            "Ratangad Fort Trek - Views of Kalsubai Peak (highest in Maharashtra)",
            "Sandan Valley - Maharashtra's Grand Canyon with rappelling",
            "Professional Trek Leadership & Safety Equipment",
            "Multi-fort Adventure Circuit Experience"
        ],
        "detailedItinerary": [
            {
                "day": 1,
                "date": "18th/25th September",
                "title": "Departure from Bengaluru 🚆🚌",
                "time": "Evening 4:00 PM",
                "description": "Assemble at designated pick-up point. Overnight journey to Pune/Satara by train/tempo traveller/mini bus. Bonding and ice-breaking sessions.",
                "activities": ["Assembly", "Travel", "Bonding sessions"]
            },
            {
                "day": 2,
                "date": "19th/26th September",
                "title": "Jivdhan Fort Trek & Reverse Waterfall 🌄💧",
                "description": "Early arrival in Pune/Satara. Road transfer (~4h) to trek base. Jivdhan Fort trek (8km, 4+4, Moderate). Visit Reverse Waterfall near Naneghat.",
                "activities": ["Jivdhan Fort Trek", "Reverse Waterfall", "Camping"],
                "trek_distance": "8 km (4+4)",
                "difficulty": "Moderate"
            },
            {
                "day": 3,
                "date": "20th/27th September", 
                "title": "Conquer Bhairavgad Trek ⛰️🔥",
                "description": "Most thrilling trek in Maharashtra with vertical rock patches, exposed ridges, adrenaline-pumping climbs under expert guidance.",
                "activities": ["Bhairavgad Fort Trek", "Rock climbing", "Safety training"],
                "trek_distance": "12 km (6+6)",
                "difficulty": "Difficult"
            },
            {
                "day": 4,
                "date": "21st/28th September",
                "title": "Ratangad Fort Trek & Sandan Valley 🏔️🌌",
                "description": "Beautiful trek with Kalsubai Peak views. Explore Nedhe, bastions, caves. Descent into Sandan Valley for rappelling and boulder hopping.",
                "activities": ["Ratangad Fort Trek", "Sandan Valley", "Rappelling", "Boulder hopping"],
                "trek_distance": "12 km (6+6)", 
                "difficulty": "Moderate"
            },
            {
                "day": 5,
                "date": "22nd/29th September",
                "title": "Arrival in Bengaluru 🏡",
                "description": "Morning arrival with unforgettable memories of Maharashtra's adventurous trails.",
                "activities": ["Return journey", "Trip conclusion"]
            }
        ],
        "batchDates": [
            "📅 September 18th – 22nd, 2024",
            "📅 September 25th – 29th, 2024"
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
            "ID card (mandatory)",
            "Basic medicines + personal prescriptions",
            "Leech & mosquito repellents",
            "Toiletries & towel",
            "Trekking pole (recommended)"
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
        "images": [
            "https://images.pexels.com/photos/29613184/pexels-photo-29613184.jpeg",
            "https://images.pexels.com/photos/27743006/pexels-photo-27743006.jpeg", 
            "https://images.pexels.com/photos/213872/pexels-photo-213872.jpeg",
            "https://images.pexels.com/photos/33041/antelope-canyon-lower-canyon-arizona.jpg"
        ],
        "tags": [
            "adventure", "forts", "maharashtra", "sahyadris", "multi-day",
            "rappelling", "difficult-trek", "monsoon", "historical", "trekking"
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
        "updatedAt": datetime.now(),
        "description": "This trip blends thrilling treks, breathtaking landscapes, and raw adventure in the heart of the Sahyadris. Perfect for those seeking an adrenaline rush and nature's magic."
    }
    
    if not firebase_available:
        print("❌ Firebase not available. Here's the complete trip data:")
        print(json.dumps(trip_data, indent=2, default=str))
        return False
    
    try:
        db = firestore.client()
        doc_ref = db.collection('trips').document(trip_data['slug'])
        doc_ref.set(trip_data, merge=True)
        
        print("🎉 Successfully added/updated Adventure Maharashtra 5 Days Trek!")
        return True
        
    except Exception as e:
        print(f"❌ Error adding trip: {e}")
        return False

def main():
    print("🔍 Verifying Adventure Maharashtra 5 Days Trek in Firestore")
    print("=" * 60)
    
    # First, verify if the trip exists
    exists = verify_maharashtra_trek()
    
    if not exists:
        print("\n🔄 Trip not found. Adding to Firestore...")
        success = add_maharashtra_trek_if_missing()
        if success:
            print("✅ Trip added successfully!")
            # Verify again
            print("\n🔍 Re-verifying...")
            verify_maharashtra_trek()
    
    # List all trips for reference
    list_all_trips()
    
    print("\n🌐 Your Adventure Maharashtra 5 Days Trek should now be visible:")
    print("   • On the Destinations page")
    print("   • In Featured Adventures section")
    print("   • Available for booking")
    print("   • In admin dashboard for management")
    
    print("=" * 60)

if __name__ == "__main__":
    main()