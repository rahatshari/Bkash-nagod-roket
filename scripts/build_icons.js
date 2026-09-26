import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  const targets = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'pwa-maskable-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 }
  ];

  for (const t of targets) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(t.size, t.size)
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();

    // write to public
    fs.writeFileSync(path.resolve('public', t.name), pngBuffer);
    // write to root
    fs.writeFileSync(path.resolve('.', t.name), pngBuffer);
    console.log(`Generated ${t.name} (${t.size}x${t.size}, ${pngBuffer.length} bytes)`);
  }
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
