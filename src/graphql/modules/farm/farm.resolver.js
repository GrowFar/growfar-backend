const graphql = require('graphql');
const farmService = require('./farm.service');
const userService = require('../user/user.service');

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
};
