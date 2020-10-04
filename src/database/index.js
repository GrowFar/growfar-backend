const { connection, isOpen, close } = require('./connection');
const { 'operatorsAliases': Op } = require('./operator');
const { Sequelize } = require('sequelize');

const CategoryModel = require('../graphql/modules/category/category.model');
const CommodityModel = require('../graphql/modules/commodity/commodity.model');
const FarmModel = require('../graphql/modules/farm/farm.model');
const MarketModel = require('../graphql/modules/market/market.model');
const UserModel = require('../graphql/modules/user/user.model');
const FarmWorkerModel = require('../graphql/modules/farm/farm_worker.model');
const WorkerPermitModel = require('../graphql/modules/farm/worker_permit.model');
const WorkerRegistrationModel = require('../graphql/modules/farm/worker_registration.model');
const WorkerTaskModel = require('../graphql/modules/farm/worker_task.model');
const WorkerTaskDiscussionModel = require('../graphql/modules/farm/worker_task_discussion.model');
const WorkerTaskDoneModel = require('../graphql/modules/farm/worker_task_done.model');
const NotificationModel = require('../graphql/modules/notifications/notification.model');

const Category = CategoryModel(connection, Sequelize);
const Commodity = CommodityModel(connection, Sequelize);
const Farm = FarmModel(connection, Sequelize);
const Market = MarketModel(connection, Sequelize);
const User = UserModel(connection, Sequelize);
const FarmWorker = FarmWorkerModel(connection, Sequelize);
const WorkerPermit = WorkerPermitModel(connection, Sequelize);
const WorkerRegistration = WorkerRegistrationModel(connection, Sequelize);
const WorkerTask = WorkerTaskModel(connection, Sequelize);
const WorkerTaskDiscussion = WorkerTaskDiscussionModel(connection, Sequelize);
const WorkerTaskDone = WorkerTaskDoneModel(connection, Sequelize);
const Notification = NotificationModel(connection, Sequelize);

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

// 1:1
Farm.hasOne(WorkerRegistration, { foreignKey: { name: 'farm_id', allowNull: false } });
WorkerRegistration.belongsTo(Farm, { foreignKey: { name: 'farm_id', allowNull: false } });

// M:N
Farm.hasMany(FarmWorker, { foreignKey: { name: 'farm_id', allowNull: false } });
FarmWorker.belongsTo(Farm, { foreignKey: { name: 'farm_id', allowNull: false } });

User.hasMany(FarmWorker, { foreignKey: { name: 'user_id', allowNull: false } });
FarmWorker.belongsTo(User, { foreignKey: { name: 'user_id', allowNull: false } });

// M:N
Farm.hasMany(WorkerPermit, { foreignKey: { name: 'farm_id', allowNull: false } });
WorkerPermit.belongsTo(Farm, { foreignKey: { name: 'farm_id', allowNull: false } });

User.hasMany(WorkerPermit, { foreignKey: { name: 'user_id', allowNull: false } });
WorkerPermit.belongsTo(User, { foreignKey: { name: 'user_id', allowNull: false } });

// 1:N
Farm.hasMany(WorkerTask, { foreignKey: { name: 'farm_id', allowNull: false } });
WorkerTask.belongsTo(Farm, { foreignKey: { name: 'farm_id', allowNull: false } });

// 1:N
WorkerTask.hasMany(WorkerTaskDiscussion, { foreignKey: { name: 'worker_task_id', allowNull: false } });
WorkerTaskDiscussion.belongsTo(WorkerTask, { foreignKey: { name: 'worker_task_id', allowNull: false } });

// 1:1
WorkerTask.hasOne(WorkerTask, { foreignKey: { name: 'worker_task_discussion_parent_id', allowNull: false } });
WorkerTask.belongsTo(WorkerTask, { foreignKey: { name: 'worker_task_discussion_parent_id', allowNull: false } });

// M:N
User.hasMany(WorkerTaskDone, { foreignKey: { name: 'user_id', allowNull: false } });
WorkerTaskDone.belongsTo(User, { foreignKey: { name: 'user_id', allowNull: false } });

WorkerTask.hasMany(WorkerTaskDone, { foreignKey: { name: 'worker_task_id', allowNull: false } });
WorkerTaskDone.belongsTo(WorkerTask, { foreignKey: { name: 'worker_task_id', allowNull: false } });

// 1:N
User.hasMany(Notification, { foreignKey: { name: 'notification_for', allowNull: false } });
Notification.belongsTo(User, { foreignKey: { name: 'notification_for', allowNull: false } });

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
  FarmWorker,
  WorkerPermit,
  WorkerRegistration,
  WorkerTask,
  WorkerTaskDiscussion,
  WorkerTaskDone,
  Notification,
};
