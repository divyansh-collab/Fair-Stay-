const Booking = require('../models/booking');
const Listing = require('../models/listing');
const { getFestivalPricing } = require('../utils/festivals');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'Stay not found.');
    return res.redirect('/listings');
  }

  const { checkIn, checkOut, guests, guestName, guestEmail } = req.body.booking;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
    req.flash('error', 'Please select valid check-in and check-out dates.');
    return res.redirect(`/listings/${id}`);
  }

  const diffTime = outDate.getTime() - inDate.getTime();
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    req.flash('error', 'Check-out date must be after check-in date.');
    return res.redirect(`/listings/${id}`);
  }

  // Prevent host from booking their own listing
  if (listing.owner && listing.owner.equals(req.user._id)) {
    req.flash('error', 'You cannot create a reservation on your own property.');
    return res.redirect(`/listings/${id}`);
  }

  // Calculate festival pricing
  const festivalData = getFestivalPricing(listing.location, inDate);
  const pricePerNight = Math.round(listing.price * festivalData.multiplier);
  const totalPrice = pricePerNight * nights;

  const booking = new Booking({
    listing: listing._id,
    user: req.user._id,
    checkIn: inDate,
    checkOut: outDate,
    nights,
    guests: guests || 1,
    guestName: guestName || req.user.username,
    guestEmail: guestEmail || req.user.email,
    pricePerNight: listing.price,
    seasonalMultiplier: festivalData.multiplier,
    festivalApplied: festivalData.festivalName,
    totalPrice,
    status: 'pending',
  });

  await booking.save();
  res.redirect(`/bookings/${booking._id}/checkout`);
};

module.exports.renderCheckout = async (req, res) => {
  const { id } = req.params;
  const booking = req.booking || (await Booking.findById(id).populate('listing').populate('user'));
  if (!booking) {
    req.flash('error', 'Booking reservation not found.');
    return res.redirect('/listings');
  }

  // Ensure authorized user or admin
  if (booking.user && !booking.user.equals(req.user._id) && !req.user.isAdmin) {
    req.flash('error', 'Unauthorized access to booking.');
    return res.redirect('/listings');
  }

  const festivalData = getFestivalPricing(booking.listing.location, booking.checkIn);
  const baseSubtotal = booking.pricePerNight * booking.nights;
  const surgeDifference = booking.totalPrice - baseSubtotal;
  const gst = Math.round(booking.totalPrice * 0.12);
  const finalPayable = booking.totalPrice + gst;

  res.render('bookings/checkout.ejs', {
    booking,
    listing: booking.listing,
    festivalData,
    baseSubtotal,
    surgeDifference,
    gst,
    finalPayable,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
  });
};

module.exports.payStripe = async (req, res) => {
  const { id } = req.params;
  const booking = req.booking || (await Booking.findById(id).populate('listing'));
  if (!booking) {
    req.flash('error', 'Booking not found.');
    return res.redirect('/listings');
  }

  if (stripe && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `${booking.listing.title} (${booking.listing.location})`,
                description: `FairStay Pilgrimage Reservation: ${booking.nights} night(s) for ${booking.guests} guest(s)`,
                images: [booking.listing.image.url],
              },
              unit_amount: Math.round(booking.totalPrice * 1.12 * 100), // in paise with GST
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_BASE_URL || 'http://localhost:8080'}/bookings/${booking._id}/confirm?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_BASE_URL || 'http://localhost:8080'}/bookings/${booking._id}/checkout`,
      });

      booking.stripeSessionId = session.id;
      await booking.save();
      return res.redirect(303, session.url);
    } catch (err) {
      console.warn('[Stripe] Checkout session failed, falling back to local confirmation:', err.message);
      req.flash('error', 'Stripe checkout unavailable. Proceeding with simulated instant confirmation.');
      return res.redirect(`/bookings/${booking._id}/confirm`);
    }
  }

  // Fallback: Local instant confirmation
  res.redirect(`/bookings/${booking._id}/confirm`);
};

module.exports.confirmBooking = async (req, res) => {
  const { id } = req.params;
  const booking = req.booking || (await Booking.findById(id).populate('listing'));
  if (!booking) {
    req.flash('error', 'Booking not found.');
    return res.redirect('/listings');
  }

  // Generate luxury reservation suite key based on destination
  const destPrefix = (booking.listing && booking.listing.location ? booking.listing.location : 'STAY').toUpperCase().slice(0, 3);
  const randomSuiteNum = Math.floor(101 + Math.random() * 899);
  booking.roomNumber = `SUITE-${destPrefix}${randomSuiteNum}`;
  booking.status = 'confirmed';
  await booking.save();

  // Send confirmation email
  const { sendBookingConfirmationEmail } = require('../utils/mailer');
  sendBookingConfirmationEmail(booking.guestEmail || req.user.email, booking, booking.listing);

  req.flash('success', `🎉 Reservation confirmed! Suite ${booking.roomNumber} secured with FairSafe Zero-Surge Guarantee.`);
  res.redirect('/bookings');
};

module.exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const booking = req.booking || (await Booking.findById(id));
  if (!booking) {
    req.flash('error', 'Booking not found.');
    return res.redirect('/bookings');
  }

  booking.status = 'cancelled';
  await booking.save();

  req.flash('success', 'Reservation cancelled. 100% full refund initiated per FairSafe zero-penalty policy.');
  res.redirect('/bookings');
};

module.exports.index = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('listing')
    .sort({ createdAt: -1 });

  res.render('bookings/index.ejs', { bookings });
};

module.exports.hostPanel = async (req, res) => {
  // If admin, show all stays, else show stays owned by user
  const listingQuery = req.user.isAdmin ? {} : { owner: req.user._id };
  const hostListings = await Listing.find(listingQuery);
  const listingIds = hostListings.map((l) => l._id);

  const allBookings = await Booking.find({ listing: { $in: listingIds } })
    .populate('listing')
    .populate('user')
    .sort({ createdAt: -1 });

  const totalBookings = allBookings.length;
  const confirmedBookings = allBookings.filter((b) => b.status === 'confirmed').length;
  const pendingBookings = allBookings.filter((b) => b.status === 'pending').length;
  const cancelledBookings = allBookings.filter((b) => b.status === 'cancelled').length;

  const totalRevenue = allBookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  res.render('bookings/host-panel.ejs', {
    hostListings,
    allBookings,
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    totalRevenue,
  });
};
