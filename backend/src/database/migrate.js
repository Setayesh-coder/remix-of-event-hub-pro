require('dotenv').config();
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running migrations...');
    
    // Read and execute migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);
