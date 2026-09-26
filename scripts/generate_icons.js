// scripts/generate_icons.js
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcData = chunk.subarray(4, 8 + len);
  const crcVal = crc32(crcData);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bits per channel
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const r = width * (isMaskable ? 0.48 : 0.44);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background gradient: Emerald green (#059669) to Deep Teal (#064e3b)
      const gradT = (y / height);
      let rBg = Math.round(5 + (6 - 5) * gradT);
      let gBg = Math.round(150 + (78 - 150) * gradT);
      let bBg = Math.round(105 + (59 - 105) * gradT);
      let aBg = 255;

      if (!isMaskable && dist > r) {
        // Transparent outside rounded icon
        rBg = 0;
        gBg = 0;
        bBg = 0;
        aBg = 0;
      }

      // Draw calculator/currency symbol or scale
      // Simple inner circle / card
      const innerR = width * 0.28;
      if (dist < innerR) {
        // Golden accent emblem (#F59E0B)
        rBg = 245;
        gBg = 158;
        bBg = 11;
        aBg = 255;

        // Draw inner white glyph area
        if (Math.abs(dx) < width * 0.16 && Math.abs(dy) < height * 0.16) {
          // Calculator grid look
          if (Math.abs(dx) < width * 0.12 && dy < -height * 0.04 && dy > -height * 0.12) {
            // Screen area (slate-900)
            rBg = 15; gBg = 23; bBg = 42;
          } else if (dy > -height * 0.02 && dy < height * 0.12) {
            // buttons
            const bx = Math.floor((dx + width * 0.12) / (width * 0.07));
            const by = Math.floor((dy + height * 0.02) / (height * 0.06));
            if ((bx + by) % 2 === 0) {
              rBg = 255; gBg = 255; bBg = 255;
            } else {
              rBg = 16; gBg = 185; bBg = 129;
            }
          }
        }
      }

      rawData[pxOffset] = rBg;
      rawData[pxOffset + 1] = gBg;
      rawData[pxOffset + 2] = bBg;
      rawData[pxOffset + 3] = aBg;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Write SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#064e3b" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  
  <!-- Scale & Calculator Symbol -->
  <circle cx="256" cy="256" r="170" fill="url(#gold)" opacity="0.15" />
  
  <!-- Calculator Device -->
  <rect x="156" y="116" width="200" height="280" rx="32" fill="#0f172a" stroke="#fbbf24" stroke-width="8"/>
  
  <!-- Screen -->
  <rect x="180" y="146" width="152" height="56" rx="12" fill="#1e293b"/>
  <!-- Taka / Currency glyph on screen -->
  <text x="316" y="186" font-family="system-ui, sans-serif" font-size="34" font-weight="bold" fill="#34d399" text-anchor="end">৳ ৫,৪২০</text>

  <!-- Buttons Grid -->
  <circle cx="204" cy="242" r="16" fill="#334155"/>
  <circle cx="256" cy="242" r="16" fill="#334155"/>
  <circle cx="308" cy="242" r="16" fill="#10b981"/>
  
  <circle cx="204" cy="292" r="16" fill="#334155"/>
  <circle cx="256" cy="292" r="16" fill="#334155"/>
  <circle cx="308" cy="292" r="16" fill="#f59e0b"/>

  <circle cx="204" cy="342" r="16" fill="#334155"/>
  <circle cx="256" cy="342" r="16" fill="#334155"/>
  <circle cx="308" cy="342" r="16" fill="#6366f1"/>

  <!-- Badge / Scale icon -->
  <circle cx="370" cy="370" r="44" fill="#10b981" stroke="#ffffff" stroke-width="6"/>
  <path d="M354 370 L366 382 L388 358" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

fs.writeFileSync(path.join(outDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), generatePNG(192, 192));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), generatePNG(512, 512));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), generatePNG(180, 180));

console.log('Icons generated successfully in public/');
