'use strict';
const Redis = require('ioredis');

let client;

function getRedis() {
    if (!client) {
        client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            retryStrategy: (times) => Math.min(times * 100, 3000),
            lazyConnect: true,
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

module.exports = { getRedis, cacheGet, cacheSet, cacheDel, disconnect, TTL };
