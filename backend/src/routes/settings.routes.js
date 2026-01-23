const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { requireAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/site', settingsController.getSiteSettings);
router.get('/card', settingsController.getCardSettings);

// Admin routes
router.put('/site', requireAdmin, settingsController.updateSiteSetting);
router.put('/site/bulk', requireAdmin, settingsController.updateSiteSettingsBulk);
router.post('/site/upload', requireAdmin, upload.single('file'), settingsController.uploadSiteFile);
router.put('/card', requireAdmin, upload.single('image'), settingsController.updateCardSettings);
router.delete('/card/image', requireAdmin, settingsController.deleteCardImage);

module.exports = router;
