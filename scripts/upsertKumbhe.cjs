// Upsert the Kumbhe Waterfall Rappelling – 5 Days Adventure trip
// Usage: node scripts/upsertKumbhe.cjs

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
    console.error('Missing serviceAccountKey.json in scripts or GOOGLE_APPLICATION_CREDENTIALS env var');
    process.exit(1);
  }
}
const db = admin.firestore();

async function run() {
  const jsonPath = path.join(__dirname, '..', 'backend', 'kumbhe_waterfall_rappelling.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('Trip JSON not found at', jsonPath);
    process.exit(2);
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const id = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const ref = db.collection('trips').doc(id);
  const payload = {
    ...data,
    active: true,
    featured: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  await ref.set(payload, { merge: true });
  console.log('✅ Upserted trip:', id);
  const snap = await ref.get();
  console.log('Name:', snap.get('name'));
  console.log('Price:', snap.get('price'));
  console.log('Category:', snap.get('category'));
  console.log('Tags:', (snap.get('tags') || []).join(', '));
}

run().catch(e => {
  console.error('❌ Upsert failed', e);
  process.exit(3);
});
