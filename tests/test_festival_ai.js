const { predictFestivalPriceAI } = require('./utils/gemini');

async function runTest() {
  console.log('=== TESTING AI FESTIVAL PRICE PREDICTOR ===\n');

  // Test 1: Christmas in Goa (The user's exact example)
  console.log('[TEST 1] Christmas in Goa (Base: ₹4,000)...');
  const christmasRes = await predictFestivalPriceAI({
    destination: 'Goa',
    festival: 'Christmas',
    basePrice: 4000,
    listingTitle: 'Azara Beach House Luxury Villa',
  });
  console.log('Festival:', christmasRes.festivalName);
  console.log('Direction:', christmasRes.direction);
  console.log('Percentage:', christmasRes.signedPercentage);
  console.log('Normal Base Price: ₹' + christmasRes.basePrice);
  console.log('Predicted Price: ₹' + christmasRes.effectivePrice);
  console.log('Difference: +₹' + christmasRes.difference);
  console.log('Customer Transparency:', christmasRes.customerComparison);
  console.log('Explanation:', christmasRes.explanation);
  console.log('AI Powered:', christmasRes.aiPowered);

  // Test 2: Diwali in Jaipur
  console.log('\n[TEST 2] Diwali in Jaipur (Base: ₹5,000)...');
  const diwaliRes = await predictFestivalPriceAI({
    destination: 'Jaipur',
    festival: 'Diwali',
    basePrice: 5000,
    listingTitle: 'Royal Heritage Haveli Jaipur',
  });
  console.log('Festival:', diwaliRes.festivalName);
  console.log('Percentage:', diwaliRes.signedPercentage);
  console.log('Normal Price: ₹' + diwaliRes.basePrice + ' → Predicted: ₹' + diwaliRes.effectivePrice);
  console.log('Customer Transparency:', diwaliRes.customerComparison);

  // Test 3: Raksha Bandhan in Manali
  console.log('\n[TEST 3] Raksha Bandhan in Manali (Base: ₹3,500)...');
  const rakhiRes = await predictFestivalPriceAI({
    destination: 'Manali',
    festival: 'Raksha Bandhan',
    basePrice: 3500,
    listingTitle: 'The Wooden Chalet, Manali',
  });
  console.log('Festival:', rakhiRes.festivalName);
  console.log('Percentage:', rakhiRes.signedPercentage);
  console.log('Normal Price: ₹' + rakhiRes.basePrice + ' → Predicted: ₹' + rakhiRes.effectivePrice);
  console.log('Customer Transparency:', rakhiRes.customerComparison);

  // Test 4: Holi in Mathura / Pushkar
  console.log('\n[TEST 4] Holi (Base: ₹3,000)...');
  const holiRes = await predictFestivalPriceAI({
    destination: 'Pushkar',
    festival: 'Holi',
    basePrice: 3000,
    listingTitle: 'Desert Rose Resort',
  });
  console.log('Festival:', holiRes.festivalName);
  console.log('Percentage:', holiRes.signedPercentage);
  console.log('Normal Price: ₹' + holiRes.basePrice + ' → Predicted: ₹' + holiRes.effectivePrice);
  console.log('Customer Transparency:', holiRes.customerComparison);
}

runTest();
