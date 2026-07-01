'use strict';
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { toPublicUser } = require('../utils/user');

const JWT_SECRET = process.env.JWT_SECRET;
// Note: Middleware already checks for JWT_SECRET at boot, but keeping it robust here.
const JWT_EXPIRES = '7d';

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// POST /api/auth/register
router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        validate,
    ],
    async (req, res) => {
        try {
            const { email, password, preferred_lang = 'en' } = req.body;
            // Existing checks for !email || !password are now handled by validator

        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existing.rows.length > 0)
            return res.status(409).json({ error: 'Email already registered' });

        const hash = await bcrypt.hash(password, 10);
        const result = await db.query(
            `INSERT INTO users (email, password_hash, preferred_lang)
             VALUES ($1, $2, $3)
             RETURNING id, email, preferred_lang, village, district, state, latitude, longitude`,
            [email.toLowerCase(), hash, preferred_lang]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        res.status(201).json({ token, user: toPublicUser(user) });
    } catch (err) {
        console.error('[API/auth/register]', err.message);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').notEmpty().withMessage('Password is required'),
        validate,
    ],
    async (req, res) => {
        try {
            const { email, password } = req.body;
            // Existing checks for !email || !password are now handled by validator

        const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash)))
            return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        res.json({ token, user: toPublicUser(user) });
    } catch (err) {
        console.error('[API/auth/login]', err.message);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
