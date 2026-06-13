'use strict';
const router = require('express').Router();
const { pollPrices } = require('../jobs/pricePoll');

function verifyCronSecret(req) {
    const secret = process.env.CRON_SECRET;
    if (!secret) return { ok: false, status: 503, error: 'CRON_SECRET not configured' };
    const provided = req.headers['x-cron-secret'] || req.query.secret;
    if (provided !== secret) return { ok: false, status: 401, error: 'Unauthorized' };
    return { ok: true };
}

async function handleTriggerPoll(req, res) {
    const auth = verifyCronSecret(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    pollPrices().catch((err) => console.error('[Admin] poll error:', err.message));
    res.json({ status: 'poll_started', ts: new Date().toISOString() });
}

// cron-job.org and similar services often use GET
router.get('/trigger-poll', handleTriggerPoll);
router.post('/trigger-poll', handleTriggerPoll);

module.exports = router;
