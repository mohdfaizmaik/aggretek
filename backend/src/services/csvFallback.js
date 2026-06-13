'use strict';
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { normaliseCropName, normaliseMarketName } = require('./normalise');

const CSV_PATH = path.join(__dirname, '../../data/prices_fallback.csv');

function parseCsvDate(raw) {
    if (!raw) return new Date().toISOString().split('T')[0];
    const parts = raw.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return raw;
}

/**
 * Load bundled CSV snapshot used when live APIs fail or return no data.
 * @param {string} [commodityName] - optional filter by canonical commodity
 * @returns {Array<object>}
 */
function getCsvFallbackPrices(commodityName = '') {
    try {
        if (!fs.existsSync(CSV_PATH)) {
            console.warn('[CSV Fallback] File not found:', CSV_PATH);
            return [];
        }

        const content = fs.readFileSync(CSV_PATH, 'utf8');
        const rows = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        const filterCanonical = commodityName
            ? (normaliseCropName(commodityName) || commodityName)
            : null;

        return rows
            .map((r) => {
                const canonical = normaliseCropName(r.Commodity) || r.Commodity;
                return {
                    commodity_name: canonical,
                    market_name: normaliseMarketName(r.Market || ''),
                    state: r.State || '',
                    district: r.District || '',
                    min_price: parseFloat(r.Min_Price || 0),
                    max_price: parseFloat(r.Max_Price || 0),
                    modal_price: parseFloat(r.Modal_Price || 0),
                    price_date: parseCsvDate(r.Arrival_Date),
                    fetched_at: new Date().toISOString(),
                    source: 'csv_fallback',
                };
            })
            .filter((r) => r.modal_price > 0)
            .filter((r) => !filterCanonical || r.commodity_name === filterCanonical);
    } catch (err) {
        console.error('[CSV Fallback] Failed to read CSV:', err.message);
        return [];
    }
}

module.exports = { getCsvFallbackPrices, CSV_PATH };
