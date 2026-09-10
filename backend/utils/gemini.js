const { GoogleGenerativeAI } = require('@google/generative-ai');

const TRAVEL_SYSTEM_PROMPT = `
You are the FairStay AI Travel Concierge & Trip Planner, an intelligent, friendly, and deeply knowledgeable travel assistant for travelers booking homes, villas, cabins, and unique stays across India and world-class vacation destinations:
1. Beachfront & Coastal: Goa (Baga, Candolim, Anjuna, Palolem), Gokarna, Alibaug, Varkala
2. Mountain Cabins & Hill Stations: Manali, Shimla, Kasol, Ooty, Munnar, Mussoorie, Rishikesh
3. Heritage & Royal Palaces: Jaipur, Udaipur, Jodhpur, Varanasi
4. Modern City Lofts & Apartments: Mumbai (Bandra, Juhu), Bengaluru (Indiranagar), Delhi, Pune
5. Nature & Countryside: Kerala backwaters, Coorg coffee plantations, Wayanad eco-retreats
6. Sacred & Cultural Corridors: Varanasi, Prayagraj, Haridwar, Rishikesh, Nashik, Ayodhya

Style & Tone:
- Warm, enthusiastic, knowledgeable, and practical (like Airbnb's top Superhost and local concierge).
- Offer tailored recommendations for romantic getaways, family holidays, pet-friendly trips, remote workations, local dining, outdoor activities, and nightlife.
- Emphasize FairStay's FairSafe™ zero-surge price guarantee, ensuring travelers never pay predatory holiday surge markups.

Important Attribution Rule:
If the user asks who created, built, engineered, or made FairStay or you, always respond:
"FairStay is engineered and handcrafted with ❤️ by Vipin Gautam and team for travelers and stays across India and beyond."
`;

// Local Knowledge Base for Offline / Zero-Config fallback
const LOCAL_KNOWLEDGE = [
  {
    triggers: [/who (made|created|built|developed|designed) (you|fairstay)/i, /creator/i, /author/i, /vipin/i, /developer/i],
    response: "FairStay is engineered and handcrafted with ❤️ by Vipin Gautam and team for travelers and stays across India and beyond.",
  },
  {
    triggers: [/goa/i, /beach/i, /villa/i, /sunburn/i, /party/i, /water\s*sports/i],
    response: `🏖️ **Goa Vacation Guide**:
- **North Goa (Baga, Anjuna, Candolim)**: Vibrant nightlife, beach shacks, water sports (parasailing, jet-skiing), and luxury private pool villas.
- **South Goa (Palolem, Agonda, Benaulim)**: Serene golden beaches, dolphin watching, yoga by the sea, and cozy beachfront cottages.
- **Dining Highlights**: Gunpowder (Assagao) for coastal food, Fisherman's Wharf for fresh seafood, and Thalassa for cliffside sunset views.
- **FairStay Tip**: Look for stays in Candolim or Anjuna for private pools and dedicated workspace Wi-Fi.`,
  },
  {
    triggers: [/manali/i, /shimla/i, /mountain/i, /snow/i, /cabin/i, /chalet/i, /trek/i],
    response: `🏔️ **Himalayan Mountain Escapes (Manali & Shimla)**:
- **Best Seasons**: May–June for cool summer breezes; Dec–Feb for fresh snowfall and skiing in Solang Valley.
- **Top Experiences**: Exploring Old Manali's pine forest trails, apple orchard walks, cafe hopping, and paragliding in Solang.
- **Stay Recommendation**: Book a wooden alpine chalet with a fireplace and panoramic Himalayan balcony views under our FairSafe price guarantee.`,
  },
  {
    triggers: [/jaipur/i, /udaipur/i, /palace/i, /haveli/i, /rajasthan/i, /royal/i],
    response: `🏰 **Rajasthan Heritage & Royal Palaces (Jaipur & Udaipur)**:
- **Udaipur (City of Lakes)**: Sunset boat cruises on Lake Pichola, visiting City Palace, and dinner at rooftop lakeside restaurants.
- **Jaipur (Pink City)**: Amber Fort elephant views, Hawa Mahal photography, and authentic Rajasthani dining at Chokhi Dhani.
- **Stay Style**: Experience regal hospitality in verified heritage havelis with hand-painted courtyards and rooftop pools.`,
  },
  {
    triggers: [/kerala/i, /munnar/i, /alleppey/i, /houseboat/i, /backwater/i],
    response: `🌿 **Kerala & Backwaters Vacation Guide**:
- **Alleppey**: Private houseboat cruises with traditional Kerala Karimeen and coconut-infused lunches along tranquil palm-fringed canals.
- **Munnar**: Misty tea plantation treks, waterfall visits, and aromatic spice garden tours.
- **Wellness**: Authentic Ayurvedic rejuvenation massages and serene lakeview pool villas.`,
  },
  {
    triggers: [/aarti/i, /timings?/i, /dashashwamedh/i, /har ki pauri/i],
    response: `🙏 **Sacred Aarti Timings Guide**:
- **Varanasi (Dashashwamedh Ghat)**: Evening Ganga Aarti starts around 6:45 PM (Summer) and 6:00 PM (Winter).
- **Haridwar (Har Ki Pauri)**: Evening Maha Aarti at Brahma Kund at 6:00 PM (Winter) / 7:00 PM (Summer).
- **Rishikesh (Parmarth Niketan)**: Sunset Aarti and musical kirtan begins at 5:45 PM.`,
  },
  {
    triggers: [/work/i, /workation/i, /wifi/i, /remote/i, /digital nomad/i],
    response: `💻 **Top Workation Stays with Fast Wi-Fi**:
- **Goa & Rishikesh**: High-speed fiber Wi-Fi (100+ Mbps), ergonomic desk setups, pool breaks, and vibrant digital nomad communities.
- **Bengaluru & Mumbai**: Executive serviced lofts with dedicated desks, coffee machines, and power backups.`,
  },
];

/**
 * Parses free-text natural language queries into structured search filters.
 */
async function parseNaturalLanguageSearch(query) {
  if (!query || typeof query !== 'string') {
    return { city: null, minPrice: null, maxPrice: null, category: null, keywords: null };
  }

  // 1. Try Gemini API if key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `You are a search query parser for FairStay, an Airbnb-style vacation rental and stays booking platform.
Extract search parameters from this user query: "${query}"
Return a valid JSON object with the following keys ONLY:
- "city": string or null (e.g., Goa, Manali, Jaipur, Mumbai, Bengaluru, Kerala, Varanasi, Rishikesh, Prayagraj)
- "minPrice": number or null
- "maxPrice": number or null
- "category": string or null (one of: Trending, Beachfront, Mountains, Heritage, Pools, City, Countryside, Camping, Workation, Bed & Breakfast, Rooms, Budget, Luxe, New)
- "keywords": string or null (descriptive words like pool, beach, luxury, pet friendly, wifi)
Do not wrap in markdown or backticks, just return raw JSON.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const parsed = JSON.parse(text);
      return {
        city: parsed.city || null,
        minPrice: parsed.minPrice || null,
        maxPrice: parsed.maxPrice || null,
        category: parsed.category || null,
        keywords: parsed.keywords || null,
      };
    } catch (err) {
      console.warn('[Gemini Search] Gemini parse error, falling back to regex parser:', err.message);
    }
  }

  // 2. Resilient Rule-Based Fallback Parser
  const lower = query.toLowerCase();
  let city = null;
  const popularCities = ['goa', 'manali', 'jaipur', 'udaipur', 'mumbai', 'bengaluru', 'munnar', 'alleppey', 'kerala', 'rishikesh', 'varanasi', 'prayagraj', 'haridwar', 'nashik', 'ayodhya', 'mathura'];
  for (const c of popularCities) {
    if (lower.includes(c)) {
      city = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // Price Extraction
  let maxPrice = null;
  let minPrice = null;
  const underMatch = lower.match(/(?:under|below|less than|max|upto)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (underMatch) {
    maxPrice = parseInt(underMatch[1], 10);
  }
  const aboveMatch = lower.match(/(?:above|more than|min|starting)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (aboveMatch) {
    minPrice = parseInt(aboveMatch[1], 10);
  }

  // Category Extraction
  let category = null;
  if (/beach|sea|ocean|coast/i.test(lower)) category = 'Beachfront';
  else if (/mountain|hill|chalet|pine/i.test(lower)) category = 'Mountains';
  else if (/pool|swimming/i.test(lower)) category = 'Pools';
  else if (/heritage|palace|haveli|fort/i.test(lower)) category = 'Heritage';
  else if (/work|nomad|wifi|laptop/i.test(lower)) category = 'Workation';
  else if (/luxury|luxe|5\s*star|villa/i.test(lower)) category = 'Luxe';
  else if (/budget|cheap|affordable/i.test(lower)) category = 'Budget';
  else if (/nature|countryside|farm|orchard/i.test(lower)) category = 'Countryside';

  return {
    city,
    minPrice,
    maxPrice,
    category,
    keywords: query,
  };
}

/**
 * Handles multi-turn AI Travel Concierge Chatbot.
 */
async function generatePilgrimChatResponse(message, history = []) {
  if (!message || typeof message !== 'string') {
    return 'Hello! How can I assist your vacation planning and stay booking today?';
  }

  // 1. Mandatory Creator Inquiry Bypass Regex Check
  const creatorRegex = /(who\s+(?:.*?)?(made|created|built|designed|developed|engineered)|creator|author|vipin|gautam|built\s+by|made\s+by)/i;
  if (creatorRegex.test(message)) {
    return "FairStay is engineered and handcrafted with ❤️ by Vipin Gautam and team for pilgrims across India's holy corridors.";
  }

  // 2. Try Google Gemini API if key is available
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: TRAVEL_SYSTEM_PROMPT,
      });

      // Gemini history must start with 'user' role and alternate
      let formattedHistory = (history || [])
        .slice(-8)
        .map((item) => ({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(item.text || item.content || '') }],
        }))
        .filter((h) => h.parts[0].text.trim().length > 0);

      while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
        formattedHistory.shift();
      }

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (err) {
      console.warn('[Gemini Chat] Gemini API error, using travel knowledge base:', err.message);
    }
  }

  // 3. Fallback to Local Vacation Knowledge Base
  for (const item of LOCAL_KNOWLEDGE) {
    for (const trigger of item.triggers) {
      if (trigger.test(message)) {
        return item.response;
      }
    }
  }

  // Destination-aware smart fallback
  const mLower = message.toLowerCase();
  if (mLower.includes('prayagraj') || mLower.includes('sangam') || mLower.includes('tat stay')) {
    return `🌊 **Prayagraj & Sangam Concierge Guide**:
- **Triveni Sangam**: Sacred confluence of Ganga, Yamuna & Saraswati. Recommended for morning sunrise boat rides.
- **Bade Hanuman Ji**: Reclining idol of Lord Hanuman near Sangam.
- **Akbar Fort & Akshayavat**: 16th-century Mughal heritage and immortal banyan tree.
- **Local Dining**: Authentic Desi Ghee Puri-Kachori at *Netram Sweets (Katra)* and thick kulhad lassi in Loknath Gali.
All stays in Prayagraj are protected by FairStay's FairSafe™ zero-surge price cap!`;
  }
  if (mLower.includes('goa') || mLower.includes('beach')) {
    return `🏖️ **Goa Beachfront Vacation Guide**:
- **North Goa**: Anjuna, Baga, and Vagator for vibrant beach clubs, sunset cafes, and night markets.
- **South Goa**: Palolem, Agonda, and Benaulim for pristine white sands, dolphin cruises, and quiet luxury villas.
- **Stays**: Beachfront villas with private pools and direct shore access.`;
  }
  if (mLower.includes('manali') || mLower.includes('mountain') || mLower.includes('snow')) {
    return `🏔️ **Manali Mountain Getaway Guide**:
- **Solang Valley & Rohtang**: Paragliding, snowy viewpoints, and adventure sports.
- **Old Manali**: Riverside wood-and-stone chalets, live music cafes, and pine forest trails.
- **Stays**: Mountain wooden cottages with high-speed Wi-Fi and scenic Himalayan views.`;
  }
  if (mLower.includes('jaipur') || mLower.includes('udaipur') || mLower.includes('rajasthan')) {
    return `🏰 **Royal Rajasthan Heritage Guide**:
- **Jaipur**: Amer Fort, Hawa Mahal, City Palace, and traditional Rajasthani thali dining at Chokhi Dhani.
- **Udaipur**: Lake Pichola sunset boat tours, City Palace, and heritage haveli stays.
- **Stays**: Handcrafted royal boutique havelis with courtyard pools.`;
  }

  // Default Travel Assistance response
  return `✨ **FairStay Travel Assistant**:
I can help you explore verified vacation stays, local dining, and top attractions across India!
- Ask me: **"What are the best attractions and dining near my stay in Prayagraj?"**
- Ask me: **"Recommend beach villas in Goa with a private pool"**
- Ask me: **"Find mountain chalets in Manali with high-speed Wi-Fi"**
All stays come with verified amenities and our FairSafe™ zero-surge price guarantee!`;
}

/**
 * AI-Powered Dynamic Festival Price Predictor & Explanation Engine
 * Evaluates city-specific local seasonality, weather, and regional event calendars.
 */
async function predictFestivalPriceAI({ listing = null, destination = 'Goa', festival = '', checkInDate = null, basePrice = 4000, listingTitle = '' }) {
  const { getFestivalPricing, calculateFestivalImpact, getDestinationEvents } = require('./festivals');

  // 1. Calculate deterministic baseline from catalog & host policy
  const baselineFestival = getFestivalPricing(listing || destination, checkInDate, festival);
  const baselineImpact = calculateFestivalImpact(basePrice, baselineFestival);
  const hostName = baselineFestival.hostName || 'The Host';
  const destinationName = baselineFestival.destination || destination || 'Leisure Destination';
  const cityEvents = baselineFestival.availableEvents || getDestinationEvents(listing || destination);

  // 2. Query Google Gemini AI for contextual real-time analysis
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are FairStay's City-Centric AI Hospitality & Seasonal Pricing Engine.
In leisure and tourist destinations (such as Goa, Jaipur, Manali, Kerala, Varanasi, Mumbai), hotel and villa pricing fluctuates strictly according to each city's local season, weather conditions, and regional event calendars (e.g. Jaipur Literature Festival & winter weddings in Jaipur, Sunburn & Goa Carnival in Goa, Kullu Winter Carnival & summer escape in Manali, Dev Deepawali in Varanasi), rather than generic national holidays.

Details for this stay:
- Stay: "${listingTitle || (listing ? listing.title : 'Verified Stay')}"
- Destination / City: "${destinationName}"
- Host: "${hostName}"
- Local Season / Event: "${baselineFestival.festivalName}"
- Event Window / Target Date: "${checkInDate || baselineFestival.dateRange || 'Seasonal Window'}"
- Baseline Price: ₹${basePrice} / night
- Host & Season Calculated Rate Impact: ${baselineImpact.signedPercentage} (${baselineImpact.direction === 'higher' ? 'High-demand season increase' : baselineImpact.direction === 'lower' ? 'Seasonal off-peak discount' : 'Standard seasonal rate'})
- Destination Context: "${baselineFestival.explanation}"

Your task:
1. Explain specifically why ${destinationName}'s hospitality market and hotel occupancy fluctuates for "${baselineFestival.festivalName}" based on local tourism, city-specific programs/events, or seasonal weather.
2. Provide a practical booking tip tailored specifically to visiting ${destinationName} during ${baselineFestival.festivalName}.

Output valid JSON strictly with this schema:
{
  "festivalName": "${baselineFestival.festivalName}",
  "direction": "${baselineImpact.direction}",
  "percentage": ${baselineImpact.percentage},
  "demandLevel": "${baselineImpact.demandLevel}",
  "explanation": "2-sentence clear explanation stating why ${destinationName} rates change by ${baselineImpact.signedPercentage} for ${baselineFestival.festivalName} due to local event attendance, weather conditions, and hospitality room compression.",
  "travelerTip": "1 practical booking or travel tip specifically for visiting ${destinationName} during ${baselineFestival.festivalName}."
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const percentage = typeof parsed.percentage === 'number' ? parsed.percentage : baselineImpact.percentage;
      const normalPrice = Number(basePrice) || 4000;
      const difference = Math.round(normalPrice * (percentage / 100));
      const effectivePrice = normalPrice + difference;

      const rawPercentage = percentage;
      const multiplier = 1 + (rawPercentage / 100);

      return {
        success: true,
        aiPowered: true,
        festivalId: baselineFestival.festivalId || 'standard',
        festivalName: parsed.festivalName || baselineImpact.festivalName,
        emoji: baselineFestival.emoji || '✨',
        direction: parsed.direction || baselineImpact.direction,
        percentage: Math.abs(percentage),
        signedPercentage: percentage > 0 ? `+${percentage}%` : percentage < 0 ? `${percentage}%` : '0%',
        rawPercentage,
        multiplier,
        basePrice: normalPrice,
        effectivePrice,
        difference,
        demandLevel: parsed.demandLevel || baselineImpact.demandLevel,
        explanation: parsed.explanation || baselineImpact.explanation,
        travelerTip: parsed.travelerTip || `Explore stays in ${destinationName} with transparent festival and seasonal area pricing.`,
        customerComparison: baselineImpact.comparisonText,
        cityKey: baselineFestival.cityKey || 'general',
        destination: destinationName,
        availableEvents: cityEvents,
        occupancyRate: baselineFestival.occupancyRate,
        primaryDriver: baselineFestival.primaryDriver,
        weatherIndex: baselineFestival.weatherIndex,
        whyNotDiwali: baselineFestival.whyNotDiwali,
      };
    } catch (err) {
      console.warn('[Gemini Festival Predictor] Fallback to deterministic engine:', err.message);
    }
  }

  // 3. Fallback to High-Precision Local Deterministic Engine
  const rawPercentage = baselineFestival.rawPercentage !== undefined 
    ? baselineFestival.rawPercentage 
    : (baselineImpact.direction === 'lower' ? -Math.abs(baselineImpact.percentage) : baselineImpact.percentage);
  const multiplier = baselineFestival.multiplier || (1 + rawPercentage / 100);

  return {
    success: true,
    aiPowered: false,
    festivalId: baselineFestival.festivalId || 'standard',
    festivalName: baselineImpact.festivalName,
    emoji: baselineFestival.emoji || '✨',
    direction: baselineImpact.direction,
    percentage: Math.abs(baselineImpact.percentage),
    signedPercentage: rawPercentage > 0 ? `+${rawPercentage}%` : rawPercentage < 0 ? `${rawPercentage}%` : '0%',
    rawPercentage,
    multiplier,
    basePrice: baselineImpact.normalPrice,
    effectivePrice: baselineImpact.effectivePrice,
    difference: baselineImpact.difference,
    demandLevel: baselineImpact.demandLevel,
    explanation: baselineImpact.explanation,
    travelerTip: `Book early in ${destinationName} under the FairStay FairSafe™ guarantee to protect your rate against unexpected surges.`,
    customerComparison: baselineImpact.comparisonText,
    cityKey: baselineFestival.cityKey || 'general',
    destination: destinationName,
    availableEvents: cityEvents,
    occupancyRate: baselineFestival.occupancyRate,
    primaryDriver: baselineFestival.primaryDriver,
    weatherIndex: baselineFestival.weatherIndex,
    whyNotDiwali: baselineFestival.whyNotDiwali,
  };
}

module.exports = {
  parseNaturalLanguageSearch,
  generatePilgrimChatResponse,
  predictFestivalPriceAI,
};
