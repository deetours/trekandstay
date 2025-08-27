# 🚀 DEPLOYMENT CHECKLIST - Landing Pages

## ✅ **Pre-Deployment Checklist**

### 1. **Build Test**
- [ ] Run `npm run build:landing`
- [ ] Verify `dist-landing/index.html` exists
- [ ] Check build completes without errors
- [ ] Confirm file size is reasonable (<1MB)

### 2. **Local Preview Test**
- [ ] Run `npm run preview:landing`
- [ ] Test homepage at `http://localhost:4174/`
- [ ] Test trip page: `http://localhost:4174/land/dudhsagar-trek-3d`
- [ ] Test short URL: `http://localhost:4174/dudhsagar-trek-3d`
- [ ] Verify all animations work
- [ ] Test mobile responsive design

### 3. **Content Verification**
- [ ] Firebase connection working
- [ ] Trip data loading from Firestore
- [ ] UPI payment details configured
- [ ] Contact numbers correct (9902937730)
- [ ] All trip slugs match Firestore data

## 🌐 **Netlify Deployment**

### Method 1: Drag & Drop (Easiest)
1. [ ] Build: `npm run build:landing`
2. [ ] Open Netlify dashboard
3. [ ] Drag `dist-landing` folder to deployment area
4. [ ] Wait for deployment (2-3 minutes)
5. [ ] Test the provided URL

### Method 2: Git Integration (Recommended)
1. [ ] Push code to GitHub/GitLab
2. [ ] Connect repository to Netlify
3. [ ] Set build command: `npm run build:landing`
4. [ ] Set publish directory: `dist-landing`
5. [ ] Deploy automatically

### Method 3: CLI Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
npm run build:landing
netlify deploy --prod --dir=dist-landing
```

## 🧪 **Post-Deployment Testing**

### 1. **URL Testing**
- [ ] Homepage loads: `https://yoursite.netlify.app/`
- [ ] Trip page works: `/land/adventure-maharashtra-5days-trek`
- [ ] Short URLs work: `/dudhsagar-trek-3d`
- [ ] Random URL redirects properly: `/random-page`

### 2. **Functionality Testing**
- [ ] Book Now button opens modal
- [ ] Lead capture popup triggers
- [ ] UPI payment flow works
- [ ] WhatsApp integration works
- [ ] Mobile sticky bar appears
- [ ] Floating action buttons work

### 3. **Performance Testing**
- [ ] Page loads in under 3 seconds
- [ ] Animations are smooth
- [ ] No console errors
- [ ] Mobile performance good

### 4. **SEO & Sharing Testing**
- [ ] Page title appears correctly
- [ ] Meta descriptions present
- [ ] Open Graph tags working
- [ ] WhatsApp preview looks good
- [ ] Social media sharing works

## 🔧 **Troubleshooting**

### If "Page Not Found" Error:
1. [ ] Check Netlify build logs
2. [ ] Verify `index.html` exists in deploy
3. [ ] Check `_redirects` file is present
4. [ ] Clear browser cache (Ctrl+F5)
5. [ ] Wait 5 minutes for DNS propagation

### If Build Fails:
1. [ ] Check Node.js version (18+)
2. [ ] Verify all dependencies installed
3. [ ] Check TypeScript errors
4. [ ] Verify Firebase configuration

### If Payments Don't Work:
1. [ ] Update UPI ID in code
2. [ ] Test UPI links manually
3. [ ] Check mobile UPI app integration
4. [ ] Verify QR code generation

## 📱 **Mobile Testing**

- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Verify touch interactions
- [ ] Check sticky elements
- [ ] Test UPI app opening
- [ ] Verify WhatsApp integration

## 🎯 **Marketing Preparation**

### 1. **URL Collection**
- [ ] Copy all trip URLs
- [ ] Create short links if needed
- [ ] Generate QR codes
- [ ] Prepare sharing text

### 2. **Analytics Setup**
- [ ] Add Google Analytics (optional)
- [ ] Set up conversion tracking
- [ ] Configure goal funnels
- [ ] Test event tracking

### 3. **Content Review**
- [ ] Check all pricing is correct
- [ ] Verify contact information
- [ ] Review trip descriptions
- [ ] Confirm batch dates

## ✅ **Final Launch Checklist**

- [ ] All URLs tested and working
- [ ] Payment flow tested
- [ ] Mobile experience verified
- [ ] Contact details confirmed
- [ ] Team notified of new URLs
- [ ] Marketing materials updated
- [ ] Social media posts scheduled

---

## 🎉 **Ready to Launch!**

Once all items are checked:
1. **Share URLs** with your team
2. **Start marketing campaigns**
3. **Monitor conversion rates**
4. **Collect customer feedback**
5. **Scale successful campaigns**

**Your landing pages are ready to convert visitors into adventurers! 🏔️💰✨**