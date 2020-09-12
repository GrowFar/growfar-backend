const config = require('./sequelize');

module.exports = {
  DATABASE: {
    DB_HOST: config[process.env.NODE_ENV].host,
    DB_NAME: config[process.env.NODE_ENV].database,
    DB_USER: config[process.env.NODE_ENV].username,
    DB_PASS: config[process.env.NODE_ENV].password,
    DB_PORT: config[process.env.NODE_ENV].port,
    DB_DIALECT: config[process.env.NODE_ENV].dialect,
    POOL_SIZE: 10,
  },
};
