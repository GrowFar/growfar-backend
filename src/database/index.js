const { connection, isOpen, close } = require('./connection');
const { 'operatorsAliases': Op } = require('./operator');
const { Sequelize } = require('sequelize');

const CategoryModel = require('../graphql/modules/category/category.model');
const CommodityModel = require('../graphql/modules/commodity/commodity.model');
const FarmModel = require('../graphql/modules/farm/farm.model');
const MarketModel = require('../graphql/modules/market/market.model');
const UserModel = require('../graphql/modules/user/user.model');

const Category = CategoryModel(connection, Sequelize);
const Commodity = CommodityModel(connection, Sequelize);
const Farm = FarmModel(connection, Sequelize);
const Market = MarketModel(connection, Sequelize);
const User = UserModel(connection, Sequelize);

// 1:1
User.hasOne(Farm, { foreignKey: { name: 'user_id', allowNull: false } });
Farm.belongsTo(User, { foreignKey: { name: 'user_id', allowNull: false } });

// 1:N
Category.hasMany(Commodity, { foreignKey: { name: 'category_id', allowNull: false } });
Commodity.belongsTo(Category, { foreignKey: { name: 'category_id', allowNull: false } });

// M:N
Farm.hasMany(Market, { foreignKey: { name: 'farm_id', allowNull: false } });
Market.belongsTo(Farm, { foreignKey: { name: 'farm_id', allowNull: false } });

Commodity.hasMany(Market, { foreignKey: { name: 'farm_id', allowNull: false } });
Market.belongsTo(Commodity, { foreignKey: { name: 'commodity_id', allowNull: false } });

isOpen().then(() => {
  console.log('Database Connection is Open');
}).catch(error => {
  console.error(error);
  close();
});

module.exports = {
  connection,
  Op,
  isOpen,
  close,
  Category,
  Commodity,
  Farm,
  Market,
  User,
};
