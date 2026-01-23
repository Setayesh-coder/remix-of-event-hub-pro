const db = require('../config/database');

/**
 * Get all schedules
 */
async function getAllSchedules(req, res, next) {
  try {
    const result = await db.query(
      `SELECT s.id, s.day_number, s.day_title, s.time_slot, s.title, s.description,
              s.course_id, c.title as course_title, s.created_at
       FROM schedules s
       LEFT JOIN courses c ON s.course_id = c.id
       ORDER BY s.day_number, s.time_slot`
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

/**
 * Get unique days
 */
async function getDays(req, res, next) {
  try {
    const result = await db.query(
      `SELECT DISTINCT day_number, day_title
       FROM schedules
       ORDER BY day_number`
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

/**
 * Get schedules by day
 */
async function getSchedulesByDay(req, res, next) {
  try {
    const { dayNumber } = req.params;
    
    const result = await db.query(
      `SELECT s.id, s.day_number, s.day_title, s.time_slot, s.title, s.description,
              s.course_id, c.title as course_title, s.created_at
       FROM schedules s
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE s.day_number = $1
       ORDER BY s.time_slot`,
      [dayNumber]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

/**
 * Get schedule by ID
 */
async function getScheduleById(req, res, next) {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT s.id, s.day_number, s.day_title, s.time_slot, s.title, s.description,
              s.course_id, c.title as course_title, s.created_at
       FROM schedules s
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE s.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'برنامه یافت نشد' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Create new schedule (admin)
 */
async function createSchedule(req, res, next) {
  try {
    const { day_number, day_title, time_slot, title, description, course_id } = req.body;
    
    const result = await db.query(
      `INSERT INTO schedules (day_number, day_title, time_slot, title, description, course_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [day_number, day_title, time_slot, title, description, course_id || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Update schedule (admin)
 */
async function updateSchedule(req, res, next) {
  try {
    const { id } = req.params;
    const { day_number, day_title, time_slot, title, description, course_id } = req.body;
    
    const result = await db.query(
      `UPDATE schedules 
       SET day_number = COALESCE($1, day_number),
           day_title = COALESCE($2, day_title),
           time_slot = COALESCE($3, time_slot),
           title = COALESCE($4, title),
           description = COALESCE($5, description),
           course_id = $6
       WHERE id = $7
       RETURNING *`,
      [day_number, day_title, time_slot, title, description, course_id || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'برنامه یافت نشد' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete schedule (admin)
 */
async function deleteSchedule(req, res, next) {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM schedules WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'برنامه یافت نشد' });
    }
    
    res.json({ success: true, message: 'برنامه حذف شد' });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete all schedules for a day (admin)
 */
async function deleteDay(req, res, next) {
  try {
    const { dayNumber } = req.params;
    
    const result = await db.query(
      'DELETE FROM schedules WHERE day_number = $1',
      [dayNumber]
    );
    
    res.json({ success: true, message: `${result.rowCount} برنامه حذف شد` });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllSchedules,
  getDays,
  getSchedulesByDay,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  deleteDay
};
