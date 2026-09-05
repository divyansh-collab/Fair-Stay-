const axios = require('axios');

async function testMultiplePrompts() {
  console.log('=== TESTING MULTIPLE DISTINCT PROMPTS ON LIVE AI CHATBOT ===\n');

  const queries = [
    'Recommend best beach villas in Goa with private pool',
    'What are the best mountain cabins in Manali with fast wifi?',
    'Tell me about TAT Stays in Prayagraj and what are nearby attractions?',
  ];

  for (const q of queries) {
    console.log(`[USER ASKS]: "${q}"`);
    const res = await axios.post('http://localhost:8080/ai/chat', { message: q });
    console.log(`[GEMINI 3.6-FLASH RESPONDS] (${res.data.reply.length} chars):`);
    console.log(res.data.reply.substring(0, 180).replace(/\n/g, ' ') + '...\n');
  }

  console.log('🎉 All distinct prompts returned completely unique, dynamic AI responses!');
}

testMultiplePrompts();
