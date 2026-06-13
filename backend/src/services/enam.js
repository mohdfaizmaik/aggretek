'use strict';
const axios = require('axios');
const { normaliseCropName, normaliseMarketName } = require('./normalise');

const ENAM_BASE = 'https://enam.gov.in/web';
const TIMEOUT = 15000;

/**
 * Fetch price data from eNAM open API.
 * eNAM provides commodity-wise trade data.
 */
async function getEnamPrices(commodityName, days = 7) {
    try {
        const url = `${ENAM_BASE}/dashboard/trade_data_list`;
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        const response = await axios.get(url, {
            params: {
                lan: 'en',
                start: 0,
                length: 500,
                commodity_name: commodityName,
                from_date: formatEnamDate(fromDate),
                to_date: formatEnamDate(toDate),
            },
            timeout: TIMEOUT,
            headers: { 'User-Agent': 'AgritechApp/1.0' },
        });

        const data = response.data;
        if (!data || !data.data) return [];

        return data.data.map((item) => ({
            commodity_name: normaliseCropName(item.commodity_name || item.commodity) || item.commodity_name,
            market_name: normaliseMarketName(item.apmc_name || item.mandi_name || ''),
            state: item.state_name || '',
            min_price: parseFloat(item.min_price || 0),
            max_price: parseFloat(item.max_price || 0),
            modal_price: parseFloat(item.modal_price || item.avg_price || 0),
            price_date: item.trade_date || new Date().toISOString().split('T')[0],
            fetched_at: new Date().toISOString(),
            source: 'enam',
        })).filter((r) => r.modal_price > 0);
    } catch (err) {
        console.warn(`[eNAM] Fetch failed for "${commodityName}": ${err.message}`);
        return [];
    }
}

function formatEnamDate(date) {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

module.exports = { getEnamPrices };
