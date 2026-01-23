const { verifyToken } = require('../services/jwt.service');
const db = require('../config/database');

/**
 * Middleware to verify JWT token
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'توکن احراز هویت یافت نشد' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      phone: decoded.phone,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}

/**
 * Middleware to verify admin role
 */
async function requireAdmin(req, res, next) {
  try {
    // First authenticate
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'توکن احراز هویت یافت نشد' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'دسترسی ادمین مورد نیاز است' });
    }
    
    // Verify admin still exists and is active
    const result = await db.query(
      'SELECT id, is_active FROM admins WHERE id = $1',
      [decoded.userId]
    );
    
    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(403).json({ error: 'حساب ادمین غیرفعال است' });
    }
    
    req.user = {
      userId: decoded.userId,
      phone: decoded.phone,
      role: 'admin'
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        phone: decoded.phone,
        role: decoded.role
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth
};
