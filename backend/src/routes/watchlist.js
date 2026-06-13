'use strict';
const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// All watchlist routes require auth
router.use(authMiddleware);

// GET /api/watchlist — includes latest price + MSP for each item
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT w.id, c.id AS commodity_id, c.name_en, c.name_hi,
              mk.id AS market_id, mk.name AS market_name, mk.state, mk.district,
              w.created_at,
              lp.min_price, lp.max_price, lp.modal_price, lp.price_date, lp.fetched_at, lp.source,
              msp.msp_price,
              CASE WHEN msp.msp_price IS NOT NULL AND lp.modal_price IS NOT NULL THEN
                CASE WHEN lp.modal_price >= msp.msp_price THEN 'above' ELSE 'below' END
              ELSE NULL END AS msp_status
       FROM watchlist w
       JOIN commodities c ON c.id = w.commodity_id
       LEFT JOIN markets mk ON mk.id = w.market_id
       LEFT JOIN LATERAL (
         SELECT p.min_price, p.max_price, p.modal_price, p.price_date, p.fetched_at, p.source
         FROM prices p
         WHERE p.commodity_id = w.commodity_id
           AND (w.market_id IS NULL OR p.market_id = w.market_id)
         ORDER BY p.price_date DESC, p.fetched_at DESC
         LIMIT 1
       ) lp ON true
       LEFT JOIN LATERAL (
         SELECT m.msp_price
         FROM msp m
         WHERE m.commodity_id = c.id
         ORDER BY m.year DESC
         LIMIT 1
       ) msp ON true
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[API/watchlist GET]', err.message);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

// POST /api/watchlist
router.post('/', async (req, res) => {
    try {
        const { commodity_id, market_id } = req.body;
        if (!commodity_id) return res.status(400).json({ error: 'commodity_id is required' });

        const result = await db.query(
            `INSERT INTO watchlist (user_id, commodity_id, market_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, commodity_id, market_id) DO NOTHING
       RETURNING id`,
            [req.user.id, commodity_id, market_id || null]
        );

        if (result.rows.length === 0)
            return res.status(409).json({ error: 'Already in watchlist' });
        res.status(201).json({ id: result.rows[0].id });
    } catch (err) {
        console.error('[API/watchlist POST]', err.message);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

// DELETE /api/watchlist/:id
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM watchlist WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Watchlist item not found' });
        res.json({ deleted: true });
    } catch (err) {
        console.error('[API/watchlist DELETE]', err.message);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

module.exports = router;
