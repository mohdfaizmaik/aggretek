'use strict';
const cron = require('node-cron');
const db = require('../db');
const { cacheDel } = require('../cache/redis');
const { getAgmarknetPrices } = require('../services/agmarknet');
const { getEnamPrices } = require('../services/enam');
const { getCsvFallbackPrices } = require('../services/csvFallback');
const { normaliseCropName } = require('../services/normalise');
const { processPriceAlerts } = require('./alertWorker');

const POLL_COMMODITIES = [
    'Wheat', 'Rice', 'Maize', 'Soybean', 'Mustard', 'Cotton',
    'Onion', 'Potato', 'Tomato', 'Chana', 'Tur Dal', 'Moong',
    'Groundnut', 'Bajra', 'Jowar', 'Sunflower', 'Urad Dal', 'Barley',
];

const FOCUS_STATES = ['Maharashtra', 'Madhya Pradesh', 'Delhi'];

let isRunning = false;

async function upsertMarket(name, state, district) {
    if (!name) return null;
    const res = await db.query(
        `INSERT INTO markets (name, state, district) VALUES ($1, $2, $3)
     ON CONFLICT (name, state) DO UPDATE SET district=EXCLUDED.district
     RETURNING id`,
        [name.slice(0, 200), state.slice(0, 100), district ? district.slice(0, 100) : null]
    );
    return res.rows[0]?.id;
}

async function upsertPrice(record, commodityId, marketId) {
    if (!commodityId || !marketId) return;
    await db.query(
        `INSERT INTO prices (commodity_id, market_id, min_price, max_price, modal_price, price_date, fetched_at, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (commodity_id, market_id, price_date, source)
     DO UPDATE SET
       min_price = EXCLUDED.min_price,
       max_price = EXCLUDED.max_price,
       modal_price = EXCLUDED.modal_price,
       fetched_at = EXCLUDED.fetched_at`,
        [
            commodityId,
            marketId,
            record.min_price,
            record.max_price,
            record.modal_price,
            record.price_date,
            record.fetched_at,
            record.source,
        ]
    );
}

async function getCommodityId(rawName) {
    const canonical = normaliseCropName(rawName) || rawName;
    const res = await db.query(
        'SELECT id FROM commodities WHERE LOWER(name_en) = LOWER($1)',
        [canonical]
    );
    return res.rows[0]?.id || null;
}

async function processRecords(records) {
    let upserted = 0;
    for (const record of records) {
        if (!record.commodity_name || !record.modal_price) continue;
        const commodityId = await getCommodityId(record.commodity_name);
        if (!commodityId) continue;
        const marketId = await upsertMarket(record.market_name, record.state, record.district);
        await upsertPrice(record, commodityId, marketId);
        upserted++;
    }
    return upserted;
}

function filterFocusStates(records) {
    if (!records.length) return records;
    const focused = records.filter((r) =>
        FOCUS_STATES.some((s) => r.state && r.state.toLowerCase() === s.toLowerCase())
    );
    return focused.length > 0 ? focused : records;
}

async function fetchCommodityPrices(commodity) {
    const [agmarknetRecords, enamRecords] = await Promise.allSettled([
        getAgmarknetPrices(commodity, '', 50),
        getEnamPrices(commodity, 7),
    ]);

    let records = [
        ...(agmarknetRecords.status === 'fulfilled' ? agmarknetRecords.value : []),
        ...(enamRecords.status === 'fulfilled' ? enamRecords.value : []),
    ];

    records = filterFocusStates(records);

    if (records.length === 0) {
        console.warn(`[PricePoll] ${commodity}: live APIs empty — using CSV fallback`);
        records = getCsvFallbackPrices(commodity);
    }

    return records;
}

async function pollPrices() {
    if (isRunning) {
        console.log('[PricePoll] Previous run still active, skipping.');
        return;
    }
    isRunning = true;
    const pollStart = Date.now();
    console.log('[PricePoll] Starting price poll…');

    try {
        for (const commodity of POLL_COMMODITIES) {
            try {
                const records = await fetchCommodityPrices(commodity);
                const upserted = await processRecords(records);
                await cacheDel(`prices:${commodity}:*`);
                console.log(`[PricePoll] ${commodity}: ${upserted} records upserted (${records.length} fetched)`);
            } catch (err) {
                console.error(`[PricePoll] Error for "${commodity}":`, err.message);
            }
        }
    } finally {
        isRunning = false;
        const duration = ((Date.now() - pollStart) / 1000).toFixed(1);
        console.log(`[PricePoll] Completed in ${duration}s`);
        
        // Trigger WhatsApp alerts for any significant changes
        await processPriceAlerts();
    }
}

function startCronJob() {
    cron.schedule('*/15 * * * *', pollPrices, {
        scheduled: true,
        timezone: 'Asia/Kolkata',
    });
    console.log('[PricePoll] Cron scheduled — every 15 minutes (IST)');

    pollPrices().catch((err) => console.error('[PricePoll] Initial poll error:', err.message));
}

module.exports = { startCronJob, pollPrices, fetchCommodityPrices, processRecords };
