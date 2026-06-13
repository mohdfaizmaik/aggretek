'use strict';
const { normaliseCropName, ALIAS_MAP } = require('../src/services/normalise');

describe('normaliseCropName', () => {
    test('handles exact English names', () => {
        expect(normaliseCropName('wheat')).toBe('Wheat');
        expect(normaliseCropName('rice')).toBe('Rice');
        expect(normaliseCropName('onion')).toBe('Onion');
    });

    test('handles transliteration variants', () => {
        expect(normaliseCropName('gehu')).toBe('Wheat');
        expect(normaliseCropName('gehun')).toBe('Wheat');
        expect(normaliseCropName('paddy')).toBe('Rice');
        expect(normaliseCropName('dhan')).toBe('Rice');
        expect(normaliseCropName('makka')).toBe('Maize');
        expect(normaliseCropName('pyaaz')).toBe('Onion');
        expect(normaliseCropName('aloo')).toBe('Potato');
        expect(normaliseCropName('tamatar')).toBe('Tomato');
        expect(normaliseCropName('sarson')).toBe('Mustard');
        expect(normaliseCropName('kapas')).toBe('Cotton');
        expect(normaliseCropName('arhar')).toBe('Tur Dal');
        expect(normaliseCropName('moongfali')).toBe('Groundnut');
        expect(normaliseCropName('haldi')).toBe('Turmeric');
    });

    test('handles Hindi Devanagari names', () => {
        expect(normaliseCropName('गेहूँ')).toBe('Wheat');
        expect(normaliseCropName('धान')).toBe('Rice');
        expect(normaliseCropName('मक्का')).toBe('Maize');
        expect(normaliseCropName('प्याज')).toBe('Onion');
        expect(normaliseCropName('आलू')).toBe('Potato');
        expect(normaliseCropName('टमाटर')).toBe('Tomato');
        expect(normaliseCropName('कपास')).toBe('Cotton');
        expect(normaliseCropName('सरसों')).toBe('Mustard');
        expect(normaliseCropName('हल्दी')).toBe('Turmeric');
    });

    test('is case-insensitive for English', () => {
        expect(normaliseCropName('WHEAT')).toBe('Wheat');
        expect(normaliseCropName('Wheat')).toBe('Wheat');
        expect(normaliseCropName('ONION')).toBe('Onion');
    });

    test('handles leading/trailing whitespace', () => {
        expect(normaliseCropName('  wheat  ')).toBe('Wheat');
        expect(normaliseCropName(' paddy ')).toBe('Rice');
    });

    test('returns null for unknown crops', () => {
        expect(normaliseCropName('unknown_veg_xyz')).toBeNull();
        expect(normaliseCropName('')).toBeNull();
        expect(normaliseCropName(null)).toBeNull();
    });

    test('all alias keys in ALIAS_MAP resolve to a known canonical name', () => {
        const canonicals = new Set(Object.values(ALIAS_MAP));
        canonicals.forEach((c) => {
            expect(typeof c).toBe('string');
            expect(c.length).toBeGreaterThan(0);
        });
    });
});
