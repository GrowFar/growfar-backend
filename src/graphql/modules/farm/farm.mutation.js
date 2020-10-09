const graphql = require('graphql');
const farmService = require('./farm.service');
const userService = require('../user/user.service');
const moment = require('moment');

const WorkerRegistration = require('./worker_registration');
const WorkerTaskDone = require('./worker_task_done');
const FarmWorker = require('./farm_worker');
const WorkerTask = require('./worker_task');
const Farm = require('./farm');

const { FARM_TOKEN_DURATION_TIME, TIME_MINUTES, WORKER_TIME_FORMAT } = require('../../constant-value');

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
  createFarmWorkerTask: {
    type: graphql.GraphQLList(farmService.farmWorkerTask),
    args: {
      farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      farmWorkerTaskInput: { type: graphql.GraphQLNonNull(graphql.GraphQLList(graphql.GraphQLNonNull(farmService.farmWorkerTaskInput))) },
    },
    resolve: async (_, { farm_id, farmWorkerTaskInput }) => {
      try {
        const workerTaskData = [];
        farmWorkerTaskInput.map((resource) => {
          resource.started_at = moment(resource.started_at, WORKER_TIME_FORMAT).format(WORKER_TIME_FORMAT);
          resource.ended_at = moment(resource.ended_at, WORKER_TIME_FORMAT).format(WORKER_TIME_FORMAT);
          const workerTask = new WorkerTask(farm_id, resource.title, resource.description, resource.started_at, resource.ended_at);
          workerTaskData.push(workerTask);
        });
        return await farmService.insertFarmWorkerTask(workerTaskData);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  createFarmWorkerTaskOnDone: {
    type: farmService.farmWorkerTaskDone,
    args: {
      user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      worker_task_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    },
    resolve: async (_, { user_id, worker_task_id }) => {
      try {
        await farmService.validateFarmWorkerTaskOnDone(user_id, worker_task_id);
        const timeNow = moment(new Date()).format(WORKER_TIME_FORMAT);
        const workerTaskDone = new WorkerTaskDone(user_id, worker_task_id, timeNow);
        const user = await userService.getUserById(user_id);
        const workerTask = await farmService.getFarmWorkerTaskById(worker_task_id);
        const workerTaskDoneResult = await farmService.insertFarmWorkerTaskOnDone(workerTaskDone);
        return { id: workerTaskDoneResult.id, user, worker_task: workerTask, submit_at: workerTaskDoneResult.submit_at };
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
        const endedAt = moment(new Date()).add(FARM_TOKEN_DURATION_TIME, TIME_MINUTES).format();
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
      user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      invitation_code: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    },
    resolve: async (_, { user_id, invitation_code }) => {
      try {
        const user = await userService.getUserById(user_id);
        const workerRegistration = await farmService.getWorkerRegistrationByToken(invitation_code);
        const farmWorker = new FarmWorker(workerRegistration.farm_id, user_id, invitation_code);
        await farmService.validateRegisteredWorker(workerRegistration.farm_id, user_id);
        await farmService.insertNewWorker(farmWorker);
        return { farm_id: workerRegistration.farm_id, user };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  deleteFarmWorkerTaskById: {
    type: farmService.farmWorkerTask,
    args: {
      farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      task_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    },
    resolve: async (_, { farm_id, task_id }) => {
      try {
        const result = await farmService.getFarmWorkerTaskById(task_id);
        const isDeleted = await farmService.deleteFarmWorkerTask(farm_id, task_id);
        return isDeleted ? result : null;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
