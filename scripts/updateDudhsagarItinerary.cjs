// Script to upsert structured itinerary for Dudhsagar Trek (3D) trip.
// Run: node scripts/updateDudhsagarItinerary.cjs
// Requires: scripts/serviceAccountKey.json or GOOGLE_APPLICATION_CREDENTIALS env var.

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

const structuredItinerary = {
  day_1: {
    date: 'August 15, 2025 (Friday)',
    title: 'Bengaluru → Kulem, Goa',
    highlights: [
      'Assemble at Bengaluru Railway Station by 2:30 PM',
      '3:00 PM train departure to Kulem',
      'Overnight train journey – bonding & prep for trek'
    ],
    activities: [
      { time: '2:30 PM', activity: 'Assembly', details: 'Gather at Bengaluru Railway Station' },
      { time: '3:00 PM', activity: 'Departure', details: 'Board train to Kulem (overnight journey)' }
    ],
    trek_distance: '0 km',
    difficulty: 'None',
    meals: [],
    accommodation: 'Overnight Train'
  },
  day_2: {
    date: 'August 16, 2025 (Saturday)',
    title: 'Dudhsagar Falls Trek',
    highlights: [
      'Early arrival at Kulem base',
      'Start trek 7:00 AM to Dudhsagar Falls',
      'Iconic multi-tiered waterfall amidst forest & rail arches'
    ],
    activities: [
      { time: 'Early Morning', activity: 'Arrival', details: 'Reach Kulem, freshen up & breakfast' },
      { time: '7:00 AM', activity: 'Trek Start', details: 'Begin trek to Dudhsagar Falls' },
      { time: 'Day', activity: 'Waterfall Exploration', details: 'Enjoy views, photos, packed energy breaks' },
      { time: 'Evening', activity: 'Return', details: 'Trek back to base, freshen up & dinner' },
      { time: '12:30 AM', activity: 'Return Train', details: 'Board midnight train back to Bengaluru' }
    ],
    waterfalls: [
      {
        name: 'Dudhsagar Waterfall',
        description: "One of India's tallest waterfalls with powerful monsoon flow",
        difficulty: 'Moderate',
        trek_distance: '10 km one way (20 km round trip)'
      }
    ],
    trek_distance: '10 + 10 km (20 km total)',
    difficulty: 'Moderate',
    meals: ['Breakfast', 'Lunch', 'Dinner'],
    accommodation: 'Overnight Train (return)'
  },
  day_3: {
    date: 'August 17, 2025 (Sunday)',
    title: 'Arrival at Bengaluru',
    highlights: [
      '12:30 PM arrival in Bengaluru',
      'Monsoon trek memories & group closure'
    ],
    activities: [
      { time: '12:30 PM', activity: 'Arrival', details: 'Reach Bengaluru – trip concludes' }
    ],
    trek_distance: '0 km',
    difficulty: 'None',
    meals: [],
    accommodation: 'Trip Ends'
  }
};

(async () => {
  try {
    const tripId = 'dudhsagar-trek-3d';
    const ref = db.collection('trips').doc(tripId);

    const payload = {
      itinerary: structuredItinerary,
      total_waterfalls: 1,
      waterfall_list: ['Dudhsagar Waterfall'],
      total_trek_distance: '20 km',
      daily_trek_distances: { day_2: '20 km' },
      inclusions: [
        'Accommodation for freshup/rest: Tent / Dorm / Shared Room',
        'Transportation: Tempo Traveller / Mini Bus / Bus / Train',
        'Meals: 1 Breakfast, 1 Lunch, 1 Dinner (basic vegetarian)',
        'Entry fees & guide charges',
        'Basic first-aid support'
      ],
      exclusions: [
        'GST',
        'Travel Insurance',
        'Hospital expenses beyond first aid',
        'Off-road / extra transport costs',
        'Anything not mentioned in inclusions'
      ],
      tags: admin.firestore.FieldValue.arrayUnion('dudhsagar','waterfall','monsoon','3-days','moderate'),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await ref.set(payload, { merge: true });
    console.log('✅ Updated structured itinerary for', tripId);
  } catch (e) {
    console.error('Update failed:', e);
    process.exit(1);
  }
})();
