'use strict';
const axios = require('axios');
const db = require('../db');
const { cacheGet, cacheSet, TTL } = require('../cache/redis');
const { resolveLocation } = require('../data/districtCentroids');

const WMO_CONDITIONS = {
    0: { en: 'Clear sky', hi: 'साफ आसमान' },
    1: { en: 'Mainly clear', hi: 'अधिकतर साफ' },
    2: { en: 'Partly cloudy', hi: 'आंशिक बादल' },
    3: { en: 'Overcast', hi: 'बादल छाए' },
    45: { en: 'Fog', hi: 'कोहरा' },
    48: { en: 'Fog', hi: 'कोहरा' },
    51: { en: 'Light drizzle', hi: 'हल्की बूंदाबांदी' },
    53: { en: 'Drizzle', hi: 'बूंदाबांदी' },
    55: { en: 'Heavy drizzle', hi: 'तेज बूंदाबांदी' },
    61: { en: 'Light rain', hi: 'हल्की बारिश' },
    63: { en: 'Rain', hi: 'बारिश' },
    65: { en: 'Heavy rain', hi: 'भारी बारिश' },
    80: { en: 'Rain showers', hi: 'बारिश' },
    81: { en: 'Heavy showers', hi: 'तेज बारिश' },
    95: { en: 'Thunderstorm', hi: 'आंधी-तूफान' },
};

function mapCondition(code) {
    return WMO_CONDITIONS[code] || { en: 'Unknown', hi: 'अज्ञात' };
}

function compactForecast(apiData, location) {
    const current = apiData.current || {};
    const daily = apiData.daily || {};
    const condition = mapCondition(current.weather_code);

    const days = (daily.time || []).slice(0, 7).map((date, i) => ({
        date,
        temp_max: daily.temperature_2m_max?.[i] ?? null,
        temp_min: daily.temperature_2m_min?.[i] ?? null,
        rain_mm: daily.precipitation_sum?.[i] ?? 0,
    }));

    const rainNext3 = days.slice(0, 3).reduce((sum, d) => sum + (Number(d.rain_mm) || 0), 0);

    return {
        location: {
            district: location.district,
            state: location.state,
            latitude: location.latitude,
            longitude: location.longitude,
        },
        current: {
            temp_c: current.temperature_2m ?? null,
            humidity_pct: current.relative_humidity_2m ?? null,
            rainfall_mm: current.precipitation ?? 0,
            wind_kmh: current.wind_speed_10m ?? null,
            condition_en: condition.en,
            condition_hi: condition.hi,
        },
        daily: days,
        rain_next_3d_mm: Math.round(rainNext3 * 10) / 10,
        fetched_at: new Date().toISOString(),
        source: 'open_meteo',
    };
}

async function fetchFromOpenMeteo(lat, lon) {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const { data } = await axios.get(url, {
        timeout: 12000,
        params: {
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
            daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
            timezone: 'Asia/Kolkata',
            forecast_days: 7,
        },
    });
    return data;
}

async function persistSnapshot(compact) {
    try {
        await db.query(
            `INSERT INTO weather_snapshots
             (latitude, longitude, district, state, temp_c, humidity_pct, rainfall_mm,
              wind_kmh, condition_en, condition_hi, forecast_json, source)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
            [
                compact.location.latitude,
                compact.location.longitude,
                compact.location.district,
                compact.location.state,
                compact.current.temp_c,
                compact.current.humidity_pct,
                compact.current.rainfall_mm,
                compact.current.wind_kmh,
                compact.current.condition_en,
                compact.current.condition_hi,
                JSON.stringify(compact.daily),
                compact.source,
            ]
        );
    } catch (err) {
        console.warn('[Weather] snapshot persist skipped:', err.message);
    }
}

async function getWeather(locationInput = {}) {
    const location = resolveLocation(locationInput);
    const cacheKey = `weather:${location.latitude.toFixed(2)}:${location.longitude.toFixed(2)}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const apiData = await fetchFromOpenMeteo(location.latitude, location.longitude);
    const compact = compactForecast(apiData, location);

    await cacheSet(cacheKey, compact, TTL.WEATHER);
    await persistSnapshot(compact);

    return compact;
}

module.exports = {
    getWeather,
    compactForecast,
    mapCondition,
    WMO_CONDITIONS,
};
