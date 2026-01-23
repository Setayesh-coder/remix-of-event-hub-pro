const { validationResult, body, param, query } = require('express-validator');

/**
 * Handle validation errors
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'اطلاعات ورودی نامعتبر است',
      details: errors.array().map(e => ({
        field: e.path,
        message: e.msg
      }))
    });
  }
  next();
}

// Validation rules
const validators = {
  // Phone number validation (Iranian format)
  phone: body('phone')
    .trim()
    .matches(/^09\d{9}$/)
    .withMessage('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود'),
  
  // OTP code validation
  otp: body('code')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('کد تأیید باید ۶ رقم باشد'),
  
  // Password validation
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('رمز عبور باید حداقل ۶ کاراکتر باشد'),
  
  // UUID validation
  uuid: (paramName) => param(paramName)
    .isUUID()
    .withMessage('شناسه نامعتبر است'),
  
  // Course validation
  course: [
    body('title').trim().notEmpty().withMessage('عنوان دوره الزامی است'),
    body('category').isIn(['workshop', 'webinar', 'training']).withMessage('دسته‌بندی نامعتبر است'),
    body('price').optional().isInt({ min: 0 }).withMessage('قیمت باید عدد مثبت باشد'),
    body('description').optional().trim(),
    body('duration').optional().trim(),
    body('instructor').optional().trim()
  ],
  
  // Gallery image validation
  galleryImage: [
    body('title').optional().trim(),
    body('category').optional().trim(),
    body('event_date').optional().isISO8601().toDate().withMessage('تاریخ نامعتبر است'),
    body('event_time').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('ساعت نامعتبر است')
  ],
  
  // Schedule validation
  schedule: [
    body('day_number').isInt({ min: 1 }).withMessage('شماره روز الزامی است'),
    body('day_title').trim().notEmpty().withMessage('عنوان روز الزامی است'),
    body('time_slot').trim().notEmpty().withMessage('بازه زمانی الزامی است'),
    body('title').trim().notEmpty().withMessage('عنوان برنامه الزامی است'),
    body('description').optional().trim(),
    body('course_id').optional().isUUID().withMessage('شناسه دوره نامعتبر است')
  ],
  
  // User profile validation
  profile: [
    body('full_name').optional().trim().isLength({ max: 255 }),
    body('national_id').optional().trim().matches(/^\d{10}$/).withMessage('کد ملی باید ۱۰ رقم باشد'),
    body('gender').optional().isIn(['male', 'female']).withMessage('جنسیت نامعتبر است'),
    body('field_of_study').optional().trim(),
    body('education_level').optional().trim(),
    body('university').optional().trim(),
    body('residence').optional().trim()
  ],
  
  // Pagination
  pagination: [
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('شماره صفحه نامعتبر است'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('تعداد نتایج نامعتبر است')
  ]
};

module.exports = {
  handleValidation,
  validators
};
