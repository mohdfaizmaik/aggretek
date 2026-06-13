'use strict';
require('dotenv').config();
const { getAgmarknetPrices } = require('./src/services/agmarknet');

async function testAgmarknet() {
    console.log('Testing Agmarknet API v2...');
    const commodities = ['Wheat', 'Potato', 'Onion'];
    
    for (const commodity of commodities) {
        console.log(`\nFetching ${commodity}...`);
        const prices = await getAgmarknetPrices(commodity);
        console.log(`Found ${prices.length} records.`);
        if (prices.length > 0) {
            console.log('Sample record:', JSON.stringify(prices[0], null, 2));
        }
    }
}

testAgmarknet().catch(console.error);
