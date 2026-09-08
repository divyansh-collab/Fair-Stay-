const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    url: {
      type: String,
      default: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    },
    filename: {
      type: String,
      default: 'listingimage',
    },
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    default: 'India',
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [82.9739, 25.3176], // Default to Varanasi
    },
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  category: {
    type: String,
    enum: [
      'Trending',
      'Beachfront',
      'Mountains',
      'Heritage',
      'Pools',
      'City',
      'Countryside',
      'Camping',
      'Workation',
      'Bed & Breakfast',
      'Rooms',
      'Budget',
      'Luxe',
      'New',
      'Ashram',
      'Haveli',
    ],
    default: 'Trending',
  },
  fairsafeScore: {
    type: Number,
    default: 96,
    min: 80,
    max: 100,
  },
  hostSurgePercentage: {
    type: Number,
    default: null, // Host-controlled custom % increase or decrease (e.g. 20, 15, 0, -10)
  },
  amenities: {
    type: [String],
    default: [
      'High-Speed Wi-Fi (100+ Mbps)',
      'Swimming Pool',
      'Air Conditioning',
      'Dedicated Workspace',
      'Fully Equipped Kitchen',
      'Free Parking On-Premises',
      'Pet Friendly',
      'Balcony with Scenic View',
    ],
  },
  propertyType: {
    type: String,
    default: 'Vacation Stay',
  },
  maxGuests: {
    type: Number,
    default: 4,
    min: 1,
  },
  bedrooms: {
    type: Number,
    default: 2,
    min: 1,
  },
  beds: {
    type: Number,
    default: 2,
    min: 1,
  },
  baths: {
    type: Number,
    default: 2,
    min: 1,
  },
  marketOtaPrice: {
    type: Number,
    default: null, // Average unmonitored OTA rate for transparency comparison
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Cascade delete: post('findOneAndDelete') hook deleting all linked reviews
listingSchema.post('findOneAndDelete', async function (listing) {
  if (listing && listing.reviews && listing.reviews.length) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model('Listing', listingSchema);
