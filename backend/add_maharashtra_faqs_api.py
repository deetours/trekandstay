"""
Alternative method: Add Maharashtra FAQs via Django admin/API
This works even without direct Firestore access by using the test endpoint
"""

import requests
import json

# Your FAQs data formatted for the API
maharashtra_faqs_api_format = [
    {
        'question': 'What are the trip dates for Explore Maharashtra 7 Days Trip?',
        'answer': 'The trip is scheduled from August 12th to August 19th, 2025.',
        'category': 'trip_details',
        'priority': 1,
        'active': True
    },
    {
        'question': 'Where does the Maharashtra journey start from?',
        'answer': 'The journey starts from Bengaluru on August 12th evening at 6:00 PM.',
        'category': 'trip_details',
        'priority': 1,
        'active': True
    },
    {
        'question': 'What is the mode of travel from Bengaluru for Maharashtra trip?',
        'answer': 'Travel will be by AC Sleeper Bus or Tempo Traveller, depending on group size and availability.',
        'category': 'transport',
        'priority': 1,
        'active': True
    },
    {
        'question': 'What is the cost of Maharashtra 7 Days Trip?',
        'answer': 'The total cost is ₹15,000/- per head.',
        'category': 'pricing',
        'priority': 1,
        'active': True
    },
    {
        'question': 'How much advance is required for booking Maharashtra trip?',
        'answer': 'An advance of ₹2,000/- per head is required for booking. This advance is non-refundable.',
        'category': 'booking',
        'priority': 1,
        'active': True
    },
    {
        'question': 'What is included in the Maharashtra trip cost?',
        'answer': '✅ AC travel from Bengaluru and back\n✅ Accommodation on sharing basis (Hotels/Homestays)\n✅ Breakfast, Lunch, and Dinner (Veg/Non-veg)\n✅ Entry fees to waterfalls, forts, and temples\n✅ Guide charges\n✅ Trek leader and first-aid assistance',
        'category': 'inclusions',
        'priority': 1,
        'active': True
    },
    {
        'question': 'What is NOT included in the Maharashtra trip cost?',
        'answer': '❌ Personal expenses (snacks, bottled water, etc.)\n❌ Self-sponsored activities (e.g., Rajmachi Fort Jeep Ride)\n❌ Medical expenses\n❌ Anything not mentioned in inclusions',
        'category': 'exclusions',
        'priority': 1,
        'active': True
    },
    {
        'question': 'How many people will be in the Maharashtra trip group?',
        'answer': 'The group size will be 12–20 participants, ensuring a good travel experience.',
        'category': 'group_details',
        'priority': 2,
        'active': True
    },
    {
        'question': 'What is the accommodation type for Maharashtra trip?',
        'answer': 'Comfortable hotel or homestay stays on a twin/triple sharing basis.',
        'category': 'accommodation',
        'priority': 2,
        'active': True
    },
    {
        'question': 'What treks are included in Maharashtra trip and difficulty levels?',
        'answer': 'Day 2: Savlya Ghat & Kumbhe Waterfall – Easy (2+2 km)\nDay 3: Devkund, Nanemachi, Satsada, Shevate Waterfalls – Easy to Moderate (6+6 km)\nDay 5: Kalu Waterfall & Adra Jungle Trek – Easy to Moderate (4+4 km)',
        'category': 'trekking',
        'priority': 1,
        'active': True
    },
    {
        'question': 'Do I need prior trekking experience for Maharashtra trip?',
        'answer': 'No, the treks are beginner-friendly, but a basic fitness level is recommended.',
        'category': 'trekking',
        'priority': 2,
        'active': True
    },
    {
        'question': 'What should I carry for Maharashtra trip?',
        'answer': '• Trekking shoes with good grip\n• Comfortable trekking clothes\n• Raincoat/Poncho (monsoon season)\n• Water bottle (1-2 liters)\n• Small backpack\n• Personal medicines\n• Power bank, camera, ID proof',
        'category': 'packing',
        'priority': 1,
        'active': True
    },
    {
        'question': 'What is the weather like in August in Maharashtra?',
        'answer': 'Expect monsoon conditions – pleasant temperatures (18–25°C), frequent rain, lush greenery, and misty views.',
        'category': 'weather',
        'priority': 2,
        'active': True
    },
    {
        'question': 'Will it be safe during the monsoon for Maharashtra trip?',
        'answer': 'Yes, our treks are planned with safety in mind, and local guides ensure safe routes. However, treks may be altered if weather conditions become unsafe.',
        'category': 'safety',
        'priority': 1,
        'active': True
    },
    {
        'question': 'Can I join Maharashtra trip from Pune or Nasik directly?',
        'answer': 'Yes, you can join from Pune on Day 2 morning or Nasik on Day 7 for return.',
        'category': 'joining_points',
        'priority': 2,
        'active': True
    },
    {
        'question': 'What is the cancellation policy for Maharashtra trip?',
        'answer': 'Advance amount (₹2,000/-) is non-refundable. Cancellation 15+ days before trip: 50% refund of remaining amount. Cancellation within 15 days: No refund.',
        'category': 'cancellation',
        'priority': 1,
        'active': True
    },
    {
        'question': 'What are the main highlights of Maharashtra 7 Days Trip?',
        'answer': '• 10+ breathtaking waterfalls including Devkund, Kalu, Nanemachi, Bhandardara Reverse Waterfall\n• Historical forts like Rajmachi Fort\n• Temples like Bhimashankar, Trimbakeshwar\n• Scenic treks and jungle trails\n• Monsoon special misty mountains & lush greenery',
        'category': 'highlights',
        'priority': 1,
        'active': True
    },
    {
        'question': 'Will there be photography support during Maharashtra trip?',
        'answer': 'Yes, our trip leaders and guides help capture moments, and we also have dedicated photography stops.',
        'category': 'services',
        'priority': 3,
        'active': True
    },
    {
        'question': 'Is alcohol allowed on the Maharashtra trip?',
        'answer': 'No, alcohol is strictly not allowed during treks and group activities for safety reasons.',
        'category': 'rules',
        'priority': 2,
        'active': True
    },
    {
        'question': 'How do I book my seat for Maharashtra 7 Days Trip?',
        'answer': '1. Pay the ₹2,000/- booking advance via UPI/Bank Transfer\n2. Share payment proof and your ID details\n3. Receive confirmation & trip checklist',
        'category': 'booking',
        'priority': 1,
        'active': True
    }
]

def add_faqs_via_api(base_url="http://127.0.0.1:8000", admin_token=None):
    """Add FAQs via API endpoint"""
    
    print("🚀 Adding Maharashtra FAQs via API...")
    
    if not admin_token:
        print("⚠️  Note: Using test endpoint (requires admin login)")
        print("Alternative: Use Django admin interface to add these FAQs")
    
    # Try the test endpoint
    try:
        response = requests.post(
            f"{base_url}/api/rag/test-faqs/",
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {admin_token}' if admin_token else ''
            },
            json={'custom_faqs': maharashtra_faqs_api_format}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: {result.get('message', 'FAQs added successfully!')}")
            return True
        else:
            print(f"❌ API Error: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Connection Error: {str(e)}")
        return False

def save_faqs_as_json():
    """Save FAQs as JSON for manual import"""
    with open('maharashtra_faqs.json', 'w', encoding='utf-8') as f:
        json.dump(maharashtra_faqs_api_format, f, indent=2, ensure_ascii=False)
    
    print("📄 FAQs saved as 'maharashtra_faqs.json'")
    print("You can manually import this JSON to Firestore console")

if __name__ == "__main__":
    print("=" * 60)
    print("🏔️  Maharashtra 7 Days Trip FAQ Loader")
    print("=" * 60)
    
    # Try API first
    success = add_faqs_via_api()
    
    if not success:
        print("\n📋 Alternative options:")
        print("1. Save as JSON for manual import")
        print("2. Use Django admin interface")
        print("3. Set up Firestore credentials and run populate_maharashtra_faqs.py")
        
        save_faqs_as_json()
        
        print("\n💡 Manual steps:")
        print("1. Go to Firebase Console → Firestore")
        print("2. Create 'faqs' collection") 
        print("3. Import the JSON data")
        print("4. Your chatbot will auto-sync within an hour!")

    print("\n🤖 Test your chatbot with these questions:")
    print("• 'What is the cost of Maharashtra trip?'")
    print("• 'What should I pack for the Maharashtra trip?'")
    print("• 'What are the trek difficulty levels?'")
    print("• 'How do I book the Maharashtra trip?'")
    print("• 'What is the cancellation policy?'")
