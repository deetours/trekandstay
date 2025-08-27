# 🏔️ Trek and Stay - Standalone Landing Pages

## 🚀 Quick Deploy

These are standalone, crazy animated landing pages for each trip with integrated UPI payment and popup lead capture.

### 📦 Build & Deploy

```bash
# Build landing pages
npm run build:landing

# Preview locally
npm run preview:landing

# Deploy to Netlify
# 1. Upload dist-landing folder to Netlify
# 2. Or connect your Git repo with build command: npm run build:landing
```

### 🔗 Landing Page URLs

After deployment, your trips will be available at:

- `/land/adventure-maharashtra-5days-trek` - Adventure Maharashtra 5 Days Trek
- `/land/kaalu-waterfall-harishchandragad-sandhan-valley-5d` - Kaalu Waterfall Adventure  
- `/land/dudhsagar-trek-3d` - Dudhsagar Trek
- `/land/kedarnath-7d` - Kedarnath Spiritual Journey
- `/land/kumbhe-waterfall-rappelling-5d` - Kumbhe Waterfall Rappelling
- `/land/maharashtra-waterfall-edition-4d` - Maharashtra Waterfall Edition 4D
- `/land/maharashtra-waterfall-edition-5d` - Maharashtra Waterfall Edition 5D

### 🎯 Features

#### 🎨 Crazy Animations
- Hero section with gradient backgrounds and floating elements
- Animated cards with hover effects
- Popup modals with spring animations
- Floating action buttons with pulsing effects
- Rotating gift icons and moving elements

#### 💳 UPI Payment Integration  
- Instant UPI payment links
- QR code generation
- Copy payment details
- Payment confirmation flow
- No external payment gateway needed

#### 🎯 Lead Capture Popup
- Smart triggers based on user interaction
- Time-based popup (30 seconds)
- Scroll-based trigger (60% scroll)
- Multi-step lead capture form
- WhatsApp integration ready

#### 📱 Mobile Optimized
- Responsive design
- Sticky bottom CTA bar
- Touch-friendly interactions
- WhatsApp quick contact

### 🛠️ Configuration

#### Firebase Setup
Update `src/firebase.ts` with your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

#### UPI Configuration
Update UPI details in `src/pages/TripLandingPage.tsx`:
```javascript
const generateUPILink = () => {
  const merchantVPA = 'your-upi-id@bank'; // Change this
  const merchantName = 'Your Business Name';   // Change this
  // ...
};
```

#### Contact Number
Update contact number in Firestore trip documents or directly in the component.

### 📊 Analytics & Tracking

The landing pages include interaction tracking:
- Button clicks
- Scroll behavior  
- Lead capture events
- Payment interactions

Add your analytics code in `index-landing.html`.

### 🎨 Customization

#### Colors & Branding
Edit gradients and colors in `src/pages/TripLandingPage.tsx`:
- Primary: `emerald-500` to `teal-500`
- Secondary: `purple-500` to `pink-500`
- Background: `emerald-900` via `cyan-900`

#### Content
All trip content is fetched from Firestore. Update trip documents to change:
- Trip details
- Pricing
- Itinerary  
- Highlights
- Batch dates

### 🚀 Performance

- Built with Vite for fast loading
- Optimized bundle size
- Lazy loading for icons
- Efficient animations with Framer Motion

### 📱 Sharing

Landing pages are optimized for sharing:
- Open Graph meta tags
- WhatsApp preview optimization
- SEO-friendly URLs
- Social media ready

### 🔧 Development

```bash
# Start development server with regular app
npm run dev

# Test landing pages at:
# http://localhost:5173/land/your-trip-slug
```

### 📞 Support

- WhatsApp: 9902937730
- Email: Contact via the landing page forms
- Direct booking through the pages

---

## 🎯 Marketing Tips

1. **Direct Links**: Share specific trip URLs for targeted campaigns
2. **QR Codes**: Generate QR codes pointing to trip landing pages  
3. **Social Media**: Optimized for sharing on WhatsApp, Instagram, Facebook
4. **Email Campaigns**: Perfect for email marketing with direct booking
5. **Influencer Campaigns**: Give influencers specific landing page links

## 🚀 Next Steps

1. Deploy to Netlify or Vercel
2. Set up custom domain
3. Configure analytics
4. Test payment flow
5. Launch marketing campaigns!

---

**Ready to convert visitors into adventurers! 🏔️✨**