const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { validators, handleValidation } = require('../middleware/validate.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

// Admin login (phone + password)
router.post(
  '/login',
  validators.phone,
  validators.password,
  handleValidation,
  adminController.login
);

// Get admin info
router.get('/me', requireAdmin, adminController.getCurrentAdmin);

// Change password
router.put(
  '/change-password',
  requireAdmin,
  validators.password,
  handleValidation,
  adminController.changePassword
);

// Get all users (admin only)
router.get('/users', requireAdmin, adminController.getAllUsers);

// Get user by ID
router.get(
  '/users/:id',
  requireAdmin,
  validators.uuid('id'),
  handleValidation,
  adminController.getUserById
);

// Update user status
router.put(
  '/users/:id/status',
  requireAdmin,
  validators.uuid('id'),
  handleValidation,
  adminController.updateUserStatus
);

// Delete user
router.delete(
  '/users/:id',
  requireAdmin,
  validators.uuid('id'),
  handleValidation,
  adminController.deleteUser
);

// Dashboard stats
router.get('/stats', requireAdmin, adminController.getDashboardStats);

module.exports = router;
