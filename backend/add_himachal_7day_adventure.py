#!/usr/bin/env python3
"""
Script to add 7-Day Himachal Adventure trip to Firestore
Following the established data structure and validation patterns
"""

import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import sys
import os

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
        print("✅ Firebase already initialized")
    except ValueError:
        # Initialize Firebase
        cred_path = "firebase-service-account.json"
        if not os.path.exists(cred_path):
            print(f"❌ Error: {cred_path} not found")
            print("Please ensure the Firebase service account key is in the backend directory")
            sys.exit(1)
        
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized successfully")
    
    return firestore.client()

def create_himachal_7day_trip():
    """Create the 7-Day Himachal Adventure trip data"""
    
    # Generate future batch dates (next 6 months, every 2 weeks)
    today = datetime.now()
    batch_dates = []
    for i in range(12):  # 12 batches over 6 months
        future_date = today + timedelta(days=(i * 14) + 7)  # Start from next week
        batch_dates.append(future_date.strftime("%Y-%m-%d"))
    
    trip_data = {
        # Basic Information
        "name": "7-Day Himachal Adventure",
        "slug": "himachal-7day-adventure-manali-kasol-tosh-kheerganga",
        "subtitle": "Manali • Kasol • Tosh • Kheerganga",
        "location": "Himachal Pradesh",
        "duration": "7 Days",
        "difficulty": "Moderate",
        "category": "multi-day",
        
        # Pricing Information
        "price": 11999,
        "originalPrice": 15999,
        "bookingAdvance": 5000,
        "priceOptions": [
            {"type": "Delhi to Delhi", "price": 11999, "currency": "INR"},
            {"type": "Bengaluru to Bengaluru (Train)", "price": 21499, "currency": "INR"},
            {"type": "Bengaluru to Bengaluru (Flight)", "price": 24499, "currency": "INR"}
        ],
        
        # Trip Details
        "spotsAvailable": 25,
        "batchDates": batch_dates,
        "nextDeparture": batch_dates[0],
        "contactNumber": "9902937730",
        "rating": 4.8,
        "totalReviews": 89,
        
        # Marketing Content
        "shortDescription": "Experience the magic of Himachal Pradesh with riverside stays in Kasol, village life in Tosh, Kheerganga trek with natural hot springs, and exploring the cultural heritage of Manali and Naggar.",
        "detailedDescription": "Embark on a transformative 7-day journey through the heart of Himachal Pradesh. From the hippie paradise of Kasol to the serene village of Tosh, culminating with the challenging yet rewarding Kheerganga trek and natural hot springs. Explore Old Manali's bohemian culture, trek to Bijli Mahadev temple, and discover Naggar's ancient heritage. This adventure combines trekking, cultural exploration, riverside relaxation, and mountain spirituality.",
        
        # Highlights
        "highlights": [
            "Riverside stay in Kasol - The Little Israel of India",
            "Village experience in scenic Tosh hamlet",
            "Kheerganga trek with natural hot spring therapy",
            "Camping under the Himalayan stars",
            "Old Manali cafe culture and Tibetan market exploration",
            "Bijli Mahadev temple trek with panoramic Kullu Valley views",
            "Naggar Castle and Roerich Art Gallery visit",
            "Multiple departure options from Bengaluru and Delhi"
        ],
        
        # Tags for filtering and search
        "tags": [
            "himachal-pradesh", "manali", "kasol", "tosh", "kheerganga", 
            "multi-day", "trekking", "camping", "hot-springs", "village-stay",
            "riverside", "mountains", "culture", "backpacking", "moderate-difficulty"
        ],
        
        # Images (placeholder URLs - replace with actual images)
        "images": [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", # Himalayan landscape
            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop", # Mountain trek
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop", # Kasol riverside
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop", # Mountain village
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"  # Camping
        ],
        
        # Detailed Daily Itinerary
        "itinerary": [
            {
                "day": "0",
                "title": "Departure from Bengaluru",
                "content": "Board your flight / train from Bengaluru to Delhi or Chandigarh. Overnight journey with excitement building up for the Himalayas. Reach Delhi/Chandigarh by Saturday 8:00 AM.",
                "meals": "Self-sponsored during journey",
                "accommodation": "In-transit",
                "activities": ["Travel to Delhi/Chandigarh", "Overnight journey"],
                "transport": "Flight/Train"
            },
            {
                "day": "1",
                "title": "Delhi/Chandigarh → Kasol (Riverside Stay)",
                "content": "Morning pickup from Delhi/Chandigarh and scenic drive (~12 hrs) to Kasol, the backpackers' paradise. Check-in at your riverside hostel/stay. Evening leisure with cafe hopping in Kasol's vibrant hippie cafes, Parvati River walk, and explore Kasol market for souvenirs and handmade crafts.",
                "meals": "Dinner included",
                "accommodation": "Riverside hostel/stay in Kasol",
                "activities": ["Scenic drive to Kasol", "Cafe hopping", "Parvati River walk", "Market exploration"],
                "transport": "Private vehicle"
            },
            {
                "day": "2",
                "title": "Kasol → Tosh Village",
                "content": "After breakfast, drive to Barshaini (~1 hr). Short trek or jeep ride to Tosh Village, a scenic hamlet in Parvati Valley. Explore apple orchards, wooden houses, and mountain vistas. Relax at homestay with bonfire vibes (weather permitting).",
                "meals": "Breakfast & Dinner included",
                "accommodation": "Homestay in Tosh Village",
                "activities": ["Drive to Barshaini", "Trek to Tosh Village", "Village exploration", "Bonfire evening"],
                "transport": "Private vehicle + Trek/Jeep"
            },
            {
                "day": "3",
                "title": "Tosh → Kheerganga Trek & Camping",
                "content": "Early breakfast to fuel up for the big day. Begin Kheerganga Trek (~12–14 km | 5–6 hrs). Trail highlights include pine forests, waterfalls, and mountain meadows. Evening reward: soak in the natural hot spring at Kheerganga. Night under the stars with stories, music & campfire (if weather permits).",
                "meals": "Breakfast & Dinner included",
                "accommodation": "Camping at Kheerganga",
                "activities": ["Kheerganga trek", "Natural hot spring bath", "Stargazing", "Campfire"],
                "transport": "Trekking"
            },
            {
                "day": "4",
                "title": "Kheerganga → Manali (Old Manali Stay)",
                "content": "Morning descent trek back to Barshaini (~5 hrs). Drive to Manali (~4–5 hrs). Evening: explore Old Manali with bohemian cafes, Tibetan market, and chill by the Beas River.",
                "meals": "Breakfast & Dinner included",
                "accommodation": "Stay in Old Manali",
                "activities": ["Descent trek", "Drive to Manali", "Old Manali exploration", "Beas River relaxation"],
                "transport": "Trekking + Private vehicle"
            },
            {
                "day": "5",
                "title": "Bijli Mahadev Trek → Naggar",
                "content": "After breakfast, drive to Chansari village (~1 hr). Begin trek (~3 km moderate climb) to Bijli Mahadev Temple, offering a panoramic view of Kullu Valley. Post trek, drive to Naggar (~1 hr). Explore Naggar Castle (ancient heritage building), Roerich Art Gallery, and cafes with valley views.",
                "meals": "Breakfast & Dinner included",
                "accommodation": "Stay in Naggar",
                "activities": ["Bijli Mahadev trek", "Temple visit", "Naggar Castle tour", "Art gallery visit"],
                "transport": "Private vehicle + Trekking"
            },
            {
                "day": "6",
                "title": "Naggar → Delhi/Chandigarh → Bengaluru",
                "content": "Early morning departure from Naggar. Scenic drive back (~12–14 hrs) to Delhi/Chandigarh. Evening/night: board flight/train/bus towards Bengaluru.",
                "meals": "Breakfast included",
                "accommodation": "In-transit",
                "activities": ["Return journey to Delhi/Chandigarh", "Board transport to Bengaluru"],
                "transport": "Private vehicle + Flight/Train"
            },
            {
                "day": "7",
                "title": "Arrival in Bengaluru",
                "content": "Reach Bengaluru by morning/evening. Trip ends with beautiful memories, countless photos, and new friendships.",
                "meals": "Self-sponsored",
                "accommodation": "Home",
                "activities": ["Arrival home", "Trip completion"],
                "transport": "Airport/Station pickup"
            }
        ],
        
        # What's Included
        "inclusions": [
            "Transportation from Delhi/Chandigarh to Himachal and back",
            "Accommodation for 6 nights (hostels, homestays, camping)",
            "Daily breakfast and dinner as per itinerary",
            "Professional trek guide and support staff",
            "All necessary trekking permits and fees",
            "Camping equipment for Kheerganga night",
            "First aid kit and emergency support",
            "Group photos and trip documentation"
        ],
        
        # What's Not Included
        "exclusions": [
            "Transportation to/from Delhi or Chandigarh",
            "Lunch meals (except where mentioned)",
            "Personal trekking gear and equipment",
            "Tips for guides and support staff",
            "Personal expenses and shopping",
            "Travel insurance",
            "Any activities not mentioned in itinerary",
            "Emergency evacuation costs"
        ],
        
        # Equipment List
        "equipmentList": [
            "Government ID card (mandatory)",
            "Warm clothes (thermals, fleece, jacket)",
            "Trekking shoes + comfortable slippers",
            "Muffler, gloves, cap, woolen socks",
            "Raincoat or poncho",
            "Daypack (20-30L) + main backpack (50-60L)",
            "Torch or headlamp with extra batteries",
            "Sunscreen, lip balm, moisturizer",
            "Water bottles (2L + 1 thermos)",
            "Energy snacks (dry fruits, protein bars, ORS)",
            "Toiletries and personal hygiene kit",
            "Personal medicines and first aid items"
        ],
        
        # Safety Guidelines
        "safetyMeasures": [
            "Experienced trek leaders and local guides",
            "Regular health and altitude checks",
            "Emergency evacuation procedures in place",
            "Weather monitoring and itinerary flexibility",
            "Group safety protocols and communication",
            "First aid trained staff and medical kit",
            "Emergency contact with base camp",
            "Proper acclimatization schedule"
        ],
        
        # Important Instructions
        "importantInstructions": [
            "Itinerary subject to change as per weather conditions or organizer's discretion",
            "No littering – carry back your trash",
            "Stay with the group; avoid wandering off alone",
            "Strictly no alcohol/drugs during trek",
            "Advance payment is non-refundable",
            "Mobile network may be unavailable in remote areas – inform family in advance",
            "Meals: only 2 meals/day included as per itinerary; additional snacks/lunches are self-sponsored",
            "Respect nature, local culture, and fellow travelers – the mountains reward humility"
        ],
        
        # Metadata
        "createdAt": datetime.now(),
        "updatedAt": datetime.now(),
        "status": "active",
        "featured": True,
        "seasonality": "March to June, September to November",
        "bestTime": "April-May, October-November",
        "groupSize": {"min": 8, "max": 25},
        "ageLimit": {"min": 16, "max": 55}
    }
    
    return trip_data

def add_trip_to_firestore(db, trip_data):
    """Add the trip to Firestore with validation"""
    try:
        # Add to trips collection
        doc_ref = db.collection('trips').document()
        trip_data['id'] = doc_ref.id
        doc_ref.set(trip_data)
        
        print(f"✅ Trip added successfully with ID: {doc_ref.id}")
        print(f"📍 Trip Name: {trip_data['name']}")
        print(f"🏷️ Slug: {trip_data['slug']}")
        print(f"💰 Price: ₹{trip_data['price']:,}")
        print(f"📅 Next Departure: {trip_data['nextDeparture']}")
        
        return doc_ref.id
        
    except Exception as e:
        print(f"❌ Error adding trip to Firestore: {str(e)}")
        return None

def verify_trip_creation(db, trip_id):
    """Verify that the trip was created successfully"""
    try:
        doc_ref = db.collection('trips').document(trip_id)
        doc = doc_ref.get()
        
        if doc.exists:
            trip_data = doc.to_dict()
            print(f"\n✅ Trip verification successful!")
            print(f"📊 Verification Details:")
            print(f"   - Trip Name: {trip_data.get('name')}")
            print(f"   - Duration: {trip_data.get('duration')}")
            print(f"   - Itinerary Days: {len(trip_data.get('itinerary', []))}")
            print(f"   - Highlights: {len(trip_data.get('highlights', []))}")
            print(f"   - Batch Dates: {len(trip_data.get('batchDates', []))}")
            print(f"   - Status: {trip_data.get('status')}")
            return True
        else:
            print(f"❌ Trip verification failed - document not found")
            return False
            
    except Exception as e:
        print(f"❌ Error during verification: {str(e)}")
        return False

def main():
    """Main execution function"""
    print("🏔️ Adding 7-Day Himachal Adventure to Firestore...")
    print("=" * 50)
    
    # Initialize Firebase
    db = initialize_firebase()
    
    # Create trip data
    print("📝 Creating trip data structure...")
    trip_data = create_himachal_7day_trip()
    
    # Add to Firestore
    print("🔄 Adding trip to Firestore...")
    trip_id = add_trip_to_firestore(db, trip_data)
    
    if trip_id:
        # Verify creation
        print("🔍 Verifying trip creation...")
        if verify_trip_creation(db, trip_id):
            print(f"\n🎉 SUCCESS! 7-Day Himachal Adventure trip has been added to Firestore!")
            print(f"\n📋 Quick Access Info:")
            print(f"   - Trip ID: {trip_id}")
            print(f"   - Slug: {trip_data['slug']}")
            print(f"   - URL: /land/{trip_data['slug']}")
            print(f"\n💡 Next Steps:")
            print(f"   1. Visit the admin dashboard to manage this trip")
            print(f"   2. Add actual trip images to replace placeholder URLs")
            print(f"   3. Test the booking flow")
            print(f"   4. Update batch dates as needed")
        else:
            print(f"\n⚠️ Trip added but verification failed. Please check manually.")
    else:
        print(f"\n❌ Failed to add trip. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()