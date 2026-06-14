'use strict';
const router = require('express').Router();
const { optionalAuth } = require('../middleware/auth');
const { getWeather } = require('../services/weather');
const { getSowingAlerts } = require('../services/sowingAlerts');
const { resolveLocation, DEFAULT_LOCATION } = require('../data/districtCentroids');
const db = require('../db');

async function resolveRequestLocation(req) {
    if (req.user?.id) {
        try {
            const result = await db.query(
                'SELECT village, district, state, latitude, longitude FROM users WHERE id = $1',
                [req.user.id]
            );
            const row = result.rows[0];
            if (row?.district || row?.state || row?.latitude) {
                return resolveLocation(row);
            }
        } catch {
            // fall through to query params
        }
    }

    return resolveLocation({
        district: req.query.district,
        state: req.query.state,
        latitude: req.query.lat,
        longitude: req.query.lon,
    });
}

// GET /api/weather?district=Nashik&state=Maharashtra
router.get('/', optionalAuth, handleWeather);

// Shared handler for GET /api/insights (mounted in app.js)
async function handleInsights(req, res) {
    try {
        const location = await resolveRequestLocation(req);
        const weather = await getWeather(location);
        const alerts = await getSowingAlerts({
            state: location.state || DEFAULT_LOCATION.state,
            weather,
            userId: req.user?.id,
        });
        res.json({ weather, alerts, location });
    } catch (err) {
        console.error('[API/insights]', err.message);
        res.status(502).json({ error: 'Insights unavailable' });
    }
}

async function handleWeather(req, res) {
    try {
        const location = await resolveRequestLocation(req);
        const weather = await getWeather(location);
        res.json(weather);
    } catch (err) {
        console.error('[API/weather]', err.message);
        res.status(502).json({ error: 'Weather service unavailable' });
    }
}

module.exports = router;
module.exports.handleInsights = handleInsights;
