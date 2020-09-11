const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'development') require('dotenv').config();

const USER_ROLE = {
  GUEST: 'GUEST',
  FARMER: 'FARMER',
  WORKER: 'WORKER',
};

const APP_TIMEZONE = 'Asia/Jakarta';

const SCHEDULER_LIST = {
  SCHEDULER_MARKET_PRICE: {
    message: 'Executing market price insert every midnight',
    value: '0 0 * * *',
  },
  SCHEDULER_NOTIFICATION: {
    message: 'Executing notification for ...',
    value: '* * * * *',
  },
};

module.exports = {
  ...process.env,
  USER_ROLE,
  SCHEDULER_LIST,
  APP_TIMEZONE,
};
