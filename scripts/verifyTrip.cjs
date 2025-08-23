// Verify a trip document exists in Firestore (admin)
// Usage: node scripts/verifyTrip.cjs kumbhe-waterfall-rappelling-5d

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!admin.apps.length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else if (fs.existsSync(keyPath)) {
    admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
  } else {
    console.error('Service account key not found.');
    process.exit(1);
  }
}
const db = admin.firestore();

(async () => {
  const id = process.argv[2] || 'kumbhe-waterfall-rappelling-5d';
  try {
    const snap = await db.collection('trips').doc(id).get();
    if (!snap.exists) {
      console.error('❌ Trip not found:', id);
      process.exit(2);
    }
    const data = snap.data();
    console.log('✅ Trip Found:', id);
    console.log('Name:', data.name);
    console.log('Location:', data.location);
    console.log('Price:', data.price);
    console.log('Next Departure:', data.nextDeparture || data.nextdeparture || 'N/A');
    console.log('Active:', data.active);
    console.log('Tags:', Array.isArray(data.tags) ? data.tags.join(', ') : '');
  } catch (e) {
    console.error('Error verifying trip:', e.message || e);
    process.exit(3);
  }
})();
