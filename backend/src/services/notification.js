'use strict';
require('dotenv').config();

const config = {
    provider: process.env.WHATSAPP_PROVIDER || 'mock', // 'mock' or 'twilio'
    twilio: {
        sid: process.env.TWILIO_SID,
        token: process.env.TWILIO_TOKEN,
        from: process.env.TWILIO_WHATSAPP_FROM,
    }
};

/**
 * Pluggable notification provider.
 */
const providers = {
    mock: {
        send: async (to, body) => {
            console.log(`[WhatsApp Mock] Sending to ${to}: ${body}`);
            return { success: true, sid: 'mock_sid_' + Date.now() };
        }
    },
    twilio: {
        send: async (to, body) => {
            if (!config.twilio.sid || !config.twilio.token) {
                throw new Error('Twilio credentials missing');
            }
            const client = require('twilio')(config.twilio.sid, config.twilio.token);
            return client.messages.create({
                from: `whatsapp:${config.twilio.from}`,
                to: `whatsapp:${to}`,
                body: body
            });
        }
    }
};

async function sendPriceAlert(user, data) {
    const { 
        commodity_name, 
        market_name, 
        current_price, 
        prev_price, 
        percent_change,
        lang = 'en'
    } = data;

    const emoji = percent_change > 0 ? '📈' : '📉';
    const direction = percent_change > 0 ? (lang === 'hi' ? 'बढ़त' : 'up') : (lang === 'hi' ? 'गिरावट' : 'down');
    
    let body = '';
    if (lang === 'hi') {
        body = `🌾 Agriमूल्य अलर्ट: ${market_name} मंडी में ${commodity_name} के दाम अब ₹${current_price} हैं (${direction} ${Math.abs(percent_change)}%)! कल ये ₹${prev_price} थे।`;
    } else {
        body = `🌾 Agriमूल्य Alert: ${commodity_name} price at ${market_name} is now ₹${current_price} (Price ${direction} ${Math.abs(percent_change)}%)! Previous: ₹${prev_price}.`;
    }

    try {
        const to = user.whatsapp_number || user.email; // Fallback to email as identifier for mock
        const result = await providers[config.provider].send(to, body);
        return result;
    } catch (err) {
        console.error('[NotificationService] Failed to send WhatsApp:', err.message);
        throw err;
    }
}

module.exports = { sendPriceAlert };
