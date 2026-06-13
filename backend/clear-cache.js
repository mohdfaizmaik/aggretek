require('dotenv').config();
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);
async function clear() {
  console.log('Clearing Redis at:', process.env.REDIS_URL);
  await redis.flushall();
  console.log('Redis flushed.');
  process.exit(0);
}
clear();
