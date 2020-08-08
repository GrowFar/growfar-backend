const { DATABASE, NODE_ENV } = require('../config');
const { Sequelize } = require('sequelize');

const {
  DB_HOST,
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_DIALECT,
  DB_PORT,
  POOL_SIZE,
} = DATABASE;

const connection = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  port: DB_PORT,
  pool: {
    min: 1,
    max: POOL_SIZE,
    acquire: 30000,
    idle: 1000,
  },
  logQueryParameters: true,
  logging: NODE_ENV === 'development' ? console.log : false,
});

const isOpen = async () => {
  return await new Promise((resolve, reject) => {
    try {
      connection.authenticate();
      resolve(true);
    } catch (error) {
      // console.error('Unable to connect to the database:', error);
      reject(error);
    }

    // console.log('Connection has been established successfully.');
  });
};

const close = async () => await connection.close();

module.exports = { connection, isOpen, close };
