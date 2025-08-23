// Simple Firebase network test
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function testFirebaseConnection() {
  console.log('🔍 Starting comprehensive Firebase connection test...');
  
  const results = {
    appStatus: false,
    authStatus: false,
    firestoreStatus: false,
    networkTest: false,
    error: null as string | null
  };

  try {
    // Check if services are initialized
    results.authStatus = !!auth;
    console.log(`Auth service: ${results.authStatus ? '✅' : '❌'}`);

    results.firestoreStatus = !!db;
    console.log(`Firestore service: ${results.firestoreStatus ? '✅' : '❌'}`);

    // Test network connectivity to Firestore
    if (db) {
      try {
        // Try to access a non-existent document (should return null without security rule issues)
        const testDoc = doc(db, 'test', 'connectivity-test');
        const docSnap = await getDoc(testDoc);
        results.networkTest = true;
        console.log('✅ Firestore network connectivity test passed');
        console.log('Document exists:', docSnap.exists());
      } catch (networkError) {
        console.error('❌ Firestore network test failed:', networkError);
        results.error = networkError instanceof Error ? networkError.message : 'Network error';
        results.networkTest = false;
      }
    } else {
      results.error = 'Firestore not initialized';
      console.error('❌ Cannot test network - Firestore not initialized');
    }

  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    results.error = error instanceof Error ? error.message : 'Unknown error';
  }

  console.log('📊 Final Test Results:', results);
  return results;
}

// Auto-run test when imported
testFirebaseConnection().then(results => {
  console.log('🏁 Firebase connection test completed:', results);
}).catch(error => {
  console.error('🚨 Firebase connection test crashed:', error);
});
