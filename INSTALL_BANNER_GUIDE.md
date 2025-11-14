# Install Banner Quick Reference

## 📱 What's the Install Banner?

It's a **smart notification** that appears on the bottom-left of your app (on desktop) or top of screen (mobile) asking users to install your app as a native app on their home screen.

---

## 🎯 When Does It Appear?

### ✅ Shows Banner If:
- User is on a new device/browser
- App is NOT already installed
- User hasn't dismissed it more than 2 times
- It's been more than 24 hours since last dismissal
- User has waited 3 seconds on the page

### ❌ Does NOT Show If:
- App is already installed (detected via standalone mode)
- User dismissed it 2+ times (waits 24 hours)
- User is currently within the 24-hour waiting period
- Browser doesn't support PWA (very rare)

---

## 👥 User Journey

```
1. User opens app
   ↓
2. Waits 3 seconds
   ↓
3. Blue banner appears at bottom
   "Install Trek & Stay"
   "Get quick access, offline support & push notifications!"
   ↓
   ├─ User clicks "Install" 
   │  └─ Native OS install dialog shows
   │     └─ User confirms
   │        └─ App installed! ✅
   │
   ├─ User clicks "X" (dismiss)
   │  └─ Banner closes
   │  └─ Will appear again in 24 hours
   │  └─ Unless dismissed 2+ times
   │
   └─ User ignores banner
      └─ Closes after 30 seconds
      └─ User can install from browser menu
```

---

## 🖥️ Desktop Experience

**Chrome/Edge on Windows/Mac:**

1. App is open in browser
2. Blue banner slides up from bottom-left after 3 seconds
3. Shows Trek & Stay logo + phone icon (📲)
4. Two buttons:
   - **Install** (white) - Opens native install dialog
   - **X** - Dismisses banner
5. Helpful tip: "Or click the install icon in your browser address bar"

**What happens after install:**
- App removes browser UI
- Shows like native app
- Appears in app switcher
- Can pin to taskbar
- Offline functionality works

---

## 📱 Mobile Experience

**iOS (Safari):**
- Banner appears at bottom
- Or user taps Share menu → "Add to Home Screen"
- App appears on home screen just like App Store app
- Full-screen experience

**Android (Chrome):**
- Banner appears at top
- Click "Install"
- Native Android install dialog
- App installs with app icon
- Works offline

---

## 🔧 Technical Details

### Banner Component
- **File:** `src/components/pwa/InstallBanner.tsx`
- **Styling:** `src/components/pwa/InstallBanner.css`
- **Hook:** `useInstallTracker()`
- **Storage:** localStorage (pwa_install_status)

### Detection Logic
```javascript
// Checks these conditions:
- window.navigator.standalone === true  // iOS
- display-mode: standalone               // Android
- display-mode: fullscreen               // Fullscreen PWA
- display-mode: minimal-ui               // Minimal UI
```

### Dismissal Tracking
- Max 2 dismissals before hiding for 24 hours
- Counter tracked in localStorage
- Resets after 24-hour window
- Shows message: "This prompt will appear X more time(s)"

---

## 📊 What Gets Tracked

Every action is logged to Google Analytics + Backend:

```
✓ install_banner_shown
✓ install_accepted
✓ install_declined
✓ install_banner_dismissed
✓ app_installed
✓ install_attempt
✓ install_error
```

View in: Google Analytics → Realtime → Events

---

## ✅ Testing Checklist

- [ ] Open app in Chrome on desktop
- [ ] Wait 3 seconds for banner
- [ ] Banner appears bottom-left with blue gradient
- [ ] Icon bounces (📲 animation)
- [ ] Can click "Install" button
- [ ] Can click "X" to dismiss
- [ ] Helpful tip shows: "Or click install icon..."
- [ ] Open Dev Tools → Console
- [ ] See logs: "📲 Install prompt captured..."
- [ ] Installation works and removes browser UI
- [ ] App appears on home screen/taskbar
- [ ] Can launch from app switcher
- [ ] Offline mode works

---

## 🐛 Debug Commands

Run in browser console (F12):

```javascript
// Check install status
localStorage.getItem('pwa_install_status')

// Clear all PWA data and reset
localStorage.clear()
location.reload()

// Check if currently installed
window.navigator.standalone  // true if iOS PWA installed

// Check display mode
window.matchMedia('(display-mode: standalone)').matches

// Listen for install events
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Install prompt event:', e)
})

window.addEventListener('appinstalled', (e) => {
  console.log('App installed!', e)
})
```

---

## 🎨 Visual Design

### Banner Layout
```
┌──────────────────────────────────────────┐
│  📲  Install Trek & Stay      [Install] [X]  │
│      Get quick access, offline support...     │
│                                              │
│  💡 Or click the install icon in address bar │
│  This prompt will appear 1 more time(s)      │
└──────────────────────────────────────────┘
```

### Colors
- Background: Blue gradient (#007AFF → #0051D5)
- Text: White
- Buttons: White install, transparent dismiss
- Backdrop: Semi-transparent dark overlay

### Animation
- Slide up from bottom (400ms)
- Bounce icon (continuous)
- Smooth transitions on button hover

---

## 🚀 Deployment Notes

### Requirements:
- ✅ HTTPS only (PWA requirement)
- ✅ Valid manifest.json
- ✅ Service worker registered
- ✅ App icons (192x192, 512x512)
- ✅ Theme color defined

### Netlify Deployment
- Automatically HTTPS ✓
- manifest.json included ✓
- Service worker generated ✓
- All ready to go!

### Testing Deployment
1. Deploy to Netlify
2. Open https://trekandstay.com
3. Open on different device (clears cache)
4. Wait 3 seconds for banner
5. Test install flow

---

## ❓ FAQ

**Q: Can I customize the banner?**
A: Yes! Edit `InstallBanner.tsx` and `InstallBanner.css` for colors, text, timing, etc.

**Q: Does it work on all browsers?**
A: Chrome, Edge, Opera, Firefox support it. Safari has limited support (iOS uses Share menu).

**Q: Can I turn it off?**
A: Yes, remove `<InstallBanner />` from `App.tsx` or modify shouldShowBanner() logic.

**Q: How do I reset the 24-hour timer?**
A: Clear localStorage in DevTools or user clears browser data.

**Q: Will it show again if user dismisses?**
A: Yes, after 24 hours or after clearing browser storage.

**Q: Does it affect desktop users who don't install?**
A: No, they use the normal web version. Only shows banner, doesn't force anything.

**Q: What if user closes browser?**
A: Banner state persists in localStorage, so same settings apply next visit.

---

## 🎯 Success Goals

- 10-20% of users install app within first month
- Reduce browser UI clutter with standalone mode
- Increase daily active users (DAU)
- Better offline experience
- App store-like experience

---

*Last Updated: November 5, 2024*
*Status: ✅ Live and Monitoring*
