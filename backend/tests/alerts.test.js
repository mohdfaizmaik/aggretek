'use strict';
const db = require('../src/db');
const { processPriceAlerts } = require('../src/jobs/alertWorker');
const { sendPriceAlert } = require('../src/services/notification');

jest.mock('../src/db', () => ({
    query: jest.fn(),
}));

jest.mock('../src/services/notification', () => ({
    sendPriceAlert: jest.fn(),
}));

describe('AlertWorker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('triggers alert when price change exceeds threshold', async () => {
        // Mock watchlist item with 5% threshold
        db.query.mockResolvedValueOnce({
            rows: [{
                watchlist_id: 1,
                user_id: 1,
                commodity_id: 1,
                market_id: 1,
                price_threshold_pct: 5.0,
                last_notified_price: 100,
                current_price: 110, // 10% change
                commodity_name_en: 'Wheat',
                market_name: 'Nagpur',
                preferred_lang: 'en'
            }]
        });

        await processPriceAlerts();

        expect(sendPriceAlert).toHaveBeenCalled();
        expect(db.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE watchlist'),
            [110, 1]
        );
    });

    test('does not trigger alert when price change is below threshold', async () => {
        db.query.mockResolvedValueOnce({ rows: [] }); // No rows meet the WHERE clause criteria
        await processPriceAlerts();
        expect(sendPriceAlert).not.toHaveBeenCalled();
    });
});
