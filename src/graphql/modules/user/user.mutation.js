const graphql = require('graphql');
const userService = require('./user.service');
const User = require('./user');

module.exports = {
  createNewUser: {
    type: userService.userType,
    args: { userInput: { type: graphql.GraphQLNonNull(userService.userInput) } },
    resolve: async (_, { userInput }) => {
      try {
        const { fullname, email, password, phone, role } = userInput;
        const user = new User(fullname, email, password, phone, role);
        user.password = await userService.hashUserPassword(user.password);
        await userService.checkUserIfExists(user.email, user.phone);
        const id = await userService.insertNewUser(user);
        return { id, ...user };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
