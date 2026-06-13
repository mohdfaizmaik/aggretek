const axios = require('axios');
const { normaliseCropName, normaliseMarketName } = require('./normalise');
const { getCsvFallbackPrices } = require('./csvFallback');

const BASE_URL = 'https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24';
const TIMEOUT = 45000;
const MAX_RETRIES = 2;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapRecords(records) {
    return records.map((r) => {
        let isoDate = new Date().toISOString().split('T')[0];
        if (r.Arrival_Date) {
            const parts = r.Arrival_Date.split('/');
            if (parts.length === 3) {
                isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        return {
            commodity_name: normaliseCropName(r.Commodity) || r.Commodity,
            market_name: normaliseMarketName(r.Market || ''),
            state: r.State || '',
            district: r.District || '',
            min_price: parseFloat(r.Min_Price || 0),
            max_price: parseFloat(r.Max_Price || 0),
            modal_price: parseFloat(r.Modal_Price || 0),
            price_date: isoDate,
            variety: r.Variety || 'Other',
            grade: r.Grade || 'FAQ',
            fetched_at: new Date().toISOString(),
            source: 'agmarknet',
        };
    }).filter((r) => r.modal_price > 0);
}

async function fetchFromApi(apiKey, commodityName, stateName, limit) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    'api-key': apiKey,
                    'format': 'json',
                    'limit': limit,
                    'sort[Arrival_Date]': 'desc',
                    'filters[Commodity]': commodityName || undefined,
                    'filters[State]': stateName || undefined,
                },
                timeout: TIMEOUT,
            });

            const data = response.data;
            if (!data?.records || !Array.isArray(data.records) || data.records.length === 0) {
                console.warn('[Agmarknet] Empty API response — using CSV fallback.');
                return getCsvFallbackPrices(commodityName);
            }

            const mapped = mapRecords(data.records);
            console.info(`[Agmarknet] ${commodityName || 'all'}: ${mapped.length} records (attempt ${attempt})`);
            return mapped;
        } catch (err) {
            lastError = err;
            const retryable = err.code === 'ECONNABORTED' || (err.response?.status >= 500);
            if (attempt < MAX_RETRIES && retryable) {
                console.warn(`[Agmarknet] Attempt ${attempt} failed (${err.message}), retrying…`);
                await sleep(2000 * attempt);
                continue;
            }
            break;
        }
    }

    console.error(`[Agmarknet] API fetch failed after ${MAX_RETRIES} attempts:`, lastError?.message);
    return getCsvFallbackPrices(commodityName);
}

/**
 * Fetch commodity prices from the data.gov.in API.
 * This API uses the resource ID 35985678-0d79-46b4-9ed6-6f13308a1d24.
 */
async function getAgmarknetPrices(commodityName, stateName = '', limit = 50) {
    const apiKey = process.env.AGMARKNET_API_KEY;
    if (!apiKey) {
        console.warn('[Agmarknet] API Key missing — using CSV fallback.');
        return getCsvFallbackPrices(commodityName);
    }

    try {
        return await fetchFromApi(apiKey, commodityName, stateName, limit);
    } catch (err) {
        console.error(`[Agmarknet] Unexpected error:`, err.message);
        return getCsvFallbackPrices(commodityName);
    }
}

module.exports = { getAgmarknetPrices };
