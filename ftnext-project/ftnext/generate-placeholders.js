const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const FRAME_COUNT = 180;
const WIDTH = 1600;
const HEIGHT = 900;

async function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function createFrameSVG(frameNum, total) {
  const progress = frameNum / total;
  const r1 = 11, g1 = 14, b1 = 20; // onyx
  const r2 = 19, g2 = 24, b2 = 34; // slate
  const r = Math.round(r1 + (r2 - r1) * progress);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const b = Math.round(b1 + (b2 - b1) * progress);
  // Add a subtle moving element to distinguish frames
  const circleX = 200 + (1200 * progress);
  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="rgb(${r},${g},${b})"/>
    <circle cx="${circleX}" cy="450" r="60" fill="none" stroke="#C91A25" stroke-width="2" opacity="0.6"/>
    <circle cx="${circleX}" cy="450" r="30" fill="#C91A25" opacity="0.3"/>
    <text x="${WIDTH/2}" y="${HEIGHT/2 - 40}" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#E2E8F0" opacity="0.15">FTNEXT</text>
    <text x="${WIDTH/2}" y="${HEIGHT/2 + 30}" text-anchor="middle" font-family="monospace" font-size="24" fill="#94A3B8" opacity="0.4">Frame ${String(frameNum).padStart(4, '0')} / ${total}</text>
  </svg>`;
}

function createPosterSVG() {
  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0B0E14"/>
        <stop offset="100%" style="stop-color:#131822"/>
      </linearGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
    <text x="${WIDTH/2}" y="${HEIGHT/2 - 20}" text-anchor="middle" font-family="sans-serif" font-size="72" font-weight="bold" fill="#E2E8F0">FTNEXT</text>
    <text x="${WIDTH/2}" y="${HEIGHT/2 + 40}" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#94A3B8">Global Logistics &amp; Shipping</text>
    <line x1="${WIDTH/2 - 100}" y1="${HEIGHT/2 + 60}" x2="${WIDTH/2 + 100}" y2="${HEIGHT/2 + 60}" stroke="#C91A25" stroke-width="3"/>
  </svg>`;
}

function createServiceIcon(name) {
  const icons = {
    'ship-owners': '<path d="M12 32 L32 16 L52 32 L52 48 L12 48 Z" stroke="#E2E8F0" fill="none" stroke-width="2"/><line x1="32" y1="8" x2="32" y2="16" stroke="#E2E8F0" stroke-width="2"/><line x1="24" y1="48" x2="24" y2="40" stroke="#E2E8F0" stroke-width="2"/><line x1="40" y1="48" x2="40" y2="40" stroke="#E2E8F0" stroke-width="2"/>',
    'charterer': '<rect x="12" y="20" width="40" height="28" rx="3" stroke="#E2E8F0" fill="none" stroke-width="2"/><line x1="12" y1="30" x2="52" y2="30" stroke="#E2E8F0" stroke-width="2"/><line x1="22" y1="12" x2="22" y2="20" stroke="#E2E8F0" stroke-width="2"/><line x1="42" y1="12" x2="42" y2="20" stroke="#E2E8F0" stroke-width="2"/>',
    'technical': '<circle cx="32" cy="32" r="18" stroke="#E2E8F0" fill="none" stroke-width="2"/><circle cx="32" cy="32" r="6" stroke="#E2E8F0" fill="none" stroke-width="2"/><line x1="32" y1="8" x2="32" y2="14" stroke="#E2E8F0" stroke-width="3"/><line x1="32" y1="50" x2="32" y2="56" stroke="#E2E8F0" stroke-width="3"/><line x1="8" y1="32" x2="14" y2="32" stroke="#E2E8F0" stroke-width="3"/><line x1="50" y1="32" x2="56" y2="32" stroke="#E2E8F0" stroke-width="3"/>',
    'agent': '<circle cx="32" cy="20" r="10" stroke="#E2E8F0" fill="none" stroke-width="2"/><path d="M16 52 C16 38 48 38 48 52" stroke="#E2E8F0" fill="none" stroke-width="2"/><rect x="44" y="28" width="12" height="16" rx="2" stroke="#E2E8F0" fill="none" stroke-width="2"/>',
    'trading': '<polyline points="12,48 24,28 36,38 52,16" stroke="#E2E8F0" fill="none" stroke-width="2"/><polygon points="52,16 52,26 42,16" fill="#E2E8F0"/><line x1="12" y1="52" x2="52" y2="52" stroke="#E2E8F0" stroke-width="2"/>',
    'coastal': '<path d="M8 40 Q20 28 32 40 Q44 52 56 40" stroke="#E2E8F0" fill="none" stroke-width="2"/><path d="M8 48 Q20 36 32 48 Q44 60 56 48" stroke="#E2E8F0" fill="none" stroke-width="2" opacity="0.5"/><path d="M24 20 L32 12 L40 20 L40 36 L24 36 Z" stroke="#E2E8F0" fill="none" stroke-width="2"/>'
  };
  return `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${icons[name] || '<circle cx="32" cy="32" r="20" stroke="#E2E8F0" fill="none" stroke-width="2"/>'}</svg>`;
}

function createPlaceholderLogo() {
  return `<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="196" height="76" rx="8" stroke="#94A3B8" fill="none" stroke-width="2" stroke-dasharray="6,4"/>
    <text x="100" y="46" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#94A3B8">LOGO</text>
  </svg>`;
}

async function main() {
  const desktopDir = path.join(__dirname, 'public', 'frames', 'desktop');
  const vectorsDir = path.join(__dirname, 'public', 'vectors');
  const framesDir = path.join(__dirname, 'public', 'frames');

  await ensureDir(desktopDir);
  await ensureDir(vectorsDir);

  console.log(`Generating ${FRAME_COUNT} placeholder frames...`);

  // Generate frames in batches to avoid overwhelming the system
  const BATCH_SIZE = 20;
  for (let batch = 0; batch < Math.ceil(FRAME_COUNT / BATCH_SIZE); batch++) {
    const start = batch * BATCH_SIZE + 1;
    const end = Math.min((batch + 1) * BATCH_SIZE, FRAME_COUNT);
    const promises = [];
    for (let i = start; i <= end; i++) {
      const svg = createFrameSVG(i, FRAME_COUNT);
      const filename = `frame_${String(i).padStart(4, '0')}.webp`;
      const outPath = path.join(desktopDir, filename);
      promises.push(
        sharp(Buffer.from(svg)).webp({ quality: 70 }).toFile(outPath)
      );
    }
    await Promise.all(promises);
    console.log(`  Frames ${start}–${end} done`);
  }

  // Poster
  console.log('Generating poster...');
  const posterSvg = createPosterSVG();
  await sharp(Buffer.from(posterSvg)).webp({ quality: 80 }).toFile(path.join(framesDir, 'poster.webp'));

  // Service icons
  console.log('Generating service icons...');
  const iconNames = ['ship-owners', 'charterer', 'technical', 'agent', 'trading', 'coastal'];
  for (const name of iconNames) {
    fs.writeFileSync(path.join(vectorsDir, `${name}.svg`), createServiceIcon(name));
  }

  // Placeholder logo
  fs.writeFileSync(path.join(vectorsDir, 'placeholder-logo.svg'), createPlaceholderLogo());

  console.log('Done! All placeholder assets generated.');
}

main().catch((err) => {
  console.error('Error generating placeholders:', err);
  process.exit(1);
});
