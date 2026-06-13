'use strict';
const router = require('express').Router();
const db = require('../db');
const { cacheGet, cacheSet, TTL } = require('../cache/redis');

// GET /api/commodities
router.get('/', async (req, res) => {
    try {
        const cacheKey = 'commodities:all';
        const cached = await cacheGet(cacheKey);
        if (cached) return res.json(cached);

        const { search, category } = req.query;
        let queryText = 'SELECT id, name_en, name_hi, aliases, category FROM commodities';
        const params = [];

        if (search || category) {
            queryText += ' WHERE';
            if (search) {
                params.push(`%${search.toLowerCase()}%`);
                queryText += ` (LOWER(name_en) LIKE $${params.length} OR LOWER(name_hi) LIKE $${params.length} OR EXISTS (
          SELECT 1 FROM unnest(aliases) a WHERE LOWER(a) LIKE $${params.length}
        ))`;
            }
            if (category) {
                if (search) queryText += ' AND';
                params.push(category);
                queryText += ` category = $${params.length}`;
            }
        }
        queryText += ' ORDER BY name_en';

        const result = await db.query(queryText, params);
        const data = result.rows;
        await cacheSet(cacheKey, data, TTL.COMMODITIES);
        res.json(data);
    } catch (err) {
        console.error('[API/commodities]', err.message);
        res.status(500).json({ error: 'Failed to fetch commodities' });
    }
});

module.exports = router;
