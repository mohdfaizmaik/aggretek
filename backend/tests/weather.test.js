'use strict';
const { resolveLocation, listStates, listDistricts } = require('../src/data/districtCentroids');
const { compactForecast, mapCondition } = require('../src/services/weather');
const { inWindow } = require('../src/services/sowingAlerts');

describe('districtCentroids', () => {
    test('resolveLocation uses district centroid', () => {
        const loc = resolveLocation({ district: 'Nashik', state: 'Maharashtra' });
        expect(loc.latitude).toBeCloseTo(19.9975, 2);
        expect(loc.longitude).toBeCloseTo(73.7898, 2);
        expect(loc.district).toBe('Nashik');
    });

    test('listStates includes focus states', () => {
        expect(listStates()).toEqual(expect.arrayContaining(['Maharashtra', 'Delhi']));
        expect(listDistricts('Maharashtra')).toContain('Nashik');
    });
});

describe('weather compactForecast', () => {
    test('maps API payload to compact shape', () => {
        const apiData = {
            current: {
                temperature_2m: 30,
                relative_humidity_2m: 55,
                precipitation: 1.2,
                weather_code: 61,
                wind_speed_10m: 12,
            },
            daily: {
                time: ['2026-06-13', '2026-06-14'],
                temperature_2m_max: [34, 33],
                temperature_2m_min: [25, 24],
                precipitation_sum: [2, 0],
            },
        };
        const compact = compactForecast(apiData, {
            district: 'Indore',
            state: 'Madhya Pradesh',
            latitude: 22.71,
            longitude: 75.85,
        });

        expect(compact.current.condition_en).toBe('Light rain');
        expect(compact.daily).toHaveLength(2);
        expect(compact.rain_next_3d_mm).toBe(2);
        expect(compact.location.district).toBe('Indore');
    });

    test('mapCondition falls back for unknown codes', () => {
        expect(mapCondition(999).en).toBe('Unknown');
    });
});

describe('sowingAlerts inWindow', () => {
    test('detects date inside window', () => {
        expect(inWindow('2026-06-10', '2026-06-01', '2026-07-15')).toBe(true);
        expect(inWindow('2026-08-01', '2026-06-01', '2026-07-15')).toBe(false);
    });
});
