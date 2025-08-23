// Script to upsert ONLY the detailed itinerary object for Maharashtra Waterfall Edition 5D trip.
// Run: node scripts/updateMaharashtra5DItinerary.cjs
// Requires: scripts/serviceAccountKey.json or GOOGLE_APPLICATION_CREDENTIALS env var set.

const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !fs.existsSync(keyPath)) {
  console.error('Missing serviceAccountKey.json or GOOGLE_APPLICATION_CREDENTIALS');
  process.exit(1);
}
if (!admin.apps.length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else {
    const serviceAccount = require(keyPath);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
}
const db = admin.firestore();

// Load structured itinerary JSON (backend/maharashtra_5day_itinerary.json)
const itineraryJsonPath = path.join(__dirname, '..', 'backend', 'maharashtra_5day_itinerary.json');
if (!fs.existsSync(itineraryJsonPath)) {
  console.error('Itinerary JSON not found at', itineraryJsonPath);
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(itineraryJsonPath, 'utf8'));

(async () => {
  try {
    const tripId = 'maharashtra-waterfall-edition-5d';
    const ref = db.collection('trips').doc(tripId);

    // Prepare the subset to upsert
    const updatePayload = {
      itinerary: raw.itinerary,
      total_waterfalls: raw.total_waterfalls,
      waterfall_list: raw.waterfall_list,
      total_trek_distance: raw.total_trek_distance,
      daily_trek_distances: raw.daily_trek_distances,
      inclusions: raw.inclusions,
      exclusions: raw.exclusions,
      tags: admin.firestore.FieldValue.arrayUnion(...raw.tags),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await ref.set(updatePayload, { merge: true });
    console.log('✅ Updated itinerary + related fields for', tripId);
  } catch (e) {
    console.error('Update failed:', e);
    process.exit(1);
  }
})();
