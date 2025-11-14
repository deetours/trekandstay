# Integration Guide: Adding MarketingCampaignPage to Your App

## Option 1: Add Route to React Router

### Step 1: Update your main routing file (e.g., `App.tsx` or `router.tsx`)

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MarketingCampaignPage from './pages/MarketingCampaignPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookings" element={<BookingFlow />} />
        
        {/* NEW: Marketing Campaign Page */}
        <Route path="/campaigns" element={<MarketingCampaignPage />} />
        <Route path="/marketing" element={<MarketingCampaignPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 2: Add Navigation Link

```typescript
// In your Navigation/Header component

import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className="flex gap-4">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/bookings">Bookings</Link>
      
      {/* NEW: Marketing link */}
      <Link to="/campaigns" className="flex items-center gap-2">
        <Send className="w-4 h-4" />
        Marketing Campaigns
      </Link>
    </nav>
  );
}
```

---

## Option 2: Add as Admin Dashboard Section

### Step 1: Create Admin Dashboard Wrapper

```typescript
// src/pages/AdminDashboard.tsx

import { useState } from 'react';
import MarketingCampaignPage from './MarketingCampaignPage';
import AnalyticsPage from './AnalyticsPage'; // existing
import { Send, BarChart3, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('campaigns');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg p-4">
        <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
        
        <div className="space-y-2">
          <button
            onClick={() => setActiveSection('campaigns')}
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeSection === 'campaigns' 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            <Send className="w-4 h-4" />
            Marketing Campaigns
          </button>
          
          <button
            onClick={() => setActiveSection('analytics')}
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeSection === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          
          <button
            onClick={() => setActiveSection('settings')}
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeSection === 'settings' 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {activeSection === 'campaigns' && <MarketingCampaignPage />}
        {activeSection === 'analytics' && <AnalyticsPage />}
        {activeSection === 'settings' && <SettingsPage />}
      </div>
    </div>
  );
}
```

---

## Option 3: Standalone Integration

### Step 1: Minimal Setup

```typescript
// src/components/CampaignManager.tsx

import MarketingCampaignPage from '../pages/MarketingCampaignPage';

export default function CampaignManager() {
  return (
    <div className="w-full">
      <MarketingCampaignPage />
    </div>
  );
}
```

### Step 2: Use in Dashboard

```typescript
// src/pages/Dashboard.tsx

import CampaignManager from '../components/CampaignManager';

export default function Dashboard() {
  return (
    <div className="space-y-8 p-8">
      <section>
        <h2>Trip Analytics</h2>
        {/* existing analytics */}
      </section>

      <section>
        <h2>Marketing Campaigns</h2>
        <CampaignManager />
      </section>
    </div>
  );
}
```

---

## Configuration: Pointing to Your Backend

### Step 1: Check API Base Configuration

Verify where your API calls are configured:

```typescript
// src/config/api.ts (or similar)

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

export const API_ENDPOINTS = {
  whatsapp: {
    send: `${API_BASE}whatsapp/send/`,
    aiResponse: `${API_BASE}whatsapp/ai-response/`,
    campaign: `${API_BASE}whatsapp/campaign/`,
    bookingConfirmation: `${API_BASE}whatsapp/booking-confirmation/`,
    promotional: `${API_BASE}whatsapp/promotional/`,
    reminder: `${API_BASE}whatsapp/reminder/`,
    bulkSend: `${API_BASE}whatsapp/bulk-send/`,
    conversation: `${API_BASE}whatsapp/conversation/`,
    models: `${API_BASE}whatsapp/models/`,
    testConnection: `${API_BASE}whatsapp/test-connection/`,
    webhook: `${API_BASE}whatsapp/webhook/`,
  }
};
```

### Step 2: Update Environment Variable

Create/update `.env` or `.env.local`:

```env
# Development
REACT_APP_API_URL=http://localhost:8000/api/

# Production (your VM)
REACT_APP_API_URL=http://129.159.227.138:8000/api/
```

### Step 3: Update MarketingCampaignPage if Needed

If your API is at a different path, update the component:

```typescript
// In MarketingCampaignPage.tsx

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

// Update axios calls:
const response = await axios.post(
  `${API_BASE}whatsapp/campaign/`,
  { /* data */ }
);
```

---

## Authentication: Setting Bearer Token

### Option 1: Use Existing Auth Context

```typescript
// MarketingCampaignPage.tsx

import { useAuth } from '../context/AuthContext'; // your auth context
import axios from 'axios';

export default function MarketingCampaignPage() {
  const { token } = useAuth();

  const handleSendCampaign = async () => {
    try {
      const response = await axios.post(
        '/api/whatsapp/campaign/',
        { /* data */ },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      // handle response
    } catch (error) {
      console.error('Campaign error:', error);
    }
  };

  return (
    // ... component JSX
  );
}
```

### Option 2: Setup Axios Interceptor

```typescript
// src/api/axios.ts

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/'
});

// Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

Then update component:

```typescript
// MarketingCampaignPage.tsx

import apiClient from '../api/axios';

// In handleSendCampaign:
const response = await apiClient.post('/whatsapp/campaign/', {
  contacts,
  campaign_brief: formData.campaign_brief,
  personalize: formData.personalize,
  delay_seconds: formData.delay_seconds
});
```

---

## Styling: Customize for Your Theme

### Update Tailwind Classes

If your app uses different colors/styles:

```typescript
// Replace in MarketingCampaignPage.tsx:

// Change:
className="bg-blue-600 text-white"

// To match your theme:
className="bg-primary text-primary-foreground"
```

### Dark Mode Support

Add dark mode:

```typescript
// In MarketingCampaignPage.tsx

export default function MarketingCampaignPage() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* ... component */}
    </div>
  );
}
```

---

## Testing: Before Going Live

### Test 1: Check Component Renders

```bash
# Make sure no import errors
npm run build

# Should show:
# ✔ Generated an optimized production build
```

### Test 2: Verify API Connection

```bash
# From browser console
curl -X GET http://localhost:8000/api/whatsapp/models/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Test Campaign Creation

1. Navigate to `/campaigns` route
2. Upload test CSV with 2-3 contacts
3. Write test message
4. Click "Send Campaign"
5. Should show results immediately

---

## Troubleshooting Integration

### Issue: "Module not found"
```bash
# Make sure file exists
ls -la src/pages/MarketingCampaignPage.tsx

# Clear cache and rebuild
rm -rf node_modules/.cache
npm run build
```

### Issue: "Cannot GET /campaigns"
```typescript
// Make sure route is registered in App.tsx
// Check that MarketingCampaignPage is imported
import MarketingCampaignPage from './pages/MarketingCampaignPage';

// And route is added
<Route path="/campaigns" element={<MarketingCampaignPage />} />
```

### Issue: "API calls failing"
```typescript
// Check:
1. REACT_APP_API_URL is correct
2. Backend server is running
3. Token is valid
4. CORS is enabled on backend

// Enable debug logging:
localStorage.setItem('DEBUG', '*');
```

### Issue: "Styling looks broken"
```bash
# Make sure Tailwind is configured
npm run build

# Check tailwind.config.js includes your src directory
# Should have: content: ['./src/**/*.{js,jsx,ts,tsx}']
```

---

## Production Deployment

### Step 1: Update API URL for Production

```env
# .env.production
REACT_APP_API_URL=http://129.159.227.138:8000/api/
```

### Step 2: Build for Production

```bash
npm run build
```

### Step 3: Deploy to Netlify

```bash
npm run build
# Push to GitHub or deploy directly
```

### Step 4: Verify in Production

```bash
# Test on live site
curl https://your-domain.com/api/whatsapp/models/
```

---

## Summary: Integration Checklist

- [ ] Add route to React Router
- [ ] Add navigation link
- [ ] Configure API base URL
- [ ] Setup authentication/token handling
- [ ] Test locally
- [ ] Update styling if needed
- [ ] Test with real backend
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Gather user feedback

---

**That's it!** Your MarketingCampaignPage is now integrated and ready to use! 🎉
