'use strict';
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
});

/**
 * Execute a query against the PostgreSQL pool.
 * @param {string} text - SQL query text
 * @param {any[]} [params] - Query parameters
 */
async function query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
        console.debug(`[DB] query=${text.slice(0, 80)} | rows=${res.rowCount} | ${duration}ms`);
    }
    return res;
}

async function getClient() {
    return pool.connect();
}

async function close() {
    await pool.end();
}

module.exports = { query, getClient, close, pool };
