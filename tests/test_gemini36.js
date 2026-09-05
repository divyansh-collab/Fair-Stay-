require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini36() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  try {
    const result = await model.generateContent('Hello! Tell me in 1 sentence what stays you recommend in Prayagraj.');
    console.log('🎉 SUCCESS with gemini-3.6-flash:');
    console.log(result.response.text());
  } catch (err) {
    console.error('Error with gemini-3.6-flash:', err.message);
  }
}

testGemini36();
