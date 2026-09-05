const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const bookingController = require('../controllers/bookings');
const { isLoggedIn, isBookingOwner } = require('../middleware');

// Create a new booking for a stay
router.post('/listings/:id/bookings', isLoggedIn, wrapAsync(bookingController.createBooking));

// Checkout breakdown & payment page
router.get('/bookings/:id/checkout', isLoggedIn, isBookingOwner, wrapAsync(bookingController.renderCheckout));

// Stripe checkout redirection
router.post('/bookings/:id/pay', isLoggedIn, isBookingOwner, wrapAsync(bookingController.payStripe));

// Simulated instant local confirmation
router.get('/bookings/:id/confirm', isLoggedIn, isBookingOwner, wrapAsync(bookingController.confirmBooking));
router.post('/bookings/:id/confirm', isLoggedIn, isBookingOwner, wrapAsync(bookingController.confirmBooking));

// Cancel booking with FairSafe guarantee
router.post('/bookings/:id/cancel', isLoggedIn, isBookingOwner, wrapAsync(bookingController.cancelBooking));

// "My Trips" dashboard for pilgrim
router.get('/bookings', isLoggedIn, wrapAsync(bookingController.index));

// Superhost Analytics & Guest Manifest
router.get('/bookings/host/panel', isLoggedIn, wrapAsync(bookingController.hostPanel));

module.exports = router;
