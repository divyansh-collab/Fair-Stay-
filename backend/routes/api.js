const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const Review = require('../models/review');
const User = require('../models/user');
const { getFestivalPricing } = require('../utils/festivals');
const { parseNaturalLanguageSearch, generatePilgrimChatResponse } = require('../utils/gemini');
const { isLoggedIn } = require('../middleware');

// Soft-auth helper: resolve user from session or fall back to first DB user (for demo mode)
async function resolveUser(req) {
  if (req.user) return req.user._id;
  const first = await User.findOne().lean();
  return first ? first._id : null;
}

// GET /api/listings - Fetch all listings with filtering
router.get('/listings', async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, search, destination, page = 1, limit = 12 } = req.query;
    const filter = {};
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * pageSize;

    if (category && category !== 'All') {
      filter.category = category;
    }

    const locationQuery = location || destination;
    if (locationQuery) {
      filter.$or = [
        { location: { $regex: locationQuery.trim(), $options: 'i' } },
        { country: { $regex: locationQuery.trim(), $options: 'i' } },
      ];
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

    const [listings, total] = await Promise.all([
      Listing.find(filter).populate('reviews', 'rating').skip(skip).limit(pageSize),
      Listing.countDocuments(filter),
    ]);

    const checkInDate = req.query.checkIn || req.query.checkInDate || null;
    const dateObj = checkInDate ? new Date(checkInDate) : new Date();

    const dataWithPricing = listings.map((l) => {
      const obj = l.toObject();
      const fest = getFestivalPricing(l, dateObj, req.query.festival || null);
      obj.festivalPricing = {
        festivalId: fest.festivalId,
        festivalName: fest.festivalName,
        emoji: fest.emoji,
        direction: fest.direction,
        percentage: fest.percentage,
        signedPercentage: fest.signedPercentage,
        rawPercentage: fest.rawPercentage,
        multiplier: fest.multiplier,
        demandLevel: fest.demandLevel,
        explanation: fest.explanation,
      };
      obj.effectivePrice = Math.round(obj.price * fest.multiplier);
      return obj;
    });

    res.json({
      success: true,
      count: listings.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
      data: dataWithPricing,
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

    const checkInDate = req.query.checkIn || req.query.checkInDate || null;
    const dateObj = checkInDate ? new Date(checkInDate) : new Date();
    const festivalPricing = getFestivalPricing(listing, dateObj, req.query.festival || null);
    const effectivePrice = Math.round(listing.price * festivalPricing.multiplier);

    res.json({
      success: true,
      data: listing,
      festivalPricing,
      effectivePrice,
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

// POST /api/bookings - Create confirmed reservation & assign suite pass
router.post('/bookings', async (req, res) => {
  try {
    const {
      listingId,
      checkIn,
      checkOut,
      guests = 1,
      guestName = 'Valued Guest',
      guestEmail = 'guest@fairstay.com',
      paymentMethod = 'UPI',
      discount = 0,
      totalPrice,
    } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Stay not found.' });
    }

    const inDate = checkIn ? new Date(checkIn) : new Date();
    const outDate = checkOut ? new Date(checkOut) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const nights = Math.max(1, Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24)));

    let userId = await resolveUser(req);

    const destPrefix = (listing.location || 'STAY').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'STY';
    const randomSuiteNum = Math.floor(100 + Math.random() * 900);
    const roomNumber = `SUITE-${destPrefix}-${randomSuiteNum}`;
    const keylessPin = String(Math.floor(1000 + Math.random() * 9000));

    const basePrice = listing.price || 3500;
    const staySubtotal = basePrice * nights;
    const gstRate = basePrice > 7500 ? 0.18 : (basePrice <= 1000 ? 0 : 0.12);
    const gst = Math.round(staySubtotal * gstRate);
    const finalCalculated = Math.max(0, staySubtotal + gst - Number(discount || 0));
    const finalAmount = totalPrice !== undefined ? Number(totalPrice) : finalCalculated;

    const booking = new Booking({
      listing: listing._id,
      user: userId,
      checkIn: inDate,
      checkOut: outDate,
      nights,
      guests: Number(guests) || 1,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      pricePerNight: basePrice,
      totalPrice: finalAmount,
      status: 'confirmed',
      roomNumber,
    });

    await booking.save();
    const populatedBooking = await Booking.findById(booking._id).populate('listing');

    res.status(201).json({
      success: true,
      booking: populatedBooking,
      keylessPin,
      paymentMethod,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bookings - Fetch reservations
router.get('/bookings', async (req, res) => {
  try {
    let query = {};
    if (req.user) {
      query = { user: req.user._id };
    }
    const bookings = await Booking.find(query).populate('listing').sort({ createdAt: -1 }).limit(30);
    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bookings/:id/cancel - 100% full FairSafe refund cancellation
router.post('/bookings/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({
      success: true,
      message: 'Reservation successfully cancelled with 100% full FairSafe refund.',
      booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/listings - Create new listing from React host form
router.post('/listings', async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      category = 'Trending',
      price = 3500,
      imageUrl,
      maxGuests = 4,
      bedrooms = 2,
      beds = 2,
      baths = 2,
      propertyType = 'Vacation Stay',
    } = req.body;

    if (!title || !location || !price) {
      return res.status(400).json({ success: false, error: 'Title, location, and price are required.' });
    }

    let ownerId = req.user ? req.user._id : null;
    if (!ownerId) {
      const firstUser = await User.findOne();
      ownerId = firstUser ? firstUser._id : null;
    }

    const newListing = new Listing({
      title: title.trim(),
      description: (description || 'A beautiful, authentic FairStay vacation sanctuary with premium hospitality, luxury comfort, and transparent pricing.').trim(),
      location: location.trim(),
      country: 'India',
      category: category || 'Trending',
      price: Number(price),
      marketOtaPrice: Math.round(Number(price) * 1.25),
      fairsafeScore: 97,
      maxGuests: Number(maxGuests) || 4,
      bedrooms: Number(bedrooms) || 2,
      beds: Number(beds) || 2,
      baths: Number(baths) || 2,
      propertyType: propertyType || 'Vacation Stay',
      image: {
        url: imageUrl || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
        filename: 'custom_host_listing',
      },
      geometry: {
        type: 'Point',
        coordinates: [75.7873, 26.9124],
      },
      owner: ownerId,
    });

    await newListing.save();
    res.status(201).json({ success: true, data: newListing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



// ─────────────────────────────────────────────
// REVIEWS API
// ─────────────────────────────────────────────

// POST /api/reviews/:listingId — Submit a review for a listing
router.post('/reviews/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ success: false, error: 'Rating and comment are required.' });
    }
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }
    const authorId = await resolveUser(req);
    const review = new Review({ rating: Number(rating), comment: comment.trim(), author: authorId });
    await review.save();
    listing.reviews.push(review._id);
    await listing.save();
    const populated = await Review.findById(review._id).populate('author', 'username profilePhoto');
    res.status(201).json({ success: true, review: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/listings/:id/availability — Return booked date ranges for availability calendar
router.get('/listings/:id/availability', async (req, res) => {
  try {
    const bookings = await Booking.find({ listing: req.params.id, status: { $ne: 'cancelled' } })
      .select('checkIn checkOut');
    res.json({ success: true, bookedRanges: bookings.map(b => ({ start: b.checkIn, end: b.checkOut })) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
