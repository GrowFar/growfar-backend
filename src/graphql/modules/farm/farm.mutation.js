const graphql = require('graphql');
const farmService = require('./farm.service');
const userService = require('../user/user.service');
const moment = require('moment');

const WorkerRegistration = require('./worker_registration');
const FarmWorker = require('./farm_worker');
const Farm = require('./farm');

const { FARM_TOKEN_DURATION_TIME } = require('../../constant-value');

module.exports = {
  createNewFarm: {
    type: farmService.farmType,
    args: { farmInput: { type: graphql.GraphQLNonNull(farmService.farmInput) } },
    resolve: async (_, { farmInput }) => {
      try {
        const { name, user_id, address, longitude, latitude } = farmInput;
        const farm = new Farm(name, user_id, address, longitude, latitude);
        const user = await userService.getUserById(user_id);
        const id = await farmService.insertNewFarm(farm);
        await farmService.insertNewFarmTile(id, latitude, longitude);
        return { id, ...farm, user };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  createFarmLocationMark: {
    type: farmService.farmLocation,
    args: { farmLocationInput: { type: graphql.GraphQLNonNull(farmService.farmLocationInput) } },
    resolve: async (_, { farmLocationInput }) => {
      try {
        await farmService.getFarmById(farmLocationInput.farm_id);
        await farmService.insertNewLocation(farmLocationInput);
        await farmService.insertNewFarmTile(farmLocationInput.farm_id, farmLocationInput.latitude, farmLocationInput.longitude);
        return farmLocationInput;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  generateFarmInvitationCode: {
    type: farmService.farmGeneratedToken,
    args: { farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) } },
    resolve: async (_, { 'farm_id': farmId }) => {
      try {
        const generatedToken = farmService.generateFarmToken();
        const endedAt = moment(new Date()).add(FARM_TOKEN_DURATION_TIME, 'minutes').format();
        const workerRegistration = new WorkerRegistration(farmId, generatedToken, endedAt);
        await farmService.getFarmById(farmId);
        await farmService.validateFarmTokenDuration(farmId);
        await farmService.insertNewFarmToken(workerRegistration);
        return { farm_id: farmId, generated_token: generatedToken, ended_at: endedAt };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  registerNewWorker: {
    type: farmService.farmWorkerType,
    args: {
      farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      invitation_code: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    },
    resolve: async (_, { farm_id, user_id, invitation_code }) => {
      try {
        const farmWorker = new FarmWorker(farm_id, user_id, invitation_code);
        const user = await userService.getUserById(user_id);
        await farmService.validateRegisteredWorker(farm_id, user_id);
        await farmService.validateFarmGeneratedToken(farm_id, invitation_code);
        await farmService.insertNewWorker(farmWorker);
        return { farm_id, user };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
