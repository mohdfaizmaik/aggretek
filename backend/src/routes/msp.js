'use strict';
const router = require('express').Router();
const db = require('../db');
const { cacheGet, cacheSet, TTL } = require('../cache/redis');

// GET /api/msp?commodity=Wheat&year=2025
router.get('/', async (req, res) => {
    try {
        const { commodity, year } = req.query;
        const safeYear = parseInt(year) || new Date().getFullYear();
        const cacheKey = `msp:${commodity || ''}:${safeYear}`;
        const cached = await cacheGet(cacheKey);
        if (cached) return res.json(cached);

        let queryText = `
      SELECT m.id, c.name_en, c.name_hi, m.season, m.year, m.msp_price, m.announced_at
      FROM msp m
      JOIN commodities c ON c.id = m.commodity_id
      WHERE m.year = $1`;
        const params = [safeYear];

        if (commodity) {
            params.push(`%${commodity.toLowerCase()}%`);
            queryText += ` AND (LOWER(c.name_en) LIKE $${params.length} OR LOWER(c.name_hi) LIKE $${params.length})`;
        }
        queryText += ' ORDER BY c.name_en, m.season';

        const result = await db.query(queryText, params);
        await cacheSet(cacheKey, result.rows, TTL.MSP);
        res.json(result.rows);
    } catch (err) {
        console.error('[API/msp]', err.message);
        res.status(500).json({ error: 'Failed to fetch MSP data' });
    }
});

module.exports = router;
