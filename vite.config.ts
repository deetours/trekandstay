import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      
      manifest: {
        name: 'Trek and Stay Adventures',
        short_name: 'Trek & Stay',
        description: 'Book amazing trekking adventures with RAG AI chatbot and WhatsApp support',
        theme_color: '#007AFF',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        launch_handler: {
          client_mode: ['navigate-new', 'auto']
        },
        
        icons: [
          {
            src: '/logo-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/logo-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        
        screenshots: [
          {
            src: '/screenshots/narrow-1.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Trek booking interface'
          },
          {
            src: '/screenshots/narrow-2.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Trek details'
          },
          {
            src: '/screenshots/wide-1.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Trek listing'
          }
        ],
        
        categories: ['travel', 'lifestyle'],
        prefer_related_applications: false,
        
        shortcuts: [
          {
            name: 'Book Trek',
            short_name: 'Book',
            description: 'Book your next trek',
            url: '/book?mode=pwa',
            icons: [{ src: '/shortcuts/book.png', sizes: '96x96' }]
          },
          {
            name: 'My Bookings',
            short_name: 'Bookings',
            description: 'View your trek bookings',
            url: '/my-bookings?mode=pwa',
            icons: [{ src: '/shortcuts/bookings.png', sizes: '96x96' }]
          },
          {
            name: 'Ask AI Bot',
            short_name: 'AI Bot',
            description: 'Chat with our AI',
            url: '/chat?mode=pwa',
            icons: [{ src: '/shortcuts/chat.png', sizes: '96x96' }]
          }
        ]
      },
      
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2}'],
        globIgnores: ['**/node_modules/**/*', '**/.git/**/*'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        
        runtimeCaching: [
          // API endpoints - NetworkFirst for fresh data
          {
            urlPattern: /^https?:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache-v1',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 3600
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // Images - CacheFirst with long expiration
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache-v1',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 604800 // 7 days
              }
            }
          },
          // Cloudinary - CacheFirst
          {
            urlPattern: /^https:\/\/.*\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-cache-v1',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 604800 // 7 days
              }
            }
          },
          // Google Fonts - CacheFirst with very long expiration
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-v1',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 31536000 // 1 year
              }
            }
          },
          // CDN resources - StaleWhileRevalidate for balance
          {
            urlPattern: /^https:\/\/cdn\..*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cdn-cache-v1',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 604800 // 7 days
              }
            }
          }
        ]
      },
      
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
  },
  resolve: {
    dedupe: ['firebase'],
    alias: {
      // Ensure single firebase instance (avoid multiple node_modules copies via symlinks)
      firebase: 'firebase'
    }
  }
});
