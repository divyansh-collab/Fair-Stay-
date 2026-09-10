const { parseNaturalLanguageSearch, generatePilgrimChatResponse, predictFestivalPriceAI } = require('../utils/gemini');
const { FESTIVALS_CATALOG, getDestinationEvents } = require('../utils/festivals');
const Listing = require('../models/listing');

module.exports.smartSearch = async (req, res) => {
  const query = req.body.query || req.query.query || '';
  const parsed = await parseNaturalLanguageSearch(query);

  const queryParams = new URLSearchParams();
  if (parsed.city) queryParams.set('location', parsed.city);
  if (parsed.category) queryParams.set('category', parsed.category);
  if (parsed.minPrice) queryParams.set('minPrice', parsed.minPrice);
  if (parsed.maxPrice) queryParams.set('maxPrice', parsed.maxPrice);
  if (!parsed.city && parsed.keywords) queryParams.set('search', parsed.keywords);

  const redirectTarget = `/listings?${queryParams.toString()}`;
  res.redirect(redirectTarget);
};

module.exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const reply = await generatePilgrimChatResponse(message, history || []);
    res.json({ reply });
  } catch (err) {
    console.error('[AI Chat Error]:', err);
    res.status(500).json({
      reply: 'Pranam pilgrim! My connection wavered for a moment. Please ask again or check our sacred corridor guides.',
    });
  }
};

/**
 * AI Festival Price Prediction API
 * Handles user inquiries on festival price increases (Raksha Bandhan, Diwali, Holi, Christmas, etc.)
 */
module.exports.predictFestivalPrice = async (req, res) => {
  try {
    const payload = req.method === 'POST' ? req.body : req.query;
    let { destination, festival, checkInDate, basePrice, listingId, listingTitle } = payload;

    let listing = null;
    // If listingId is provided, pull real listing details
    if (listingId) {
      listing = await Listing.findById(listingId).populate('owner');
      if (listing) {
        destination = destination || listing.location;
        basePrice = basePrice || listing.price;
        listingTitle = listingTitle || listing.title;
      }
    }

    const prediction = await predictFestivalPriceAI({
      listing,
      destination: destination || 'Goa',
      festival: festival || '',
      checkInDate: checkInDate || null,
      basePrice: Number(basePrice) || 3500,
      listingTitle: listingTitle || '',
    });

    const resolvedDestination = destination || (listing ? listing.location : 'Goa');
    const cityEvents = getDestinationEvents(resolvedDestination);

    res.json({
      success: true,
      ...prediction,
      destination: resolvedDestination,
      availableEvents: cityEvents,
      availableFestivals: cityEvents.map((f) => ({
        id: f.id,
        name: f.name,
        emoji: f.emoji,
        dateRange: f.dateRange,
        defaultPercentage: f.defaultPercentage,
      })),
    });
  } catch (err) {
    console.error('[AI Festival Prediction Error]:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to predict festival pricing.',
    });
  }
};
