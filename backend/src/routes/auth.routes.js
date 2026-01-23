const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validators, handleValidation } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');

// Request OTP
router.post(
  '/request-otp',
  validators.phone,
  handleValidation,
  authController.requestOTP
);

// Verify OTP and login/register
router.post(
  '/verify-otp',
  validators.phone,
  validators.otp,
  handleValidation,
  authController.verifyOTP
);

// Get current user info
router.get('/me', authenticate, authController.getCurrentUser);

// Logout (optional - for token invalidation if implemented)
router.post('/logout', authenticate, authController.logout);

module.exports = router;
