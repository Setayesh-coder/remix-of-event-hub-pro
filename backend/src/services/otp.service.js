const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { sendOTP } = require('./sms.service');

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH) || 6;
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;

/**
 * Generate a random numeric OTP code
 */
function generateOTPCode(length = OTP_LENGTH) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

/**
 * Create and send OTP to phone number
 * @param {string} phone - Phone number (11 digits starting with 09)
 */
async function createAndSendOTP(phone) {
  // Invalidate any existing pending OTPs for this phone
  await db.query(`
    UPDATE otp_codes 
    SET status = 'expired' 
    WHERE phone = $1 AND status = 'pending'
  `, [phone]);
  
  // Generate new OTP
  const code = generateOTPCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  
  // Store OTP in database
  await db.query(`
    INSERT INTO otp_codes (phone, code_hash, expires_at)
    VALUES ($1, $2, $3)
  `, [phone, codeHash, expiresAt]);
  
  // Send OTP via SMS
  await sendOTP(phone, code);
  
  return {
    success: true,
    expiresIn: OTP_EXPIRY_MINUTES * 60, // seconds
    message: 'کد تأیید ارسال شد'
  };
}

/**
 * Verify OTP code
 * @param {string} phone - Phone number
 * @param {string} code - OTP code to verify
 */
async function verifyOTP(phone, code) {
  // Get the latest pending OTP for this phone
  const result = await db.query(`
    SELECT id, code_hash, attempts, max_attempts, expires_at
    FROM otp_codes
    WHERE phone = $1 AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
  `, [phone]);
  
  if (result.rows.length === 0) {
    return { valid: false, error: 'کد تأیید یافت نشد. لطفاً کد جدید درخواست کنید.' };
  }
  
  const otp = result.rows[0];
  
  // Check if expired
  if (new Date() > new Date(otp.expires_at)) {
    await db.query(`UPDATE otp_codes SET status = 'expired' WHERE id = $1`, [otp.id]);
    return { valid: false, error: 'کد تأیید منقضی شده است. لطفاً کد جدید درخواست کنید.' };
  }
  
  // Check max attempts
  if (otp.attempts >= otp.max_attempts) {
    await db.query(`UPDATE otp_codes SET status = 'expired' WHERE id = $1`, [otp.id]);
    return { valid: false, error: 'تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کد جدید درخواست کنید.' };
  }
  
  // Increment attempts
  await db.query(`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1`, [otp.id]);
  
  // Verify code
  const isValid = await bcrypt.compare(code, otp.code_hash);
  
  if (!isValid) {
    const remainingAttempts = otp.max_attempts - otp.attempts - 1;
    return { 
      valid: false, 
      error: `کد تأیید اشتباه است. ${remainingAttempts} تلاش باقی مانده.`,
      remainingAttempts
    };
  }
  
  // Mark as verified
  await db.query(`UPDATE otp_codes SET status = 'verified' WHERE id = $1`, [otp.id]);
  
  return { valid: true };
}

/**
 * Cleanup expired OTPs (can be run as a cron job)
 */
async function cleanupExpiredOTPs() {
  const result = await db.query(`
    DELETE FROM otp_codes 
    WHERE expires_at < NOW() - INTERVAL '1 day'
    OR status = 'expired'
    OR status = 'verified'
  `);
  
  console.log(`🧹 Cleaned up ${result.rowCount} expired OTP codes`);
  return result.rowCount;
}

module.exports = {
  generateOTPCode,
  createAndSendOTP,
  verifyOTP,
  cleanupExpiredOTPs
};
