'use strict';
const { calculateEMA } = require('../src/services/forecast');

describe('Forecast Service', () => {
    describe('calculateEMA', () => {
        test('calculates correct EMA for a simple series', () => {
            const data = [10, 10, 10, 10, 10, 10, 10, 20];
            const period = 7;
            const ema = calculateEMA(data, period);
            
            // First EMA is SMA: 10
            // Second EMA: 20 * (2/8) + 10 * (1 - 2/8) = 5 + 7.5 = 12.5
            expect(ema[0]).toBe(10);
            expect(ema[1]).toBe(12.5);
        });

        test('returns empty array if data length < period', () => {
            expect(calculateEMA([1, 2], 5)).toEqual([]);
        });
    });
});
