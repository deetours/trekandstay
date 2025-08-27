import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-landing',
    rollupOptions: {
      input: resolve(__dirname, 'index-landing-new.html')
    }
  },
  resolve: {
    alias: {
      '@landing': resolve(__dirname, 'landing'),
      '@src': resolve(__dirname, 'src')
    }
  }
});