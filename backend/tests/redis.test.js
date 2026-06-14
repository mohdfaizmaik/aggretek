'use strict';
const { normalizeRedisUrl } = require('../src/cache/redis');

describe('normalizeRedisUrl', () => {
    test('extracts URL from redis-cli paste', () => {
        const raw = 'redis-cli --tls -u redis://default:abc123@polite-tadpole-148391.upstash.io:6379';
        expect(normalizeRedisUrl(raw)).toBe(
            'rediss://default:abc123@polite-tadpole-148391.upstash.io:6379'
        );
    });

    test('passes through valid rediss URL', () => {
        const url = 'rediss://default:token@host.upstash.io:6379';
        expect(normalizeRedisUrl(url)).toBe(url);
    });
});
