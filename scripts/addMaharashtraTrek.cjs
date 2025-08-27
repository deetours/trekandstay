// Firebase Admin SDK script to add Adventure Maharashtra 5 Days Trek
// Run with: node scripts/addMaharashtraTrek.cjs

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'trekandstay-fade6'
});

const db = admin.firestore();

// Adventure Maharashtra 5 Days Trek Data
const maharashtraTrekData = {
  name: "🏞️ Adventure Maharashtra 5 Days Trek",
  slug: "adventure-maharashtra-5days-trek",
  location: "Maharashtra (Sahyadris)",
  duration: "5D / 4N",
  spotsAvailable: 25,
  nextDeparture: "2024-09-18",
  safetyRecord: "Excellent",
  price: 9500,
  bookingAdvance: 2000,
  difficulty: "Moderate to Difficult",
  category: "adventure",
  highlights: [
    "Jivdhan Fort Trek - Historical Sahyadri Fort with steep climbs and panoramic views",
    "Reverse Waterfall at Naneghat - Nature's wonder where water flows upward",
    "Bhairavgad Fort Trek - Thrilling vertical rock patches and exposed ridges",
    "Ratangad Fort Trek - Views of Kalsubai Peak (highest in Maharashtra)",
    "Sandan Valley - Maharashtra's Grand Canyon with rappelling experience",
    "Professional Trek Leadership & Safety Equipment included",
    "Multi-fort Adventure Circuit in the heart of Sahyadris"
  ],
  itinerary: [
    "Day 1 (18th/25th Sept): Evening 4:00 PM departure from Bengaluru. Overnight journey to Pune/Satara by train/tempo traveller/mini bus. Bonding, ice-breaking sessions, and get ready for adventure-filled 5 days.",
    "Day 2 (19th/26th Sept): Early morning arrival in Pune/Satara. Road transfer (~4 hours) to trek base. Freshen up and breakfast. Jivdhan Fort Trek (8km, 4+4, Moderate difficulty). Post-lunch visit to Reverse Waterfall near Naneghat. Evening return to campsite for tent/dorm/shared room stay.",
    "Day 3 (20th/27th Sept): Wake up early, breakfast, and set off for the most thrilling trek. Bhairavgad Fort Trek (12km, 6+6, Difficult). Known for vertical rock patches, exposed ridges, and adrenaline-pumping climbs. Trek under guidance of experienced leaders with all safety precautions.",
    "Day 4 (21st/28th Sept): Morning breakfast followed by travel to trek base. Ratangad Fort Trek (12km, 6+6, Moderate). Beautiful trek offering views of Kalsubai Peak and Bhandardara region. Explore Nedhe (natural rock hole), bastions, caves, and scenic landscapes. Post Ratangad, descend into majestic Sandan Valley for rappelling, boulder hopping, and nature's raw beauty. Evening departure from Nasik.",
    "Day 5 (22nd/29th Sept): Morning arrival in Bengaluru with unforgettable memories of Maharashtra's adventurous trails."
  ],
  batchDates: [
    "📅 September 18th – 22nd, 2024",
    "📅 September 25th – 29th, 2024"
  ],
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
  ],
  essentials: [
    "Valid ID card (mandatory for all participants)",
    "Basic first aid kit and personal medicines",
    "Energy snacks: chocolates, glucose, dry fruits, ORS",
    "Cash (limited ATMs in remote areas)"
  ],
  safety: [
    "Experienced trek leaders with safety certification",
    "Basic first-aid support and emergency response protocols",
    "All safety precautions for vertical rock climbing sections",
    "Weather monitoring and route assessment",
    "Emergency evacuation plans for remote areas",
    "Professional grade safety equipment for rappelling"
  ],
  guide: {
    name: "Expert Sahyadri Trek Team",
    experience: "Specialized in Maharashtra fort treks and adventure activities with 5+ years experience",
    bio: "Professional team with extensive experience in Sahyadri mountain range, fort trekking, and adventure sports including rappelling and rock climbing. Certified in wilderness first aid and emergency response."
  },
  reviews: [],
  images: [
    "https://images.pexels.com/photos/29613184/pexels-photo-29613184.jpeg",
    "https://images.pexels.com/photos/27743006/pexels-photo-27743006.jpeg",
    "https://images.pexels.com/photos/213872/pexels-photo-213872.jpeg",
    "https://images.pexels.com/photos/33041/antelope-canyon-lower-canyon-arizona.jpg"
  ],
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
    "trekking",
    "camping",
    "rock-climbing"
  ],
  includes: [
    "Accommodation: Tent stay / dormitory / shared room",
    "Transportation: Train / tempo traveller / mini bus / bus (as per group size)",
    "Food: 3 breakfasts + 3 dinners (Vegetarian meals)",
    "Trek entry fees & guide charges",
    "Experienced trek leaders & basic first-aid support",
    "Safety equipment for rappelling activities"
  ],
  excludes: [
    "GST & Travel Insurance",
    "All lunches (self-sponsored)",
    "Medical expenses beyond first aid",
    "Off-road vehicle charges (if applicable)",
    "Personal expenses and shopping",
    "Anything not mentioned in inclusions"
  ],
  contactNumber: "9902937730",
  active: true,
  status: "active",
  description: "This trip blends thrilling treks, breathtaking landscapes, and raw adventure in the heart of the Sahyadris. Perfect for those seeking an adrenaline rush and nature's magic. Experience the historical significance of Maharashtra's forts while enjoying modern adventure activities.",
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

async function addMaharashtraTrek() {
  try {
    console.log('🏔️ Adding Adventure Maharashtra 5 Days Trek to Firestore...');
    console.log('=' * 60);
    
    // Reference to the document
    const docRef = db.collection('trips').doc(maharashtraTrekData.slug);
    
    // Check if document already exists
    const existingDoc = await docRef.get();
    if (existingDoc.exists) {
      console.log('⚠️  Document already exists. Updating with new data...');
    } else {
      console.log('📄 Creating new document...');
    }
    
    // Set the document (merge: true will update existing or create new)
    await docRef.set(maharashtraTrekData, { merge: true });
    
    console.log('🎉 SUCCESS! Adventure Maharashtra 5 Days Trek added to Firestore!');
    console.log('');
    
    // Verify the document was created/updated
    const verifyDoc = await docRef.get();
    if (verifyDoc.exists) {
      const data = verifyDoc.data();
      console.log('✅ Document verified in Firestore:');
      console.log(`   📄 ID: ${verifyDoc.id}`);
      console.log(`   🏔️  Name: ${data.name}`);
      console.log(`   📍 Location: ${data.location}`);
      console.log(`   💰 Price: ₹${data.price} (Advance: ₹${data.bookingAdvance})`);
      console.log(`   📅 Duration: ${data.duration}`);
      console.log(`   👥 Spots Available: ${data.spotsAvailable}`);
      console.log(`   🏷️  Difficulty: ${data.difficulty}`);
      console.log(`   📞 Contact: ${data.contactNumber}`);
      console.log(`   🏷️  Category: ${data.category}`);
      console.log(`   🏷️  Tags: ${data.tags.join(', ')}`);
      
      console.log('');
      console.log('📅 Batch Dates:');
      data.batchDates.forEach(date => {
        console.log(`   ${date}`);
      });
      
      console.log('');
      console.log('✨ Key Highlights:');
      data.highlights.slice(0, 3).forEach((highlight, index) => {
        console.log(`   ${index + 1}. ${highlight}`);
      });
      if (data.highlights.length > 3) {
        console.log(`   ... and ${data.highlights.length - 3} more highlights`);
      }
      
      console.log('');
      console.log('🌐 Your trip is now available on:');
      console.log('   • Destinations page (/destinations)');
      console.log('   • Featured Adventures section');
      console.log('   • Trip details page (/trip/adventure-maharashtra-5days-trek)');
      console.log('   • Admin dashboard for management');
      console.log('   • Available for customer bookings');
      console.log('   • Lead capture popup recommendations');
      
      return true;
    } else {
      console.log('❌ Document verification failed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error adding trip to Firestore:', error);
    
    if (error.code === 'permission-denied') {
      console.log('');
      console.log('🔑 Permission Error Solutions:');
      console.log('   1. Check Firebase security rules for "trips" collection');
      console.log('   2. Ensure service account has Firestore write permissions');
      console.log('   3. Verify project ID matches your Firebase project');
    }
    
    return false;
  }
}

async function listAllTrips() {
  try {
    console.log('');
    console.log('📋 Current trips in Firestore:');
    console.log('-'.repeat(60));
    
    const snapshot = await db.collection('trips').get();
    
    if (snapshot.empty) {
      console.log('   No trips found in database');
      return;
    }
    
    let count = 0;
    snapshot.forEach(doc => {
      count++;
      const data = doc.data();
      console.log(`${count}. ${doc.id}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   Price: ₹${data.price || 'N/A'}`);
      console.log(`   Location: ${data.location || 'N/A'}`);
      console.log('');
    });
    
    console.log(`📊 Total trips: ${count}`);
    
  } catch (error) {
    console.error('❌ Error listing trips:', error);
  }
}

// Main execution
async function main() {
  try {
    const success = await addMaharashtraTrek();
    
    if (success) {
      await listAllTrips();
    }
    
    console.log('');
    console.log('=' * 60);
    console.log('🎯 Next Steps:');
    console.log('   1. Check your website to see the new trip');
    console.log('   2. Test the booking flow');
    console.log('   3. Update any promotional materials');
    console.log('   4. Share with your team for review');
    console.log('=' * 60);
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
  } finally {
    // Clean up Firebase connection
    process.exit(0);
  }
}

main();