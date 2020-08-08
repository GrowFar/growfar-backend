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
  findFarmLocationNearby: {
    type: graphql.GraphQLList(farmService.farmType),
    args: {
      longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      radius: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
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
};
