# Trek and Stay - PWA Deployment Guide for Netlify

## Pre-Deployment Checklist

- [ ] All dependencies installed: `npm install`
- [ ] No TypeScript errors: `npm run lint`
- [ ] Local build successful: `npm run build`
- [ ] PWA manifest valid: Check `dist/manifest.json`
- [ ] Service worker present: Check `dist/sw.js`
- [ ] Icons properly sized and present
- [ ] HTTPS enabled (Netlify provides this by default)

## Step-by-Step Deployment to Netlify

### Option 1: Using Netlify CLI (Recommended)

```bash
# Install Netlify CLI globally (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy the application
netlify deploy --prod --dir=dist

# Or for automatic deployments from Git
netlify link
```

### Option 2: Using GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "PWA Mobile Responsive - Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your repository
   - Confirm build settings (already in `netlify.toml`)
   - Click "Deploy site"

3. **Netlify will automatically**
   - Run `npm run build`
   - Deploy from the `dist` folder
   - Generate HTTPS certificate
   - Enable PWA features

### Option 3: Using Drag & Drop

```bash
# Build locally
npm run build

# Drag the `dist` folder to Netlify
# Go to app.netlify.com and drag-and-drop the dist folder
```

## Post-Deployment Verification

### 1. Check PWA Installation
```bash
# Visit your deployed site URL
# Open DevTools (F12) → Application → Manifest
# You should see:
# - ✅ manifest.json loaded
# - ✅ "Install app" option available
# - ✅ All icons present
# - ✅ start_url: "/"
# - ✅ display: "standalone"
```

### 2. Verify Service Worker
```bash
# In DevTools → Application → Service Workers
# You should see:
# - ✅ Service worker registered and active
# - ✅ Controlled by service worker
# - ✅ Update on reload disabled or enabled based on config
```

### 3. Test Installation

**On Desktop (Chrome/Edge)**
1. Look for install button in address bar or menu
2. Click "Install Trek & Stay"
3. Verify app opens in standalone window
4. Check window title and icon

**On Mobile (Android - Chrome)**
1. Visit site on Chrome
2. Look for install prompt or use menu
3. Select "Install app"
4. Verify app appears on home screen
5. Launch and check full-screen mode

**On Mobile (iOS - Safari)**
1. Visit site on Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Verify app appears on home screen
5. Launch and check full-screen mode with status bar styling

### 4. Test Offline Functionality
```bash
# With DevTools open:
# 1. Go to Network tab
# 2. Check "Offline" checkbox
# 3. Reload page - should still load from cache
# 4. Navigate between pages - should work offline
# 5. API calls should fail gracefully
```

### 5. Check Performance

```bash
# Run Lighthouse audit:
# DevTools → Lighthouse → PWA
# Expected scores:
# - PWA: 90+
# - Performance: 80+
# - Accessibility: 90+
# - Best Practices: 90+

# Specific checks:
# ✅ Web app manifest exists
# ✅ Service worker present
# ✅ Has metadata
# ✅ Works offline
# ✅ Installable
```

## Monitoring & Maintenance

### Check Deployment Logs
```bash
# View live deploy logs
netlify logs --function name

# Or in Netlify Dashboard:
# Site settings → Deploy logs
```

### Update Service Worker Version
When making updates, increment the cache version:

```javascript
// In public/sw.js
const CACHE_NAME = 'trek-stay-v2.0.1'; // Increment version

// In vite.config.ts workbox section, versions are auto-managed
```

### Monitor PWA Metrics
- Check how many users install the app
- Track app usage vs web usage
- Monitor offline functionality effectiveness
- Analyze cache hit rates

## Troubleshooting Deployment Issues

### Issue: "App won't install"
**Solution:**
- Verify manifest.json is served with correct MIME type
- Check `Content-Type: application/manifest+json` header
- Ensure site is HTTPS (not HTTP)
- Verify icons are properly sized and format

**Check:**
```bash
curl -I https://your-site.netlify.app/manifest.json
# Should show: Content-Type: application/manifest+json
```

### Issue: "Service worker not registering"
**Solution:**
- Check if `vite-plugin-pwa` is properly configured
- Verify `registerType: 'autoUpdate'` in vite config
- Check browser console for errors
- Clear browser cache and reinstall

### Issue: "Offline functionality not working"
**Solution:**
- Verify sw.js is at root level (not in subdirectory)
- Check service worker activation in DevTools
- Verify cache names match in sw.js and vite config
- Test with actual offline (not just DevTools offline)

### Issue: "Notch/safe area not respected on iPhone"
**Solution:**
- Verify `viewport-fit=cover` in meta tags
- Check CSS includes safe-area-inset values
- Test on real device (notch area may differ in simulator)
- Update viewport meta tag format if needed

### Issue: "App loads very small on iPad"
**Solution:**
- Check `viewport` meta tag doesn't have fixed width
- Verify Tailwind responsive classes are working
- Check body and #root CSS sizing
- Test on actual iPad (simulator may differ)

## Continuous Deployment Setup

### Auto-Deploy on Git Push
Netlify automatically deploys on every push to main branch.

**To deploy only specific changes:**
```bash
# Deploy specific branch
git push origin feature-branch

# Create PR to main for review before auto-deploy
```

### Scheduled Builds (Optional)
In Netlify UI:
1. Site settings → Build & deploy → Continuous deployment
2. Or set up GitHub Actions for custom triggers

## Environment Variables

If needed in the future, add env vars in Netlify UI:
1. Site settings → Build & deploy → Environment
2. Add your variables
3. Rebuild site for changes to take effect

## DNS Configuration (If custom domain)

1. Go to Site settings → Domain management
2. Add your custom domain
3. Update DNS records at your domain provider:
   ```
   CNAME: your-site.netlify.app
   ```
4. Wait for DNS propagation (up to 48 hours)
5. Netlify auto-generates SSL certificate

## Performance Optimization After Deployment

### 1. Analyze Bundle Size
```bash
npm run build -- --analyze
# Check dist folder sizes
# Optimize large dependencies
```

### 2. Monitor Core Web Vitals
- Check PageSpeed Insights
- Use DevTools Lighthouse
- Monitor real user metrics in Netlify

### 3. Cache Strategy Tuning
Review and adjust in `vite.config.ts`:
- API cache expiration time
- Image cache duration
- Font cache settings

## Deployment Monitoring Commands

```bash
# View build history
netlify builds:list

# View specific build details
netlify builds:log [BUILD_ID]

# Check site status
netlify status

# View environment variables
netlify env:list

# View site info
netlify sites:list
```

## Rollback in Case of Issues

```bash
# View deployments
netlify deploys:list

# Rollback to previous deploy
netlify deploy --alias main --dir=dist --prod

# Or in Netlify UI:
# Deployments → Select previous version → Publish deploy
```

## Security Checklist

- [ ] HTTPS enforced (Netlify default)
- [ ] Security headers configured in netlify.toml
- [ ] CSP policy set appropriately
- [ ] No sensitive data in service worker
- [ ] No hardcoded API keys
- [ ] Environment variables used for secrets

## Post-Launch Monitoring

### Week 1: Monitor for Issues
- Check for service worker errors
- Verify offline functionality
- Monitor installation rates
- Check Lighthouse scores

### Week 2-4: Optimize Performance
- Analyze real user metrics
- Adjust cache strategies if needed
- Monitor app crash reports
- Gather user feedback

### Ongoing: Maintenance
- Regular security updates
- Dependency updates
- Performance monitoring
- User engagement tracking

---

## Support & Resources

- **Netlify Docs**: https://docs.netlify.com/
- **PWA Resources**: https://web.dev/progressive-web-apps/
- **Service Worker**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Manifest Spec**: https://www.w3.org/TR/appmanifest/

---

**Version**: 2.0.0  
**Last Updated**: November 6, 2025  
**Status**: Ready for Deployment ✅
