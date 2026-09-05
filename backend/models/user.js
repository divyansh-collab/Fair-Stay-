const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  verificationOtp: String,
  verificationOtpExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  phone: {
    type: String,
    default: '',
  },
  profilePhoto: {
    url: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    filename: {
      type: String,
      default: 'default_avatar',
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// passport-local-mongoose plugin (injects username, salt, hash)
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
