require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('API Key:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'Missing');

  const modelsToTest = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-pro',
    'gemini-1.0-pro',
  ];

  for (const mName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: mName });
      const result = await model.generateContent('Say hello in 5 words');
      console.log(`✅ Model "${mName}" WORKS! Response:`, result.response.text().trim());
      return mName;
    } catch (err) {
      console.log(`❌ Model "${mName}" failed:`, err.message.substring(0, 120));
    }
  }
}

listAvailableModels();
