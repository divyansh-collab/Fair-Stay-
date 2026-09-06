const Listing = require('../models/listing');
const { geocodeLocation } = require('../utils/geocoder');
const { getFestivalPricing } = require('../utils/festivals');

module.exports.index = async (req, res) => {
  const { category, location, minPrice, maxPrice, search } = req.query;
  const andClauses = [];

  if (category && category !== 'All') {
    andClauses.push({ category });
  }

  if (location) {
    andClauses.push({ location: { $regex: location.trim(), $options: 'i' } });
  }

  if (search) {
    const rawSearch = search.trim();
    const terms = rawSearch.split(/\s+/).filter(Boolean);
    terms.forEach((term) => {
      const reg = new RegExp(term, 'i');
      andClauses.push({
        $or: [
          { title: reg },
          { location: reg },
          { description: reg },
          { category: reg },
          { country: reg },
        ],
      });
    });
  }

  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    andClauses.push({ price: priceFilter });
  }

  const filter = andClauses.length > 0 ? { $and: andClauses } : {};

  const { getFestivalPricing } = require('../utils/festivals');
  const allListings = await Listing.find(filter).populate('reviews');
  res.render('listings/index.ejs', {
    allListings,
    getFestivalPricing,
    activeCategory: category || 'All',
    searchQuery: search || location || '',
    minPrice: minPrice || '',
    maxPrice: maxPrice || '',
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render('listings/new.ejs');
};

module.exports.createListing = async (req, res) => {
  const geometry = await geocodeLocation(req.body.listing.location, req.body.listing.country || 'India');
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.geometry = geometry;

  // Handle uploaded file or fallback URL
  if (req.file) {
    newListing.image = {
      url: req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    };
  } else if (req.body.listing.imageUrl) {
    newListing.image = {
      url: req.body.listing.imageUrl,
      filename: 'custom_image',
    };
  }

  // Parse host festive pricing policy
  if (req.body.listing.hostSurgePercentage !== undefined) {
    req.body.listing.hostSurgePercentage = req.body.listing.hostSurgePercentage === '' 
      ? null 
      : Number(req.body.listing.hostSurgePercentage);
  }

  // Parse amenities if passed as comma separated string
  if (typeof req.body.listing.amenities === 'string') {
    newListing.amenities = req.body.listing.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
  }

  await newListing.save();
  req.flash('success', 'Vacation stay successfully published on FairStay!');
  res.redirect(`/listings/${newListing._id}`);
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author',
      },
    })
    .populate('owner');

  if (!listing) {
    req.flash('error', 'The sacred stay you requested does not exist.');
    return res.redirect('/listings');
  }

  // Compute seasonal pricing preview based on host policy
  const { getFestivalPricing, getDestinationEvents, FESTIVALS_CATALOG } = require('../utils/festivals');
  const festivalData = getFestivalPricing(listing, new Date());
  const destinationEvents = getDestinationEvents(listing.location || 'India');

  // Compute average rating
  let avgRating = 0;
  if (listing.reviews && listing.reviews.length > 0) {
    const total = listing.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    avgRating = (total / listing.reviews.length).toFixed(1);
  }

  res.render('listings/show.ejs', {
    listing,
    festivalData,
    destinationEvents,
    festivalsCatalog: FESTIVALS_CATALOG,
    avgRating,
  });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'The sacred stay you requested does not exist.');
    return res.redirect('/listings');
  }
  res.render('listings/edit.ejs', { listing });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const existingListing = await Listing.findById(id);

  if (req.body.listing.location && req.body.listing.location !== existingListing.location) {
    req.body.listing.geometry = await geocodeLocation(
      req.body.listing.location,
      req.body.listing.country || 'India'
    );
  }

  if (typeof req.body.listing.amenities === 'string') {
    req.body.listing.amenities = req.body.listing.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
  }

  // Parse host festive pricing policy
  if (req.body.listing.hostSurgePercentage !== undefined) {
    req.body.listing.hostSurgePercentage = req.body.listing.hostSurgePercentage === '' 
      ? null 
      : Number(req.body.listing.hostSurgePercentage);
  }

  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  if (req.file) {
    listing.image = {
      url: req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    };
    await listing.save();
  } else if (req.body.listing.imageUrl) {
    listing.image = {
      url: req.body.listing.imageUrl,
      filename: 'custom_image',
    };
    await listing.save();
  }

  req.flash('success', 'Stay details successfully updated!');
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash('success', 'Stay successfully removed from corridor listings.');
  res.redirect('/listings');
};
