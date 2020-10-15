const graphql = require('graphql');

const notificationService = require('./notification.service');

const Pagination = require('../../../utils/pagination');

module.exports = {
  findLogActivity: {
    type: graphql.GraphQLList(notificationService.notificationType),
    args: {
      user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      limit: { type: graphql.GraphQLInt },
      page: { type: graphql.GraphQLInt },
    },
    resolve: async (_, { user_id, limit, page }) => {
      try {
        const pagination = new Pagination(limit, page);
        const result = await notificationService.getNotificationsByUserId(user_id, pagination);
        return result;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
