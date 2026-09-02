#!/usr/bin/env node
/**
 * process-frames.js
 *
 * Concatenates three raw scene videos with 0.5 s cross-dissolve transitions,
 * then extracts exactly 180 sequential .webp frames (1920 × 1080)
 * into public/frames/desktop/.
 *
 * Uses the ffmpeg binary bundled by the `ffmpeg-static` npm package —
 * no system-level ffmpeg install required.
 *
 * Usage:  npm run process-frames
 *         node process-frames.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ── Paths ──────────────────────────────────────────────────────────────────
const ffmpeg = require('ffmpeg-static');

const ROOT = __dirname;
const RAW_DIR = path.join(ROOT, 'raw-media');
const OUT_DIR = path.join(ROOT, 'public', 'frames', 'desktop');
const TEMP_CONCAT = path.join(RAW_DIR, '_concat_master.mp4');

const scenes = [
  path.join(RAW_DIR, 'scene_1_plane.mp4'),
  path.join(RAW_DIR, 'scene_2_ship.mp4'),
  path.join(RAW_DIR, 'scene_3_truck.mp4'),
];

const TOTAL_FRAMES = 180;
const XFADE_DURATION = 0.5; // seconds of cross-dissolve between each scene

// ── Helpers ────────────────────────────────────────────────────────────────

/** Run an ffmpeg command synchronously and log it. */
function run(cmd, label) {
  console.log(`\n⏳ ${label}…`);
  console.log(`   ${cmd}\n`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: ROOT });
  } catch (err) {
    console.error(`\n❌ ${label} failed.`);
    process.exit(1);
  }
}

/** Get the duration of a video file in seconds. */
function getDuration(filePath) {
  const cmd = `"${ffmpeg}" -i "${filePath}" 2>&1`;
  try {
    execSync(cmd, { encoding: 'utf8', cwd: ROOT });
  } catch (err) {
    // ffmpeg -i without output always exits with code 1; parse stdout/stderr
    const output = err.stdout || err.stderr || '';
    const match = output.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
    if (match) {
      return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
    }
  }
  console.error(`❌ Could not determine duration for ${filePath}`);
  process.exit(1);
}

// ── Main ───────────────────────────────────────────────────────────────────

(function main() {
  console.log('🎬 FTNeX Frame Processor');
  console.log('========================\n');

  // 1. Validate source files exist
  for (const scene of scenes) {
    if (!fs.existsSync(scene)) {
      console.error(`❌ Missing source file: ${scene}`);
      console.error('   Place scene_1_plane.mp4, scene_2_ship.mp4, and scene_3_truck.mp4 in raw-media/');
      process.exit(1);
    }
  }

  // 2. Get durations of each scene
  const durations = scenes.map((s, i) => {
    const d = getDuration(s);
    console.log(`   Scene ${i + 1}: ${d.toFixed(2)}s`);
    return d;
  });

  // Calculate xfade offsets:
  const offset1 = durations[0] - XFADE_DURATION;
  const offset2 = durations[0] + durations[1] - 2 * XFADE_DURATION;

  // Total concat duration = sum(durations) - (num_transitions * xfade_duration)
  const totalDuration = durations.reduce((a, b) => a + b, 0) - 2 * XFADE_DURATION;

  console.log(`\n   Total concat duration: ${totalDuration.toFixed(2)}s`);

  // 3. Ensure output directory exists and is clean
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // Clean any existing frame files
  const existing = fs.readdirSync(OUT_DIR).filter(f => f.startsWith('frame_') && f.endsWith('.webp'));
  if (existing.length > 0) {
    console.log(`   Cleaning ${existing.length} existing frames…`);
    existing.forEach(f => fs.unlinkSync(path.join(OUT_DIR, f)));
  }

  // ────────────────────────────────────────────────────────────────────────
  // PASS 1: Concatenate scenes with cross-dissolve into a single master mp4
  // ────────────────────────────────────────────────────────────────────────
  const filterConcat = [
    `[0:v][1:v]xfade=transition=fade:duration=${XFADE_DURATION}:offset=${offset1.toFixed(4)}[v01]`,
    `[v01][2:v]xfade=transition=fade:duration=${XFADE_DURATION}:offset=${offset2.toFixed(4)}[v012]`,
    `[v012]scale=1920:1080:flags=lanczos[out]`,
  ].join(';');

  run(
    `"${ffmpeg}" -i "${scenes[0]}" -i "${scenes[1]}" -i "${scenes[2]}" -filter_complex "${filterConcat}" -map "[out]" -an -c:v libx264 -preset fast -crf 18 -y "${TEMP_CONCAT}"`,
    'Pass 1 — Concatenating scenes with cross-dissolve'
  );

  // Verify master was created
  if (!fs.existsSync(TEMP_CONCAT)) {
    console.error('❌ Concatenated master video was not created.');
    process.exit(1);
  }

  // Get actual master duration for precise FPS calculation
  const masterDuration = getDuration(TEMP_CONCAT);
  const outputFps = TOTAL_FRAMES / masterDuration;
  console.log(`   Master duration: ${masterDuration.toFixed(2)}s`);
  console.log(`   Output FPS for ${TOTAL_FRAMES} frames: ${outputFps.toFixed(4)}`);

  // ────────────────────────────────────────────────────────────────────────
  // PASS 2: Extract exactly 180 frames as .webp from the master video
  // ────────────────────────────────────────────────────────────────────────
  const framePattern = path.join(OUT_DIR, 'frame_%03d.webp');

  run(
    `"${ffmpeg}" -i "${TEMP_CONCAT}" -vf "fps=${outputFps.toFixed(6)}" -frames:v ${TOTAL_FRAMES} -c:v libwebp -qscale:v 85 -y "${framePattern}"`,
    'Pass 2 — Extracting 180 .webp frames'
  );

  // 4. Clean up temp file
  try {
    fs.unlinkSync(TEMP_CONCAT);
    console.log('\n   Cleaned up temporary master video.');
  } catch {
    // non-fatal
  }

  // 5. Verify output
  const generated = fs.readdirSync(OUT_DIR).filter(
    (f) => f.startsWith('frame_') && f.endsWith('.webp')
  );

  if (generated.length === TOTAL_FRAMES) {
    console.log(`\n✅ Successfully generated ${generated.length} frames in ${OUT_DIR}`);
    console.log('   frame_001.webp … frame_180.webp (3-digit padding)');
  } else if (generated.length > 0) {
    console.warn(`\n⚠️  Expected ${TOTAL_FRAMES} frames but found ${generated.length}.`);
    console.warn('   The scroll hero will still work but some frames may be missing.');
    // List first and last few for debugging
    generated.sort();
    console.log(`   First: ${generated[0]}`);
    console.log(`   Last:  ${generated[generated.length - 1]}`);
  } else {
    console.error('\n❌ No frames were generated. Check ffmpeg output above for errors.');
    process.exit(1);
  }

  console.log('\n🏁 Done! Run `npm run dev` to preview the scroll hero.\n');
})();
