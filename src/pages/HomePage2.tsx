'use client';

import React from 'react';
import { HeroSectionOptimized } from '../components/sections/HeroSectionOptimized';
import { TrustStripOptimized } from '../components/sections/TrustStripOptimized';
import { VideoSectionOptimized } from '../components/sections/VideoSectionOptimized';
// import { ValueProps } from '../components/sections/ValueProps'; // COMMENTED OUT: Not needed in preview
import { CTASectionOptimized } from '../components/sections/CTASectionOptimized';

/**
 * HOMEPAGE 2 - OPTIMIZED TEST PAGE
 * 
 * This is a test/staging page for the new optimized homepage design.
 * All components have been redesigned for:
 * 
 * ✅ Better performance (LCP, CLS, FID)
 * ✅ Improved visual hierarchy
 * ✅ Better spacing and typography
 * ✅ Smooth interactions
 * ✅ Mobile-first responsive design
 * ✅ Brand consistency
 * 
 * Structure:
 * 1. Hero Section - Eye-catching intro with animated background
 * 2. Trust Strip - Social proof with 5 key indicators
 * 3. Video Section - Customer testimonials/adventure highlights
 * 4. Why Travel With Us - Value propositions with animated cards
 * 5. Featured Destinations - Destination cards (using existing component)
 * 6. CTA Section - Final call-to-action to book
 * 7. Footer - (using existing component)
 * 
 * Performance Targets:
 * - LCP: <1.2s (currently estimated 2.5s)
 * - CLS: <0.05 (currently estimated 0.15)
 * - FID: <50ms (currently estimated 200ms)
 * 
 * Testing Checklist:
 * □ Test on mobile (360px, 375px, 414px)
 * □ Test on tablet (768px, 1024px)
 * □ Test on desktop (1440px, 1920px)
 * □ Run Lighthouse audit
 * □ Check all animations smooth
 * □ Verify all links work
 * □ Test form submissions
 * □ Check keyboard navigation
 * □ Test on slow 3G network
 * □ Verify all images load
 */

export default function HomePage2() {
  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <HeroSectionOptimized />

      {/* Trust Strip */}
      <TrustStripOptimized />

      {/* Video Section */}
      <VideoSectionOptimized />

      {/* Why Travel With Us - COMMENTED OUT: Not needed in preview */}
      {/* <ValueProps /> */}

      {/* CTA Section */}
      <CTASectionOptimized />

      {/* Footer */}
      {/* TODO: Import and use optimized Footer when ready */}
      <footer className="bg-neutral-900 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Destinations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Treks</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-800 text-center text-neutral-400 text-sm">
            <p>&copy; 2024 Trek & Stay. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Performance Monitoring Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && 'web-vital' in window) {
              const { getCLS, getFID, getFCP, getLCP, getTTFB } = window['web-vital'];
              getCLS(console.log);
              getFID(console.log);
              getFCP(console.log);
              getLCP(console.log);
              getTTFB(console.log);
            }
          `,
        }}
      />
    </div>
  );
}
