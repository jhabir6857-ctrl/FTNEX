const sharp = require('sharp');
const path = require('path');

async function main() {
  const inputPath = path.join(__dirname, 'public', 'logo.jpg');
  const img = sharp(inputPath);
  const metadata = await img.metadata();
  const width = metadata.width;
  const height = metadata.height;

  // Get raw RGBA buffer
  const rawBuffer = await img.ensureAlpha().raw().toBuffer();
  const data = new Uint8Array(rawBuffer);

  // Background color sampling at corners (top-left, top-right, bottom-left, bottom-right)
  // The background is a slightly warm white/off-white (r ~ 240, g ~ 238, b ~ 236)
  
  // Create a 2D grid of visited pixels for flood fill
  const visited = new Uint8Array(width * height);
  const isBackground = new Uint8Array(width * height);

  // Helper to get pixel index
  const idx = (x, y) => (y * width + x);

  // Helper to check if pixel is background-like (light off-white / light shadow)
  function isBgColor(x, y) {
    const p = idx(x, y) * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    
    // Background brightness and saturation test
    // Background in the render is very light gray/off-white with very low saturation
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const diff = maxVal - minVal;
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    // Off-white background / light shadow gradient:
    // If brightness is high (> 180) and color difference/saturation is low (not vibrant red/blue/chrome)
    if (brightness > 185 && diff < 30) return true;
    if (brightness > 215) return true;
    if (brightness > 165 && diff < 15) return true; // soft shadow area on white wall

    return false;
  }

  // Queue for BFS flood fill from all perimeter pixels
  const queue = [];

  // Seed with all borders
  for (let x = 0; x < width; x++) {
    if (!visited[idx(x, 0)]) {
      visited[idx(x, 0)] = 1;
      queue.push([x, 0]);
    }
    if (!visited[idx(x, height - 1)]) {
      visited[idx(x, height - 1)] = 1;
      queue.push([x, height - 1]);
    }
  }

  for (let y = 0; y < height; y++) {
    if (!visited[idx(0, y)]) {
      visited[idx(0, y)] = 1;
      queue.push([0, y]);
    }
    if (!visited[idx(width - 1, y)]) {
      visited[idx(width - 1, y)] = 1;
      queue.push([width - 1, y]);
    }
  }

  // BFS flood fill
  let head = 0;
  while (head < queue.length) {
    const [cx, cy] = queue[head++];
    
    if (isBgColor(cx, cy)) {
      isBackground[idx(cx, cy)] = 1;

      // Check 4 neighbors
      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (let n = 0; n < 4; n++) {
        const nx = neighbors[n][0];
        const ny = neighbors[n][1];
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = idx(nx, ny);
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            if (isBgColor(nx, ny)) {
              queue.push([nx, ny]);
            }
          }
        }
      }
    }
  }

  // Apply alpha mask
  // Inside foreground: keep 100% alpha (preserves all internal highlights, metals, globe, reflections!)
  // On boundary: calculate smooth edge antialiasing
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = idx(x, y);
      const p = pIdx * 4;

      if (isBackground[pIdx]) {
        // Transparent
        data[p + 3] = 0;
      } else {
        // Check if on boundary with background for smooth subpixel anti-aliasing
        let bgNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (isBackground[idx(nx, ny)]) bgNeighbors++;
            }
          }
        }

        if (bgNeighbors > 0) {
          // Edge pixel: remove background color contamination so there's no white halo around the 3D logo
          // Darken the edge slightly to blend seamlessly onto dark themes
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

          if (brightness > 190) {
            // Remove white bleed on the edge
            data[p] = Math.round(r * 0.7);
            data[p + 1] = Math.round(g * 0.7);
            data[p + 2] = Math.round(b * 0.7);
          }
          data[p + 3] = Math.round(255 * (1 - (bgNeighbors / 12)));
        } else {
          // Full solid alpha inside the logo
          data[p + 3] = 255;
        }
      }
    }
  }

  // Trim transparent padding to get tight bounds
  const trimmed = await sharp(Buffer.from(data), {
    raw: { width, height, channels: 4 }
  })
  .trim()
  .png({ quality: 100, compressionLevel: 9 })
  .toBuffer();

  const trimmedMeta = await sharp(trimmed).metadata();
  console.log(`Trimmed logo bounds: ${trimmedMeta.width} x ${trimmedMeta.height}`);

  // 1. Ultra high-res master logo (retina @3x)
  await sharp(trimmed)
    .png({ quality: 100 })
    .toFile(path.join(__dirname, 'public', 'logo-full.png'));

  // 2. Crisp WebP version for fast loading
  await sharp(trimmed)
    .webp({ quality: 95, lossless: true })
    .toFile(path.join(__dirname, 'public', 'logo-full.webp'));

  // 3. Crisp navbar 2x retina logo (height 96px for high-density displays)
  await sharp(trimmed)
    .resize({ height: 96 })
    .png({ quality: 100 })
    .toFile(path.join(__dirname, 'public', 'logo-nav.png'));

  // 4. Square crisp favicon with metallic emblem
  await sharp(trimmed)
    .resize(128, 128, {
      fit: 'contain',
      background: { r: 11, g: 14, b: 20, alpha: 1 }
    })
    .png({ quality: 100 })
    .toFile(path.join(__dirname, 'public', 'favicon.png'));

  console.log('High-fidelity logo assets generated successfully!');
}

main().catch(console.error);
