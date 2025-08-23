# Firebase/Firestore Setup Guide for RAG Knowledge Base

## Quick Setup Instructions

### 1. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Firestore Database in your project
4. Go to Project Settings > Service Accounts
5. Generate a new private key (JSON file)

### 2. Environment Configuration

**Option A: Service Account Key File (Recommended)**
```bash
# Add to your .env file
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/your/serviceAccountKey.json
```

**Option B: Service Account JSON as Environment Variable**
```bash
# Add the entire JSON as a single environment variable
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project",...}'
```

### 3. Firestore Collections Structure

The system expects these collections:

#### `faqs` Collection
```javascript
// Document structure
{
  question: "What should I pack for a trek?",
  answer: "Essential items include...",
  category: "preparation", // preparation, booking, safety, policy
  active: true,
  priority: 1, // 1=high, 2=medium, 3=low
  updated_at: firestore.Timestamp.now()
}
```

#### `trips` Collection
```javascript
// Document structure
{
  title: "Kedarkantha Trek",
  location: "Uttarakhand",
  duration: "6 days",
  difficulty: "moderate", // easy, moderate, difficult
  price: "₹12,000",
  description: "Beautiful winter trek...",
  highlights: ["Snow trek", "Panoramic views"],
  included: ["Meals", "Guide", "Transport"],
  itinerary: {
    "Day 1": "Arrival and briefing",
    "Day 2": "Trek to base camp"
  },
  status: "active", // active, inactive
  updated_at: firestore.Timestamp.now()
}
```

#### `company_info` Collection
```javascript
// Document structure
{
  title: "Cancellation Policy",
  content: "Our cancellation policy...",
  type: "policy", // policy, guideline, info
  category: "general",
  active: true,
  updated_at: firestore.Timestamp.now()
}
```

#### `reviews` Collection
```javascript
// Document structure
{
  customer_name: "John Doe",
  review_text: "Amazing experience!",
  rating: 5, // 1-5 stars
  trip_name: "Kedarkantha Trek",
  approved: true,
  created_at: firestore.Timestamp.now()
}
```

### 4. Testing the Integration

#### Using the Admin Panel
1. Access `/admin/` and login as superuser
2. Use API endpoints:
   - `POST /api/rag/test-faqs/` - Add sample FAQs
   - `GET /api/rag/firestore-stats/` - Check connection
   - `POST /api/rag/sync-firestore/` - Force sync

#### API Endpoints
- **Health Check**: `GET /api/rag/health/`
- **Firestore Stats**: `GET /api/rag/firestore-stats/`
- **Force Sync**: `POST /api/rag/sync-firestore/` (Admin only)
- **Add Test FAQs**: `POST /api/rag/test-faqs/` (Admin only)

### 5. Automatic Sync Features

- **Startup Sync**: Automatically loads Firestore data on first startup
- **Periodic Sync**: Checks for updates every hour
- **Query Sync**: Checks for updates before processing each query
- **Manual Sync**: Admin can force sync through API

### 6. Fallback Behavior

If Firestore is not configured or unavailable:
- System falls back to basic hardcoded knowledge
- Chatbot continues to work with essential information
- No errors thrown to users
- Admin notifications in logs

### 7. Development Mode (Without Firebase)

For development without Firebase setup:
- System automatically uses basic knowledge
- All Firestore endpoints return appropriate messages
- Chatbot works normally with fallback data
- No configuration required

### 8. Production Deployment

1. Set up Firebase service account
2. Add environment variables to your hosting platform
3. Ensure Firestore security rules allow server access
4. Monitor sync logs for any issues

## Sample Firestore Rules

```javascript
// Allow read/write from server with service account
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow server access (with service account)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow public read for some collections (optional)
    match /faqs/{faq} {
      allow read: if resource.data.active == true;
    }
  }
}
```

The system is designed to work seamlessly with or without Firestore, providing maximum flexibility for your deployment needs!
