#!/usr/bin/env node

/**
 * encode-hero-video.js
 *
 * Encodes a raw Veo 3.1 hero video into web-optimized formats using ffmpeg-static.
 *
 * Outputs (all written to public/video/):
 *   - hero-desktop.mp4   — H.264 at native resolution
 *   - hero-desktop.webm  — VP9   at native resolution
 *   - hero-mobile.mp4    — H.264 scaled to 720p
 *   - hero-mobile.webm   — VP9   scaled to 720p
 *   - hero-poster.webp   — Static poster frame (WebP)
 */

require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');

// ─── Paths ───────────────────────────────────────────────────────────────────

const INPUT = path.resolve(__dirname, 'public/video/hero-raw-veo.mp4');
const OUTPUT_DIR = path.resolve(__dirname, 'public/video');

const OUTPUTS = {
  desktopMp4: path.join(OUTPUT_DIR, 'hero-desktop.mp4'),
  desktopWebm: path.join(OUTPUT_DIR, 'hero-desktop.webm'),
  mobileMp4: path.join(OUTPUT_DIR, 'hero-mobile.mp4'),
  mobileWebm: path.join(OUTPUT_DIR, 'hero-mobile.webm'),
  poster: path.join(OUTPUT_DIR, 'hero-poster.webp'),
};

const MAX_TOTAL_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_POSTER_BYTES = 150 * 1024;     // 150 KB

// ─── Helpers ─────────────────────────────────────────────────────────────────

function banner(title) {
  const line = '═'.repeat(60);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(`${line}\n`);
}

function run(cmd) {
  console.log(`  ▸ ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit' });
}

function fileSize(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  return fs.statSync(filePath).size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

// ─── Encode functions ────────────────────────────────────────────────────────

function encodeDesktopMp4(crf) {
  banner(`Encoding hero-desktop.mp4  (H.264 · native res · CRF ${crf})`);
  run(
    `"${ffmpegPath}" -y -i "${INPUT}" ` +
    `-c:v libx264 -preset slow -crf ${crf} ` +
    `-profile:v high -level 4.2 ` +
    `-pix_fmt yuv420p ` +
    `-an ` +
    `-movflags +faststart ` +
    `"${OUTPUTS.desktopMp4}"`
  );
}

function encodeDesktopWebm(crf) {
  banner(`Encoding hero-desktop.webm (VP9 · native res · CRF ${crf})`);
  run(
    `"${ffmpegPath}" -y -i "${INPUT}" ` +
    `-c:v libvpx-vp9 -crf ${crf} -b:v 0 ` +
    `-pix_fmt yuv420p ` +
    `-an ` +
    `"${OUTPUTS.desktopWebm}"`
  );
}

function encodeMobileMp4(crf) {
  banner(`Encoding hero-mobile.mp4   (H.264 · 720p · CRF ${crf})`);
  run(
    `"${ffmpegPath}" -y -i "${INPUT}" ` +
    `-vf "scale=-2:720" ` +
    `-c:v libx264 -preset slow -crf ${crf} ` +
    `-profile:v high -level 4.2 ` +
    `-pix_fmt yuv420p ` +
    `-an ` +
    `-movflags +faststart ` +
    `"${OUTPUTS.mobileMp4}"`
  );
}

function encodeMobileWebm(crf) {
  banner(`Encoding hero-mobile.webm  (VP9 · 720p · CRF ${crf})`);
  run(
    `"${ffmpegPath}" -y -i "${INPUT}" ` +
    `-vf "scale=-2:720" ` +
    `-c:v libvpx-vp9 -crf ${crf} -b:v 0 ` +
    `-pix_fmt yuv420p ` +
    `-an ` +
    `"${OUTPUTS.mobileWebm}"`
  );
}

function extractPoster(quality) {
  banner(`Extracting hero-poster.webp (quality ${quality})`);
  run(
    `"${ffmpegPath}" -y -ss 2 -i "${INPUT}" ` +
    `-frames:v 1 ` +
    `-c:v libwebp -quality ${quality} ` +
    `"${OUTPUTS.poster}"`
  );
}

// ─── Size report ─────────────────────────────────────────────────────────────

function reportSizes() {
  banner('File sizes');
  const sizes = {};
  for (const [key, filePath] of Object.entries(OUTPUTS)) {
    const bytes = fileSize(filePath);
    sizes[key] = bytes;
    const status = key === 'poster' && bytes > MAX_POSTER_BYTES ? ' ⚠ over 150 KB' : '';
    console.log(`  ${path.basename(filePath).padEnd(22)} ${formatBytes(bytes).padStart(10)}${status}`);
  }
  return sizes;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  banner('Hero Video Encoder — ffmpeg-static');
  console.log(`  ffmpeg : ${ffmpegPath}`);
  console.log(`  input  : ${INPUT}`);
  console.log(`  output : ${OUTPUT_DIR}\n`);

  // Pre-flight checks
  if (!fs.existsSync(INPUT)) {
    console.error(`\n  ✖ Input file not found: ${INPUT}`);
    console.error('    Place the raw Veo 3.1 output at public/video/hero-raw-veo.mp4 and retry.\n');
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`  Created output directory: ${OUTPUT_DIR}`);
  }

  // ── Phase 1: Initial encode ────────────────────────────────────────────

  let h264Crf = 22;
  let vp9Crf = 30;
  const issues = [];

  encodeDesktopMp4(h264Crf);
  encodeDesktopWebm(vp9Crf);
  encodeMobileMp4(h264Crf);
  encodeMobileWebm(vp9Crf);

  // ── Phase 2: Poster extraction with quality fallback ───────────────────

  const posterQualities = [90, 80, 70];
  for (const q of posterQualities) {
    extractPoster(q);
    const posterBytes = fileSize(OUTPUTS.poster);
    if (posterBytes <= MAX_POSTER_BYTES) {
      console.log(`  ✔ Poster is ${formatBytes(posterBytes)} (under 150 KB) at quality ${q}\n`);
      break;
    }
    if (q === posterQualities[posterQualities.length - 1]) {
      issues.push(`Poster is ${formatBytes(posterBytes)} at quality ${q} — still over 150 KB target`);
      console.log(`  ⚠ Poster still over 150 KB at minimum quality ${q}\n`);
    } else {
      console.log(`  ⚠ Poster is ${formatBytes(posterBytes)} — reducing quality …\n`);
    }
  }

  // ── Phase 3: Total size check & CRF bumping ───────────────────────────

  let sizes = reportSizes();
  let totalVideoBytes = sizes.desktopMp4 + sizes.desktopWebm + sizes.mobileMp4 + sizes.mobileWebm;

  console.log(`\n  Total (video files): ${formatBytes(totalVideoBytes)}`);

  const crfBumps = [24, 25];
  let bumpIndex = 0;

  while (totalVideoBytes > MAX_TOTAL_BYTES && bumpIndex < crfBumps.length) {
    const newH264Crf = crfBumps[bumpIndex];
    // VP9 CRF roughly maps: H.264 22→VP9 30, H.264 24→VP9 33, H.264 25→VP9 34
    const newVp9Crf = newH264Crf === 24 ? 33 : 34;

    banner(`Total exceeds 8 MB — re-encoding with H.264 CRF ${newH264Crf} / VP9 CRF ${newVp9Crf}`);

    h264Crf = newH264Crf;
    vp9Crf = newVp9Crf;

    encodeDesktopMp4(h264Crf);
    encodeDesktopWebm(vp9Crf);
    encodeMobileMp4(h264Crf);
    encodeMobileWebm(vp9Crf);

    sizes = reportSizes();
    totalVideoBytes = sizes.desktopMp4 + sizes.desktopWebm + sizes.mobileMp4 + sizes.mobileWebm;
    console.log(`\n  Total (video files): ${formatBytes(totalVideoBytes)}`);

    bumpIndex++;
  }

  if (totalVideoBytes > MAX_TOTAL_BYTES) {
    issues.push(`Total video size is ${formatBytes(totalVideoBytes)} — still over 8 MB after max CRF bump`);
  }

  // ── Final report ──────────────────────────────────────────────────────

  banner('Final Report');

  console.log(`  H.264 CRF : ${h264Crf}`);
  console.log(`  VP9   CRF : ${vp9Crf}`);
  console.log(`  Total     : ${formatBytes(totalVideoBytes)}`);
  console.log(`  Budget    : ${totalVideoBytes <= MAX_TOTAL_BYTES ? '✔ within 8 MB' : '✖ over 8 MB'}`);
  console.log();

  if (issues.length > 0) {
    console.log('  Issues:');
    for (const issue of issues) {
      console.log(`    ⚠ ${issue}`);
    }
    console.log();
  } else {
    console.log('  ✔ No issues detected.\n');
  }

  console.log('  Done.\n');
}

main();
