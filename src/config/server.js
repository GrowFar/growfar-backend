const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'development') require('dotenv').config();

const USER_ROLE = {
  GUEST: 'GUEST',
  FARMER: 'FARMER',
  WORKER: 'WORKER',
};

module.exports = { ...process.env, USER_ROLE };
