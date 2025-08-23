// Quick Firestore availability check via Node (server environment)
// Uses modular SDK. If this fails with 'Service firestore is not available' Firestore is almost certainly not enabled.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getCountFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBGn7NtE-rFOGYP6nWGPaAXb_mK-i4hdjg',
  authDomain: 'trekandstay-fade6.firebaseapp.com',
  projectId: 'trekandstay-fade6',
  storageBucket: 'trekandstay-fade6.appspot.com',
  messagingSenderId: '1086551379927',
  appId: '1:1086551379927:web:8502d2414d95e4e53b0592',
  measurementId: 'G-X0L1D0QFC6'
};

function log(label, value) { console.log(`[firestore-check] ${label}:`, value); }

try {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig, 'cli-check');
  log('App initialized', app.name);
  let db;
  try {
    db = getFirestore(app);
    log('getFirestore()', 'success');
  } catch (e) {
    log('getFirestore() error', e instanceof Error ? e.message : e);
    process.exitCode = 2;
    process.exit();
  }
  // Try reading a non-existent doc (should succeed with a NotFound style semantics if rules allow)
  const testDocRef = doc(db, '__diagnostics__', 'ping');
  try {
    const snap = await getDoc(testDocRef);
    log('Doc exists', snap.exists());
  } catch (e) {
    log('getDoc error', e instanceof Error ? e.message : e);
  }
  // Try a count query (only returns permission issues or success / unimplemented if service disabled)
  try {
    const tripsCol = collection(db, 'trips');
    const countSnap = await getCountFromServer(tripsCol);
    log('trips count', countSnap.data().count);
  } catch (e) {
    log('count query error', e instanceof Error ? e.message : e);
  }
  log('Conclusion', 'If earlier log said Service firestore is not available -> enable Firestore in Firebase Console.');
} catch (outer) {
  log('Fatal error', outer instanceof Error ? outer.message : outer);
  process.exitCode = 1;
}
