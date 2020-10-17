const graphql = require('graphql');
const moment = require('moment');

const farmService = require('./farm.service');
const userService = require('../user/user.service');
const notificationService = require('../notifications/notification.service');

const WorkerRegistration = require('./worker_registration');
const WorkerTaskDone = require('./worker_task_done');
const FarmWorker = require('./farm_worker');
const FarmWorkerPermit = require('./farm_worker_permit');
const WorkerTask = require('./worker_task');
const Farm = require('./farm');

const ErrorMessage = require('../../constant-error');
const { FARM_TOKEN_DURATION_TIME, TIME_MINUTES, WORKER_TIME_FORMAT } = require('../../constant-value');

const NotificationFactory = require('../notifications/notification_factory');
const { NOTIFICATION_TYPE } = require('../../../config');
const { ABSENT, ATTENDANCE, TASK } = NOTIFICATION_TYPE;

const notificationFactory = new NotificationFactory();

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
        const farm = await farmService.getFarmById(workerTask.farm_id);

        const isWorkerRegistered = await farmService.validateRegisteredWorker(workerTask.farm_id, user_id);
        if (!isWorkerRegistered) throw new Error(ErrorMessage.WORKER_IS_NOT_REGISTERED);

        const workerTaskDoneResult = await farmService.insertFarmWorkerTaskOnDone(workerTaskDone);

        const taskNotification = notificationFactory.getNotification(TASK);

        taskNotification.notification_for = farm.user_id;
        taskNotification.notification_type = TASK;
        taskNotification.information = {
          title: user.fullname,
          data: 'Menyelesaikan ' + workerTask.title,
          user_id: user_id,
          task_finish_at: workerTaskDoneResult.created_at,
        };

        await notificationService.insertNotification(taskNotification);

        return { id: workerTaskDoneResult.id, user, worker_task: workerTask, submit_at: workerTaskDoneResult.submit_at };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  createFarmWorkerPermit: {
    type: farmService.farmWorkerPermitType,
    args: {
      workerPermitInput: { type: graphql.GraphQLNonNull(farmService.farmWorkerPermitInput) },
    },
    resolve: async (_, { workerPermitInput }) => {
      try {
        const farmWorkerPermit = new FarmWorkerPermit(
          workerPermitInput.category,
          workerPermitInput.description,
          workerPermitInput.duration,
          workerPermitInput.farm_id,
          workerPermitInput.user_id,
        );

        const isWorkerRegistered = await farmService.validateRegisteredWorker(workerPermitInput.farm_id, workerPermitInput.user_id);
        if (!isWorkerRegistered) throw new Error(ErrorMessage.WORKER_IS_NOT_REGISTERED);

        const farm = await farmService.getFarmById(workerPermitInput.farm_id);
        const user = await userService.getUserById(workerPermitInput.user_id);
        const id = await farmService.insertNewWorkerPermit(farmWorkerPermit);
        const permit = await farmService.getFarmWorkerPermitById(id);

        const taskNotification = notificationFactory.getNotification(ABSENT);

        taskNotification.notification_for = farm.user_id;
        taskNotification.notification_type = ABSENT;
        taskNotification.information = {
          title: user.fullname,
          data: 'Mengajukan perizinan',
          user_id: workerPermitInput.user_id,
          submit_at: permit.created_at,
        };

        await notificationService.insertNotification(taskNotification);

        return { ...permit, worker: user };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  createFarmWorkerAttendance: {
    type: farmService.workerAttendanceType,
    args: {
      farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    },
    resolve: async (_, { farm_id, user_id }) => {
      try {
        const isWorkerRegistered = await farmService.validateRegisteredWorker(farm_id, user_id);
        if (!isWorkerRegistered) throw new Error(ErrorMessage.WORKER_IS_NOT_REGISTERED);

        const farm = await farmService.getFarmById(farm_id);
        const user = await userService.getUserById(user_id);

        const taskNotification = notificationFactory.getNotification(ATTENDANCE);

        taskNotification.notification_for = farm.user_id;
        taskNotification.notification_type = ATTENDANCE;
        taskNotification.information = {
          title: user.fullname,
          data: 'Absen masuk kerja',
          user_id: user_id,
          submit_at: moment(new Date()),
        };

        await notificationService.insertNotification(taskNotification);

        return { farm_id, user_id, inside_farm: true };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  createFarmWorkerPermitSubmit: {
    type: farmService.farmWorkerPermitType,
    args: {
      worker_permit_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      is_allowed: { type: graphql.GraphQLNonNull(graphql.GraphQLBoolean) },
      farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    },
    resolve: async (_, { worker_permit_id, is_allowed, farm_id }) => {
      try {

        await farmService.updateFarmWorkerPermit(worker_permit_id, farm_id, is_allowed);
        const permit = await farmService.getFarmWorkerPermitById(worker_permit_id);
        const user = await userService.getUserById(permit.user_id);

        return { ...permit, worker: user };
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
  updateFarmWorkerTask: {
    type: farmService.farmWorkerTask,
    args: {
      worker_task_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      farmWorkerTaskInput: { type: graphql.GraphQLNonNull(farmService.farmWorkerTaskUpdate) },
    },
    resolve: async (_, { worker_task_id, farmWorkerTaskInput }) => {
      try {
        if (farmWorkerTaskInput.started_at) farmWorkerTaskInput.started_at = moment(farmWorkerTaskInput.started_at, WORKER_TIME_FORMAT).format(WORKER_TIME_FORMAT);
        if (farmWorkerTaskInput.ended_at) farmWorkerTaskInput.ended_at = moment(farmWorkerTaskInput.ended_at, WORKER_TIME_FORMAT).format(WORKER_TIME_FORMAT);
        await farmService.updateFarmWorkerTask(worker_task_id, farmWorkerTaskInput);
        const result = await farmService.getFarmWorkerTaskById(worker_task_id);
        return result;
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
