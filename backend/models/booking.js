const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  nights: {
    type: Number,
    required: true,
    min: 1,
  },
  guests: {
    type: Number,
    default: 1,
    min: 1,
  },
  guestName: {
    type: String,
    trim: true,
  },
  guestEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
  seasonalMultiplier: {
    type: Number,
    default: 1.0,
  },
  festivalApplied: {
    type: String,
    default: null,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  roomNumber: {
    type: String,
    default: null,
  },
  stripeSessionId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
