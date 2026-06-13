'use strict';
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
    try {
        console.log('Testing connection to:', process.env.DATABASE_URL);
        const res = await pool.query('SELECT NOW()');
        console.log('Success!', res.rows[0]);
    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await pool.end();
    }
}

test();
