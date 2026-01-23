const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_ADMIN_EXPIRES_IN = process.env.JWT_ADMIN_EXPIRES_IN || '24h';

/**
 * Generate JWT token for user
 * @param {object} payload - Token payload
 * @param {string} payload.userId - User ID
 * @param {string} payload.phone - User phone
 * @param {string} payload.role - User role (user/admin)
 */
function generateToken(payload, isAdmin = false) {
  return jwt.sign(
    {
      userId: payload.userId,
      phone: payload.phone,
      role: payload.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: isAdmin ? JWT_ADMIN_EXPIRES_IN : JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('توکن منقضی شده است');
    }
    throw new Error('توکن نامعتبر است');
  }
}

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
