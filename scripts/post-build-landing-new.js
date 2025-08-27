import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const distPath = resolve('dist-landing');
const indexPath = resolve(distPath, 'index-landing-new.html');
const targetPath = resolve(distPath, 'index.html');

try {
  // Read the built HTML file
  const htmlContent = readFileSync(indexPath, 'utf-8');
  
  // Write it as index.html for Netlify deployment
  writeFileSync(targetPath, htmlContent);
  
  console.log('✅ Renamed index-landing-new.html to index.html for Netlify deployment');
} catch (error) {
  console.error('❌ Post-build process failed:', error);
  process.exit(1);
}