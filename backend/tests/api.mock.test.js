'use strict';
process.env.MOCK_MODE = 'true';
process.env.DISABLE_CRON = 'true';

const request = require('supertest');
const app = require('../src/app');

describe('API health', () => {
    test('GET /api/health returns mock status', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('mock-mode');
    });
});

describe('API auth (mock)', () => {
    test('POST /api/auth/register returns token', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@example.com', password: 'secret123' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe('test@example.com');
    });

    test('POST /api/auth/login returns token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'farmer@example.com', password: 'any' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });
});

describe('API prices (mock)', () => {
    test('GET /api/prices returns paginated data', async () => {
        const res = await request(app).get('/api/prices?commodity=Wheat');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.pagination).toBeDefined();
    });

    test('GET /api/prices/sparkline returns mock series', async () => {
        const res = await request(app).get('/api/prices/sparkline?commodity=Wheat');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('API watchlist (mock)', () => {
    test('GET /api/watchlist returns empty array', async () => {
        const res = await request(app).get('/api/watchlist');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
});
