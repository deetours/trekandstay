import React from 'react';
import { ArrowLeft } from 'lucide-react';
import './OfflinePage.css';

export default function OfflinePage() {
  return (
    <div className="offline-page">
      <div className="offline-content">
        <div className="offline-icon-large">📡</div>

        <h1>You're Offline</h1>

        <p className="offline-subtitle">
          But don't worry! You can still access cached content.
        </p>

        <div className="offline-features">
          <div className="feature">
            <span className="check">✅</span>
            <div>
              <h3>View Your Bookings</h3>
              <p>All your trek bookings are saved locally</p>
            </div>
          </div>

          <div className="feature">
            <span className="check">✅</span>
            <div>
              <h3>Read Trek Details</h3>
              <p>Browse trek information & packing lists</p>
            </div>
          </div>

          <div className="feature">
            <span className="check">✅</span>
            <div>
              <h3>Chat History</h3>
              <p>Review your previous chatbot conversations</p>
            </div>
          </div>

          <div className="feature">
            <span className="check">✅</span>
            <div>
              <h3>Auto-Sync</h3>
              <p>Everything syncs when you're back online</p>
            </div>
          </div>
        </div>

        <div className="offline-actions">
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Connecting Again
          </button>
          <button onClick={() => window.history.back()} className="back-btn">
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        <div className="offline-tips">
          <h4>💡 Tips:</h4>
          <ul>
            <li>Check your internet connection</li>
            <li>Try moving to a different location</li>
            <li>All your changes will sync when online</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
