'use strict';
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'agritech-dev-secret-change-in-prod';
const JWT_EXPIRES = '7d';

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, preferred_lang = 'en' } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password are required' });
        if (password.length < 6)
            return res.status(400).json({ error: 'Password must be at least 6 characters' });

        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existing.rows.length > 0)
            return res.status(409).json({ error: 'Email already registered' });

        const hash = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (email, password_hash, preferred_lang) VALUES ($1, $2, $3) RETURNING id, email, preferred_lang',
            [email.toLowerCase(), hash, preferred_lang]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        res.status(201).json({ token, user: { id: user.id, email: user.email, preferred_lang: user.preferred_lang } });
    } catch (err) {
        console.error('[API/auth/register]', err.message);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password are required' });

        const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash)))
            return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        res.json({ token, user: { id: user.id, email: user.email, preferred_lang: user.preferred_lang } });
    } catch (err) {
        console.error('[API/auth/login]', err.message);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
