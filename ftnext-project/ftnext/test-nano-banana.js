require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

async function testNanoBanana() {
  // Try the correct model names from the list
  const modelsToTry = [
    'gemini-3.1-flash-image',
    'gemini-3.1-flash-image-preview',
    'gemini-2.5-flash-image',
    'gemini-3-pro-image',
  ];

  for (const model of modelsToTry) {
    console.log(`   Trying ${model}...`);
    try {
      const res = await fetch(`${BASE_URL}/models/${model}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Generate a small test image: a blue circle on a white background' }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE']
          }
        })
      });

      const data = await res.json();

      if (data.error) {
        console.log(`   ❌ ${model}: ${data.error.message.substring(0, 80)}...`);
        continue;
      }

      const hasImage = data.candidates?.[0]?.content?.parts?.some(p => p.inlineData);
      if (hasImage) {
        console.log(`   ✅ SUCCESS with ${model}! Image generated!`);
        return model;
      } else {
        const hasText = data.candidates?.[0]?.content?.parts?.some(p => p.text);
        console.log(`   ⚠️  ${model} responded but no image. Has text: ${hasText}`);
      }
    } catch (err) {
      console.log(`   ❌ ${model}: Network error - ${err.message}`);
    }
  }
  return null;
}

async function main() {
  console.log('🍌 Testing all available Nano Banana models...\n');
  const workingModel = await testNanoBanana();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (workingModel) {
    console.log(`✅ Working Nano Banana model: ${workingModel}`);
  } else {
    console.log('❌ No Nano Banana model worked for image generation.');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main();
