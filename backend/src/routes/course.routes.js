const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { validators, handleValidation } = require('../middleware/validate.middleware');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/', validators.pagination, handleValidation, courseController.getAllCourses);
router.get('/:id', validators.uuid('id'), handleValidation, courseController.getCourseById);

// User routes
router.get('/user/enrolled', authenticate, courseController.getUserCourses);
router.get('/user/cart', authenticate, courseController.getCartItems);
router.post('/user/cart/:courseId', authenticate, validators.uuid('courseId'), handleValidation, courseController.addToCart);
router.delete('/user/cart/:courseId', authenticate, validators.uuid('courseId'), handleValidation, courseController.removeFromCart);
router.post('/user/enroll/:courseId', authenticate, validators.uuid('courseId'), handleValidation, courseController.enrollCourse);

// Admin routes
router.post(
  '/',
  requireAdmin,
  upload.single('image'),
  validators.course,
  handleValidation,
  courseController.createCourse
);

router.put(
  '/:id',
  requireAdmin,
  upload.single('image'),
  validators.uuid('id'),
  handleValidation,
  courseController.updateCourse
);

router.delete(
  '/:id',
  requireAdmin,
  validators.uuid('id'),
  handleValidation,
  courseController.deleteCourse
);

module.exports = router;
