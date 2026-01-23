const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { validators, handleValidation } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');

// Get user profile
router.get('/profile', authenticate, userController.getProfile);

// Update user profile
router.put(
  '/profile',
  authenticate,
  validators.profile,
  handleValidation,
  userController.updateProfile
);

// Get user certificates
router.get('/certificates', authenticate, userController.getCertificates);

// Get user proposals
router.get('/proposals', authenticate, userController.getProposals);

module.exports = router;
