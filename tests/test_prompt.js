require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const TRAVEL_SYSTEM_PROMPT = `You are FairStay AI Concierge — a warm, friendly, and deeply knowledgeable local travel assistant for FairStay.
FairStay is a premier Airbnb-style vacation rentals & sacred stays booking platform across India (Goa, Manali, Jaipur, Mumbai, Kerala, Varanasi, Prayagraj, Rishikesh, etc.).
Help travelers with:
- Best nearby attractions, temples, ghats, beaches, viewpoints, and hidden gems.
- Local dining, cafes, traditional food, and culinary experiences.
- Activities, boat rides, watersports, hiking, and cultural tours.
- Transparent FairSafe pricing advice (zero surge gouging, GST breakdown).

Keep your answers engaging, well-formatted with bullet points and emojis, concise, and inspiring.`;

async function testPrompt() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    systemInstruction: TRAVEL_SYSTEM_PROMPT,
  });

  const msg = `Tell me about "TAT Stays" in Prayagraj. What are the best nearby attractions, dining, and activities?`;
  console.log('Sending message to gemini-3.6-flash:\n', msg);

  const result = await model.generateContent(msg);
  console.log('\n--- GEMINI AI RESPONSE ---');
  console.log(result.response.text());
}

testPrompt();
