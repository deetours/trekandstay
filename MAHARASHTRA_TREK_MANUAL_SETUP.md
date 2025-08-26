# 🏔️ Manual Firebase Setup Guide for Adventure Maharashtra 5 Days Trek

## 🎯 Trip Overview
**Adventure Maharashtra 5 Days Trek** - A comprehensive multi-fort adventure in the Sahyadris featuring Jivdhan, Bhairavgad, and Ratangad forts with rappelling activities.

## 📋 Manual Firebase Console Setup

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `trekandstay-fade6`
3. Navigate to **Firestore Database**

### Step 2: Add Document to 'trips' Collection
1. Click on **trips** collection
2. Click **Add document**
3. Set **Document ID**: `adventure-maharashtra-5days-trek`

### Step 3: Add Trip Data Fields

Copy and paste these fields exactly as shown:

#### Basic Information
```
name: "🏞️ Adventure Maharashtra 5 Days Trek"
slug: "adventure-maharashtra-5days-trek"
location: "Maharashtra (Sahyadris)"
duration: "5D / 4N"
price: 9500
bookingAdvance: 2000
difficulty: "Moderate to Difficult"
category: "adventure"
spotsAvailable: 25
nextDeparture: "2024-09-18"
safetyRecord: "Excellent"
contactNumber: "9902937730"
active: true
```

#### Batch Dates (Array)
```
batchDates: [
  "📅 September 18th – 22nd, 2024",
  "📅 September 25th – 29th, 2024"
]
```

#### Highlights (Array)
```
highlights: [
  "Jivdhan Fort Trek - Historical Sahyadri Fort with steep climbs",
  "Reverse Waterfall at Naneghat - Nature's wonder with upward flow",
  "Bhairavgad Fort Trek - Thrilling vertical rock patches and ridges", 
  "Ratangad Fort Trek - Views of Kalsubai Peak (highest in Maharashtra)",
  "Sandan Valley - Maharashtra's Grand Canyon with rappelling",
  "Professional Trek Leadership & Safety Equipment",
  "Multi-fort Adventure Circuit Experience"
]
```

#### Equipment List (Array)
```
equipment: [
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
]
```

#### Inclusions (Array)
```
includes: [
  "Accommodation: Tent stay / dormitory / shared room",
  "Transportation: Train / tempo traveller / mini bus / bus (as per group size)",
  "Food: 3 breakfasts + 3 dinners (Veg)",
  "Trek entry fees & guide charges",
  "Experienced trek leaders & basic first-aid support"
]
```

#### Exclusions (Array)
```
excludes: [
  "GST & Travel Insurance",
  "All lunches (self-sponsored)",
  "Medical expenses beyond first aid",
  "Off-road vehicle charges (if applicable)",
  "Anything not mentioned in inclusions"
]
```

#### Tags (Array)
```
tags: [
  "adventure",
  "forts", 
  "maharashtra",
  "sahyadris",
  "multi-day",
  "rappelling",
  "difficult-trek",
  "monsoon",
  "historical",
  "trekking"
]
```

#### Images (Array)
```
images: [
  "https://images.pexels.com/photos/29613184/pexels-photo-29613184.jpeg",
  "https://images.pexels.com/photos/27743006/pexels-photo-27743006.jpeg",
  "https://images.pexels.com/photos/213872/pexels-photo-213872.jpeg",
  "https://images.pexels.com/photos/33041/antelope-canyon-lower-canyon-arizona.jpg"
]
```

#### Detailed Itinerary (Array of Objects)
```
itinerary: [
  "Day 1 (18th/25th Sept): Evening 4:00 PM departure from Bengaluru. Overnight journey to Pune/Satara by train/tempo traveller. Bonding & ice-breaking sessions.",
  "Day 2 (19th/26th Sept): Early arrival in Pune/Satara. Road transfer (~4h) to trek base. Jivdhan Fort Trek (8km, 4+4, Moderate difficulty). Visit Reverse Waterfall near Naneghat. Tent/dorm stay.",
  "Day 3 (20th/27th Sept): Bhairavgad Fort Trek (12km, 6+6, Difficult). Thrilling vertical rock patches and exposed ridges with safety precautions. Expert trek leaders guidance.",
  "Day 4 (21st/28th Sept): Ratangad Fort Trek (12km, 6+6, Moderate). Views of Kalsubai Peak and Bhandardara region. Explore Nedhe, caves and scenic landscapes. Sandan Valley exploration with rappelling and boulder hopping. Evening departure from Nasik.",
  "Day 5 (22nd/29th Sept): Morning arrival in Bengaluru with unforgettable memories of Maharashtra's adventurous trails."
]
```

#### Description
```
description: "This trip blends thrilling treks, breathtaking landscapes, and raw adventure in the heart of the Sahyadris. Perfect for those seeking an adrenaline rush and nature's magic."
```

#### Timestamps
```
createdAt: [Use Firebase timestamp - current time]
updatedAt: [Use Firebase timestamp - current time]
```

### Step 4: Save Document
Click **Save** to create the document.

## 🎉 Verification

After adding the document, your Adventure Maharashtra 5 Days Trek will appear:

✅ **On your website:**
- Destinations page
- Featured Adventures section
- Search results for "Maharashtra", "fort", "adventure"

✅ **For booking:**
- Available for customer bookings
- Contact: 9902937730
- Price: ₹9,500 per person
- Advance: ₹2,000 (non-refundable)

✅ **In admin dashboard:**
- Trip management section
- Booking management
- Lead tracking

## 📞 Contact Information
**Phone**: 9902937730
**Batch 1**: September 18th – 22nd, 2024
**Batch 2**: September 25th – 29th, 2024

---

**Note**: This manual process ensures your Adventure Maharashtra 5 Days Trek is properly added to Firestore with all required fields and formatting.