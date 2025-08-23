// Upsert Maharashtra Waterfall Edition – 4 Days Adventure
// Usage: node scripts/upsertMaharashtra4D.cjs

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!admin.apps.length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else if (fs.existsSync(keyPath)) {
    admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
  } else {
    console.error('Missing serviceAccountKey.json or GOOGLE_APPLICATION_CREDENTIALS');
    process.exit(1);
  }
}
const db = admin.firestore();

async function run() {
  const jsonPath = path.join(__dirname, '..', 'backend', 'maharashtra_waterfall_edition_4d.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('Trip JSON not found at', jsonPath);
    process.exit(2);
  }
  const data = JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  const id = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const ref = db.collection('trips').doc(id);
  await ref.set({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    active: true,
    featured: data.featured !== false
  }, { merge: true });
  const snap = await ref.get();
  console.log('✅ Upserted:', id);
  console.log('Name:', snap.get('name'));
  console.log('Price:', snap.get('price'));
  console.log('Next Departure:', snap.get('nextDeparture'));
  console.log('Tags:', (snap.get('tags')||[]).join(', '));
}

run().catch(e => { console.error('❌ Failed', e); process.exit(3); });
