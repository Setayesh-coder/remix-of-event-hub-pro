const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');
const { validators, handleValidation } = require('../middleware/validate.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/', validators.pagination, handleValidation, galleryController.getAllImages);
router.get('/:id', validators.uuid('id'), handleValidation, galleryController.getImageById);

// Admin routes
router.post(
  '/',
  requireAdmin,
  upload.single('image'),
  validators.galleryImage,
  handleValidation,
  galleryController.createImage
);

router.put(
  '/:id',
  requireAdmin,
  upload.single('image'),
  validators.uuid('id'),
  validators.galleryImage,
  handleValidation,
  galleryController.updateImage
);

router.delete(
  '/:id',
  requireAdmin,
  validators.uuid('id'),
  handleValidation,
  galleryController.deleteImage
);

module.exports = router;
