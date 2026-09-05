require('dotenv').config();
const { generatePilgrimChatResponse } = require('./utils/gemini');

async function test() {
  console.log('Testing generatePilgrimChatResponse with GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
  try {
    const res = await generatePilgrimChatResponse('Tell me about stays in Prayagraj and nearby activities');
    console.log('Response:');
    console.log(res);
  } catch (err) {
    console.error('Test Error:', err);
  }
}

test();
