// Minimal, deterministic Firebase initialization (modular v12+)
import { initializeApp, getApps, getApp, SDK_VERSION } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBGn7NtE-rFOGYP6nWGPaAXb_mK-i4hdjg",
  authDomain: "trekandstay-fade6.firebaseapp.com",
  projectId: "trekandstay-fade6",
  storageBucket: "trekandstay-fade6.appspot.com",
  messagingSenderId: "1086551379927",
  appId: "1:1086551379927:web:8502d2414d95e4e53b0592",
  measurementId: "G-X0L1D0QFC6"
};

console.log('[firebase] Init (SDK', SDK_VERSION + ')');
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
console.log('[firebase] App ready:', app.name);

// Initialize Auth (this works)
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
console.log('✅ Firebase Auth initialized');

// Initialize Analytics (optional)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  } catch (error) {
    console.warn('⚠️ Firebase Analytics initialization failed (normal in development):', error);
  }
}

// Firestore simple init
let dbInitError: unknown = null;
let db: Firestore | undefined;
const fsStart = performance.now();
try {
  db = getFirestore(app);
  console.log('[firebase] Firestore ready');
} catch (e) {
  dbInitError = e;
  console.error('[firebase] Firestore init failed:', e);
}

// Expose diagnostics (may update after async retry)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__FIREBASE_DIAG = {
  ts: new Date().toISOString(),
  elapsedMs: +(performance.now() - fsStart).toFixed(2),
  projectId: app.options.projectId,
  appName: app.name,
  firestoreOk: !!db && !dbInitError,
  firstError: dbInitError ? (dbInitError instanceof Error ? { name: dbInitError.name, message: dbInitError.message } : String(dbInitError)) : null,
  sdkVersion: SDK_VERSION,
};
if (dbInitError) console.warn('📋 Firestore diagnostics (initial):', (globalThis as unknown as { __FIREBASE_DIAG?: unknown }).__FIREBASE_DIAG);

// Final status report
console.log('[firebase] Status:', { app: !!app, auth: !!auth, db: !!db, analytics: !!analytics });

export { app, auth, db, analytics, googleProvider };

// Helper for consumers that want a hard guarantee (throws instead of silent null logic)
export function getDbOrThrow() {
  if (!db) {
    const diagHolder = (globalThis as unknown as { __FIREBASE_DIAG?: unknown });
    const diagSafe = typeof diagHolder.__FIREBASE_DIAG === 'object' ? diagHolder.__FIREBASE_DIAG : { value: diagHolder.__FIREBASE_DIAG };
    throw new Error('Firestore unavailable. Diagnostics: ' + JSON.stringify(diagSafe));
  }
  return db;
}

// Async helper: poll for Firestore up to timeoutMs
export async function waitForFirestore(timeoutMs = 4000, intervalMs = 150): Promise<Firestore> {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    if (db) return db;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return getDbOrThrow();
}
