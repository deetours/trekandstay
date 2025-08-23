import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection } from 'firebase/firestore';

interface ConnectionStatus {
  db: boolean;
  auth: boolean;
  error?: string;
}

export function FirebaseTest() {
  const [status, setStatus] = useState<ConnectionStatus>({ db: false, auth: false });

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔍 Testing Firebase connection...');
        
        // Test auth
        const authStatus = !!auth;
        console.log('Auth status:', authStatus);
        
        // Test Firestore (simplified)
        let dbStatus = false;
        let error: string | undefined;
        
        if (db) {
          try {
            // Try to get a collection reference (this should work even with security rules)
            collection(db, 'test');
            console.log('✅ Firestore connection test passed');
            dbStatus = true;
          } catch (err) {
            console.error('❌ Firestore connection test failed:', err);
            error = err instanceof Error ? err.message : 'Unknown error';
            dbStatus = false;
          }
        } else {
          error = 'Firestore not initialized';
          console.error('❌ Firestore is null');
        }
        
        setStatus({ db: dbStatus, auth: authStatus, error });
      } catch (err) {
        console.error('Overall Firebase test failed:', err);
        setStatus({ 
          db: false, 
          auth: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h4>Firebase Status</h4>
      <div>DB: {status.db ? '✅' : '❌'}</div>
      <div>Auth: {status.auth ? '✅' : '❌'}</div>
      {status.error && <div style={{ color: 'red' }}>Error: {status.error}</div>}
    </div>
  );
}
