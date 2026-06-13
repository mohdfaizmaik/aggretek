require('dotenv').config();
const db = require('./src/db');
async function check() {
  try {
    const commods = await db.query('SELECT count(*) FROM commodities');
    const markets = await db.query('SELECT count(*) FROM markets');
    const prices = await db.query('SELECT count(*) FROM prices');
    console.log('--- Database Stats ---');
    console.log('Commodities:', commods.rows[0].count);
    console.log('Markets:', markets.rows[0].count);
    console.log('Prices:', prices.rows[0].count);
    process.exit(0);
  } catch (err) {
    console.error('DB Connection Error:', err.message);
    process.exit(1);
  }
}
check();
