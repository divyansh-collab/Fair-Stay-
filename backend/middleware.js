const Listing = require('./models/listing');
const Review = require('./models/review');
const Booking = require('./models/booking');
const { listingSchema, reviewSchema, bookingSchema, userSignupSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // If it was a booking submission, redirect back to the listing page after login
    if (req.originalUrl && req.originalUrl.includes('/bookings')) {
      const match = req.originalUrl.match(/\/listings\/([a-f0-9]{24})/);
      req.session.redirectUrl = match ? `/listings/${match[1]}` : '/listings';
    } else if (req.originalUrl && req.originalUrl.startsWith('/') && !req.originalUrl.startsWith('//')) {
      req.session.redirectUrl = req.originalUrl;
    } else {
      req.session.redirectUrl = '/listings';
    }
    req.flash('error', 'Please log in to proceed.');
    return res.redirect('/login');
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    let clean = req.session.redirectUrl;
    if (typeof clean === 'string' && clean.startsWith('/') && !clean.startsWith('//')) {
      res.locals.redirectUrl = clean;
    } else {
      res.locals.redirectUrl = '/listings';
    }
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'Listing not found.');
    return res.redirect('/listings');
  }
  if (!listing.owner || (!listing.owner.equals(req.user._id) && !req.user.isAdmin)) {
    req.flash('error', 'You do not have permission to modify this listing.');
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash('error', 'Review not found.');
    return res.redirect(`/listings/${id}`);
  }
  if (!review.author || (!review.author.equals(req.user._id) && !req.user.isAdmin)) {
    req.flash('error', 'You do not have permission to delete this review.');
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isBookingOwner = async (req, res, next) => {
  const { id } = req.params;
  const booking = await Booking.findById(id).populate('listing');
  if (!booking) {
    req.flash('error', 'Reservation not found.');
    return res.redirect('/listings');
  }
  if (!booking.user || (!booking.user.equals(req.user._id) && !req.user.isAdmin)) {
    req.flash('error', 'You do not have permission to view or manage this reservation.');
    return res.redirect('/listings');
  }
  req.booking = booking;
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    req.flash('error', 'Access restricted to FairStay Administrators.');
    return res.redirect('/listings');
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateUserSignup = (req, res, next) => {
  const { error } = userSignupSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join('. ');
    req.flash('error', errMsg);
    return res.redirect('/signup');
  }
  next();
};

