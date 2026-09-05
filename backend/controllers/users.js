const User = require('../models/user');
const crypto = require('crypto');
const { sendVerificationOtpEmail, sendVerificationEmail } = require('../utils/mailer');

module.exports.renderSignup = (req, res) => {
  res.render('users/signup.ejs');
};

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/i;

function isValidGmail(email) {
  if (!email || typeof email !== 'string') return false;
  return GMAIL_REGEX.test(email.trim());
}

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, phone } = req.body;

    const cleanUsername = (username || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanUsername) {
      req.flash('error', 'Username is required.');
      return req.session.save(() => res.redirect('/signup'));
    }

    // Strict authentic Gmail verification
    if (!cleanEmail || !isValidGmail(cleanEmail)) {
      req.flash('error', 'Registration requires an authentic Gmail address ending with @gmail.com.');
      return req.session.save(() => res.redirect('/signup'));
    }

    // Check if username already taken
    const existingUsername = await User.findOne({
      username: new RegExp('^' + cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i'),
    });
    if (existingUsername) {
      req.flash('error', `Username "${cleanUsername}" is already taken. Please choose another username or log in.`);
      return req.session.save(() => res.redirect('/signup'));
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      if (!existingUser.emailVerified) {
        // Pending approval: generate new OTP and redirect to verify screen
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.verificationOtp = otp;
        existingUser.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await existingUser.save();
        await sendVerificationOtpEmail(cleanEmail, otp);
        req.session.pendingEmail = cleanEmail;
        req.flash('info', `This account is pending verification. We sent a fresh 6-digit approval code to ${cleanEmail}.`);
        return req.session.save(() => res.redirect('/verify-email'));
      }
      req.flash('error', `This Gmail address (${cleanEmail}) is already registered. Please log in.`);
      return req.session.save(() => res.redirect('/login'));
    }

    const verificationToken = crypto.randomBytes(24).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      username: cleanUsername,
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      verificationToken,
      verificationTokenExpires,
      verificationOtp: otp,
      verificationOtpExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      emailVerified: false,
    });

    if (req.file) {
      newUser.profilePhoto = {
        url: req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`,
        filename: req.file.filename,
      };
    }

    await User.register(newUser, password);

    // Send 6-digit OTP code to authentic Gmail inbox
    await sendVerificationOtpEmail(cleanEmail, otp);

    // Store pending email in session and require OTP before approval
    req.session.pendingEmail = cleanEmail;
    req.flash(
      'success',
      `Approval code sent! We've sent a 6-digit verification code to ${cleanEmail}. Enter it below to activate your account.`
    );
    req.session.save((saveErr) => {
      if (saveErr) console.error('Session save error on signup:', saveErr);
      res.redirect('/verify-email');
    });
  } catch (e) {
    req.flash('error', e.message);
    req.session.save(() => res.redirect('/signup'));
  }
};

module.exports.renderVerifyEmail = (req, res) => {
  const email = req.session.pendingEmail || req.query.email;
  if (!email) {
    req.flash('error', 'Please sign up or log in first.');
    return res.redirect('/signup');
  }
  res.render('users/verify-email.ejs', { email });
};

module.exports.verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = (email || req.session.pendingEmail || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();

    if (!cleanEmail || !cleanOtp) {
      req.flash('error', 'Please enter your 6-digit verification code.');
      return res.redirect('/verify-email');
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      req.flash('error', 'Account not found.');
      return res.redirect('/signup');
    }

    if (user.emailVerified) {
      req.flash('success', 'Your account is already verified! Please log in.');
      return res.redirect('/login');
    }

    if (!user.verificationOtp || user.verificationOtp !== cleanOtp) {
      req.flash('error', 'Invalid 6-digit verification code. Please check your Gmail inbox and try again.');
      return res.render('users/verify-email.ejs', { email: cleanEmail });
    }

    if (user.verificationOtpExpires && user.verificationOtpExpires < Date.now()) {
      req.flash('error', 'Verification code has expired. Click "Resend Code" to receive a fresh code.');
      return res.render('users/verify-email.ejs', { email: cleanEmail });
    }

    // Approve & activate account!
    user.emailVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    delete req.session.pendingEmail;

    // Log the user in
    req.login(user, (err) => {
      if (err) return next(err);
      req.flash('success', `🎉 Account approved and activated! Welcome to FairStay, ${user.username}!`);
      req.session.save((saveErr) => {
        if (saveErr) console.error('Session save error on OTP verify:', saveErr);
        res.redirect('/listings');
      });
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/signup');
  }
};

module.exports.resendVerificationOtp = async (req, res) => {
  try {
    const email = req.body.email || req.session.pendingEmail;
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      req.flash('error', 'Account not found.');
      return res.redirect('/signup');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendVerificationOtpEmail(cleanEmail, otp);

    req.session.pendingEmail = cleanEmail;
    req.flash('success', `A fresh 6-digit verification code has been sent to ${cleanEmail}.`);
    req.session.save(() => res.redirect('/verify-email'));
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/verify-email');
  }
};

module.exports.changeSignupEmail = async (req, res) => {
  const pendingEmail = req.session.pendingEmail;
  if (pendingEmail) {
    // Delete unverified pending user so they can start fresh
    await User.deleteOne({ email: pendingEmail, emailVerified: false });
    delete req.session.pendingEmail;
  }
  req.flash('info', 'Please sign up with your real, active Gmail address.');
  res.redirect('/signup');
};

module.exports.renderLogin = (req, res) => {
  res.render('users/login.ejs');
};

module.exports.login = (req, res) => {
  // Check if account is verified
  if (req.user && !req.user.emailVerified && !req.user.isAdmin) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    req.user.verificationOtp = otp;
    req.user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
    req.user.save();

    sendVerificationOtpEmail(req.user.email, otp);

    const pendingEmail = req.user.email;
    req.logout(() => {
      req.session.pendingEmail = pendingEmail;
      req.flash(
        'warning',
        `Your account requires Gmail verification. We've sent a 6-digit approval code to ${pendingEmail}.`
      );
      req.session.save(() => res.redirect('/verify-email'));
    });
    return;
  }

  const username = req.user ? req.user.username : 'Traveler';
  req.flash('success', `Welcome back, ${username}! Have a wonderful stay.`);
  let redirectUrl = res.locals.redirectUrl || '/listings';
  if (typeof redirectUrl !== 'string' || !redirectUrl.startsWith('/') || redirectUrl.startsWith('//')) {
    redirectUrl = '/listings';
  }
  delete req.session.redirectUrl;
  req.session.save((err) => {
    if (err) console.error('Session save error on login:', err);
    res.redirect(redirectUrl);
  });
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Logged out successfully. See you again soon!');
    req.session.save((saveErr) => {
      if (saveErr) console.error('Session save error on logout:', saveErr);
      res.redirect('/listings');
    });
  });
};

module.exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash('error', 'Verification link is invalid or has expired.');
    return res.redirect('/listings');
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  user.verificationOtp = undefined;
  user.verificationOtpExpires = undefined;
  await user.save();

  req.flash('success', '🎉 Your email has been verified! Your account is now fully approved.');
  req.login(user, () => {
    res.redirect('/profile');
  });
};

module.exports.renderProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render('users/profile.ejs', { user });
};

module.exports.updateProfile = async (req, res) => {
  const { phone } = req.body;
  const updateData = { phone: phone || '' };

  if (req.file) {
    updateData.profilePhoto = {
      url: req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    };
  }

  await User.findByIdAndUpdate(req.user._id, updateData);
  req.flash('success', 'Profile details updated successfully.');
  res.redirect('/profile');
};
