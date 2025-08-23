// Simple Node.js script to seed trips to Firestore
// Run with: node scripts/seedTripsSimple.js

const { initializeApp } = require('firebase/app');
const { getFirestore, writeBatch, doc, serverTimestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: "AIzaSyBGn7NtE-rFOGYP6nWGPaAXb_mK-i4hdjg",
  authDomain: "trekandstay-fade6.firebaseapp.com",
  projectId: "trekandstay-fade6",
  storageBucket: "trekandstay-fade6.appspot.com",
  messagingSenderId: "1086551379927",
  appId: "1:1086551379927:web:8502d2414d95e4e53b0592",
  measurementId: "G-X0L1D0QFC6"
};

async function seedTrips() {
  try {
    console.log('🚀 Starting trip seeding process...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const jsonPath = path.join(__dirname, 'tripsSeedData.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ tripsSeedData.json not found');
      process.exit(1);
    }
    
    const tripsWrapper = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const trips = tripsWrapper.trips || [];
    
    if (!trips.length) {
      console.error('❌ No trips found in JSON');
      return;
    }
    
    console.log(`📊 Found ${trips.length} trips to seed`);
    
    const batch = writeBatch(db);
    let count = 0;
    
    for (const trip of trips) {
      const id = trip.slug || trip.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
      const ref = doc(db, 'trips', id);
      batch.set(ref, { 
        ...trip, 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: trip.active !== false // default to true unless explicitly false
      });
      count++;
      console.log(`✓ Prepared ${trip.name} (${id})`);
    }
    
    console.log('💾 Committing batch to Firestore...');
    await batch.commit();
    
    console.log('🎉 SUCCESS! Seeded ' + count + ' trips to Firestore!');
    console.log('\n✨ Your new trips are now available:');
    
    // Find and highlight our new trip
    const newTrip = trips.find(t => t.slug === 'kumbhe-waterfall-rappelling-5d');
    if (newTrip) {
      console.log(`\n🌊 NEW: ${newTrip.name}`);
      console.log(`   📍 Location: ${newTrip.location}`);
      console.log(`   💰 Price: ₹${newTrip.price}`);
      console.log(`   🏷️  Category: ${newTrip.category || 'adventure'}`);
      console.log(`   🏷️  Tags: ${newTrip.tags ? newTrip.tags.join(', ') : 'N/A'}`);
    }
    
    console.log('\n🌐 Check your web app:');
    console.log('   • Destinations page');
    console.log('   • Featured Adventures section');
    console.log('   • Available for booking');
    
  } catch (error) {
    console.error('❌ Error seeding trips:', error);
    process.exit(1);
  }
}

seedTrips();
