'use strict';
const { getCsvFallbackPrices } = require('../src/services/csvFallback');
const { normaliseCropName } = require('../src/services/normalise');

describe('getCsvFallbackPrices', () => {
    test('returns records from bundled CSV', () => {
        const records = getCsvFallbackPrices();
        expect(records.length).toBeGreaterThan(0);
        expect(records[0]).toMatchObject({
            commodity_name: expect.any(String),
            market_name: expect.any(String),
            modal_price: expect.any(Number),
            source: 'csv_fallback',
        });
    });

    test('filters by commodity when provided', () => {
        const wheat = getCsvFallbackPrices('Wheat');
        expect(wheat.length).toBeGreaterThan(0);
        expect(wheat.every((r) => r.commodity_name === 'Wheat')).toBe(true);

        const paddy = getCsvFallbackPrices('paddy');
        expect(paddy.every((r) => r.commodity_name === 'Rice')).toBe(true);
    });

    test('normalises transliterated crop names in filter', () => {
        const records = getCsvFallbackPrices('gehu');
        expect(records.every((r) => r.commodity_name === 'Wheat')).toBe(true);
    });

    test('all records have positive modal prices', () => {
        const records = getCsvFallbackPrices();
        expect(records.every((r) => r.modal_price > 0)).toBe(true);
    });
});

describe('normaliseCropName integration with CSV', () => {
    test('maps CSV commodity names to canonical names', () => {
        expect(normaliseCropName('Wheat')).toBe('Wheat');
        expect(normaliseCropName('Tur Dal')).toBe('Tur Dal');
    });
});
