#!/usr/bin/env python
"""
Script to add detailed itinerary to Maharashtra Waterfall Edition 5 Days Trip in Firestore
This will update the document in the 'trips' collection with comprehensive itinerary data
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
except ImportError:
    print("⚠️  Django not available, using direct Firebase setup")
    import firebase_admin
    from firebase_admin import credentials, firestore
    
    # Initialize Firebase if not already done
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app()
    
    db = firestore.client()

def add_maharashtra_5d_itinerary():
    """Add detailed itinerary to Maharashtra 5 Days Waterfall Edition trip"""
    
    # Detailed itinerary structure for Firestore
    itinerary_data = {
        "title": "Maharashtra Waterfall Edition – 5 Days Trip",
        "trip_code": "maharashtra-waterfall-edition-5d",
        "dates": "August 13-17, 2025",
        "cost": "₹9,000/- per head",
        "advance": "₹2,000/- per head (Non-refundable)",
        "contact": "9902937730",
        "status": "active",
        "type": "waterfall_trek",
        "difficulty": "easy_to_moderate",
        "duration": 5,
        "location": "Maharashtra",
        
        # Detailed day-by-day itinerary
        "itinerary": {
            "day_1": {
                "date": "August 13, 2025 (Wednesday)",
                "title": "Bengaluru → Pune/Satara",
                "highlights": [
                    "Evening departure from Bengaluru at 6:00 PM",
                    "Comfortable Tempo Traveller / Mini Bus travel",
                    "Overnight journey through scenic highways"
                ],
                "activities": [
                    {
                        "time": "6:00 PM",
                        "activity": "Departure from Bengaluru",
                        "details": "Board comfortable Tempo Traveller/Mini Bus for overnight journey"
                    }
                ],
                "meals": [],
                "accommodation": "Travel (Overnight in vehicle)",
                "trek_distance": "0 km",
                "difficulty": "none"
            },
            
            "day_2": {
                "date": "August 14, 2025 (Thursday)",
                "title": "Nanemachi, Satsada & Shevate Waterfalls",
                "highlights": [
                    "🌊 Nanemachi Waterfall – Crystal-clear pool hidden in the forest",
                    "🌊 Satsada Waterfall – Seven-tier beauty in the Western Ghats",
                    "🌊 Shevate Waterfall – Lesser-known gem, perfect for photography"
                ],
                "activities": [
                    {
                        "time": "Early Morning",
                        "activity": "Arrival at Pune/Satara",
                        "details": "Fresh up and breakfast"
                    },
                    {
                        "time": "Morning",
                        "activity": "Journey to waterfall base",
                        "details": "4-hour scenic drive to first waterfall location"
                    },
                    {
                        "time": "Afternoon",
                        "activity": "Waterfall exploration",
                        "details": "Trek to Nanemachi, Satsada, and Shevate waterfalls"
                    },
                    {
                        "time": "Evening",
                        "activity": "Return to stay location",
                        "details": "Check-in and rest"
                    }
                ],
                "waterfalls": [
                    {
                        "name": "Nanemachi Waterfall",
                        "description": "Crystal-clear pool hidden in the forest",
                        "difficulty": "Easy"
                    },
                    {
                        "name": "Satsada Waterfall",
                        "description": "Seven-tier beauty in the Western Ghats",
                        "difficulty": "Easy"
                    },
                    {
                        "name": "Shevate Waterfall",
                        "description": "Lesser-known gem, perfect for photography",
                        "difficulty": "Easy"
                    }
                ],
                "trek_distance": "2+2 km (4 km total)",
                "difficulty": "Easy",
                "meals": ["Breakfast", "Lunch", "Dinner"],
                "accommodation": "Tent Stay / Dormitory / Shared Room"
            },
            
            "day_3": {
                "date": "August 15, 2025 (Friday)",
                "title": "Devkund, Kumbhe & Secret Waterfall",
                "highlights": [
                    "🌊 Devkund Waterfall – Famous plunge waterfall with emerald pool",
                    "🌊 Kumbhe Waterfall – Lush surroundings and refreshing mist",
                    "🌊 Secret Waterfall – Offbeat spot (entry fee self-sponsored)"
                ],
                "activities": [
                    {
                        "time": "Early Morning",
                        "activity": "Start trek to waterfalls",
                        "details": "Begin longest trek day with multiple waterfall visits"
                    },
                    {
                        "time": "Morning to Afternoon",
                        "activity": "Waterfall hopping",
                        "details": "Visit Devkund, Kumbhe, and Secret waterfalls"
                    },
                    {
                        "time": "Evening",
                        "activity": "Journey to next destination",
                        "details": "6-hour journey to next location"
                    }
                ],
                "waterfalls": [
                    {
                        "name": "Devkund Waterfall",
                        "description": "Famous plunge waterfall with emerald pool",
                        "difficulty": "Easy to Moderate",
                        "special_note": "Most famous waterfall of the trip"
                    },
                    {
                        "name": "Kumbhe Waterfall",
                        "description": "Lush surroundings and refreshing mist",
                        "difficulty": "Easy to Moderate"
                    },
                    {
                        "name": "Secret Waterfall",
                        "description": "Offbeat spot with entry fee self-sponsored",
                        "difficulty": "Easy to Moderate",
                        "special_note": "Entry fee not included in package"
                    }
                ],
                "trek_distance": "6+6 km (12 km total)",
                "difficulty": "Easy to Moderate",
                "meals": ["Breakfast", "Lunch", "Dinner"],
                "accommodation": "Tent Stay / Dormitory / Shared Room"
            },
            
            "day_4": {
                "date": "August 16, 2025 (Saturday)",
                "title": "Kalu Waterfall → Pune → Bengaluru",
                "highlights": [
                    "🌊 Kalu Waterfall – One of Maharashtra's tallest and most dramatic monsoon waterfalls",
                    "Journey back to Pune",
                    "Night departure for Bengaluru"
                ],
                "activities": [
                    {
                        "time": "Morning",
                        "activity": "Trek to Kalu Waterfall",
                        "details": "Visit Maharashtra's tallest monsoon waterfall"
                    },
                    {
                        "time": "Afternoon",
                        "activity": "Return journey to Pune",
                        "details": "Pack up and head back to Pune"
                    },
                    {
                        "time": "Night",
                        "activity": "Departure for Bengaluru",
                        "details": "Board vehicle for overnight return journey"
                    }
                ],
                "waterfalls": [
                    {
                        "name": "Kalu Waterfall",
                        "description": "One of Maharashtra's tallest and most dramatic monsoon waterfalls",
                        "difficulty": "Easy to Moderate",
                        "special_note": "Grand finale waterfall of the trip"
                    }
                ],
                "trek_distance": "4+4 km (8 km total)",
                "difficulty": "Easy to Moderate",
                "meals": ["Breakfast", "Lunch"],
                "accommodation": "Travel (Overnight in vehicle)"
            },
            
            "day_5": {
                "date": "August 17, 2025 (Sunday)",
                "title": "Arrival at Bengaluru",
                "highlights": [
                    "Evening arrival back in Bengaluru",
                    "End of refreshing monsoon adventure"
                ],
                "activities": [
                    {
                        "time": "Evening",
                        "activity": "Arrival in Bengaluru",
                        "details": "Trip concludes with memories of 7 beautiful waterfalls"
                    }
                ],
                "waterfalls": [],
                "trek_distance": "0 km",
                "difficulty": "none",
                "meals": [],
                "accommodation": "Trip ends"
            }
        },
        
        # Summary data for easy querying
        "total_waterfalls": 7,
        "waterfall_list": [
            "Nanemachi Waterfall",
            "Satsada Waterfall", 
            "Shevate Waterfall",
            "Devkund Waterfall",
            "Kumbhe Waterfall",
            "Secret Waterfall",
            "Kalu Waterfall"
        ],
        
        "total_trek_distance": "24 km",
        "daily_trek_distances": {
            "day_2": "4 km",
            "day_3": "12 km", 
            "day_4": "8 km"
        },
        
        # Inclusions and exclusions
        "inclusions": [
            "Accommodation: Tent Stay / Dormitory Stay / Shared Room",
            "Transportation: Tempo Traveller / Mini Bus", 
            "Meals: Breakfast, Lunch, Dinner (as per itinerary)",
            "Trek leader & guide charges",
            "Entry fees (except Secret Waterfall)"
        ],
        
        "exclusions": [
            "Personal expenses (snacks, bottled water, etc.)",
            "Self-sponsored activities and entry fees (e.g., Secret Waterfall)",
            "Medical expenses",
            "Anything not mentioned in inclusions"
        ],
        
        # Meta information
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "created_by": "system",
        "tags": ["waterfall", "monsoon", "maharashtra", "5-days", "beginner-friendly", "august-2025"]
    }
    
    try:
        # Try to use the Django firestore service first
        if 'firestore_knowledge_service' in globals():
            if firestore_knowledge_service.is_connected():
                db = firestore_knowledge_service.db
                print("✅ Using Django Firestore service")
            else:
                print("❌ Firestore service not connected")
                return False
        else:
            # Use direct Firebase connection
            print("✅ Using direct Firebase connection")
        
        # Add/Update document in trips collection
        doc_ref = db.collection('trips').document('maharashtra-waterfall-edition-5d')
        doc_ref.set(itinerary_data, merge=True)  # merge=True to update existing document
        
        print("🎉 Successfully added detailed itinerary to Firestore!")
        print(f"📄 Document ID: maharashtra-waterfall-edition-5d")
        print(f"🗓️  Trip dates: {itinerary_data['dates']}")
        print(f"🌊 Total waterfalls: {itinerary_data['total_waterfalls']}")
        print(f"🥾 Total trek distance: {itinerary_data['total_trek_distance']}")
        
        # Verify the document was created
        doc = doc_ref.get()
        if doc.exists:
            print("✅ Document verified in Firestore")
            return True
        else:
            print("❌ Document verification failed")
            return False
            
    except Exception as e:
        print(f"❌ Error adding itinerary to Firestore: {str(e)}")
        return False

def main():
    print("🔄 Adding Maharashtra 5 Days Waterfall Edition itinerary to Firestore...")
    print("=" * 60)
    
    success = add_maharashtra_5d_itinerary()
    
    if success:
        print("\n✅ Itinerary successfully added to Firestore!")
        print("\nNow your chatbot can answer questions like:")
        print("• 'What waterfalls are visited on Day 3?'")
        print("• 'How far is the Devkund trek?'")
        print("• 'What time does the trip start on Day 1?'")
        print("• 'Which is the longest trek day?'")
        print("• 'What's included in the 5-day trip cost?'")
    else:
        print("\n❌ Failed to add itinerary to Firestore")
        
    print("=" * 60)

if __name__ == "__main__":
    main()
