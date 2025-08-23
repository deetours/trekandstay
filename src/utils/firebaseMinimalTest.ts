// Minimal Firebase test - bypassing our configuration
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGn7NtE-rFOGYP6nWGPaAXb_mK-i4hdjg",
  authDomain: "trekandstay-fade6.firebaseapp.com",
  projectId: "trekandstay-fade6",
  storageBucket: "trekandstay-fade6.appspot.com",
  messagingSenderId: "1086551379927",
  appId: "1:1086551379927:web:8502d2414d95e4e53b0592",
  measurementId: "G-X0L1D0QFC6"
};

console.log('🧪 Running minimal Firebase test...');

try {
  // Check if Firebase is already initialized
  const existingApps = getApps();
  console.log('Existing Firebase apps:', existingApps.length);
  
  let testApp;
  if (existingApps.length > 0) {
    testApp = existingApps[0];
    console.log('Using existing Firebase app:', testApp.name);
  } else {
    testApp = initializeApp(firebaseConfig, 'minimal-test-app');
    console.log('Created new Firebase app:', testApp.name);
  }
  
  // Try to initialize Firestore
  const testDB = getFirestore(testApp);
  console.log('✅ Minimal Firestore test SUCCESS:', !!testDB);
  console.log('Firestore app name:', testDB.app.name);
  
} catch (error) {
  console.error('❌ Minimal Firebase test FAILED:', error);
  console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
  console.error('Error message:', error instanceof Error ? error.message : String(error));
}
