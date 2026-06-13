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

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = parseCorsOrigins();
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'DELETE'],
}));
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
} else {
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', ts: new Date().toISOString(), env: process.env.NODE_ENV });
    });
    app.use('/api/commodities', commoditiesRouter);
    app.use('/api/markets', marketsRouter);
    app.use('/api/prices', pricesRouter);
    app.use('/api/msp', mspRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/watchlist', watchlistRouter);
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
