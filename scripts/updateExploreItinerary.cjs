// One-off script to update detailed itinerary for Explore Maharashtra trip.
// Run: node scripts/updateExploreItinerary.cjs
// Requires scripts/serviceAccountKey.json (already used for seeding) OR GOOGLE_APPLICATION_CREDENTIALS.

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

const itinerary = [
  'Day 1 – Aug 12 (Tue): 06:00 PM assemble Bengaluru, trip briefing, overnight journey to Pune/Satara.',
  'Day 2 – Aug 13 (Wed): Savlya Ghat scenic pass + Kumbhe Waterfall (~2 km trek, Easy). Evening rest.',
  'Day 3 – Aug 14 (Thu): Waterfall Marathon – Devkund, Nanemachi, Satsada, Shevate (~12 km total, Easy–Moderate).',
  'Day 4 – Aug 15 (Fri): Rajmachi Fort (jeep ride) + Bhimashankar Temple (Jyotirlinga), viewpoints, overnight stay.',
  'Day 5 – Aug 16 (Sat): Kalu Waterfall trek + Adra Jungle Trek (~8 km total, Easy–Moderate).',
  'Day 6 – Aug 17 (Sun): Bhandardara circuit – Reverse Waterfall, Vasundhara, Necklace, Gondeshwara Temple, Sandan Valley View Point.',
  'Day 7 – Aug 18 (Mon): Trimbakeshwar Temple + Durgewadi Waterfall, evening departure from Nashik to Bengaluru.',
  'Day 8 – Aug 19 (Tue): Morning arrival Bengaluru – trip end.'
];

(async () => {
  try {
    const id = 'explore-maharashtra-7d';
    const ref = db.collection('trips').doc(id);
    await ref.update({ itinerary, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    console.log('Itinerary updated for', id);
  } catch (e) {
    console.error('Update failed:', e.message);
    process.exit(1);
  }
})();
