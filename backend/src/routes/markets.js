'use strict';
const router = require('express').Router();
const db = require('../db');
const { cacheGet, cacheSet, TTL } = require('../cache/redis');

// GET /api/markets?state=Maharashtra&search=pune
router.get('/', async (req, res) => {
    try {
        const { state, search } = req.query;
        const cacheKey = `markets:${state || ''}:${search || ''}`;
        const cached = await cacheGet(cacheKey);
        if (cached) return res.json(cached);

        let queryText = 'SELECT id, name, state, district FROM markets';
        const params = [];

        const conditions = [];
        if (state) {
            params.push(state);
            conditions.push(`LOWER(state) = LOWER($${params.length})`);
        }
        if (search) {
            params.push(`%${search.toLowerCase()}%`);
            conditions.push(`LOWER(name) LIKE $${params.length}`);
        }
        if (conditions.length) queryText += ' WHERE ' + conditions.join(' AND ');
        queryText += ' ORDER BY state, name LIMIT 200';

        const result = await db.query(queryText, params);
        await cacheSet(cacheKey, result.rows, TTL.MARKETS);
        res.json(result.rows);
    } catch (err) {
        console.error('[API/markets]', err.message);
        res.status(500).json({ error: 'Failed to fetch markets' });
    }
});

module.exports = router;
