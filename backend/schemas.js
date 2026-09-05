const Joi = require('joi');

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required().trim(),
    description: Joi.string().required(),
    location: Joi.string().required().trim(),
    country: Joi.string().default('India'),
    price: Joi.number().required().min(0),
    category: Joi.string()
      .valid('Trending', 'Beachfront', 'Mountains', 'Heritage', 'Pools', 'City', 'Countryside', 'Camping', 'Workation', 'Bed & Breakfast', 'Rooms', 'Budget', 'Luxe', 'New', 'Ashram', 'Haveli')
      .default('Trending'),
    fairsafeScore: Joi.number().min(80).max(100).default(95),
    amenities: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ),
    image: Joi.object({
      url: Joi.string().allow('', null),
      filename: Joi.string().allow('', null),
    }),
    imageUrl: Joi.string().allow('', null),
  }).unknown(true).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required().trim(),
  }).required(),
});

module.exports.bookingSchema = Joi.object({
  booking: Joi.object({
    checkIn: Joi.date().required(),
    checkOut: Joi.date().greater(Joi.ref('checkIn')).required(),
    guests: Joi.number().min(1).max(20).default(1),
    guestName: Joi.string().allow('', null),
    guestEmail: Joi.string().email().allow('', null),
  }).required(),
});

// Authentic Gmail Regex: standard format ending in @gmail.com or @googlemail.com
const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/i;

module.exports.userSignupSchema = Joi.object({
  username: Joi.string().trim().min(2).max(40).required().messages({
    'string.min': 'Username must be at least 2 characters long.',
    'string.max': 'Username cannot exceed 40 characters.',
    'any.required': 'Username is required.',
  }),
  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(GMAIL_REGEX)
    .required()
    .messages({
      'string.pattern.base': 'Please provide an authentic Gmail address ending with @gmail.com.',
      'any.required': 'An authentic Gmail address is required.',
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long.',
    'any.required': 'Password is required.',
  }),
  phone: Joi.string().allow('', null),
}).unknown(true);

