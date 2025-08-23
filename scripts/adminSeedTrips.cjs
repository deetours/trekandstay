// Admin Firestore seeding script. Run: npm run seed:trips
// Uses firebase-admin with service account to bypass security rules safely.

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Resolve paths
const scriptsDir = __dirname;
const keyPath = path.join(scriptsDir, 'serviceAccountKey.json');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !fs.existsSync(keyPath)) {
  console.error('\nMissing serviceAccountKey.json in scripts/ OR GOOGLE_APPLICATION_CREDENTIALS env var.');
  console.error('Download from Firebase Console: Project Settings > Service Accounts > Generate new private key.');
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

async function seed() {
  const dataPath = path.join(scriptsDir, 'tripsSeedData.json');
  if (!fs.existsSync(dataPath)) {
    console.error('tripsSeedData.json not found');
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const trips = raw.trips || [];
  if (!trips.length) {
    console.log('No trips in JSON');
    return;
  }

  console.log(`Seeding ${trips.length} trips...`);

  const batchSize = 400;
  let batch = db.batch();
  let opCount = 0;
  for (const trip of trips) {
    const id = (trip.slug || trip.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const ref = db.collection('trips').doc(id);
    batch.set(ref, {
      ...trip,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    opCount++;
    if (opCount % batchSize === 0) {
      await batch.commit();
      console.log(`Committed batch of ${batchSize}`);
      batch = db.batch();
    }
  }
  if (opCount % batchSize !== 0) {
    await batch.commit();
    console.log(`Committed final batch of ${opCount % batchSize}`);
  }
  console.log('Seeding complete.');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
