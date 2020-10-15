const graphql = require('graphql');
const farmService = require('./farm.service');
const userService = require('../user/user.service');

const ErrorMessage = require('../../constant-error');
const Pagination = require('../../../utils/pagination');

module.exports = {
  findFarmById: {
    type: farmService.farmType,
    args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) } },
    resolve: async (_, { id }) => {
      try {
        const farm = await farmService.getFarmById(id);
        const user = await userService.getUserById(farm.user_id);
        return { ...farm, user };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findFarmByUserId: {
    type: farmService.farmType,
    args: { user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) } },
    resolve: async (_, { user_id }) => {
      try {
        const farm = await farmService.getFarmByUserId(user_id);
        const user = await userService.getUserById(user_id);
        return { ...farm, user };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findFarmLocationNearby: {
    type: graphql.GraphQLList(farmService.farmType),
    args: {
      longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      radius: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    },
    resolve: async (_, { longitude, latitude, radius }) => {
      try {
        const { points } = await farmService.getFarmNearby(longitude, latitude, radius);
        const farmResult = await farmService.getFarmDataNearby(points);
        return farmResult;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findFarmLocationWorker: {
    type: graphql.GraphQLList(farmService.farmLocationWorker),
    args: {
      longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      radius: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    },
    resolve: async (_, { longitude, latitude, radius }) => {
      try {
        const { points } = await farmService.getFarmNearby(longitude, latitude, radius);
        const farmResult = await farmService.getFarmDataWorkerNearby(points);
        return farmResult;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findFarmWorkerTaskById: {
    type: farmService.farmWorkerTask,
    args: {
      task_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    },
    resolve: async (_, { task_id }) => {
      try {
        return await farmService.getFarmWorkerTaskById(task_id);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findFarmWorkerTaskByFarmId: {
    type: graphql.GraphQLList(farmService.farmWorkerTask),
    args: {
      farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    },
    resolve: async (_, { farm_id }) => {
      try {
        return await farmService.getFarmWorkerTaskByFarmId(farm_id);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findFarmByWorkerId: {
    type: farmService.farmType,
    args: {
      user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    },
    resolve: async (_, { user_id }) => {
      try {
        const farmWorkerData = await farmService.getFarmWorkerByUserId(user_id);
        if (!farmWorkerData) {
          return null;
        }

        const farm = await farmService.getFarmById(farmWorkerData.farm_id);
        const user = await userService.getUserById(farm.user_id);
        return { ...farm, user };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findFarmWorker: {
    type: farmService.farmWorkerListType,
    args: {
      farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      limit: { type: graphql.GraphQLInt },
      page: { type: graphql.GraphQLInt },
    },
    resolve: async (_, { farm_id, limit, page }) => {
      try {
        const pagination = new Pagination(limit, page);
        const ids = await farmService.getFarmWorkerIdByFarmId(farm_id, pagination);
        const users = await userService.getUserByIds(ids);
        const usersMergedResult = await farmService.mergeFarmWorkerWithPermit(users, farm_id);
        return { farm_id, users: usersMergedResult };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findFarmWorkerPermitById: {
    type: farmService.farmWorkerPermitType,
    args: {
      worker_permit_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    },
    resolve: async (_, { worker_permit_id }) => {
      try {
        const permit = await farmService.getFarmWorkerPermitById(worker_permit_id);
        const user = await userService.getUserById(permit.user_id);
        return { ...permit, worker: user };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findFarmWorkerTaskProgress: {
    type: graphql.GraphQLList(farmService.farmWorkerTaskProgress),
    args: {
      farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    },
    resolve: async (_, { farm_id, user_id }) => {
      try {
        const workProgress = await farmService.getFarmWorkerTaskProgress(user_id);
        const farmWorkerTaskResult = await farmService.getFarmWorkerTaskByFarmId(farm_id);
        const workProgressResult = await farmService.mergeFarmWorkerProgress(workProgress, farmWorkerTaskResult);
        return workProgressResult;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findWorkerIsOnWorkLocation: {
    type: farmService.workerAttendanceType,
    args: {
      farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    },
    resolve: async (_, { farm_id, user_id, longitude, latitude }) => {
      try {
        const isWorkerRegistered = await farmService.validateRegisteredWorker(farm_id, user_id);
        if (!isWorkerRegistered) throw new Error(ErrorMessage.WORKER_IS_NOT_REGISTERED);

        const { points } = await farmService.getFarmNearby(longitude, latitude, 0.5);
        const result = await farmService.validateWorkLocation(points, farm_id);

        return { farm_id, user_id, inside_farm: result };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
