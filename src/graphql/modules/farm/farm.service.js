const graphql = require('graphql');
const moment = require('moment');
const _ = require('lodash');

const { QueryTypes } = require('sequelize');

const ErrorMessage = require('../../constant-error');
const { TILE_KEY_FARM, TILE_RADIUS, CHARACTERS, FARM_TOKEN_LENGTH, TIME_ZONE_JAKARTA, TIME_ZONE_DEFAULT } = require('../../constant-value');
const { connection, Farm, User, Op, Market, Commodity, WorkerRegistration, FarmWorker, WorkerTask, WorkerTaskDone, WorkerPermit } = require('../../../database');
const { userType, userPermitType } = require('../user/user.service');
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
    users: { type: graphql.GraphQLList(userPermitType) },
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

const farmWorkerTaskProgress = new graphql.GraphQLObjectType({
  name: 'FarmWorkerTaskProgress',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    title: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    description: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    started_at: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    ended_at: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    is_done: { type: graphql.GraphQLBoolean },
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

const farmWorkerTaskUpdate = new graphql.GraphQLInputObjectType({
  name: 'FarmWorkerTaskUpdate',
  fields: {
    title: { type: graphql.GraphQLString },
    description: { type: graphql.GraphQLString },
    started_at: { type: graphql.GraphQLString },
    ended_at: { type: graphql.GraphQLString },
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
    submit_at: { type: graphql.GraphQLString },
    worker: { type: graphql.GraphQLNonNull(userType) },
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

const workerAttendanceType = new graphql.GraphQLObjectType({
  name: 'WorkerAttendance',
  fields: {
    user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    inside_farm: { type: graphql.GraphQLNonNull(graphql.GraphQLBoolean) },
  },
});

const workerAttendanceCheckerType = new graphql.GraphQLObjectType({
  name: 'WorkerAttendanceChecker',
  fields: {
    user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    attendance: { type: graphql.GraphQLNonNull(graphql.GraphQLBoolean) },
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
  farmWorkerTaskUpdate,
  farmWorkerTaskDone,
  farmWorkerPermitType,
  farmWorkerPermitInput,
  farmWorkerTaskProgress,
  workerAttendanceType,
  workerAttendanceCheckerType,
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
        attributes: ['id', 'category', 'description', 'duration', 'is_allowed', 'farm_id', 'user_id', ['created_at', 'submit_at']],
        where: {
          id: { [Op.$eq]: permitId },
        },
      });

      if (!result) throw new Error(ErrorMessage.WORKER_PERMIT_NOT_FOUND);

      result.dataValues.submit_at = moment(result.dataValues.submit_at).format();

      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getFarmWorkerTaskProgress: async (user_id) => {
    try {
      const currentDate = moment(new Date()).format('YYYY-MM-DD');
      const result = await connection.query(`
        SELECT user_id, worker_task_id, max(created_at) AS submit_at
        FROM Worker_Task_Done wtd
        WHERE user_id = '${user_id}'
        AND date(convert_tz(created_at, '${TIME_ZONE_DEFAULT}', '${TIME_ZONE_JAKARTA}')) = '${currentDate}'
        GROUP BY user_id, worker_task_id
      `, { type: QueryTypes.SELECT }) || {};

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  updateFarmWorkerPermit: async (worker_permit_id, farm_id, is_allowed) => {
    try {
      const result = await WorkerPermit.update({ isAllowed: is_allowed }, {
        where: {
          id: worker_permit_id,
          farm_id: farm_id,
        },
      });
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  updateFarmWorkerTask: async (worker_task_id, worker_task_data) => {
    try {
      const result = await WorkerTask.update(worker_task_data, {
        where: {
          id: worker_task_id,
        },
      });
      return result;
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

      if (result) {
        return result;
      }

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
        AND date(convert_tz(created_at, '${TIME_ZONE_DEFAULT}', '${TIME_ZONE_JAKARTA}')) = '${currentDate}'
        LIMIT 1
      `, { type: QueryTypes.SELECT }) || {};

      if (result) throw new Error(ErrorMessage.WORKER_TASK_DONE);
      return null;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  validateWorkLocation: async (points, farm_id) => {
    try {
      let result = false;

      points.map(({ id }) => {
        const [, fId] = id.split('-');
        if (fId == farm_id) result = true;
      });

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  validateFarmWorkerAlreadyAttendance: async (farm_user_id, user_id) => {
    try {
      const currentDate = moment(new Date()).format('YYYY-MM-DD');
      const [notificationResult] = await connection.query(`
        SELECT * FROM Notification n
        WHERE notification_type = 'ATTENDANCE'
        AND notification_for = ${farm_user_id}
        AND JSON_EXTRACT(information, "$.user_id") = '${user_id}'
        AND date(convert_tz(created_at, '${TIME_ZONE_DEFAULT}', '${TIME_ZONE_JAKARTA}')) = '${currentDate}'
        ORDER BY created_at DESC
        LIMIT 1
      `, { type: QueryTypes.SELECT }) || {};

      const result = notificationResult ? true : false;

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  validateAllFarmWorkerAlreadyAttendance: async (farm_id, ids) => {
    try {
      ids = ids.map(id => `"${id}"`).join(',');

      const currentDate = moment(new Date()).format('YYYY-MM-DD');
      const notificationResult = await connection.query(`
        SELECT JSON_EXTRACT(information, "$.user_id") AS user_id, created_at
        FROM Notification n
        WHERE notification_type = 'ATTENDANCE'
        AND notification_for = ${farm_id}
        AND JSON_EXTRACT(information, "$.user_id") IN (${ids.length > 0 ? ids : '"0"'})
        AND date(convert_tz(created_at, '${TIME_ZONE_DEFAULT}', '${TIME_ZONE_JAKARTA}')) = '${currentDate}'
        ORDER BY created_at DESC
      `, { type: QueryTypes.SELECT }) || {};

      return notificationResult;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  mergeFarmWorkerWithAttendance: async (users, attendanceIds) => {
    try {
      const ids = new Map();

      attendanceIds.map(({ user_id, created_at }) => {
        if (!ids.has(user_id)) {
          ids.set(user_id, {
            user_id,
            created_at,
          });
        }
      });

      users.map(user => {
        user.attendance_at = null;
        const id = user.id.toString();

        if (ids.has(user.id.toString())) {
          const { created_at } = ids.get(id);
          const attendance_at = moment(created_at).format();
          user.attendance_at = attendance_at;
        }

      });

      return users;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  mergeFarmWorkerProgress: async (workerProgressData, farmWorkerTaskData) => {
    try {
      const workerProgressIds = [];
      const mergedProgress = [];

      workerProgressData.map(({ worker_task_id }) => {
        workerProgressIds.push(worker_task_id);
      });

      farmWorkerTaskData.map(({ 'dataValues': task }) => {
        task.is_done = false;

        if (workerProgressIds.includes(task.id)) {
          task.is_done = true;
        }

        mergedProgress.push(task);
      });

      return mergedProgress;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  mergeFarmWorkerWithPermit: async (users, farm_id) => {
    try {
      const workerTaskPermitResult = await connection.query(`
        SELECT id, user_id
        FROM Worker_Permit wp
        WHERE created_at IN (
          SELECT max(created_at) AS created_at
          FROM Worker_Permit wp2
          WHERE farm_id = ${farm_id}
          AND is_allowed = 0
          GROUP BY farm_id, user_id
        )
      `, { type: QueryTypes.SELECT }) || {};

      users.map(user => {
        user.permit_id = null;

        workerTaskPermitResult.map(permit => {
          if (user.id == permit.user_id) {
            user.permit_id = permit.id;
          }
        });

      });

      return users;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
