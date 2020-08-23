const graphql = require('graphql');
const userService = require('./user.service');
const User = require('./user');

module.exports = {
  createNewUser: {
    type: userService.userType,
    args: { userInput: { type: graphql.GraphQLNonNull(userService.userInput) } },
    resolve: async (_, { userInput }) => {
      try {
        const { fullname, phone, role, uid } = userInput;
        const user = new User(fullname, phone, role, uid);
        await userService.checkUserIfExists(user.phone, user.uid);
        const id = await userService.insertNewUser(user);
        return { id, ...user };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
