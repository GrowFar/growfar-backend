const { SCHEDULER_LIST: { SCHEDULER_MARKET_PRICE }, APP_TIMEZONE } = require('../config');
const cron = require('node-cron');

const marketService = require('../graphql/modules/market/market.service');

cron.schedule(SCHEDULER_MARKET_PRICE.value, async () => {
  console.log(SCHEDULER_MARKET_PRICE.message);
  const result = await marketService.insertLatestMarketPrice();
  console.log('Scheduler market price result: ', result);
}, { timezone: APP_TIMEZONE });

module.exports = cron;
