const db = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Get all gallery images
 */
async function getAllImages(req, res, next) {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, image_url, title, category, event_date, event_time, created_at
      FROM gallery_images
    `;
    const params = [];
    
    if (category) {
      params.push(category);
      query += ` WHERE category = $${params.length}`;
    }
    
    query += ` ORDER BY event_date DESC NULLS LAST, created_at DESC`;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM gallery_images';
    const countParams = [];
    if (category) {
      countParams.push(category);
      countQuery += ` WHERE category = $1`;
    }
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      images: result.rows,
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
 * Get image by ID
 */
async function getImageById(req, res, next) {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT id, image_url, title, category, event_date, event_time, created_at
       FROM gallery_images WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'تصویر یافت نشد' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Create new gallery image (admin)
 */
async function createImage(req, res, next) {
  try {
    const { title, category, event_date, event_time } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'تصویر الزامی است' });
    }
    
    const image_url = `/uploads/${req.file.filename}`;
    
    const result = await db.query(
      `INSERT INTO gallery_images (image_url, title, category, event_date, event_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [image_url, title, category, event_date || null, event_time || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Update gallery image (admin)
 */
async function updateImage(req, res, next) {
  try {
    const { id } = req.params;
    const { title, category, event_date, event_time } = req.body;
    
    // Get current image
    const current = await db.query('SELECT image_url FROM gallery_images WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'تصویر یافت نشد' });
    }
    
    let image_url = current.rows[0].image_url;
    if (req.file) {
      // Delete old image
      if (image_url) {
        const oldPath = path.join(__dirname, '../../', image_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      image_url = `/uploads/${req.file.filename}`;
    }
    
    const result = await db.query(
      `UPDATE gallery_images 
       SET title = COALESCE($1, title),
           category = COALESCE($2, category),
           event_date = $3,
           event_time = $4,
           image_url = COALESCE($5, image_url)
       WHERE id = $6
       RETURNING *`,
      [title, category, event_date || null, event_time || null, image_url, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete gallery image (admin)
 */
async function deleteImage(req, res, next) {
  try {
    const { id } = req.params;
    
    // Get image
    const current = await db.query('SELECT image_url FROM gallery_images WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'تصویر یافت نشد' });
    }
    
    // Delete file
    if (current.rows[0].image_url) {
      const imagePath = path.join(__dirname, '../../', current.rows[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await db.query('DELETE FROM gallery_images WHERE id = $1', [id]);
    
    res.json({ success: true, message: 'تصویر حذف شد' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllImages,
  getImageById,
  createImage,
  updateImage,
  deleteImage
};
