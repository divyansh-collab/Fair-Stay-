const axios = require('axios');
const mongoose = require('mongoose');

async function verifyHostPricing() {
  console.log('=== VERIFYING HOST-SPECIFIC FESTIVAL PRICING VARIATION & AI EXPLANATIONS ===\n');
  const baseURL = 'http://localhost:8080';

  // 1. Fetch listings from the database
  const res = await axios.get(`${baseURL}/api/listings`);
  const listings = (res.data.data || []).slice(0, 8);
  console.log(`Analyzing ${listings.length} distinct listings from the catalog:\n`);

  // Query each listing's price for Christmas
  const results = [];
  for (const item of listings) {
    const aiRes = await axios.get(`${baseURL}/ai/predict-festival-price`, {
      params: {
        listingId: item._id,
        festival: 'christmas',
      },
    });

    results.push({
      title: item.title.substring(0, 30),
      location: item.location,
      normalBasePrice: '₹' + aiRes.data.basePrice,
      signedPercentage: aiRes.data.signedPercentage,
      effectivePrice: '₹' + aiRes.data.effectivePrice,
      direction: aiRes.data.direction,
      customerExplanation: aiRes.data.explanation,
    });
  }

  console.table(
    results.map((r) => ({
      Stay: r.title,
      Location: r.location,
      Normal: r.normalBasePrice,
      'Festive %': r.signedPercentage,
      Effective: r.effectivePrice,
      Direction: r.direction,
    }))
  );

  // Check that percentages are NOT all identical
  const uniquePercentages = new Set(results.map((r) => r.signedPercentage));
  console.log(`\nUnique percentage adjustments across sample: ${uniquePercentages.size}`);
  console.log('Percentages observed:', Array.from(uniquePercentages));

  const hasVariation = uniquePercentages.size > 1;
  console.log('✅ Listings have distinct host-specific percentages (not all identical):', hasVariation);

  // Print sample customer explanations from AI
  console.log('\n--- Sample AI Customer Explanations ---');
  results.slice(0, 3).forEach((r, idx) => {
    console.log(`[Stay ${idx + 1}] "${r.title}":`);
    console.log(`  ➔ ${r.customerExplanation}\n`);
  });
}

verifyHostPricing();
