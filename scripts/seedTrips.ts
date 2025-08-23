// One-time Firestore seeding script (run with: npx ts-node scripts/seedTrips.ts)
// IMPORTANT: Remove or protect after seeding.

import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { Destination } from '../src/types/index';

// You may prefer to move config to env vars for security
const firebaseConfig = {
  apiKey: "AIzaSyBGn7NtE-rFOGYP6nWGPaAXb_mK-i4hdjg",
  authDomain: "trekandstay-fade6.firebaseapp.com",
  projectId: "trekandstay-fade6",
  storageBucket: "trekandstay-fade6.appspot.com",
  messagingSenderId: "1086551379927",
  appId: "1:1086551379927:web:8502d2414d95e4e53b0592",
  measurementId: "G-X0L1D0QFC6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type TripInput = Destination & { slug?: string };

async function seedTrips() {
  const jsonPath = path.join(__dirname, 'tripsSeedData.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('tripsSeedData.json not found');
    process.exit(1);
  }
  const tripsWrapper = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const trips: TripInput[] = tripsWrapper.trips || [];
  if (!trips.length) {
    console.error('No trips found in JSON');
    return;
  }
  const batch = writeBatch(db);
  for (const t of trips) {
    const id = t.slug || t.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const ref = doc(db, 'trips', id);
    batch.set(ref, { ...t, createdAt: serverTimestamp() });
  }
  await batch.commit();
  console.log(`Seeded ${trips.length} trips.`);
}

seedTrips().catch(e => {
  console.error(e);
  process.exit(1);
});
