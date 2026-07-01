'use strict';
const db = require('../db');
const { sendPriceAlert } = require('../services/notification');

/**
 * Scan all watchlists that have WhatsApp enabled and check if a new price
 * meets the threshold for notification.
 */
async function processPriceAlerts() {
    console.log('[AlertWorker] Checking for price alerts...');
    try {
        // Find watchlist items where price changed since last notification
        // and meets the user's threshold percentage
        const results = await db.query(`
            SELECT 
                w.id as watchlist_id,
                w.user_id,
                w.commodity_id,
                w.market_id,
                w.price_threshold_pct,
                w.last_notified_price,
                u.email,
                u.preferred_lang,
                c.name_en as commodity_name_en,
                c.name_hi as commodity_name_hi,
                mk.name as market_name,
                p.modal_price as current_price
            FROM watchlist w
            JOIN users u ON u.id = w.user_id
            JOIN commodities c ON c.id = w.commodity_id
            JOIN markets mk ON mk.id = w.market_id
            JOIN prices p ON p.commodity_id = w.commodity_id AND p.market_id = w.market_id
            WHERE w.whatsapp_enabled = TRUE
              AND p.price_date = CURRENT_DATE
              AND (
                w.last_notified_price IS NULL OR 
                ABS((p.modal_price - w.last_notified_price) / w.last_notified_price * 100) >= w.price_threshold_pct
              )
        `);

        for (const row of results.rows) {
            const { 
                watchlist_id, 
                current_price, 
                last_notified_price, 
                price_threshold_pct,
                commodity_name_en,
                commodity_name_hi,
                market_name,
                preferred_lang
            } = row;

            const prev = last_notified_price || current_price;
            const pctChange = last_notified_price ? ((current_price - last_notified_price) / last_notified_price * 100) : 0;

            console.log(`[AlertWorker] Triggering alert for User ${row.user_id} - ${commodity_name_en}`);
            
            await sendPriceAlert(row, {
                commodity_name: preferred_lang === 'hi' ? commodity_name_hi : commodity_name_en,
                market_name,
                current_price,
                prev_price: prev,
                percent_change: Math.round(pctChange * 10) / 10,
                lang: preferred_lang
            });

            // Update last notified price to avoid repeat alerts for same price
            await db.query(
                'UPDATE watchlist SET last_notified_price = $1, last_notified_at = NOW() WHERE id = $2',
                [current_price, watchlist_id]
            );
        }

        console.log(`[AlertWorker] Processed ${results.rows.length} alerts.`);
    } catch (err) {
        console.error('[AlertWorker] Error processing alerts:', err.message);
    }
}

module.exports = { processPriceAlerts };
