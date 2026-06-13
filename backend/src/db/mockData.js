'use strict';

const mockCommodities = [
    { id: 1, name_en: 'Wheat', name_hi: 'गेहूँ', aliases: ['gehu', 'wheat'], category: 'cereal' },
    { id: 2, name_en: 'Rice', name_hi: 'चावल', aliases: ['paddy', 'rice'], category: 'cereal' },
    { id: 3, name_en: 'Soybean', name_hi: 'सोयाबीन', aliases: ['soy'], category: 'oilseed' },
    { id: 4, name_en: 'Onion', name_hi: 'प्याज', aliases: ['pyaaz'], category: 'vegetable' },
    { id: 5, name_en: 'Potato', name_hi: 'आलू', aliases: ['aloo'], category: 'vegetable' }
];

const mockMarkets = [
    { id: 1, name: 'Nagpur', state: 'Maharashtra', district: 'Nagpur' },
    { id: 2, name: 'Indore', state: 'Madhya Pradesh', district: 'Indore' },
    { id: 3, name: 'Azadpur', state: 'Delhi', district: 'North Delhi' },
    { id: 4, name: 'Nashik', state: 'Maharashtra', district: 'Nashik' }
];

const mockPrices = [
    { id: 101, commodity_id: 1, commodity_en: 'Wheat', commodity_hi: 'गेहूँ', market_id: 1, market_name: 'Nagpur', state: 'Maharashtra', min_price: 2100, max_price: 2450, modal_price: 2320, price_date: '2026-03-20', msp_price: 2275, msp_status: 'above', source: 'agmarknet', fetched_at: new Date().toISOString() },
    { id: 102, commodity_id: 1, commodity_en: 'Wheat', commodity_hi: 'गेहूँ', market_id: 2, market_name: 'Indore', state: 'Madhya Pradesh', min_price: 2200, max_price: 2400, modal_price: 2250, price_date: '2026-03-19', msp_price: 2275, msp_status: 'below', source: 'enam', fetched_at: new Date().toISOString() },
    { id: 103, commodity_id: 4, commodity_en: 'Onion', commodity_hi: 'प्याज', market_id: 4, market_name: 'Nashik', state: 'Maharashtra', min_price: 1500, max_price: 1800, modal_price: 1650, price_date: '2026-03-20', msp_price: null, msp_status: null, source: 'agmarknet', fetched_at: new Date().toISOString() },
    { id: 104, commodity_id: 5, commodity_en: 'Potato', commodity_hi: 'आलू', market_id: 1, market_name: 'Nagpur', state: 'Maharashtra', min_price: 1200, max_price: 1400, modal_price: 1300, price_date: '2026-03-20', msp_price: null, msp_status: null, source: 'agmarknet', fetched_at: new Date().toISOString() }
];

// 7-day sparkline mock
const mockSparkline = [
    { price_date: '2026-03-14', modal_price: 2280, min_price: 2100, max_price: 2400 },
    { price_date: '2026-03-15', modal_price: 2300, min_price: 2150, max_price: 2450 },
    { price_date: '2026-03-16', modal_price: 2250, min_price: 2100, max_price: 2350 },
    { price_date: '2026-03-17', modal_price: 2320, min_price: 2200, max_price: 2400 },
    { price_date: '2026-03-18', modal_price: 2290, min_price: 2180, max_price: 2380 },
    { price_date: '2026-03-19', modal_price: 2350, min_price: 2250, max_price: 2450 },
    { price_date: '2026-03-20', modal_price: 2320, min_price: 2200, max_price: 2450 }
];

module.exports = { mockCommodities, mockMarkets, mockPrices, mockSparkline };
