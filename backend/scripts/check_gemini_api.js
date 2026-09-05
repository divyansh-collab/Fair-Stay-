const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

async function checkApiKey() {
  const key = process.env.GEMINI_API_KEY;
  console.log('Testing key:', key);
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    console.log('SUCCESS! Models count:', res.data.models.length);
    console.log('Available model names:');
    res.data.models.forEach((m) => console.log(' -', m.name));
  } catch (err) {
    console.error('Error status:', err.response ? err.response.status : err.message);
    console.error('Error data:', err.response ? JSON.stringify(err.response.data) : err);
  }
}

checkApiKey();
