const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { validators, handleValidation } = require('../middleware/validate.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/', scheduleController.getAllSchedules);
router.get('/days', scheduleController.getDays);
router.get('/day/:dayNumber', scheduleController.getSchedulesByDay);
router.get('/:id', validators.uuid('id'), handleValidation, scheduleController.getScheduleById);

// Admin routes
router.post(
  '/',
  requireAdmin,
  validators.schedule,
  handleValidation,
  scheduleController.createSchedule
);

router.put(
  '/:id',
  requireAdmin,
  validators.uuid('id'),
  handleValidation,
  scheduleController.updateSchedule
);

router.delete(
  '/:id',
  requireAdmin,
  validators.uuid('id'),
  handleValidation,
  scheduleController.deleteSchedule
);

// Delete all schedules for a day
router.delete(
  '/day/:dayNumber',
  requireAdmin,
  scheduleController.deleteDay
);

module.exports = router;
