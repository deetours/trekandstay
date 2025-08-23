// Admin Firestore verification script
// Requires a service account JSON. Generate in Firebase Console:
//  Project Settings > Service Accounts > Generate New Private Key
// Save it as serviceAccount.json in the project root (or anywhere) and set env var:
//  PowerShell:  $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\\Users\\...\\project\\serviceAccount.json"
// Then run:  node scripts/adminFirestoreCheck.cjs

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

function log(label, value) { console.log(`[admin-firestore-check] ${label}:`, value); }

(async () => {
  try {
    // Prefer explicit credential file if GOOGLE_APPLICATION_CREDENTIALS set
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (credPath && fs.existsSync(credPath)) {
      log('Using credentials file', credPath);
      const key = require(path.resolve(credPath));
      initializeApp({ credential: cert(key), projectId: key.project_id });
    } else {
      log('Using applicationDefault credentials (may fail if not set)');
      initializeApp({ credential: applicationDefault(), projectId: 'trekandstay-fade6' });
    }
    const db = getFirestore();
    const cols = await db.listCollections();
    log('Collections', cols.map(c => c.id));
    // Try a simple write/read in a temp collection (uncomment if you want to test security rules allow this)
    // const testRef = db.collection('__diag').doc('ping');
    // await testRef.set({ ts: Date.now() });
    // const snap = await testRef.get();
    // log('Diag doc exists', snap.exists);
    log('Conclusion', 'Admin SDK can access Firestore. If your web app still reports "Service firestore is not available", it is a frontend module registration issue, not backend availability.');
  } catch (e) {
    log('Error', e && e.message ? e.message : e);
    if (e && e.code) log('Error code', e.code);
    process.exitCode = 1;
  }
})();
