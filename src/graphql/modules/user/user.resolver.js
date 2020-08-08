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
  findUserByEmail: {
    type: userService.userType,
    args: { email: { type: graphql.GraphQLNonNull(graphql.GraphQLString) } },
    resolve: async (_, { email }) => {
      try {
        return await userService.getUserByEmail(email);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
