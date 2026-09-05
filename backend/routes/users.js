const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const userController = require('../controllers/users');
const { isLoggedIn, saveRedirectUrl, validateUserSignup } = require('../middleware');
const { upload } = require('../cloudConfig');

router
  .route('/signup')
  .get(userController.renderSignup)
  .post(upload.single('profilePhoto'), validateUserSignup, wrapAsync(userController.signup));

router
  .route('/login')
  .get(userController.renderLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: true,
    }),
    userController.login
  );

router.get('/logout', userController.logout);

// Email verification and account approval routes
router.get('/verify-email', userController.renderVerifyEmail);
router.post('/verify-email-otp', wrapAsync(userController.verifyEmailOtp));
router.post('/resend-verification-otp', wrapAsync(userController.resendVerificationOtp));
router.get('/change-signup-email', wrapAsync(userController.changeSignupEmail));
router.get('/verify-email/:token', wrapAsync(userController.verifyEmail));

router
  .route('/profile')
  .get(isLoggedIn, wrapAsync(userController.renderProfile))
  .post(isLoggedIn, upload.single('profilePhoto'), wrapAsync(userController.updateProfile));

module.exports = router;
