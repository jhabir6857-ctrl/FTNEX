require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'veo-3.1-generate-preview'; // Standard quality — NOT Fast or Lite

// ─── Premium cinematic prompt (exact spec from task) ─────────────────────
const VIDEO_PROMPT = `Ultra-premium cinematic shot of a brand-new, pristine mega cargo ship with a sleek modern hull, freshly painted deep navy and white livery, immaculately organized colorful shipping containers stacked in perfect rows, sailing through calm open ocean at golden hour. Camera does a slow, smooth low-angle tracking shot alongside the hull, holding steady with minimal motion blur so hull details, rivets, container edges, and paint texture stay crisp and in focus throughout. Shot on cinema camera, deep depth of field (avoid heavy background blur), tack-sharp focus on the ship itself, hyper-realistic micro-details on steel plating, container textures, and paint reflections, no rust or wear, flagship vessel quality. Warm reddish-amber sky, sun flare reflecting off the water, light sea spray catching the light. Corporate brand film style, ultra-high fidelity, 4K photorealistic, crisp detail retention, no soft focus, no upscale artifacts.`;

// ─── Output paths ────────────────────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, 'public', 'video');
const RAW_VIDEO = path.join(OUTPUT_DIR, 'hero-raw-veo.mp4');

// ═══════════════════════════════════════════════════════════════════════════
// Step 1: Submit video generation request to Veo 3.1
// ═══════════════════════════════════════════════════════════════════════════
async function submitVideoGeneration() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎬 STEP 1: Submitting Veo 3.1 video generation (native 4K)...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Model:      ${MODEL} (Standard — max quality)`);
  console.log(`   Resolution: 4K (native 3840×2160)`);
  console.log(`   Duration:   8 seconds`);
  console.log(`   Aspect:     16:9`);
  console.log(`   Audio:      Will be stripped in encoding step`);
  console.log(`   Prompt:     "${VIDEO_PROMPT.substring(0, 100)}..."`);
  console.log('');

  const requestBody = {
    instances: [{
      prompt: VIDEO_PROMPT
    }],
    parameters: {
      aspectRatio: '16:9',
      durationSeconds: 8,
      resolution: '4k'
    }
  };

  console.log('   Request body (parameters):');
  console.log(`   ${JSON.stringify(requestBody.parameters, null, 2).replace(/\n/g, '\n   ')}`);
  console.log('');

  const res = await fetch(
    `${BASE_URL}/models/${MODEL}:predictLongRunning?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    }
  );

  const data = await res.json();

  if (data.error) {
    console.error('❌ Veo API error:', data.error.message);
    console.error('   Status:', data.error.status);
    console.error('   Code:', data.error.code);
    if (data.error.code === 429) {
      console.error('\n⚠️  Rate limited — wait a few minutes before retrying.');
    }
    if (data.error.code === 400) {
      console.error('\n⚠️  Bad request — check if the model supports the requested parameters.');
      console.error('   Full error:', JSON.stringify(data.error, null, 2));
    }
    process.exit(1);
  }

  if (!data.name) {
    console.error('❌ Unexpected response (no operation name):', JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log(`✅ Video generation submitted!`);
  console.log(`   Operation: ${data.name}`);
  return data.name;
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 2: Poll until video is ready
// ═══════════════════════════════════════════════════════════════════════════
async function pollForCompletion(operationName) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⏳ STEP 2: Waiting for Veo 3.1 to finish rendering (4K)...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   (4K generation typically takes 3-8 minutes)\n');

  const startTime = Date.now();
  let attempt = 0;

  while (true) {
    attempt++;
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    const res = await fetch(`${BASE_URL}/${operationName}?key=${API_KEY}`);
    const data = await res.json();

    if (data.error) {
      console.error(`\n❌ Polling error: ${data.error.message}`);
      console.error('   Full error:', JSON.stringify(data.error, null, 2));
      process.exit(1);
    }

    if (data.done) {
      console.log(`\n✅ Video generation complete! (took ${elapsed}s)`);

      // Check for generation-level errors
      if (data.response && data.response.error) {
        console.error('❌ Generation finished with error:', JSON.stringify(data.response.error, null, 2));
        process.exit(1);
      }

      return data;
    }

    // Show progress
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const s = spinner[attempt % spinner.length];
    process.stdout.write(`\r   ${s} Rendering 4K video... (${elapsed}s elapsed, poll #${attempt})   `);

    // Wait 15 seconds between polls
    await new Promise(r => setTimeout(r, 15000));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 3: Download the video
// ═══════════════════════════════════════════════════════════════════════════
async function downloadVideo(completedOperation) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 STEP 3: Downloading generated 4K video...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Navigate the response structure per official docs:
  // response.generateVideoResponse.generatedSamples[0].video.uri
  const response = completedOperation.response || completedOperation;
  let videoUri = null;
  let videoData = null;

  // Primary path (official REST API structure)
  if (response.generateVideoResponse?.generatedSamples?.[0]?.video?.uri) {
    videoUri = response.generateVideoResponse.generatedSamples[0].video.uri;
    console.log('   Found video URI via generateVideoResponse path');
  }
  // Fallback paths for different API versions
  else if (response.generatedSamples?.[0]?.video?.uri) {
    videoUri = response.generatedSamples[0].video.uri;
    console.log('   Found video URI via generatedSamples path');
  }
  else if (response.predictions?.[0]?.uri) {
    videoUri = response.predictions[0].uri;
    console.log('   Found video URI via predictions path');
  }
  else if (response.videos?.[0]?.uri) {
    videoUri = response.videos[0].uri;
    console.log('   Found video URI via videos path');
  }
  // Check for inline base64 data
  else if (response.generateVideoResponse?.generatedSamples?.[0]?.video?.bytesBase64Encoded) {
    videoData = response.generateVideoResponse.generatedSamples[0].video.bytesBase64Encoded;
    console.log('   Found inline base64 video data');
  }
  else if (response.generatedSamples?.[0]?.video?.bytesBase64Encoded) {
    videoData = response.generatedSamples[0].video.bytesBase64Encoded;
    console.log('   Found inline base64 video data (alt path)');
  }
  else if (response.predictions?.[0]?.bytesBase64Encoded) {
    videoData = response.predictions[0].bytesBase64Encoded;
    console.log('   Found inline base64 video data (predictions path)');
  }

  // Last resort: search entire response for URI or base64
  if (!videoUri && !videoData) {
    const responseStr = JSON.stringify(response);
    console.log('   ⚠️  Standard paths did not match. Response keys:', Object.keys(response));

    const uriMatch = responseStr.match(/"uri"\s*:\s*"(https?:\/\/[^"]+)"/);
    if (uriMatch) {
      videoUri = uriMatch[1];
      console.log('   Found video URI via regex search');
    }

    const b64Match = responseStr.match(/"bytesBase64Encoded"\s*:\s*"([^"]+)"/);
    if (!videoUri && b64Match) {
      videoData = b64Match[1];
      console.log('   Found base64 data via regex search');
    }
  }

  if (!videoUri && !videoData) {
    console.error('❌ Could not extract video from API response.');
    console.error('   Full response structure:');
    console.error(JSON.stringify(response, null, 2).substring(0, 3000));
    process.exit(1);
  }

  // Download or decode
  if (videoUri) {
    console.log(`   Downloading from: ${videoUri.substring(0, 100)}...`);
    const videoRes = await fetch(videoUri);
    if (!videoRes.ok) {
      console.error(`❌ Download failed: HTTP ${videoRes.status}`);
      process.exit(1);
    }
    const arrayBuf = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    fs.writeFileSync(RAW_VIDEO, buffer);
    console.log(`✅ Raw video saved: ${RAW_VIDEO}`);
    console.log(`   Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.log('   Decoding base64 video data...');
    const buffer = Buffer.from(videoData, 'base64');
    fs.writeFileSync(RAW_VIDEO, buffer);
    console.log(`✅ Raw video saved: ${RAW_VIDEO}`);
    console.log(`   Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  }

  return RAW_VIDEO;
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 4: Verify native resolution with ffprobe
// ═══════════════════════════════════════════════════════════════════════════
function verifyResolution(videoPath) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 STEP 4: Verifying native resolution (ffprobe)...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Use ffmpeg -i to get video info (ffprobe may not be bundled with ffmpeg-static)
  let probeOutput = '';
  try {
    // ffmpeg -i always exits non-zero, but stderr has the info
    execSync(`"${ffmpegPath}" -i "${videoPath}" -f null - 2>&1`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (e) {
    probeOutput = e.stdout || e.stderr || '';
  }

  // If we got nothing from the catch, try another approach
  if (!probeOutput) {
    try {
      probeOutput = execSync(`"${ffmpegPath}" -i "${videoPath}" 2>&1 || true`, {
        encoding: 'utf-8'
      });
    } catch (e2) {
      probeOutput = e2.stdout || e2.stderr || e2.message || '';
    }
  }

  console.log('\n   ─── Raw ffprobe/ffmpeg output ───');
  // Show only the relevant lines
  const lines = probeOutput.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('Duration:') ||
        trimmed.includes('Stream #') ||
        trimmed.includes('Video:') ||
        trimmed.includes('Audio:') ||
        trimmed.includes('bitrate:') ||
        trimmed.includes('fps') ||
        trimmed.includes('encoder') ||
        trimmed.includes('creation_time')) {
      console.log(`   ${trimmed}`);
    }
  }
  console.log('   ─── End ffprobe output ───\n');

  // Extract resolution
  const resMatch = probeOutput.match(/(\d{3,5})x(\d{3,5})/);
  if (!resMatch) {
    console.error('❌ Could not parse resolution from ffprobe output.');
    console.error('   Full output:', probeOutput.substring(0, 2000));
    process.exit(1);
  }

  const width = parseInt(resMatch[1]);
  const height = parseInt(resMatch[2]);

  console.log(`   Resolution: ${width}×${height}`);

  // Extract duration
  const durMatch = probeOutput.match(/Duration:\s*(\d+):(\d+):(\d+)\.(\d+)/);
  if (durMatch) {
    const dur = parseInt(durMatch[1]) * 3600 + parseInt(durMatch[2]) * 60 +
                parseInt(durMatch[3]) + parseInt(durMatch[4]) / 100;
    console.log(`   Duration:   ${dur.toFixed(2)}s`);
  }

  // Extract fps
  const fpsMatch = probeOutput.match(/([\d.]+)\s*fps/);
  if (fpsMatch) {
    console.log(`   Frame rate: ${fpsMatch[1]} fps`);
  }

  // Extract codec
  const codecMatch = probeOutput.match(/Video:\s*(\w+)/);
  if (codecMatch) {
    console.log(`   Codec:      ${codecMatch[1]}`);
  }

  // File size
  const fileSize = fs.statSync(videoPath).size;
  console.log(`   File size:  ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

  // ─── Resolution gate ───
  console.log('');
  if (width >= 3840 && height >= 2160) {
    console.log('   ✅ CONFIRMED: Native 4K (3840×2160 or higher) — no upscaling detected');
    return { width, height, passed: true };
  } else if (width >= 1920 && height >= 1080) {
    console.log(`   ⚠️  WARNING: Resolution is ${width}×${height} (1080p), NOT native 4K.`);
    console.log('   The API may have fallen back to a lower resolution.');
    console.log('   Proceeding is allowed but you asked to be notified.');
    return { width, height, passed: false };
  } else {
    console.log(`   ❌ FAILED: Resolution is only ${width}×${height}.`);
    console.log('   This is below the expected 4K output. Do NOT proceed to encoding.');
    return { width, height, passed: false };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 5: Check for loop discontinuity (first vs last frame comparison)
// ═══════════════════════════════════════════════════════════════════════════
function checkLoopContinuity(videoPath) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 STEP 5: Checking loop continuity (first vs last frame)...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const tmpDir = path.join(OUTPUT_DIR, '_loop_check');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const firstFrame = path.join(tmpDir, 'first.png');
  const lastFrame = path.join(tmpDir, 'last.png');

  try {
    // Extract first frame
    execSync(
      `"${ffmpegPath}" -i "${videoPath}" -vframes 1 -y "${firstFrame}"`,
      { stdio: 'pipe' }
    );

    // Extract last frame (seek near end)
    execSync(
      `"${ffmpegPath}" -sseof -0.5 -i "${videoPath}" -vframes 1 -y "${lastFrame}"`,
      { stdio: 'pipe' }
    );

    if (fs.existsSync(firstFrame) && fs.existsSync(lastFrame)) {
      const firstSize = fs.statSync(firstFrame).size;
      const lastSize = fs.statSync(lastFrame).size;
      const sizeDiff = Math.abs(firstSize - lastSize) / Math.max(firstSize, lastSize);

      console.log(`   First frame size: ${(firstSize / 1024).toFixed(1)} KB`);
      console.log(`   Last frame size:  ${(lastSize / 1024).toFixed(1)} KB`);
      console.log(`   Size difference:  ${(sizeDiff * 100).toFixed(1)}%`);

      // File size difference is a rough heuristic — very similar sizes suggest
      // similar visual content (good for looping). Large differences suggest
      // a potential jump cut.
      if (sizeDiff < 0.15) {
        console.log('   ✅ Frames appear visually similar — loop should be relatively smooth');
      } else if (sizeDiff < 0.35) {
        console.log('   ⚠️  Moderate difference — loop may have a noticeable transition');
        console.log('   Consider reviewing the first/last frames visually.');
      } else {
        console.log('   ⚠️  SIGNIFICANT difference — likely a jarring jump cut at loop point');
        console.log('   Recommend: crossfade, trim, or regenerate the video.');
      }

      console.log(`\n   First frame saved: ${firstFrame}`);
      console.log(`   Last frame saved:  ${lastFrame}`);
      console.log('   Review these visually to confirm.');
    }
  } catch (e) {
    console.log('   ⚠️  Could not extract frames for loop check:', e.message);
    console.log('   This is non-blocking — proceed manually.');
  }

  return tmpDir;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main pipeline
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🚢 ═══════════════════════════════════════════════════════════');
  console.log('   FTNEXT Hero Video Pipeline — Veo 3.1 (Native 4K)');
  console.log('   ═══════════════════════════════════════════════════════════\n');

  if (!API_KEY) {
    console.error('❌ GOOGLE_AI_API_KEY not found in .env.local');
    process.exit(1);
  }
  console.log(`   API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
  console.log('');

  // Step 1: Submit generation
  const operationName = await submitVideoGeneration();

  // Step 2: Poll for completion
  const completed = await pollForCompletion(operationName);

  // Step 3: Download
  const videoPath = await downloadVideo(completed);

  // Step 4: Verify native resolution
  const resolution = verifyResolution(videoPath);

  // Step 5: Check loop continuity
  checkLoopContinuity(videoPath);

  // ─── Final summary ───
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 GENERATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Model:          ${MODEL}`);
  console.log(`   Requested:      4K (3840×2160), 8s, 16:9`);
  console.log(`   Actual:         ${resolution.width}×${resolution.height}`);
  console.log(`   Native 4K:      ${resolution.passed ? '✅ YES' : '❌ NO'}`);
  console.log(`   Raw file:       ${RAW_VIDEO}`);
  console.log(`   Raw size:       ${(fs.statSync(RAW_VIDEO).size / 1024 / 1024).toFixed(2)} MB`);
  console.log('');

  if (resolution.passed) {
    console.log('   ✅ Ready for encoding. Run: node encode-hero-video.js');
  } else {
    console.log('   ⚠️  Resolution did NOT match 4K. Review before proceeding.');
    console.log('   The API may have silently fallen back to a lower resolution.');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('\n💥 Unhandled error:', err);
  process.exit(1);
});
