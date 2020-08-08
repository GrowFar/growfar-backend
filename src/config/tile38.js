const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'development') require('dotenv').config();

const tileConfig = {
  host: process.env.TILE38_HOST,
  port: process.env.TILE38_PORT,
  debug: NODE_ENV == 'development',
};

module.exports = { tileConfig };
