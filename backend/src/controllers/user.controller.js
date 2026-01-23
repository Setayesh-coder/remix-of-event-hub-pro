const db = require('../config/database');

/**
 * Get user profile
 */
async function getProfile(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, phone, full_name, national_id, gender, field_of_study,
              education_level, university, residence, created_at, updated_at
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
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 */
async function updateProfile(req, res, next) {
  try {
    const {
      full_name,
      national_id,
      gender,
      field_of_study,
      education_level,
      university,
      residence
    } = req.body;
    
    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           national_id = COALESCE($2, national_id),
           gender = COALESCE($3, gender),
           field_of_study = COALESCE($4, field_of_study),
           education_level = COALESCE($5, education_level),
           university = COALESCE($6, university),
           residence = COALESCE($7, residence)
       WHERE id = $8
       RETURNING id, phone, full_name, national_id, gender, field_of_study,
                 education_level, university, residence, updated_at`,
      [full_name, national_id, gender, field_of_study, education_level, university, residence, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }
    
    const user = result.rows[0];
    
    res.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.full_name,
        nationalId: user.national_id,
        gender: user.gender,
        fieldOfStudy: user.field_of_study,
        educationLevel: user.education_level,
        university: user.university,
        residence: user.residence,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user certificates
 */
async function getCertificates(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, title, certificate_url, issued_at
       FROM certificates
       WHERE user_id = $1
       ORDER BY issued_at DESC`,
      [req.user.userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

/**
 * Get user proposals
 */
async function getProposals(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, file_url, file_name, status, template_url, uploaded_at
       FROM proposals
       WHERE user_id = $1
       ORDER BY uploaded_at DESC`,
      [req.user.userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getCertificates,
  getProposals
};
