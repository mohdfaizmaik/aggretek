require('dotenv').config();
const { pollPrices } = require('./src/jobs/pricePoll');
async function force() {
  console.log('--- Forced Price Poll Start ---');
  await pollPrices();
  console.log('--- Forced Price Poll End ---');
  process.exit(0);
}
force();
