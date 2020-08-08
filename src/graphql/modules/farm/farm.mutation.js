const graphql = require('graphql');
const farmService = require('./farm.service');
const userService = require('../user/user.service');
const Farm = require('./farm');

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
};
