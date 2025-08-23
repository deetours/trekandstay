import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
