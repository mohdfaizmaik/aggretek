'use strict';
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');
const { getRedis } = require('../src/cache/redis');

jest.mock('../src/db', () => ({
    query: jest.fn(),
}));

jest.mock('../src/cache/redis', () => ({
    cacheGet: jest.fn(),
    cacheSet: jest.fn(),
    getRedis: jest.fn().mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
        keys: jest.fn(),
        del: jest.fn(),
    }),
    TTL: { PRICES: 60 },
}));

describe('Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Auth Validation', () => {
        test('POST /api/auth/register fails with invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'invalid-email', password: 'password123' });
            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors[0].msg).toBe('Invalid email address');
        });

        test('POST /api/auth/register fails with short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com', password: '123' });
            expect(res.status).toBe(400);
            expect(res.body.errors[0].msg).toBe('Password must be at least 6 characters');
        });
    });

    describe('Prices API', () => {
        test('GET /api/prices returns 200 and data', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ count: '1' }] }) // count query
                    .mockResolvedValueOnce({ rows: [{ id: 1, modal_price: 100 }], fetched_at: new Date() }); // data query

            const res = await request(app).get('/api/prices?commodity=Wheat');
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].modal_price).toBe(100);
        });
    });

    describe('Health Monitoring', () => {
        test('GET /api/health includes memory and uptime', async () => {
            db.query.mockResolvedValueOnce({ rows: [] }) // SELECT 1
                    .mockResolvedValueOnce({ rows: [{ ready: true }] }); // table check

            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body.uptime).toBeDefined();
            expect(res.body.memory).toBeDefined();
        });
    });
});
