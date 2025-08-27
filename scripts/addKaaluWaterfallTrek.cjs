const admin = require('firebase-admin');
const serviceAccount = require('../scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Create reference to the trips collection
const tripsRef = db.collection('trips');

// Define the new trek data
const kaaluTrekData = {
  name: "🌄 Kaalu Waterfall - Harishchandragad - Sandhan Valley 5D/4N",
  slug: "kaalu-waterfall-harishchandragad-sandhan-valley-5d",
  location: "Maharashtra (Sahyadris)",
  price: 8999,
  bookingAdvance: 2000,
  contactNumber: "9902937730",
  duration: "5D / 4N",
  spotsAvailable: 25,
  difficulty: "Moderate to Difficult",
  category: "adventure",
  tags: ["adventure", "forts", "maharashtra", "sahyadris", "multi-day", "camping", "monsoon", "historical", "trekking", "waterfall"],
  highlights: [
    "Kaalu Waterfall Trek through dense Sahyadri forests",
    "Harishchandragad Fort with iconic Konkan Kada cliff view",
    "Sandhan Valley exploration through deep gorge",
    "Camping under stars at Harishchandragad",
    "Pune to Nasik valley exploration"
  ],
  itinerary: [
    {
      day: 0,
      title: "Departure from Bangalore",
      content: [
        "04:00 AM - Assemble at Bengaluru railway station for departure by train",
        "Overnight journey towards Pune",
        "02:00 AM (Friday) - Pickup from Pune Railway Station by vehicle and transfer towards trek base"
      ],
      meals: "None (self-sponsored during train journey)"
    },
    {
      day: 1,
      title: "Kaalu Waterfall Trek",
      content: [
        "Arrival at Kheereshwar base village",
        "Fresh-up followed by breakfast",
        "Begin trek to Kaalu Waterfall - a majestic seasonal cascade amidst dense Sahyadri forests",
        "Trek Distance: ~6 km (easy-moderate trail)",
        "Enjoy lush greenery and misty surroundings of monsoon treks",
        "Packed lunch en route",
        "Evening rest, relaxation & group bonding around campfire (if weather permits)"
      ],
      meals: "Breakfast & Lunch"
    },
    {
      day: 2,
      title: "Harishchandragad Trek & Camping",
      content: [
        "Early morning breakfast at base",
        "Start trek towards Harishchandragad Fort - one of the most iconic forts in Maharashtra",
        "Trek Distance: ~6 km uphill + 5 km descend + 4 km exploration",
        "Explore the majestic Konkan Kada (Cliff view)",
        "Visit caves and ancient structures around the fort",
        "Set up camp under the stars at Harishchandragad",
        "Dinner together with fellow trekkers near campfire (weather dependent)"
      ],
      meals: "Breakfast & Dinner"
    },
    {
      day: 3,
      title: "Sandhan Valley Exploration",
      content: [
        "Morning breakfast at campsite",
        "Descend trek and travel towards Vasundhara Waterfall",
        "Trek Distance: ~1 km (easy)",
        "Continue towards Sandhan Valley - The Valley of Shadows",
        "Trek inside the deep gorge carved between high rock walls",
        "Trek Distance: ~2 km one way (rock patches, water streams, and boulder walk)",
        "Post exploration, travel by vehicle towards Nasik / Pune",
        "Drop at station for evening train/bus journey back to Bangalore"
      ],
      meals: "Breakfast & Lunch"
    },
    {
      day: 4,
      title: "Arrival in Bengaluru",
      content: [
        "Overnight journey by train/bus",
        "Reach Bangalore by ~11:00 AM with wonderful memories and new trek buddies"
      ],
      meals: "None"
    }
  ],
  inclusions: [
    "Homestay/dormitory/tents accommodation",
    "All meals as per itinerary (2 meals/day)",
    "Professional trek leaders & local guides",
    "Basic first aid kit",
    "Vehicle transfers as per itinerary"
  ],
  exclusions: [
    "Train/bus tickets",
    "Personal expenses (shopping, additional meals)",
    "Fresh-up/changing room costs",
    "Personal medicines",
    "Alcohol/drugs (strictly prohibited)"
  ],
  equipmentList: [
    "Govt. ID proof (mandatory)",
    "Backpack (40L) + daypack for trekking",
    "Blanket/Sleeping bag for camping",
    "Trekking shoes with good grip + slippers",
    "2-3 pairs trekking clothes + warm wear",
    "Raincoat/Poncho/Umbrella",
    "Torch/Headlamp with extra batteries",
    "Sunglasses, cap & sunscreen",
    "Water bottles (2L minimum)",
    "Energy snacks (dry fruits, chocolates, glucose)",
    "Personal medicines + basic first aid kit",
    "Toiletries & towel",
    "Power bank",
    "Plastic covers to keep clothes dry"
  ],
  safetyMeasures: [
    "Follow trek leader's instructions for safety",
    "Stay with the group at all times",
    "No wandering alone",
    "Strictly no alcohol/drugs during the trip",
    "No littering policy - carry your waste back",
    "Be punctual at all pickup points"
  ],
  policies: [
    "Organisers reserve the right to modify itinerary based on weather, time, and group fitness",
    "Advance amount is non-refundable under any circumstances",
    "Late arrivals may miss transport",
    "Trek responsibly - support fellow trekkers on difficult terrain",
    "Trip cost covers only mentioned inclusions"
  ],
  batchDates: [
    "September 11th - 15th, 2024"
  ],
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

async function addKaaluTrek() {
  try {
    console.log('\n🏔️ Adding Kaalu Waterfall - Harishchandragad - Sandhan Valley trek to Firestore...');
    
    // Check if document already exists
    const docRef = tripsRef.doc(kaaluTrekData.slug);
    const doc = await docRef.get();
    
    if (doc.exists) {
      console.log(`\n❌ A trip with slug ${kaaluTrekData.slug} already exists!`);
      console.log('Document ID:', doc.id);
      console.log('Existing trip name:', doc.data().name);
      
      // Ask user if they want to update the existing document
      const updateExisting = await confirm('Do you want to update the existing document? (y/n) ');
      if (updateExisting) {
        // Merge the existing data with the new data
        await docRef.set(kaaluTrekData, { merge: true });
        console.log(`\n🎉 SUCCESS! Kaalu Waterfall - Harishchandragad - Sandhan Valley trek updated in Firestore!`);
      } else {
        console.log('\n🚫 Operation cancelled. The existing document was not modified.');
        return;
      }
    } else {
      // Add new document
      await docRef.set(kaaluTrekData);
      console.log(`\n🎉 SUCCESS! Kaalu Waterfall - Harishchandragad - Sandhan Valley trek added to Firestore!`);
    }
    
    // Verify the document was created/updated
    const verifyDoc = await docRef.get();
    if (verifyDoc.exists) {
      console.log('\n✅ Document verified in Firestore:');
      console.log(`   📄 ID: ${verifyDoc.id}`);
      console.log(`   🏔️  Name: ${verifyDoc.data().name}`);
      console.log(`   📍 Location: ${verifyDoc.data().location}`);
      console.log(`   💰 Price: ₹${verifyDoc.data().price} (Advance: ₹${verifyDoc.data().bookingAdvance})`);
      console.log(`   📅 Duration: ${verifyDoc.data().duration}`);
      console.log(`   👥 Spots Available: ${verifyDoc.data().spotsAvailable}`);
      console.log(`   🏷️  Difficulty: ${verifyDoc.data().difficulty}`);
      console.log(`   📞 Contact: ${verifyDoc.data().contactNumber}`);
      console.log(`   🏷️  Category: ${verifyDoc.data().category}`);
      console.log(`   🏷️  Tags: ${verifyDoc.data().tags.join(', ')}`);
      
      console.log('\n🌐 Your trip is now available on:');
      console.log('   • Destinations page (/destinations)');
      console.log('   • Featured Adventures section');
      console.log('   • Trip details page (/trip/kaalu-waterfall-harishchandragad-sandhan-valley-5d)');
      console.log('   • Admin dashboard for management');
      console.log('   • Available for customer bookings');
      console.log('   • Lead capture popup recommendations');
    } else {
      console.log('\n❌ Document verification failed. Document was not created.');
    }
    
    // List all trips in Firestore
    const allTrips = await tripsRef.orderBy('name').get();
    console.log('\n📋 Current trips in Firestore:');
    console.log('------------------------------------------------------------');
    allTrips.forEach((tripDoc, index) => {
      const data = tripDoc.data();
      console.log(`${index + 1}. ${tripDoc.id}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Price: ₹${data.price}`);
      console.log(`   Location: ${data.location}`);
      console.log('------------------------------------------------------------');
    });
    
    console.log(`\n📊 Total trips: ${allTrips.size}`);
    
  } catch (error) {
    console.error('\n❌ Error adding trip to Firestore:', error);
  }
}

// Helper function for user confirmation
function confirm(question) {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Run the function
addKaaluTrek();