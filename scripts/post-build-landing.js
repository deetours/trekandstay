import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Post-build script to rename index-landing.html to index.html
const distDir = path.join(__dirname, '..', 'dist-landing');
const oldPath = path.join(distDir, 'index-landing.html');
const newPath = path.join(distDir, 'index.html');

if (fs.existsSync(oldPath)) {
  fs.renameSync(oldPath, newPath);
  console.log('✅ Renamed index-landing.html to index.html for Netlify deployment');
} else {
  console.log('❌ index-landing.html not found in dist-landing directory');
}