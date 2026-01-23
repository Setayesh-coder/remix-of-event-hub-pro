const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../services/jwt.service');

/**
 * Admin login with phone and password
 */
async function login(req, res, next) {
  try {
    const { phone, password } = req.body;
    
    // Find admin by phone
    const result = await db.query(
      'SELECT id, phone, password_hash, full_name, is_active FROM admins WHERE phone = $1',
      [phone]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'شماره موبایل یا رمز عبور اشتباه است' });
    }
    
    const admin = result.rows[0];
    
    if (!admin.is_active) {
      return res.status(403).json({ error: 'حساب ادمین غیرفعال است' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'شماره موبایل یا رمز عبور اشتباه است' });
    }
    
    // Update last login
    await db.query(
      'UPDATE admins SET last_login = NOW() WHERE id = $1',
      [admin.id]
    );
    
    // Generate token
    const token = generateToken({
      userId: admin.id,
      phone: admin.phone,
      role: 'admin'
    }, true);
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        phone: admin.phone,
        fullName: admin.full_name
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current admin info
 */
async function getCurrentAdmin(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, phone, full_name, last_login, created_at FROM admins WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ادمین یافت نشد' });
    }
    
    const admin = result.rows[0];
    
    res.json({
      id: admin.id,
      phone: admin.phone,
      fullName: admin.full_name,
      lastLogin: admin.last_login,
      createdAt: admin.created_at
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Change admin password
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, password } = req.body;
    
    // Get current admin
    const result = await db.query(
      'SELECT password_hash FROM admins WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ادمین یافت نشد' });
    }
    
    // Verify current password if provided
    if (currentPassword) {
      const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
      if (!isValid) {
        return res.status(400).json({ error: 'رمز عبور فعلی اشتباه است' });
      }
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Update password
    await db.query(
      'UPDATE admins SET password_hash = $1 WHERE id = $2',
      [passwordHash, req.user.userId]
    );
    
    res.json({ success: true, message: 'رمز عبور تغییر کرد' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all users
 */
async function getAllUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const result = await db.query(
      `SELECT id, phone, full_name, national_id, gender, field_of_study,
              education_level, university, residence, is_active, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const countResult = await db.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user by ID
 */
async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT id, phone, full_name, national_id, gender, field_of_study,
              education_level, university, residence, is_active, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Update user status (activate/deactivate)
 */
async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const result = await db.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, is_active',
      [is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete user
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }
    
    res.json({ success: true, message: 'کاربر حذف شد' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get dashboard statistics
 */
async function getDashboardStats(req, res, next) {
  try {
    const [usersCount, coursesCount, galleryCount, schedulesCount] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query('SELECT COUNT(*) FROM courses'),
      db.query('SELECT COUNT(*) FROM gallery_images'),
      db.query('SELECT COUNT(*) FROM schedules')
    ]);
    
    // Recent users
    const recentUsers = await db.query(
      `SELECT id, phone, full_name, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 5`
    );
    
    res.json({
      stats: {
        users: parseInt(usersCount.rows[0].count),
        courses: parseInt(coursesCount.rows[0].count),
        gallery: parseInt(galleryCount.rows[0].count),
        schedules: parseInt(schedulesCount.rows[0].count)
      },
      recentUsers: recentUsers.rows
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getCurrentAdmin,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getDashboardStats
};
