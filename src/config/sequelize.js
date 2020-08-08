const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'development') require('dotenv').config();

let DATABASE;
switch (NODE_ENV) {
  case 'production':
    DATABASE = {
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASS: process.env.DB_PASS,
      DB_PORT: process.env.DB_PORT,
      DB_DIALECT: 'mysql',
      POOL_SIZE: 10,
    };
    break;
  case 'test':
    DATABASE = {
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASS: process.env.DB_PASS,
      DB_PORT: process.env.DB_PORT,
      DB_DIALECT: 'mysql',
      POOL_SIZE: 5,
    };
    break;
  default:
    DATABASE = {
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASS: process.env.DB_PASS,
      DB_PORT: process.env.DB_PORT,
      DB_DIALECT: 'mysql',
      POOL_SIZE: 5,
    };
    break;
}

module.exports = { DATABASE };
