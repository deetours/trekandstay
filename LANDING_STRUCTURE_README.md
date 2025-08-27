# Landing Page Structure

This document outlines the new separate folder structure for landing pages that keeps them completely isolated from the main web application.

## Folder Structure

```
landing/
├── components/           # Landing-specific components (re-exports)
│   ├── ErrorBoundary.ts
│   ├── modals/
│   │   └── index.ts
│   └── ui/
│       └── HeroSVGs.ts
├── hooks/               # Landing-specific hooks (re-exports)
│   └── index.ts
├── pages/               # Landing pages (re-exports)
│   └── TripLandingPage.tsx
├── store/               # Landing-specific stores (re-exports)
│   └── index.ts
├── index.css           # Landing-specific styles
├── main.tsx            # Landing entry point
└── LandingApp.tsx      # Main landing app component
```

## Key Benefits

1. **Complete Separation**: Landing pages are completely separate from the main web app
2. **No Interference**: Changes to landing pages won't affect the main application
3. **Independent Deployment**: Landing pages can be built and deployed separately
4. **Shared Components**: Uses re-exports to access main app components without duplication
5. **Optimized Builds**: Separate build process with optimized bundles

## Build Commands

### New Landing Structure
```bash
# Build the new landing page structure
npm run build:landing-new

# Preview the new landing page
npx vite preview --outDir dist-landing --port 8080
```

### Legacy Landing Structure (still available)
```bash
# Build the legacy landing page
npm run build:landing

# Preview legacy landing page
npm run preview:landing
```

## Configuration Files

- `vite.landing-new.config.ts` - Vite configuration for new landing structure
- `index-landing-new.html` - HTML template for new landing structure
- `scripts/post-build-landing-new.js` - Post-build script for deployment

## Component Re-exports

The landing folder uses re-export files to access main app components:

```typescript
// landing/components/ErrorBoundary.ts
export { ErrorBoundary } from '../../src/components/ErrorBoundary';

// landing/store/index.ts
export { useLeadCaptureStore } from '../../src/store/leadCaptureStore';
```

This approach:
- Avoids code duplication
- Maintains single source of truth
- Allows landing pages to benefit from main app improvements
- Keeps the landing structure clean and manageable

## Landing-Specific Styles

The `landing/index.css` file contains:
- Landing-specific CSS overrides
- Custom animations for landing pages
- Fonts and typography specific to landing experience
- Utility classes for landing page components

## Deployment

The new structure is fully compatible with:
- Netlify (with automatic index.html renaming)
- Vercel
- Firebase Hosting
- Custom servers

## Migration Path

1. **Phase 1**: Use new structure for new landing pages
2. **Phase 2**: Gradually migrate existing landing pages
3. **Phase 3**: Deprecate old landing structure when all pages are migrated

## Usage

To create a new landing page:

1. Add the page component to `landing/pages/`
2. Add routing in `landing/LandingApp.tsx`
3. Use the build command: `npm run build:landing-new`
4. Deploy the `dist-landing` folder