'use strict';
require('dotenv').config();
const db = require('./index');

async function seed() {
    console.log('[Seeder] Starting data seed…');

    try {
        // 1. Ensure commodities exist (already should be from schema.sql, but let's be safe)
        const commodities = await db.query('SELECT id, name_en FROM commodities');
        if (commodities.rows.length === 0) {
            console.error('[Seeder] No commodities found. Run schema.sql first.');
            process.exit(1);
        }

        const commodityMap = {};
        commodities.rows.forEach(c => commodityMap[c.name_en] = c.id);

        // 2. Sample Markets
        const markets = [
            { name: 'Nagpur', state: 'Maharashtra', district: 'Nagpur' },
            { name: 'Indore', state: 'Madhya Pradesh', district: 'Indore' },
            { name: 'Azadpur', state: 'Delhi', district: 'North Delhi' },
            { name: 'Nashik', state: 'Maharashtra', district: 'Nashik' }
        ];

        const marketIds = [];
        for (const m of markets) {
            const res = await db.query(
                'INSERT INTO markets (name, state, district) VALUES ($1, $2, $3) ON CONFLICT (name, state) DO UPDATE SET district=EXCLUDED.district RETURNING id',
                [m.name, m.state, m.district]
            );
            marketIds.push(res.rows[0].id);
        }
        console.log(`[Seeder] Seeded ${marketIds.length} markets.`);

        // 3. Sample Prices for the last 7 days
        const sources = ['agmarknet', 'enam'];
        let count = 0;

        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            for (const commodityName of ['Wheat', 'Rice', 'Soybean', 'Onion', 'Potato']) {
                const commodityId = commodityMap[commodityName];
                if (!commodityId) continue;

                for (const marketId of marketIds) {
                    const basePrice = commodityName === 'Wheat' ? 2200 : (commodityName === 'Rice' ? 2400 : 1500);
                    const variation = Math.floor(Math.random() * 200) - 100;
                    
                    const min_price = basePrice + variation - 50;
                    const max_price = basePrice + variation + 50;
                    const modal_price = basePrice + variation;

                    await db.query(
                        `INSERT INTO prices (commodity_id, market_id, min_price, max_price, modal_price, price_date, source)
                         VALUES ($1,$2,$3,$4,$5,$6,$7)
                         ON CONFLICT (commodity_id, market_id, price_date, source)
                         DO UPDATE SET
                           min_price = EXCLUDED.min_price,
                           max_price = EXCLUDED.max_price,
                           modal_price = EXCLUDED.modal_price,
                           fetched_at = NOW()`,
                        [commodityId, marketId, min_price, max_price, modal_price, dateStr, sources[Math.floor(Math.random() * sources.length)]]
                    );
                    count++;
                }
            }
        }

        console.log(`[Seeder] Seeded ${count} price records.`);
        console.log('[Seeder] Done.');
    } catch (err) {
        console.error('[Seeder] Error:', err.message);
    } finally {
        await db.close();
        process.exit(0);
    }
}

seed();
