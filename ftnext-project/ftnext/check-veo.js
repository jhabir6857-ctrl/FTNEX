require('dotenv').config({ path: '.env.local' });
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`)
  .then(r => r.json())
  .then(data => {
    const veoModels = data.models.filter(m => m.name.toLowerCase().includes('veo') || m.name.toLowerCase().includes('video'));
    console.log(veoModels);
  });
