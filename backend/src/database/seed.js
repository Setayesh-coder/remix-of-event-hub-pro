require('dotenv').config();
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding database...');
    
    // Create default admin
    const adminPhone = process.env.ADMIN_PHONE || '09123456789';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    await client.query(`
      INSERT INTO admins (phone, password_hash, full_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (phone) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
    `, [adminPhone, passwordHash, 'مدیر سیستم']);
    
    console.log(`✅ Admin created: ${adminPhone}`);
    
    // Insert default site settings
    const defaultSettings = [
      { key: 'hero_title', value: 'مرکز تحقیقات اپتوالکترونیک' },
      { key: 'hero_description', value: 'پیشرو در تحقیقات نوین اپتوالکترونیک' },
      { key: 'countdown_target', value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
    ];
    
    for (const setting of defaultSettings) {
      await client.query(`
        INSERT INTO site_settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO NOTHING
      `, [setting.key, setting.value]);
    }
    
    console.log('✅ Default settings created');
    
    // Insert sample courses
    const sampleCourses = [
      {
        title: 'کارگاه مقدماتی لیزر',
        description: 'آشنایی با مبانی لیزر و کاربردهای آن',
        category: 'workshop',
        price: 500000,
        duration: '8 ساعت',
        instructor: 'دکتر احمدی'
      },
      {
        title: 'وبینار فوتونیک',
        description: 'آخرین پیشرفت‌ها در علم فوتونیک',
        category: 'webinar',
        price: 0,
        duration: '2 ساعت',
        instructor: 'دکتر محمدی'
      }
    ];
    
    for (const course of sampleCourses) {
      await client.query(`
        INSERT INTO courses (title, description, category, price, duration, instructor)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [course.title, course.description, course.category, course.price, course.duration, course.instructor]);
    }
    
    console.log('✅ Sample courses created');
    console.log('🎉 Seeding completed!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
