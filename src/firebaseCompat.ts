// Compat fallback for Firestore (diagnostic)
// If modular v12 getFirestore keeps returning 'Service firestore is not available',
// this provides a legacy namespace Firestore instance for comparison.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBGn7NtE-rFOGYP6nWGPaAXb_mK-i4hdjg',
  authDomain: 'trekandstay-fade6.firebaseapp.com',
  projectId: 'trekandstay-fade6',
  storageBucket: 'trekandstay-fade6.appspot.com',
  messagingSenderId: '1086551379927',
  appId: '1:1086551379927:web:8502d2414d95e4e53b0592',
  measurementId: 'G-X0L1D0QFC6'
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log('[compat] Firebase initialized');
}

export const compatApp = firebase.app();
export const compatDb = firebase.firestore();
export const compatAuth = firebase.auth();

// Tiny diagnostic log
console.log('[compat] Firestore instance:', !!compatDb, 'Project ID:', (compatApp.options as { projectId?: string }).projectId);
