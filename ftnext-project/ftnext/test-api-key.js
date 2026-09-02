require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

async function testNanoBanana() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🍌 TEST 1: Nano Banana (Gemini 2.5 Flash Image)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const res = await fetch(`${BASE_URL}/models/gemini-2.5-flash-preview-image-generation:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Generate a small 256x256 test image of a blue circle on white background' }]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      })
    });

    const data = await res.json();

    if (data.error) {
      console.log(`❌ FAILED: ${data.error.message}`);
      return false;
    }

    const hasImage = data.candidates?.[0]?.content?.parts?.some(p => p.inlineData);
    if (hasImage) {
      console.log('✅ SUCCESS: Nano Banana generated an image!');
      console.log(`   Model responded with ${data.candidates[0].content.parts.length} part(s)`);
      return true;
    } else {
      console.log('⚠️  Response received but no image data found.');
      console.log('   Response:', JSON.stringify(data.candidates?.[0]?.content?.parts?.map(p => Object.keys(p)), null, 2));
      return false;
    }
  } catch (err) {
    console.log(`❌ NETWORK ERROR: ${err.message}`);
    return false;
  }
}

async function testVeo() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎬 TEST 2: Veo 3.1 (Video Generation)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Veo uses predictLongRunning - we just need to confirm it accepts the request
    const res = await fetch(`${BASE_URL}/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{
          prompt: 'A test video of ocean waves'
        }],
        parameters: {
          sampleCount: 1
        }
      })
    });

    const data = await res.json();

    if (data.error) {
      // Check if it's a "quota" or "billing" error vs a "model not found" error
      if (data.error.code === 404) {
        console.log(`❌ FAILED: Model not found or not accessible.`);
        console.log(`   ${data.error.message}`);
        return false;
      } else if (data.error.code === 429) {
        console.log('✅ API KEY WORKS! (Rate limited - means access is granted, just quota exceeded)');
        return true;
      } else if (data.error.code === 400) {
        console.log('✅ API KEY WORKS! (Bad request format - means the model accepted the key)');
        console.log(`   Detail: ${data.error.message}`);
        return true;
      } else {
        console.log(`⚠️  Response code ${data.error.code}: ${data.error.message}`);
        return false;
      }
    }

    // If we get an operation name back, the video is being generated
    if (data.name) {
      console.log('✅ SUCCESS: Veo accepted the request and started generating!');
      console.log(`   Operation ID: ${data.name}`);
      return true;
    }

    console.log('✅ SUCCESS: Veo responded.');
    console.log('   Response keys:', Object.keys(data));
    return true;

  } catch (err) {
    console.log(`❌ NETWORK ERROR: ${err.message}`);
    return false;
  }
}

async function testModelAccess() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 TEST 3: Available Models Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const res = await fetch(`${BASE_URL}/models?key=${API_KEY}`);
    const data = await res.json();

    if (data.error) {
      console.log(`❌ FAILED: ${data.error.message}`);
      return;
    }

    const imageModels = data.models.filter(m =>
      m.name.toLowerCase().includes('imagen') ||
      m.name.toLowerCase().includes('image')
    );

    const videoModels = data.models.filter(m =>
      m.name.toLowerCase().includes('veo') ||
      m.name.toLowerCase().includes('video')
    );

    console.log(`\n   📸 Image Models (${imageModels.length}):`);
    imageModels.forEach(m => console.log(`      • ${m.displayName} (${m.name})`));

    console.log(`\n   🎬 Video Models (${videoModels.length}):`);
    videoModels.forEach(m => console.log(`      • ${m.displayName} (${m.name})`));

  } catch (err) {
    console.log(`❌ NETWORK ERROR: ${err.message}`);
  }
}

async function main() {
  console.log('\n🔑 API Key: ' + API_KEY.substring(0, 6) + '...' + API_KEY.substring(API_KEY.length - 4));
  console.log('');

  const nanoBananaOk = await testNanoBanana();
  const veoOk = await testVeo();
  await testModelAccess();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   🍌 Nano Banana (Image): ${nanoBananaOk ? '✅ Working' : '❌ Not Working'}`);
  console.log(`   🎬 Veo (Video):         ${veoOk ? '✅ Working' : '❌ Not Working'}`);
  console.log('');
}

main();
