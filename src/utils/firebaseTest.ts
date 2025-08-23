// Firebase Connection Test Utility
import { app, db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🔍 Testing Firebase Connection...');
  
  // Test Firebase App
  console.log('📱 Firebase App:', app ? '✅ Initialized' : '❌ Not Available');
  
  // Test Auth
  console.log('🔐 Firebase Auth:', auth ? '✅ Available' : '❌ Not Available');
  
  // Test Firestore
  console.log('🗄️ Firebase Firestore:', db ? '✅ Available' : '❌ Not Available');
  
  if (db) {
    try {
      // Try to read from Firestore
      const testQuery = collection(db, 'trips');
      const testSnapshot = await getDocs(testQuery);
      console.log('📊 Firestore Query Test:', testSnapshot.empty ? '⚠️ No data' : `✅ ${testSnapshot.size} documents`);
      
      // Check Firebase Rules
      console.log('🔒 Firebase Rules: Testing read permissions...');
      
    } catch (error: unknown) {
      console.error('❌ Firestore Query Failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          console.error('🚫 Permission Denied - Check Firestore Security Rules');
        } else if (error.message.includes('unavailable')) {
          console.error('📡 Network/Connection Issue - Check internet connection');
        } else if (error.message.includes('not-found')) {
          console.error('📂 Collection/Document Not Found');
        }
      }
    }
  }
  
  // Test project configuration
  const config = {
    projectId: app.options.projectId,
    authDomain: app.options.authDomain,
    databaseURL: app.options.databaseURL
  };
  
  console.log('⚙️ Firebase Config:', config);
  
  return {
    app: !!app,
    auth: !!auth,
    firestore: !!db
  };
};

// Auto-run test in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    testFirebaseConnection().catch(console.error);
  }, 1000);
}
