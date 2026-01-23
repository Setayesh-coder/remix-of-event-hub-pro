const db = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Get all courses
 */
async function getAllCourses(req, res, next) {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, title, description, category, price, original_price,
             duration, instructor, image_url, skyroom_link, created_at
      FROM courses
      WHERE is_active = true
    `;
    const params = [];
    
    if (category && category !== 'all') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM courses WHERE is_active = true';
    const countParams = [];
    if (category && category !== 'all') {
      countParams.push(category);
      countQuery += ` AND category = $1`;
    }
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      courses: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get course by ID
 */
async function getCourseById(req, res, next) {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT id, title, description, category, price, original_price,
              duration, instructor, image_url, skyroom_link, created_at
       FROM courses WHERE id = $1 AND is_active = true`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'دوره یافت نشد' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Create new course (admin)
 */
async function createCourse(req, res, next) {
  try {
    const { title, description, category, price, original_price, duration, instructor, skyroom_link } = req.body;
    
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    const result = await db.query(
      `INSERT INTO courses (title, description, category, price, original_price, duration, instructor, image_url, skyroom_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, category, price || 0, original_price, duration, instructor, image_url, skyroom_link]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Update course (admin)
 */
async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, category, price, original_price, duration, instructor, skyroom_link } = req.body;
    
    // Get current course
    const current = await db.query('SELECT image_url FROM courses WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'دوره یافت نشد' });
    }
    
    let image_url = current.rows[0].image_url;
    if (req.file) {
      // Delete old image if exists
      if (image_url) {
        const oldPath = path.join(__dirname, '../../', image_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      image_url = `/uploads/${req.file.filename}`;
    }
    
    const result = await db.query(
      `UPDATE courses 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           price = COALESCE($4, price),
           original_price = $5,
           duration = COALESCE($6, duration),
           instructor = COALESCE($7, instructor),
           image_url = COALESCE($8, image_url),
           skyroom_link = $9
       WHERE id = $10
       RETURNING *`,
      [title, description, category, price, original_price, duration, instructor, image_url, skyroom_link, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete course (admin)
 */
async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    
    // Get course image
    const current = await db.query('SELECT image_url FROM courses WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'دوره یافت نشد' });
    }
    
    // Delete image file
    if (current.rows[0].image_url) {
      const imagePath = path.join(__dirname, '../../', current.rows[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await db.query('DELETE FROM courses WHERE id = $1', [id]);
    
    res.json({ success: true, message: 'دوره حذف شد' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user's enrolled courses
 */
async function getUserCourses(req, res, next) {
  try {
    const result = await db.query(
      `SELECT c.id, c.title, c.description, c.category, c.duration, 
              c.instructor, c.image_url, c.skyroom_link, uc.purchased_at
       FROM user_courses uc
       JOIN courses c ON uc.course_id = c.id
       WHERE uc.user_id = $1
       ORDER BY uc.purchased_at DESC`,
      [req.user.userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

/**
 * Get user's cart items
 */
async function getCartItems(req, res, next) {
  try {
    const result = await db.query(
      `SELECT c.id, c.title, c.description, c.category, c.price, 
              c.original_price, c.duration, c.instructor, c.image_url, ci.added_at
       FROM cart_items ci
       JOIN courses c ON ci.course_id = c.id
       WHERE ci.user_id = $1
       ORDER BY ci.added_at DESC`,
      [req.user.userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

/**
 * Add course to cart
 */
async function addToCart(req, res, next) {
  try {
    const { courseId } = req.params;
    
    // Check if course exists
    const course = await db.query('SELECT id FROM courses WHERE id = $1 AND is_active = true', [courseId]);
    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'دوره یافت نشد' });
    }
    
    // Check if already in cart
    const existing = await db.query(
      'SELECT id FROM cart_items WHERE user_id = $1 AND course_id = $2',
      [req.user.userId, courseId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'دوره قبلاً به سبد خرید اضافه شده' });
    }
    
    // Check if already purchased
    const purchased = await db.query(
      'SELECT id FROM user_courses WHERE user_id = $1 AND course_id = $2',
      [req.user.userId, courseId]
    );
    
    if (purchased.rows.length > 0) {
      return res.status(400).json({ error: 'شما قبلاً این دوره را خریداری کرده‌اید' });
    }
    
    await db.query(
      'INSERT INTO cart_items (user_id, course_id) VALUES ($1, $2)',
      [req.user.userId, courseId]
    );
    
    res.json({ success: true, message: 'دوره به سبد خرید اضافه شد' });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove course from cart
 */
async function removeFromCart(req, res, next) {
  try {
    const { courseId } = req.params;
    
    const result = await db.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND course_id = $2 RETURNING id',
      [req.user.userId, courseId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'دوره در سبد خرید یافت نشد' });
    }
    
    res.json({ success: true, message: 'دوره از سبد خرید حذف شد' });
  } catch (error) {
    next(error);
  }
}

/**
 * Enroll in a course (for free courses)
 */
async function enrollCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    
    // Check if course exists and is free
    const course = await db.query(
      'SELECT id, price FROM courses WHERE id = $1 AND is_active = true',
      [courseId]
    );
    
    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'دوره یافت نشد' });
    }
    
    if (course.rows[0].price > 0) {
      return res.status(400).json({ error: 'این دوره رایگان نیست' });
    }
    
    // Check if already enrolled
    const existing = await db.query(
      'SELECT id FROM user_courses WHERE user_id = $1 AND course_id = $2',
      [req.user.userId, courseId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'شما قبلاً در این دوره ثبت‌نام کرده‌اید' });
    }
    
    await db.query(
      'INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2)',
      [req.user.userId, courseId]
    );
    
    // Remove from cart if exists
    await db.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND course_id = $2',
      [req.user.userId, courseId]
    );
    
    res.json({ success: true, message: 'ثبت‌نام با موفقیت انجام شد' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getUserCourses,
  getCartItems,
  addToCart,
  removeFromCart,
  enrollCourse
};
