require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    try {
        console.log('Starting migration for watchlist WhatsApp alerts...');
        await pool.query(`
            ALTER TABLE watchlist 
            ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS price_threshold_pct NUMERIC DEFAULT 5.0,
            ADD COLUMN IF NOT EXISTS last_notified_price NUMERIC,
            ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMP;
        `);
        console.log('Migration successful.');
        await pool.end();
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}
migrate();
