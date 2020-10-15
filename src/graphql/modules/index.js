module.exports = {
  resolvers: {
    ...require('./user').resolver,
    ...require('./market').resolver,
    ...require('./category').resolver,
    ...require('./farm').resolver,
    ...require('./commodity').resolver,
    ...require('./notifications').resolver,
  },
  mutations: {
    ...require('./user').mutation,
    ...require('./market').mutation,
    ...require('./category').mutation,
    ...require('./farm').mutation,
    ...require('./commodity').mutation,
    ...require('./notifications').mutation,
  },
};
