const sharp = require('sharp');
const path = require('path');

async function main() {
  const input = path.join(__dirname, 'public', 'logo.jpg');
  const outputFull = path.join(__dirname, 'public', 'logo-full.png');
  const outputNav = path.join(__dirname, 'public', 'logo-nav.png');
  const outputFavicon = path.join(__dirname, 'public', 'favicon.png');

  const image = sharp(input);
  const { width, height } = await image.metadata();

  const raw = await image
    .ensureAlpha()
    .raw()
    .toBuffer();

  const channels = 4;
  const processed = Buffer.from(raw);

  for (let i = 0; i < processed.length; i += channels) {
    const r = processed[i];
    const g = processed[i + 1];
    const b = processed[i + 2];

    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    if (brightness > 195) {
      processed[i + 3] = 0;
    } else if (brightness > 165) {
      processed[i + 3] = Math.round((195 - brightness) / 30 * 255);
    }
  }

  // Trim the transparent borders so it fits nicely
  const trimmedBuffer = await sharp(processed, { raw: { width, height, channels } })
    .trim()
    .png()
    .toBuffer();

  // Save trimmed high-res full logo
  await sharp(trimmedBuffer)
    .png()
    .toFile(outputFull);

  // Save nav logo (height 40px, keeping aspect ratio)
  await sharp(trimmedBuffer)
    .resize({ height: 40 })
    .png()
    .toFile(outputNav);

  // Save square icon for favicon / app icon
  await sharp(trimmedBuffer)
    .resize(64, 64, { fit: 'contain', background: { r: 11, g: 14, b: 20, alpha: 1 } })
    .png()
    .toFile(outputFavicon);

  console.log('Processed trimmed logos successfully.');
}

main().catch(console.error);
