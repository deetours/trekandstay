import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Landing pages specific build config
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-landing',
    rollupOptions: {
      input: resolve(__dirname, 'index-landing.html'),
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'firebase/app',
      'firebase/firestore',
    ],
  },
});