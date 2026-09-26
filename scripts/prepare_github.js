import fs from 'fs';
import path from 'path';

const rootDir = path.resolve('.');
const distDir = path.resolve('dist');

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist! Please run vite build first.');
  process.exit(1);
}

// Ensure root assets dir
const targetAssetsDir = path.join(rootDir, 'assets');
if (!fs.existsSync(targetAssetsDir)) {
  fs.mkdirSync(targetAssetsDir, { recursive: true });
}

// Copy dist/assets to /assets
const distAssets = path.join(distDir, 'assets');
if (fs.existsSync(distAssets)) {
  const files = fs.readdirSync(distAssets);
  for (const f of files) {
    fs.copyFileSync(path.join(distAssets, f), path.join(targetAssetsDir, f));
    console.log(`Copied ${f} -> assets/${f}`);
  }
}

// Copy root PWA and fallback files
const rootFilesToCopy = [
  'sw.js',
  'registerSW.js',
  'manifest.webmanifest',
  '404.html',
  'icon.svg',
  'apple-touch-icon.png',
  'pwa-192x192.png',
  'pwa-512x512.png',
  'pwa-maskable-512x512.png'
];

for (const rf of rootFilesToCopy) {
  const src = fs.existsSync(path.join(distDir, rf))
    ? path.join(distDir, rf)
    : path.join(rootDir, 'public', rf);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(rootDir, rf));
    console.log(`Copied ${rf} to root`);
  }
}

// Copy workbox files
const distFiles = fs.readdirSync(distDir);
for (const f of distFiles) {
  if (f.startsWith('workbox-') && f.endsWith('.js')) {
    fs.copyFileSync(path.join(distDir, f), path.join(rootDir, f));
    console.log(`Copied ${f} to root`);
  }
}

console.log('GitHub Pages root distribution prepared successfully!');
