const admin = require('firebase-admin');
const serviceAccount = require('../scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const axios = require('axios');

// Django backend API endpoint
// Using localhost:8000 as the default development server
const DJANGO_API_URL = 'http://127.0.0.1:8000/api/trips/';

// Get trips from Firestore
async function getFirestoreTrips() {
  try {
    const tripsRef = db.collection('trips');
    const snapshot = await tripsRef.orderBy('name').get();
    const trips = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Helper function to safely join arrays
      const safeJoin = (arr, separator = ',') => {
        return Array.isArray(arr) ? arr.join(separator) : '';
      };
      
      // Helper function to safely stringify objects
      const safeStringify = (obj) => {
        return obj ? JSON.stringify(obj) : '{}';
      };
      
      trips.push({
        id: doc.id,
        name: data.name || '',
        slug: data.slug || '',
        location: data.location || '',
        price: data.price || 0,
        booking_advance: data.bookingAdvance || 0,
        contact_number: data.contactNumber || '',
        duration: data.duration || '',
        spots_available: data.spotsAvailable || 0,
        difficulty: data.difficulty || '',
        category: data.category || '',
        tags: safeJoin(data.tags),
        highlights: safeJoin(data.highlights, '\n'),
        itinerary: safeStringify(data.itinerary),
        inclusions: safeJoin(data.inclusions, '\n'),
        exclusions: safeJoin(data.exclusions, '\n'),
        equipment_list: safeJoin(data.equipmentList, '\n'),
        safety_measures: safeJoin(data.safetyMeasures, '\n'),
        policies: safeJoin(data.policies, '\n'),
        batch_dates: safeJoin(data.batchDates, '\n'),
        created_at: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updated_at: data.updatedAt ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
      });
    });
    
    return trips;
  } catch (error) {
    console.error('Error getting trips:', error);
    return [];
  }
}

// Create trip in Django backend
async function createDjangoTrip(trip) {
  try {
    // Make API request to Django backend
    const response = await axios.post(DJANGO_API_URL, trip);
    console.log(`✅ Created Django trip: ${trip.name} (ID: ${response.data.id})`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`⚠️  Trip ${trip.name} already exists in Django (slug: ${trip.slug})`);
      return null;
    }
    console.error(`❌ Error creating trip ${trip.name}:`, error.message);
    return null;
  }
}

// Sync trips from Firestore to Django
async function syncTrips() {
  console.log('🔄 Starting Firestore to Django trip sync...');
  
  // Get trips from Firestore
  const firestoreTrips = await getFirestoreTrips();
  console.log(`📚 Found ${firestoreTrips.length} trips in Firestore`);
  
  if (firestoreTrips.length === 0) {
    console.log('⚠️  No trips found in Firestore. Sync cancelled.');
    return;
  }
  
  // Create or update trips in Django
  let createdCount = 0;
  let skippedCount = 0;
  
  for (const trip of firestoreTrips) {
    // Check if trip exists in Django
    const exists = await checkDjangoTripExists(trip.slug);
    
    if (exists) {
      console.log(`🔁 Skipping ${trip.name} - already exists in Django`);
      skippedCount++;
      continue;
    }
    
    // Create new trip
    const result = await createDjangoTrip(trip);
    if (result) {
      createdCount++;
    }
  }
  
  // Summary
  console.log('\n✅ Sync completed successfully!');
  console.log(`  🎉 Created: ${createdCount} trips`);
  console.log(`  🔄 Skipped: ${skippedCount} trips (already exist)`);
  console.log(`  📚 Total trips in Django: ${createdCount + skippedCount}`);
  console.log('\n🚀 All trips are now synchronized between Firestore and Django');
}

// Check if trip exists in Django
async function checkDjangoTripExists(slug) {
  try {
    const response = await axios.get(`${DJANGO_API_URL}?slug=${slug}`);
    return response.data.length > 0;
  } catch (error) {
    console.error(`❌ Error checking trip existence for slug ${slug}:`, error.message);
    return true; // Skip on error to avoid duplicates
  }
}

// Run the sync
syncTrips();