'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const commoditiesRouter = require('./routes/commodities');
const marketsRouter = require('./routes/markets');
const pricesRouter = require('./routes/prices');
const mspRouter = require('./routes/msp');
const authRouter = require('./routes/auth');
const watchlistRouter = require('./routes/watchlist');

const app = express();

function parseCorsOrigins() {
    const raw = process.env.CORS_ORIGIN || '*';
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/** Vercel production + preview URLs for this app (PATCH needs preflight + matching origin). */
function normalizeOrigin(origin) {
    if (!origin || typeof origin !== 'string') return origin;
    return origin.replace(/\/$/, '');
}

function isAllowedOrigin(origin, allowedOrigins) {
    if (!origin) return true;
    const normalized = normalizeOrigin(origin);
    if (allowedOrigins.includes('*')) return true;
    if (allowedOrigins.some((o) => normalizeOrigin(o) === normalized)) return true;
    if (/^https:\/\/aggretek(-[\w-]+)*\.vercel\.app$/i.test(normalized)) return true;
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/i.test(normalized)) return true;
    return false;
}

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
const allowedOrigins = parseCorsOrigins();
const corsOptions = {
    origin(origin, callback) {
        if (isAllowedOrigin(origin, allowedOrigins)) {
            callback(null, normalizeOrigin(origin) || true);
        } else {
            console.warn('[CORS] Blocked origin:', origin);
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // Reflect all preflight headers (Accept, Authorization, etc.) — avoids Chrome CORS failures
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
        'X-Cron-Secret',
    ],
    optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
// Ensure PATCH preflight is answered before any route/auth logic
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Routes ──────────────────────────────────────────────────────────────────
const { mockCommodities, mockMarkets, mockPrices, mockSparkline } = require('./db/mockData');

if (process.env.MOCK_MODE === 'true') {
    app.get('/api/health', (req, res) => res.json({ status: 'mock-mode', ts: new Date().toISOString() }));
    app.get('/api/commodities', (req, res) => res.json(mockCommodities));
    app.get('/api/markets', (req, res) => res.json(mockMarkets));
    app.get('/api/prices', (req, res) => res.json({ 
        data: req.query.commodity ? mockPrices.filter(p => p.commodity_en === req.query.commodity) : mockPrices, 
        pagination: { total: 4, page: 1, limit: 50, pages: 1 },
        meta: { last_fetched: new Date().toISOString() }
    }));
    app.get('/api/prices/sparkline', (req, res) => res.json(mockSparkline));
    app.get('/api/msp', (req, res) => res.json([]));
    app.post('/api/auth/login', (req, res) => res.json({ 
        token: 'mock-jwt', 
        user: { id: 1, email: 'farmer@example.com', preferred_lang: 'hi' } 
    }));
    app.post('/api/auth/register', (req, res) => res.json({
        token: 'mock-jwt',
        user: { id: 2, email: req.body?.email || 'new@example.com', preferred_lang: req.body?.preferred_lang || 'en' },
    }));
    app.get('/api/watchlist', (req, res) => res.json([]));
    app.get('/api/insights', (req, res) => res.json({
        weather: {
            location: { district: 'Nashik', state: 'Maharashtra', latitude: 19.99, longitude: 73.78 },
            current: { temp_c: 32, humidity_pct: 65, rainfall_mm: 0, condition_en: 'Clear sky', condition_hi: 'साफ आसमान' },
            daily: [{ date: '2026-06-13', temp_max: 35, temp_min: 26, rain_mm: 2 }],
            rain_next_3d_mm: 5,
            fetched_at: new Date().toISOString(),
        },
        alerts: [{
            type: 'sow',
            severity: 'info',
            crop: 'Soybean',
            crop_hi: 'सोयाबीन',
            message_en: 'Soybean sowing window is open.',
            message_hi: 'सोयाबीन बुवाई का समय चल रहा है।',
        }],
        location: { district: 'Nashik', state: 'Maharashtra' },
    }));
    app.get('/api/users/locations', (req, res) => res.json({
        states: [
            { state: 'Maharashtra', districts: ['Nashik', 'Pune', 'Nagpur'] },
            { state: 'Madhya Pradesh', districts: ['Indore', 'Bhopal'] },
            { state: 'Delhi', districts: ['Delhi'] },
        ],
    }));
    app.patch('/api/users/me', (req, res) => res.json({
        user: { id: 1, email: 'farmer@example.com', preferred_lang: 'hi', district: 'Nashik', state: 'Maharashtra' },
    }));
} else {
    const db = require('./db');
    app.get('/api/health', async (req, res) => {
        const payload = {
            status: 'ok',
            ts: new Date().toISOString(),
            env: process.env.NODE_ENV,
        };
        try {
            await db.query('SELECT 1');
            const tableCheck = await db.query(
                `SELECT EXISTS (
                   SELECT FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = 'commodities'
                 ) AS ready`
            );
            const ready = tableCheck.rows[0]?.ready;
            payload.database = ready ? 'ready' : 'connected — run schema.sql migrations';
            if (!ready) payload.status = 'degraded';
        } catch (err) {
            payload.status = 'degraded';
            payload.database = `error: ${err.message}`;
        }
        res.status(payload.status === 'ok' ? 200 : 503).json(payload);
    });
    app.use('/api/commodities', commoditiesRouter);
    app.use('/api/markets', marketsRouter);
    app.use('/api/prices', pricesRouter);
    app.use('/api/msp', mspRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/watchlist', watchlistRouter);
    app.use('/api/users', require('./routes/users'));
    app.use('/api/weather', require('./routes/weather'));
    const { optionalAuth } = require('./middleware/auth');
    const { handleInsights } = require('./routes/weather');
    app.get('/api/insights', optionalAuth, handleInsights);
    app.use('/api/admin', require('./routes/admin'));
}

/*
// ── Mock Routes (Bypass DB) (DEPRECATED: Switched to real routes) ──────────
app.get('/api/commodities', (req, res) => res.json(mockCommodities));
...
*/

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
    console.error('[Express]', err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
