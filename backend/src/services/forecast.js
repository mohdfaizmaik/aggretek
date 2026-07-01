'use strict';
const db = require('../db');

/**
 * Calculate Exponential Moving Average (EMA) for a series of numbers.
 * Formula: EMA_t = [Value_t * (2 / (n + 1))] + [EMA_{t-1} * (1 - (2 / (n + 1)))]
 * @param {number[]} data - Array of prices
 * @param {number} period - Smoothing period (e.g., 7 days)
 * @returns {number[]} - EMA series
 */
function calculateEMA(data, period) {
    if (data.length < period) return [];
    const k = 2 / (period + 1);
    const ema = [];
    
    // Seed EMA with Simple Moving Average for the first period
    let sum = 0;
    for (let i = 0; i < period; i++) sum += data[i];
    ema.push(sum / period);

    for (let i = period; i < data.length; i++) {
        const nextEma = data[i] * k + ema[ema.length - 1] * (1 - k);
        ema.push(nextEma);
    }
    return ema;
}

/**
 * Get price forecast and trend for a commodity.
 */
async function getCommodityForecast(commodityId, marketId = null, days = 30) {
    const params = [commodityId, days];
    let marketFilter = '';
    if (marketId) {
        params.push(marketId);
        marketFilter = 'AND market_id = $3';
    }

    const result = await db.query(
        `SELECT price_date, AVG(modal_price) as avg_price
         FROM prices
         WHERE commodity_id = $1
           AND price_date >= CURRENT_DATE - ($2 || ' days')::INTERVAL
           ${marketFilter}
         GROUP BY price_date
         ORDER BY price_date ASC`,
        params
    );

    const prices = result.rows.map(r => parseFloat(r.avg_price));
    if (prices.length < 7) {
        return { trend: 'neutral', message: 'Insufficient data for forecast' };
    }

    const ema7 = calculateEMA(prices, 7);
    const lastPrice = prices[prices.length - 1];
    const lastEma = ema7[ema7.length - 1];
    const prevEma = ema7[ema7.length - 2];

    const change = ((lastEma - prevEma) / prevEma) * 100;
    let trend = 'stable';
    let message_en = 'Price is stable';
    let message_hi = 'कीमत स्थिर है';

    if (change > 0.5) {
        trend = 'bullish';
        message_en = 'Rising trend';
        message_hi = 'बढ़त का रुझान';
    } else if (change < -0.5) {
        trend = 'bearish';
        message_en = 'Downward trend';
        message_hi = 'गिरावट का रुझान';
    }

    return {
        commodity_id: commodityId,
        market_id: marketId,
        trend,
        change_pct: Math.round(change * 100) / 100,
        forecast_price: Math.round(lastEma * 100) / 100,
        message_en,
        message_hi,
        data_points: prices.length,
        last_price: lastPrice
    };
}

module.exports = { calculateEMA, getCommodityForecast };
