const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const { getFestivalPricing } = require('../utils/festivals');
const { parseNaturalLanguageSearch, generatePilgrimChatResponse } = require('../utils/gemini');

// GET /api/listings - Fetch all listings with filtering
router.get('/listings', async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (location) {
      filter.location = { $regex: location.trim(), $options: 'i' };
    } else if (search) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(filter).populate('reviews');
    res.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/search - Instant Auto-Suggest Search API
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.json({ success: true, count: 0, results: [] });
    }

    const terms = q.split(/\s+/).filter(Boolean);
    const andClauses = terms.map((t) => {
      const reg = new RegExp(t, 'i');
      return {
        $or: [
          { title: reg },
          { location: reg },
          { category: reg },
          { description: reg },
        ],
      };
    });

    const results = await Listing.find({ $and: andClauses })
      .select('title location category price image fairsafeScore reviews')
      .populate('reviews', 'rating')
      .limit(6);

    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/listings/:id - Fetch single stay details with festival surge analysis
router.get('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate({
        path: 'reviews',
        populate: { path: 'author', select: 'username' },
      })
      .populate('owner', 'username email');

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Stay not found' });
    }

    const festivalPricing = getFestivalPricing(listing, new Date());

    res.json({
      success: true,
      data: listing,
      festivalPricing,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/destinations & /api/corridors - Top destinations & stay counts
router.get(['/destinations', '/corridors'], async (req, res) => {
  try {
    const destinations = [
      { name: 'Goa', title: 'Sun, Sand & Beachfront Villas', key: 'goa', state: 'Goa' },
      { name: 'Manali', title: 'Snowy Peaks & Alpine Chalets', key: 'manali', state: 'Himachal Pradesh' },
      { name: 'Jaipur', title: 'Pink City & Royal Havelis', key: 'jaipur', state: 'Rajasthan' },
      { name: 'Udaipur', title: 'City of Lakes & Boutique Resorts', key: 'udaipur', state: 'Rajasthan' },
      { name: 'Mumbai', title: 'Modern City Lofts & Apartments', key: 'mumbai', state: 'Maharashtra' },
      { name: 'Bengaluru', title: 'Tech City Workations & Lofts', key: 'bengaluru', state: 'Karnataka' },
      { name: 'Munnar', title: 'Tea Plantations & Misty Mountains', key: 'munnar', state: 'Kerala' },
      { name: 'Alleppey', title: 'Backwater Houseboats & Canals', key: 'alleppey', state: 'Kerala' },
      { name: 'Varanasi', title: 'Ancient Ghats & Heritage Stays', key: 'varanasi', state: 'Uttar Pradesh' },
      { name: 'Rishikesh', title: 'Himalayan River & Yoga Retreats', key: 'rishikesh', state: 'Uttarakhand' },
    ];

    const results = await Promise.all(
      destinations.map(async (d) => {
        const count = await Listing.countDocuments({
          location: { $regex: d.name, $options: 'i' },
        });
        return { ...d, stayCount: count };
      })
    );

    res.json({
      success: true,
      destinations: results,
      corridors: results, // backwards compatibility
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/search/ai - Natural language search API
router.post('/search/ai', async (req, res) => {
  try {
    const { query } = req.body;
    const parsed = await parseNaturalLanguageSearch(query);
    res.json({
      success: true,
      originalQuery: query,
      parsedFilters: parsed,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/chat - Pilgrimage Concierge AI Chat API
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    const reply = await generatePilgrimChatResponse(message, history || []);
    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET & POST /api/fetch-live-stays - Fetch & sync stays from Google Places API
router.all('/fetch-live-stays', async (req, res) => {
  try {
    const { fetchStaysFromGooglePlaces } = require('../utils/fetchPlaces');
    const result = await fetchStaysFromGooglePlaces();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET & POST /api/festival-pricing - AI-driven festival price prediction & percentage impact
router.all('/festival-pricing', async (req, res) => {
  const { predictFestivalPrice } = require('../controllers/ai');
  return predictFestivalPrice(req, res);
});

module.exports = router;
