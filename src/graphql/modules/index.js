module.exports = {
  resolvers: {
    ...require('./user').resolver,
    ...require('./market').resolver,
    ...require('./category').resolver,
    ...require('./subscription').resolver,
    ...require('./farm').resolver,
    ...require('./plan').resolver,
    ...require('./commodity').resolver,
  },
  mutations: {
    ...require('./user').mutation,
    ...require('./market').mutation,
    ...require('./category').mutation,
    ...require('./subscription').mutation,
    ...require('./farm').mutation,
    ...require('./plan').mutation,
    ...require('./commodity').mutation,
  },
};
