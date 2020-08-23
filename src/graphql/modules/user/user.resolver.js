const graphql = require('graphql');
const userService = require('./user.service');

module.exports = {
  findUserById: {
    type: userService.userType,
    args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) } },
    resolve: async (_, { id }) => {
      try {
        return await userService.getUserById(id);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findUserByPhone: {
    type: userService.userType,
    args: { phone: { type: graphql.GraphQLNonNull(graphql.GraphQLString) } },
    resolve: async (_, { phone }) => {
      try {
        return await userService.getUserByPhone(phone);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
