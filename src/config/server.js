const USER_ROLE = {
  GUEST: 'GUEST',
  FARMER: 'FARMER',
  WORKER: 'WORKER',
};

const PERMIT_CATEGORY = {
  SICK: 'SICK',
  EVENT: 'EVENT',
  OTHERS: 'OTHERS',
};

const NOTIFICATION_TYPE = {
  TASK: 'TASK',
  ATTENDANCE: 'ATTENDANCE',
  ABSENT: 'ABSENT',
};

const APP_TIMEZONE = 'Asia/Jakarta';
const APP_LOCALES = 'en-US';

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
  APP_LOCALES,
  PERMIT_CATEGORY,
  NOTIFICATION_TYPE,
};
