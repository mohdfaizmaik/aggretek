'use strict';
require('dotenv').config();
const app = require('./app');
const { startCronJob } = require('./jobs/pricePoll');
const { close: closeDb } = require('./db');
const { disconnect: closeRedis } = require('./cache/redis');

const PORT = parseInt(process.env.PORT) || 4000;

const server = app.listen(PORT, () => {
    console.log(`[Server] Agritech API running on http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);

    if (process.env.DISABLE_CRON !== 'true') {
        startCronJob();
    }
});

async function shutdown(signal) {
    console.log(`\n[Server] ${signal} received. Shutting down gracefully…`);
    server.close(async () => {
        await closeDb();
        await closeRedis();
        console.log('[Server] Goodbye.');
        process.exit(0);
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
    console.error('[Server] Unhandled rejection:', reason);
});

module.exports = server;
