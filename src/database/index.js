const { connection, isOpen, close } = require('./connection');
const { 'operatorsAliases': Op } = require('./operator');
const { Sequelize } = require('sequelize');
const { NODE_ENV } = require('../config');

const CategoryModel = require('../graphql/modules/category/category.model');
const CommodityModel = require('../graphql/modules/commodity/commodity.model');
const FarmModel = require('../graphql/modules/farm/farm.model');
const MarketModel = require('../graphql/modules/market/market.model');
const PlanModel = require('../graphql/modules/plan/plan.model');
const SubscriptionModel = require('../graphql/modules/subscription/subscription.model');
const UserModel = require('../graphql/modules/user/user.model');

const Category = CategoryModel(connection, Sequelize);
const Commodity = CommodityModel(connection, Sequelize);
const Farm = FarmModel(connection, Sequelize);
const Market = MarketModel(connection, Sequelize);
const Plan = PlanModel(connection, Sequelize);
const Subscription = SubscriptionModel(connection, Sequelize);
const User = UserModel(connection, Sequelize);

// 1:1
Plan.hasOne(Subscription, { foreignKey: { name: 'plan_id', allowNull: false } });
Subscription.belongsTo(Plan, { foreignKey: { name: 'plan_id', allowNull: false } });

// 1:N
User.hasMany(Subscription, { foreignKey: { name: 'user_id', allowNull: false } });
Subscription.belongsTo(User, { foreignKey: { name: 'user_id', allowNull: false } });

// 1:1
User.hasOne(Farm, { foreignKey: { name: 'user_id', allowNull: false } });
Farm.belongsTo(User, { foreignKey: { name: 'user_id', allowNull: false } });

// 1:N
Category.hasMany(Commodity, { foreignKey: { name: 'category_id', allowNull: false } });
Commodity.belongsTo(Category, { foreignKey: { name: 'category_id', allowNull: false } });

// 1:N
Commodity.hasMany(Market, { foreignKey: { name: 'commodity_id', allowNull: false } });
Market.belongsTo(Commodity, { foreignKey: { name: 'commodity_id', allowNull: false } });

// M:N
User.belongsToMany(Farm, { through: { model: Market, primaryKey: { name: 'id', allowNull: false } }, foreignKey: { name: 'user_id', allowNull: false } });
Farm.belongsToMany(User, { through: { model: Market, primaryKey: { name: 'id', allowNull: false } }, foreignKey: { name: 'farm_id', allowNull: false } });

isOpen().then(() => {
  console.log('Database Connection is Open');
  connection.sync({ force: NODE_ENV === 'development' });
}).catch(error => {
  console.log(error);
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
  Plan,
  Subscription,
  User,
};
