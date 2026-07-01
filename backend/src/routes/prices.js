'use strict';
const router = require('express').Router();
const db = require('../db');
const { cacheGet, cacheSet, TTL } = require('../cache/redis');
const { normaliseCropName } = require('../services/normalise');
const { getCommodityForecast } = require('../services/forecast');

/**
 * GET /api/prices
 * Query params:
 *   commodity  - commodity name (en or hi)
 *   market     - market name
 *   state      - state name
 *   days       - number of days of history (default 7)
 *   page       - page number (default 1)
 *   limit      - rows per page (default 50, max 200)
 *   sort       - modal_price|min_price|max_price|price_date (default price_date)
 *   order      - asc|desc (default desc)
 */
router.get('/', async (req, res) => {
    try {
        const {
            commodity,
            market,
            state,
            days = 7,
            page = 1,
            limit = 50,
            sort = 'price_date',
            order = 'desc',
        } = req.query;

        const safeSort = ['modal_price', 'min_price', 'max_price', 'price_date', 'commodity_en', 'market_name', 'state'].includes(sort)
            ? sort : 'price_date';
        const sortColumn = {
            commodity_en: 'c.name_en',
            market_name: 'mk.name',
            state: 'mk.state',
            modal_price: 'p.modal_price',
            min_price: 'p.min_price',
            max_price: 'p.max_price',
            price_date: 'p.price_date',
        }[safeSort];
        const safeOrder = order === 'asc' ? 'ASC' : 'DESC';
        const safeDays = Math.min(Math.max(parseInt(days) || 365, 1), 730);
        const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 200);
        const offset = (Math.max(parseInt(page) || 1, 1) - 1) * safeLimit;

        const cacheKey = `prices:${commodity || ''}:${market || ''}:${state || ''}:${safeDays}:${page}:${safeLimit}:${safeSort}:${safeOrder}`;
        const cached = await cacheGet(cacheKey);
        if (cached) return res.json(cached);

        const params = [safeDays || 365];
        const conditions = [
            `p.price_date >= CURRENT_DATE - ($1 || ' days')::INTERVAL`,
        ];

        if (commodity) {
            const canonical = normaliseCropName(commodity);
            if (canonical) {
                params.push(canonical.toLowerCase());
                conditions.push(`LOWER(c.name_en) = $${params.length}`);
            } else {
                params.push(`%${commodity.toLowerCase()}%`);
                conditions.push(`(LOWER(c.name_en) LIKE $${params.length} OR LOWER(c.name_hi) LIKE $${params.length} OR EXISTS (
        SELECT 1 FROM unnest(c.aliases) a WHERE LOWER(a) LIKE $${params.length}
      ))`);
            }
        }
        if (market) {
            params.push(`%${market.toLowerCase()}%`);
            conditions.push(`LOWER(mk.name) LIKE $${params.length}`);
        }
        if (state) {
            params.push(state.toLowerCase());
            conditions.push(`LOWER(mk.state) = $${params.length}`);
        }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

        // Count total for pagination
        const countResult = await db.query(
            `SELECT COUNT(*) FROM prices p
       JOIN commodities c ON c.id = p.commodity_id
       JOIN markets mk ON mk.id = p.market_id
       ${where}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        // Fetch page with MSP join
        params.push(safeLimit, offset);
        const dataResult = await db.query(
            `SELECT
          p.id,
          c.id AS commodity_id,
          c.name_en AS commodity_en,
          c.name_hi AS commodity_hi,
          mk.id AS market_id,
          mk.name AS market_name,
          mk.state,
          mk.district,
          p.min_price,
          p.max_price,
          p.modal_price,
          p.price_date,
          p.fetched_at,
          p.source,
          msp.msp_price,
          CASE WHEN msp.msp_price IS NOT NULL THEN
            CASE WHEN p.modal_price >= msp.msp_price THEN 'above' ELSE 'below' END
          ELSE NULL END AS msp_status,
          trend_data.avg_7d,
          CASE 
            WHEN p.modal_price > trend_data.avg_7d * 1.02 THEN 'bullish'
            WHEN p.modal_price < trend_data.avg_7d * 0.98 THEN 'bearish'
            ELSE 'stable'
          END AS trend
       FROM prices p
       JOIN commodities c ON c.id = p.commodity_id
       JOIN markets mk ON mk.id = p.market_id
          LEFT JOIN msp ON msp.commodity_id = c.id AND msp.year = (
            SELECT MAX(m2.year) FROM msp m2 WHERE m2.commodity_id = c.id
          )
          LEFT JOIN LATERAL (
            SELECT AVG(p2.modal_price) as avg_7d
            FROM prices p2
            WHERE p2.commodity_id = p.commodity_id
              AND p2.market_id = p.market_id
              AND p2.price_date < p.price_date
              AND p2.price_date >= p.price_date - INTERVAL '7 days'
          ) trend_data ON true
       ${where}
       ORDER BY ${sortColumn} ${safeOrder}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
            params
        );

        const response = {
            data: dataResult.rows,
            pagination: {
                total,
                page: Math.max(parseInt(page) || 1, 1),
                limit: safeLimit,
                pages: Math.ceil(total / safeLimit),
            },
            meta: {
                last_fetched: dataResult.rows.length > 0
                    ? dataResult.rows.reduce((a, b) =>
                        new Date(a.fetched_at) > new Date(b.fetched_at) ? a : b
                    ).fetched_at
                    : null,
            },
        };

        await cacheSet(cacheKey, response, TTL.PRICES);
        res.json(response);
    } catch (err) {
        console.error('[API/prices]', err.message);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

/**
 * GET /api/prices/sparkline?commodity=Wheat&market=Nagpur&days=7
 * Returns daily modal price series for sparkline chart
 */
router.get('/sparkline', async (req, res) => {
    try {
        const { commodity, market, days = 7 } = req.query;
        if (!commodity) return res.status(400).json({ error: 'commodity is required' });

        const canonical = normaliseCropName(commodity) || commodity;
        const safeDays = Math.min(Math.max(parseInt(days) || 365, 1), 730);
        const cacheKey = `sparkline:${canonical}:${market || ''}:${safeDays}`;
        const cached = await cacheGet(cacheKey);
        if (cached) return res.json(cached);

        const params = [canonical.toLowerCase(), safeDays];
        let marketFilter = '';
        if (market) {
            params.push(`%${market.toLowerCase()}%`);
            marketFilter = `AND LOWER(mk.name) LIKE $${params.length}`;
        }

        const result = await db.query(
            `SELECT
          p.price_date,
          ROUND(AVG(p.modal_price)::numeric, 2) AS modal_price,
          ROUND(AVG(p.min_price)::numeric, 2) AS min_price,
          ROUND(AVG(p.max_price)::numeric, 2) AS max_price
       FROM prices p
       JOIN commodities c ON c.id = p.commodity_id
       JOIN markets mk ON mk.id = p.market_id
       WHERE LOWER(c.name_en) = $1
         AND p.price_date >= CURRENT_DATE - ($2 || ' days')::INTERVAL
         ${marketFilter}
       GROUP BY p.price_date
       ORDER BY p.price_date ASC`,
            params
        );

        await cacheSet(cacheKey, result.rows, TTL.PRICES);
        res.json(result.rows);
    } catch (err) {
        console.error('[API/prices/sparkline]', err.message);
        res.status(500).json({ error: 'Failed to fetch sparkline data' });
    }
});

/**
 * GET /api/prices/forecast?commodity=Wheat&market=Nagpur
 * Returns EMA-based price trend forecast
 */
router.get('/forecast', async (req, res) => {
    try {
        const { commodity, market } = req.query;
        if (!commodity) return res.status(400).json({ error: 'commodity is required' });

        const commodityResult = await db.query(
            'SELECT id FROM commodities WHERE LOWER(name_en) = LOWER($1) OR name_hi = $1',
            [commodity]
        );
        if (commodityResult.rows.length === 0) 
            return res.status(404).json({ error: 'Commodity not found' });
        
        const commodityId = commodityResult.rows[0].id;
        let marketId = null;
        if (market) {
            const marketResult = await db.query(
                'SELECT id FROM markets WHERE LOWER(name) = LOWER($1)',
                [market]
            );
            marketId = marketResult.rows[0]?.id || null;
        }

        const forecast = await getCommodityForecast(commodityId, marketId);
        res.json(forecast);
    } catch (err) {
        console.error('[API/prices/forecast]', err.message);
        res.status(500).json({ error: 'Failed to generate forecast' });
    }
});

module.exports = router;
