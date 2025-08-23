"""
Script to populate Firestore with Maharashtra 7 Days Trip FAQs
Run this script to automatically add all the FAQs to your Firestore collection
"""

import os
import sys
import django
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
django.setup()

from rag.firestore_service import firestore_knowledge_service

# Maharashtra 7 Days Trip FAQs
maharashtra_trip_faqs = [
    {
        'question': 'What are the trip dates for Explore Maharashtra 7 Days Trip?',
        'answer': 'The trip is scheduled from August 12th to August 19th, 2025.',
        'category': 'trip_details',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['dates', 'schedule', 'maharashtra', '7days']
    },
    {
        'question': 'Where does the Maharashtra journey start from?',
        'answer': 'The journey starts from Bengaluru on August 12th evening at 6:00 PM.',
        'category': 'trip_details',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['start_point', 'bengaluru', 'departure']
    },
    {
        'question': 'What is the mode of travel from Bengaluru for Maharashtra trip?',
        'answer': 'Travel will be by AC Sleeper Bus or Tempo Traveller, depending on group size and availability.',
        'category': 'transport',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['transport', 'bus', 'tempo_traveller']
    },
    {
        'question': 'What is the cost of Maharashtra 7 Days Trip?',
        'answer': 'The total cost is ₹15,000/- per head.',
        'category': 'pricing',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['cost', 'price', '15000', 'per_head']
    },
    {
        'question': 'How much advance is required for booking Maharashtra trip?',
        'answer': 'An advance of ₹2,000/- per head is required for booking. This advance is non-refundable.',
        'category': 'booking',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['advance', 'booking', '2000', 'non_refundable']
    },
    {
        'question': 'What is included in the Maharashtra trip cost?',
        'answer': '✅ AC travel from Bengaluru and back\n✅ Accommodation on sharing basis (Hotels/Homestays)\n✅ Breakfast, Lunch, and Dinner (Veg/Non-veg)\n✅ Entry fees to waterfalls, forts, and temples (where applicable)\n✅ Guide charges\n✅ Trek leader and first-aid assistance',
        'category': 'inclusions',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['inclusions', 'meals', 'accommodation', 'guide']
    },
    {
        'question': 'What is NOT included in the Maharashtra trip cost?',
        'answer': '❌ Personal expenses (snacks, bottled water, etc.)\n❌ Any costs for self-sponsored activities (e.g., Rajmachi Fort Jeep Ride)\n❌ Medical expenses\n❌ Anything not mentioned in the inclusions list',
        'category': 'exclusions',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['exclusions', 'personal_expenses', 'medical']
    },
    {
        'question': 'How many people will be in the Maharashtra trip group?',
        'answer': 'The group size will be 12–20 participants, ensuring a good travel experience.',
        'category': 'group_details',
        'priority': 2,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['group_size', '12_20', 'participants']
    },
    {
        'question': 'What is the accommodation type for Maharashtra trip?',
        'answer': 'Comfortable hotel or homestay stays on a twin/triple sharing basis.',
        'category': 'accommodation',
        'priority': 2,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['accommodation', 'hotel', 'homestay', 'sharing']
    },
    {
        'question': 'What treks are included in Maharashtra trip and what is their difficulty level?',
        'answer': 'Day 2: Savlya Ghat & Kumbhe Waterfall – Easy (2+2 km)\nDay 3: Devkund, Nanemachi, Satsada, Shevate Waterfalls – Easy to Moderate (6+6 km)\nDay 5: Kalu Waterfall & Adra Jungle Trek – Easy to Moderate (4+4 km)',
        'category': 'trekking',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['trekking', 'difficulty', 'waterfalls', 'easy_moderate']
    },
    {
        'question': 'Do I need prior trekking experience for Maharashtra trip?',
        'answer': 'No, the treks are beginner-friendly, but a basic fitness level is recommended.',
        'category': 'trekking',
        'priority': 2,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['beginner_friendly', 'fitness', 'experience']
    },
    {
        'question': 'What should I carry for Maharashtra trip?',
        'answer': '• Trekking shoes with good grip\n• Comfortable trekking clothes\n• Raincoat/Poncho (August is monsoon season)\n• Water bottle (1-2 liters)\n• Small backpack for treks\n• Personal medicines\n• Power bank, camera, and ID proof',
        'category': 'packing',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['packing', 'essentials', 'trekking_shoes', 'raincoat']
    },
    {
        'question': 'What is the weather like in August in Maharashtra?',
        'answer': 'Expect monsoon conditions – pleasant temperatures (18–25°C), frequent rain, lush greenery, and misty views.',
        'category': 'weather',
        'priority': 2,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['weather', 'monsoon', 'august', 'temperature', 'rain']
    },
    {
        'question': 'Will it be safe during the monsoon for Maharashtra trip?',
        'answer': 'Yes, our treks are planned with safety in mind, and local guides ensure safe routes. However, treks may be altered if weather conditions become unsafe.',
        'category': 'safety',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['safety', 'monsoon', 'guides', 'weather_conditions']
    },
    {
        'question': 'Can I join Maharashtra trip from Pune or Nasik directly?',
        'answer': 'Yes, you can join from Pune on Day 2 morning or Nasik on Day 7 for return.',
        'category': 'joining_points',
        'priority': 2,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['pune', 'nasik', 'joining_points', 'alternate_pickup']
    },
    {
        'question': 'What is the cancellation policy for Maharashtra trip?',
        'answer': 'Advance amount (₹2,000/-) is non-refundable. Cancellation 15+ days before trip: 50% refund of remaining amount. Cancellation within 15 days: No refund.',
        'category': 'cancellation',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['cancellation', 'refund', 'policy', '15_days']
    },
    {
        'question': 'What are the main highlights of Maharashtra 7 Days Trip?',
        'answer': '• 10+ breathtaking waterfalls including Devkund, Kalu, Nanemachi, Bhandardara Reverse Waterfall\n• Historical forts like Rajmachi Fort\n• Temples like Bhimashankar, Trimbakeshwar\n• Scenic treks and jungle trails\n• Monsoon special misty mountains & lush greenery',
        'category': 'highlights',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['highlights', 'waterfalls', 'forts', 'temples', 'monsoon']
    },
    {
        'question': 'Will there be photography support during Maharashtra trip?',
        'answer': 'Yes, our trip leaders and guides help capture moments, and we also have dedicated photography stops.',
        'category': 'services',
        'priority': 3,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['photography', 'guides', 'photo_stops']
    },
    {
        'question': 'Is alcohol allowed on the Maharashtra trip?',
        'answer': 'No, alcohol is strictly not allowed during treks and group activities for safety reasons.',
        'category': 'rules',
        'priority': 2,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['alcohol', 'rules', 'safety', 'not_allowed']
    },
    {
        'question': 'How do I book my seat for Maharashtra 7 Days Trip?',
        'answer': '1. Pay the ₹2,000/- booking advance via UPI/Bank Transfer.\n2. Share payment proof and your ID details.\n3. Receive confirmation & trip checklist.',
        'category': 'booking',
        'priority': 1,
        'trip_name': 'Explore Maharashtra 7 Days Trip',
        'active': True,
        'tags': ['booking_process', 'upi', 'bank_transfer', 'confirmation']
    }
]

def add_faqs_to_firestore():
    """Add Maharashtra trip FAQs to Firestore"""
    
    if not firestore_knowledge_service.is_connected():
        print("❌ Firestore not connected. Please check your Firebase credentials.")
        print("See FIREBASE_SETUP.md for setup instructions.")
        return False
    
    print("🔥 Adding Maharashtra 7 Days Trip FAQs to Firestore...")
    
    try:
        added_count = 0
        for faq_data in maharashtra_trip_faqs:
            # Add timestamp
            faq_data['updated_at'] = datetime.now()
            faq_data['created_at'] = datetime.now()
            
            # Add to Firestore
            doc_ref = firestore_knowledge_service.db.collection('faqs').add(faq_data)
            added_count += 1
            
            print(f"✅ Added FAQ: {faq_data['question'][:50]}...")
        
        print(f"\n🎉 Successfully added {added_count} FAQs to Firestore!")
        print("The RAG chatbot will automatically sync these FAQs within an hour.")
        print("Or you can force sync via the admin interface.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding FAQs: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Maharashtra 7 Days Trip FAQ Populator")
    print("=" * 60)
    
    success = add_faqs_to_firestore()
    
    if success:
        print("\n✨ FAQs are now available in your knowledge base!")
        print("Test your chatbot by asking questions like:")
        print("- 'What is the cost of Maharashtra trip?'")
        print("- 'What should I pack for the trip?'")
        print("- 'What are the trek difficulty levels?'")
    else:
        print("\n💡 To enable Firestore integration:")
        print("1. Set up Firebase project")
        print("2. Add FIREBASE_SERVICE_ACCOUNT_PATH to environment")
        print("3. Run this script again")
