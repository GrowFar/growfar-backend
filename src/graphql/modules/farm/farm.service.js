const graphql = require('graphql');
const moment = require('moment');
const _ = require('lodash');

const { QueryTypes } = require('sequelize');

const ErrorMessage = require('../../constant-error');
const { TILE_KEY_FARM, TILE_RADIUS, CHARACTERS, FARM_TOKEN_LENGTH } = require('../../constant-value');
const { connection, Farm, User, Op, Market, Commodity, WorkerRegistration, FarmWorker, WorkerTask, WorkerTaskDone, WorkerPermit } = require('../../../database');
const { userType } = require('../user/user.service');
const { tileClient } = require('../../../tile38');

const { PERMIT_CATEGORY } = require('../../../config');

const WORKER_PERMIT_CATEGORY = _.assign({}, ...Object.keys(PERMIT_CATEGORY).map(key => {
  const result = {};
  result[key] = { value: key };
  return result;
}));

const workerPermitEnum = new graphql.GraphQLEnumType({
  name: 'WorkerPermit',
  values: WORKER_PERMIT_CATEGORY,
});

const farmType = new graphql.GraphQLObjectType({
  name: 'Farm',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    user: { type: graphql.GraphQLNonNull(userType) },
    address: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
  },
});

const farmShortType = new graphql.GraphQLObjectType({
  name: 'FarmShort',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
  },
});

const farmInput = new graphql.GraphQLInputObjectType({
  name: 'FarmInput',
  fields: {
    name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    address: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
  },
});

const farmLocation = new graphql.GraphQLObjectType({
  name: 'FarmLocation',
  fields: {
    farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
  },
});

const farmLocationInput = new graphql.GraphQLInputObjectType({
  name: 'FarmLocationInput',
  fields: {
    farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
  },
});

const farmLocationWorker = new graphql.GraphQLObjectType({
  name: 'FarmLocationWorker',
  fields: {
    farm: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    owner: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    phone: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    commodity: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    vacancy: { type: graphql.GraphQLInt },
  },
});

const farmCommodities = new graphql.GraphQLObjectType({
  name: 'FarmCommodities',
  fields: {
    name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    tag: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
  },
});

const farmGeneratedToken = new graphql.GraphQLObjectType({
  name: 'FarmGeneratedToken',
  fields: {
    farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
    generated_token: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    ended_at: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
  },
});

const farmWorkerType = new graphql.GraphQLObjectType({
  name: 'FarmWorker',
  fields: {
    farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
    user: { type: graphql.GraphQLNonNull(userType) },
  },
});

const farmWorkerListType = new graphql.GraphQLObjectType({
  name: 'FarmWorkerList',
  fields: {
    farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
    users: { type: graphql.GraphQLList(userType) },
  },
});

const farmWorkerTask = new graphql.GraphQLObjectType({
  name: 'FarmWorkerTask',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    title: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    description: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    started_at: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    ended_at: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
  },
});

const farmWorkerTaskInput = new graphql.GraphQLInputObjectType({
  name: 'FarmWorkerTaskInput',
  fields: {
    title: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    description: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    started_at: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    ended_at: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
  },
});

const farmWorkerTaskDone = new graphql.GraphQLObjectType({
  name: 'FarmWorkerTaskDone',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    user: { type: graphql.GraphQLNonNull(userType) },
    worker_task: { type: graphql.GraphQLNonNull(farmWorkerTask) },
    submit_at: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
  },
});

const farmWorkerPermitType = new graphql.GraphQLObjectType({
  name: 'FarmWorkerPermit',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    category: { type: graphql.GraphQLNonNull(workerPermitEnum) },
    description: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    duration: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
    is_allowed: { type: graphql.GraphQLNonNull(graphql.GraphQLBoolean) },
    farm: { type: graphql.GraphQLNonNull(farmType) },
  },
});

const farmWorkerPermitInput = new graphql.GraphQLInputObjectType({
  name: 'FarmWorkerPermitInput',
  fields: {
    category: { type: graphql.GraphQLNonNull(workerPermitEnum) },
    description: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    duration: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
    farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
  },
});

module.exports = {
  farmType,
  farmShortType,
  farmInput,
  farmLocation,
  farmLocationInput,
  farmLocationWorker,
  farmCommodities,
  farmGeneratedToken,
  farmWorkerType,
  farmWorkerListType,
  farmWorkerTask,
  farmWorkerTaskInput,
  farmWorkerTaskDone,
  farmWorkerPermitType,
  farmWorkerPermitInput,
  generateFarmToken: () => {
    let result = '';

    for (let i = 0; i < FARM_TOKEN_LENGTH; i++) {
      result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }

    return result;
  },
  getFarmById: async (id) => {
    try {
      const result = await Farm.findOne({
        where: { id: { [Op.$eq]: id } },
      });

      if (!result) throw new Error(ErrorMessage.FARM_NOT_FOUND);
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getFarmByUserId: async (userId) => {
    try {
      const result = await Farm.findOne({
        where: { user_id: { [Op.$eq]: userId } },
      });

      if (!result) throw new Error(ErrorMessage.FARM_NOT_FOUND);
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  insertNewFarm: async (farm) => {
    try {
      const result = await Farm.create(farm);
      return result.dataValues.id;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  insertNewLocation: async (farm) => {
    try {
      const { farm_id, user_id, longitude, latitude } = farm;
      const result = await Farm.update({
        longitude,
        latitude,
      }, {
        where: {
          id: { [Op.$eq]: farm_id },
          user_id: { [Op.$eq]: user_id },
        },
      });

      if (!result[0] || !result) {
        throw new Error(ErrorMessage.FARM_UPDATE_ERROR);
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  insertNewFarmTile: async (id, latitude, longitude) => {
    try {
      return await tileClient.set(TILE_KEY_FARM, `${TILE_KEY_FARM}-${id}`, [latitude, longitude]);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  insertNewFarmToken: async (workerRegistration) => {
    try {
      const result = await WorkerRegistration.create(workerRegistration);
      return result.dataValues.id;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  insertNewWorker: async (farmWorker) => {
    try {
      const result = await FarmWorker.create(farmWorker);
      return result.dataValues.id;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  insertFarmWorkerTask: async (workerTask) => {
    try {
      const result = await WorkerTask.bulkCreate(workerTask);
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  insertFarmWorkerTaskOnDone: async (workerTaskDone) => {
    try {
      const result = await WorkerTaskDone.create(workerTaskDone);
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  insertNewWorkerPermit: async (farmWorkerPermit) => {
    try {
      const result = await WorkerPermit.create(farmWorkerPermit);
      return result.dataValues.id;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  deleteFarmWorkerTask: async (farm_id, task_id) => {
    try {
      const result = await WorkerTask.destroy({
        where: {
          id: { [Op.$eq]: task_id },
          farm_id: { [Op.$eq]: farm_id },
        },
      });
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getFarmWorkerTaskById: async (task_id) => {
    try {
      const result = await WorkerTask.findOne({
        where: {
          id: { [Op.$eq]: task_id },
        },
      });

      if (!result) throw new Error(ErrorMessage.WORKER_TASK_NOT_FOUND);
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getFarmWorkerTaskByFarmId: async (farm_id) => {
    try {
      const result = [];
      const workerTaskResult = await WorkerTask.findAll({
        where: {
          farm_id: { [Op.$eq]: farm_id },
        },
      });

      workerTaskResult.map(res => result.push(res));

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getFarmWorkerByUserId: async (user_id) => {
    try {
      const result = await FarmWorker.findOne({
        where: { user_id: { [Op.$eq]: user_id } },
      });
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getFarmNearby: async (longitude, latitude, radius) => {
    try {
      const kmRadius = (radius * TILE_RADIUS);
      return await tileClient.nearbyQuery(TILE_KEY_FARM).output('points').point(latitude, longitude, kmRadius).execute();
    } catch (error) {
      throw new Error(error);
    }
  },
  getFarmDataNearby: async (points) => {
    try {
      const ids = [];
      const result = [];
      points.map(({ id }) => ids.push(id.split('-')[1]));

      const farmResult = await Farm.findAll({
        where: { id: { [Op.$in]: ids } },
        include: [{
          attributes: ['id', 'fullname', 'email', 'phone', 'role'],
          model: User,
        }],
        nested: true,
      });

      farmResult.map(res => {
        const farm = {
          id: res.id,
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude,
          user: res.User.dataValues,
        };
        result.push(farm);
      });

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getFarmDataWorkerNearby: async (points) => {
    try {
      const ids = [];
      const result = [];
      points.map(({ id }) => ids.push(id.split('-')[1]));

      const farmResult = await Market.findAll({
        attributes: ['farm_id', 'commodity_id'],
        where: { farm_id: { [Op.$in]: ids } },
        group: ['farm_id', 'commodity_id', 'Farm.User.phone'],
        include: [
          {
            attributes: [['name', 'farm'], 'longitude', 'latitude'],
            model: Farm,
            include: {
              attributes: [['fullname', 'owner'], ['phone', 'phone']],
              model: User,
            },
          },
          {
            attributes: [['name', 'commodity']],
            model: Commodity,
          },
        ],
      });

      farmResult.map(res => {
        const farm = {
          farm: res.Farm.dataValues.farm,
          longitude: res.Farm.dataValues.longitude,
          latitude: res.Farm.dataValues.latitude,
          owner: res.Farm.dataValues.User.dataValues.owner,
          phone: res.Farm.dataValues.User.dataValues.phone,
          commodity: res.Commodity.dataValues.commodity,
          vacancy: 0,
        };
        result.push(farm);
      });

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getWorkerRegistrationByToken: async (token) => {
    const result = await WorkerRegistration.findOne({
      where: {
        generated_token: { [Op.$eq]: token },
        ended_at: { [Op.$gt]: moment(new Date()).format() },
      },
      order: [['ended_at', 'DESC']],
    });

    if (!result) throw new Error(ErrorMessage.WORKER_REGISTRATION_NOT_FOUND);
    return result.dataValues;
  },
  getFarmWorkerIdByFarmId: async (farm_id, pagination) => {
    try {
      const result = [];
      const { limit, offset } = pagination;
      const workerResult = await FarmWorker.findAll({
        offset: offset,
        limit: limit,
        where: {
          farm_id: { [Op.$eq]: farm_id },
        },
      });

      workerResult.map(res => result.push(res.user_id));

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getFarmWorkerPermitById: async (permitId) => {
    try {
      const result = await WorkerPermit.findOne({
        attributes: ['id', 'category', 'description', 'duration', 'is_allowed', 'farm_id', 'user_id'],
        where: {
          id: { [Op.$eq]: permitId },
        },
      });
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  validateFarmTokenDuration: async (farmId) => {
    try {
      const result = await WorkerRegistration.findOne({
        where: {
          farm_id: { [Op.$eq]: farmId },
          ended_at: { [Op.$gt]: moment(new Date()).format() },
        },
        order: [['ended_at', 'DESC']],
      });

      if (result) throw new Error(ErrorMessage.WORKER_REGISTRATION_IS_AT_DURATION);
      return null;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  validateFarmGeneratedToken: async (farmId, token) => {
    try {
      const result = await WorkerRegistration.findOne({
        where: {
          generated_token: { [Op.$eq]: token },
          farm_id: { [Op.$eq]: farmId },
          ended_at: { [Op.$gt]: moment(new Date()).format() },
        },
        order: [['ended_at', 'DESC']],
      });

      if (!result) throw new Error(ErrorMessage.WORKER_REGISTRATION_NOT_FOUND);
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  validateRegisteredWorker: async (farm_id, user_id) => {
    try {
      const result = await FarmWorker.findOne({
        where: {
          farm_id: { [Op.$eq]: farm_id },
          user_id: { [Op.$eq]: user_id },
        },
      });

      if (result) throw new Error(ErrorMessage.WORKER_ALREADY_REGISTERED);
      return null;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  validateFarmWorkerTaskOnDone: async (user_id, worker_task_id) => {
    try {
      const currentDate = moment(new Date()).format('YYYY-MM-DD');
      const [result] = await connection.query(`
        SELECT * FROM Worker_Task_Done wtd
        WHERE user_id = ${user_id}
        AND worker_task_id = ${worker_task_id}
        AND date(created_at) = '${currentDate}'
        LIMIT 1
      `, { type: QueryTypes.SELECT }) || {};

      if (result) throw new Error(ErrorMessage.WORKER_TASK_DONE);
      return null;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
