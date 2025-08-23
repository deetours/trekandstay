// Simple Firebase connection test
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBGn7NtE-rFOGYP6nWGPaAXb_mK-i4hdjg",
  authDomain: "trekandstay-fade6.firebaseapp.com", 
  projectId: "trekandstay-fade6",
  storageBucket: "trekandstay-fade6.appspot.com",
  messagingSenderId: "1086551379927",
  appId: "1:1086551379927:web:8502d2414d95e4e53b0592",
  measurementId: "G-X0L1D0QFC6"
};

console.log('🔧 Testing Firebase Connection...\n');

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App initialized');

  // Test Firestore
  const db = getFirestore(app);
  console.log('✅ Firestore service initialized');

  // Test Auth  
  const auth = getAuth(app);
  console.log('✅ Auth service initialized');

  console.log('\n📊 All Firebase services initialized successfully!');
  console.log('🌐 Project ID:', firebaseConfig.projectId);
  console.log('🔒 Auth Domain:', firebaseConfig.authDomain);
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.error('Error details:', {
    name: error.name,
    message: error.message,
    code: error.code
  });
}
