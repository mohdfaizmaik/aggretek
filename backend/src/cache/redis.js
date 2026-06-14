'use strict';
const Redis = require('ioredis');

let client;
let warnedBadUrl = false;

/**
 * Fix common Upstash paste mistake: "redis-cli --tls -u redis://..." → "rediss://..."
 */
function normalizeRedisUrl(raw) {
    if (!raw) return 'redis://localhost:6379';
    const trimmed = raw.trim();
    const match = trimmed.match(/(rediss?:\/\/[^\s"'<>]+)/i);
    let url = match ? match[1] : trimmed;
    if (/upstash\.io/i.test(url) && url.startsWith('redis://')) {
        url = `rediss://${url.slice('redis://'.length)}`;
    }
    return url;
}

function getRedis() {
    if (!client) {
        const raw = process.env.REDIS_URL;
        const url = normalizeRedisUrl(raw);
        if (raw && raw !== url && !warnedBadUrl) {
            warnedBadUrl = true;
            console.warn('[Redis] REDIS_URL was malformed — auto-fixed. Set on Render to:', url);
        }
        client = new Redis(url, {
            maxRetriesPerRequest: 1,
            enableReadyCheck: true,
            retryStrategy: (times) => (times > 2 ? null : Math.min(times * 100, 500)),
            lazyConnect: true,
            connectTimeout: 5000,
        });

        client.on('error', (err) => {
            console.warn('[Redis] Connection error:', err.message);
        });
        client.on('connect', () => {
            console.info('[Redis] Connected');
        });
    }
    return client;
}

const TTL = {
    PRICES: 60 * 14,          // 14 minutes (poll is every 15 min)
    COMMODITIES: 60 * 60,     // 1 hour
    MARKETS: 60 * 60,         // 1 hour
    MSP: 60 * 60 * 24,        // 24 hours
    WEATHER: 60 * 30,         // 30 minutes
    INSIGHTS: 60 * 30,        // 30 minutes
};

async function cacheGet(key) {
    try {
        const val = await getRedis().get(key);
        return val ? JSON.parse(val) : null;
    } catch {
        return null;
    }
}

async function cacheSet(key, data, ttl = TTL.PRICES) {
    try {
        await getRedis().set(key, JSON.stringify(data), 'EX', ttl);
    } catch (err) {
        console.warn('[Redis] cacheSet failed:', err.message);
    }
}

async function cacheDel(pattern) {
    try {
        const keys = await getRedis().keys(pattern);
        if (keys.length > 0) await getRedis().del(keys);
    } catch (err) {
        console.warn('[Redis] cacheDel failed:', err.message);
    }
}

async function disconnect() {
    if (client) {
        await client.quit();
        client = null;
    }
}

module.exports = { getRedis, cacheGet, cacheSet, cacheDel, disconnect, TTL, normalizeRedisUrl };
