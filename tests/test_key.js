require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  console.log('Testing with key:', key.substring(0, 10) + '...');
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello in 5 words');
    console.log('SUCCESS! Result:', result.response.text());
  } catch (err) {
    console.log('Error with Google Places key:', err.message);
  }
}

testKey();
