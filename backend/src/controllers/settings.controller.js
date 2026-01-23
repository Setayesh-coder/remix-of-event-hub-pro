const db = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Get all site settings
 */
async function getSiteSettings(req, res, next) {
  try {
    const result = await db.query('SELECT key, value FROM site_settings');
    
    // Convert to object
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json(settings);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a single site setting (admin)
 */
async function updateSiteSetting(req, res, next) {
  try {
    const { key, value } = req.body;
    
    if (!key) {
      return res.status(400).json({ error: 'کلید تنظیم الزامی است' });
    }
    
    await db.query(
      `INSERT INTO site_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, value]
    );
    
    res.json({ success: true, message: 'تنظیم ذخیره شد' });
  } catch (error) {
    next(error);
  }
}

/**
 * Update multiple site settings at once (admin)
 */
async function updateSiteSettingsBulk(req, res, next) {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'تنظیمات نامعتبر است' });
    }
    
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      for (const [key, value] of Object.entries(settings)) {
        await client.query(
          `INSERT INTO site_settings (key, value)
           VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, value]
        );
      }
      
      await client.query('COMMIT');
      res.json({ success: true, message: 'تنظیمات ذخیره شد' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Upload file for site settings (background, logos, etc.)
 */
async function uploadSiteFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'فایل الزامی است' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    next(error);
  }
}

/**
 * Get card settings
 */
async function getCardSettings(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, card_image_url, updated_at FROM card_settings LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return res.json({ cardImageUrl: null });
    }
    
    res.json({
      id: result.rows[0].id,
      cardImageUrl: result.rows[0].card_image_url,
      updatedAt: result.rows[0].updated_at
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update card settings (admin)
 */
async function updateCardSettings(req, res, next) {
  try {
    // Get current settings
    const current = await db.query('SELECT id, card_image_url FROM card_settings LIMIT 1');
    
    let cardImageUrl = current.rows.length > 0 ? current.rows[0].card_image_url : null;
    
    if (req.file) {
      // Delete old image if exists
      if (cardImageUrl) {
        const oldPath = path.join(__dirname, '../../', cardImageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      cardImageUrl = `/uploads/${req.file.filename}`;
    }
    
    if (current.rows.length === 0) {
      // Insert new record
      await db.query(
        'INSERT INTO card_settings (card_image_url) VALUES ($1)',
        [cardImageUrl]
      );
    } else {
      // Update existing
      await db.query(
        'UPDATE card_settings SET card_image_url = $1 WHERE id = $2',
        [cardImageUrl, current.rows[0].id]
      );
    }
    
    res.json({ success: true, cardImageUrl });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete card image (admin)
 */
async function deleteCardImage(req, res, next) {
  try {
    const current = await db.query('SELECT id, card_image_url FROM card_settings LIMIT 1');
    
    if (current.rows.length > 0 && current.rows[0].card_image_url) {
      // Delete file
      const imagePath = path.join(__dirname, '../../', current.rows[0].card_image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      // Update database
      await db.query(
        'UPDATE card_settings SET card_image_url = NULL WHERE id = $1',
        [current.rows[0].id]
      );
    }
    
    res.json({ success: true, message: 'تصویر کارت حذف شد' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSiteSettings,
  updateSiteSetting,
  updateSiteSettingsBulk,
  uploadSiteFile,
  getCardSettings,
  updateCardSettings,
  deleteCardImage
};
