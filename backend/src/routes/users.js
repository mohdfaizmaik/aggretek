'use strict';
const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { resolveLocation, listStates, listDistricts } = require('../data/districtCentroids');
const { toPublicUser } = require('../utils/user');

// GET /api/users/locations — public, for profile + guest weather picker
router.get('/locations', (_req, res) => {
    const states = listStates().map((state) => ({
        state,
        districts: listDistricts(state),
    }));
    res.json({ states });
});

router.use(authMiddleware);

// GET /api/users/me
router.get('/me', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, email, preferred_lang, village, district, state, latitude, longitude
             FROM users WHERE id = $1`,
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ user: toPublicUser(result.rows[0]) });
    } catch (err) {
        console.error('[API/users/me GET]', err.message);
        res.status(500).json({ error: 'Failed to load profile' });
    }
});

// PATCH /api/users/me
router.patch('/me', async (req, res) => {
    try {
        const { village, district, state, latitude, longitude, preferred_lang } = req.body;

        const current = await db.query(
            'SELECT village, district, state, latitude, longitude, preferred_lang FROM users WHERE id = $1',
            [req.user.id]
        );
        const cur = current.rows[0];
        if (!cur) return res.status(404).json({ error: 'User not found' });

        const updates = [];
        const values = [];
        let idx = 1;

        if (village !== undefined) {
            updates.push(`village = $${idx++}`);
            values.push(village ? String(village).trim() : null);
        }
        if (preferred_lang !== undefined) {
            updates.push(`preferred_lang = $${idx++}`);
            values.push(preferred_lang === 'hi' ? 'hi' : 'en');
        }

        if (district !== undefined || state !== undefined || latitude !== undefined || longitude !== undefined) {
            const nextDistrict = district !== undefined ? district : cur.district;
            const nextState = state !== undefined ? state : cur.state;
            const gpsProvided = latitude != null && longitude != null
                && latitude !== '' && longitude !== '';

            // Manual district/state save must not keep old GPS (e.g. Nashik coords when user picks Delhi)
            const resolved = gpsProvided
                ? resolveLocation({
                    district: nextDistrict,
                    state: nextState,
                    latitude,
                    longitude,
                })
                : resolveLocation({ district: nextDistrict, state: nextState });

            updates.push(`district = $${idx++}`);
            values.push(resolved.district);
            updates.push(`state = $${idx++}`);
            values.push(resolved.state);
            updates.push(`latitude = $${idx++}`);
            values.push(resolved.latitude);
            updates.push(`longitude = $${idx++}`);
            values.push(resolved.longitude);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        values.push(req.user.id);
        const result = await db.query(
            `UPDATE users SET ${updates.join(', ')}
             WHERE id = $${idx}
             RETURNING id, email, preferred_lang, village, district, state, latitude, longitude`,
            values
        );

        res.json({ user: toPublicUser(result.rows[0]) });
    } catch (err) {
        console.error('[API/users/me PATCH]', err.message);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
