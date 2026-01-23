const db = require('../config/database');
const { createAndSendOTP, verifyOTP } = require('../services/otp.service');
const { generateToken } = require('../services/jwt.service');

/**
 * Request OTP for login/registration
 */
async function requestOTP(req, res, next) {
  try {
    const { phone } = req.body;
    
    const result = await createAndSendOTP(phone);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Verify OTP and login/register user
 */
async function verifyOTPHandler(req, res, next) {
  try {
    const { phone, code } = req.body;
    
    // Verify OTP
    const otpResult = await verifyOTP(phone, code);
    
    if (!otpResult.valid) {
      return res.status(400).json({ error: otpResult.error });
    }
    
    // Check if user exists
    let result = await db.query(
      'SELECT id, phone, full_name, role FROM users WHERE phone = $1',
      [phone]
    );
    
    let user;
    let isNewUser = false;
    
    if (result.rows.length === 0) {
      // Create new user
      result = await db.query(
        'INSERT INTO users (phone) VALUES ($1) RETURNING id, phone, full_name, role',
        [phone]
      );
      isNewUser = true;
    }
    
    user = result.rows[0];
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      role: user.role
    });
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.full_name,
        role: user.role
      },
      isNewUser
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user
 */
async function getCurrentUser(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, phone, full_name, national_id, gender, field_of_study, 
              education_level, university, residence, role, created_at
       FROM users WHERE id = $1`,
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }
    
    const user = result.rows[0];
    
    res.json({
      id: user.id,
      phone: user.phone,
      fullName: user.full_name,
      nationalId: user.national_id,
      gender: user.gender,
      fieldOfStudy: user.field_of_study,
      educationLevel: user.education_level,
      university: user.university,
      residence: user.residence,
      role: user.role,
      createdAt: user.created_at
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout (placeholder for token invalidation)
 */
async function logout(req, res) {
  // In a stateless JWT system, logout is handled client-side
  // For added security, you could implement token blacklisting here
  res.json({ success: true, message: 'خروج موفق' });
}

module.exports = {
  requestOTP,
  verifyOTP: verifyOTPHandler,
  getCurrentUser,
  logout
};
