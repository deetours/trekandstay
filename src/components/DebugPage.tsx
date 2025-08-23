import React from 'react';

export const DebugPage: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      color: 'black',
      minHeight: '100vh' 
    }}>
      <h1>Debug Page - App is working!</h1>
      <p>If you can see this, the app is rendering correctly.</p>
      <p>Current time: {new Date().toISOString()}</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>App Status:</h2>
        <ul>
          <li>✅ React is loaded</li>
          <li>✅ Router is working</li>
          <li>✅ Components can render</li>
        </ul>
      </div>
    </div>
  );
};
