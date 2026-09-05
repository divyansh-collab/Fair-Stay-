const axios = require('axios');

async function testHttpChat() {
  console.log('Testing HTTP POST http://localhost:8080/ai/chat...');
  try {
    const res = await axios.post('http://localhost:8080/ai/chat', {
      message: 'Tell me about stays in Prayagraj and nearby activities',
    });
    console.log('Status:', res.status);
    console.log('AI Reply Preview (first 250 chars):');
    console.log(res.data.reply.substring(0, 250) + '...');
    const isGeneric = res.data.reply.includes('I can help you find stunning vacation stays across Goa, Manali, Jaipur');
    console.log('Is Generic Fallback:', isGeneric);
    console.log('✅ Real Dynamic AI Chat Working:', !isGeneric);
  } catch (err) {
    console.error('HTTP Chat Error:', err.message);
  }
}

testHttpChat();
