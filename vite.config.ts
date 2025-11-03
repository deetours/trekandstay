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
        start_url: '/',
        scope: '/',
        
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
            src: '/screenshots/wide-1.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Trek listing'
          }
        ],
        
        categories: ['travel', 'lifestyle'],
        
        shortcuts: [
          {
            name: 'Book Trek',
            short_name: 'Book',
            description: 'Book your next trek',
            url: '/book',
            icons: [{ src: '/shortcuts/book.png', sizes: '96x96' }]
          },
          {
            name: 'My Bookings',
            short_name: 'Bookings',
            description: 'View your trek bookings',
            url: '/my-bookings',
            icons: [{ src: '/shortcuts/bookings.png', sizes: '96x96' }]
          },
          {
            name: 'Ask AI Bot',
            short_name: 'AI Bot',
            description: 'Chat with our AI',
            url: '/chat',
            icons: [{ src: '/shortcuts/chat.png', sizes: '96x96' }]
          }
        ]
      },
      
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2}'],
        globIgnores: ['**/node_modules/**/*', '**/.git/**/*'],
        
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 3600
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 604800
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 31536000
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
