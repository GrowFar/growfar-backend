const graphql = require('graphql');
const { GraphQLJSON } = require('graphql-type-json');

const { Notification, Op } = require('../../../database');

const notificationType = new graphql.GraphQLObjectType({
  name: 'Notification',
  fields: {
    notification_for: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    notification_type: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    information: { type: GraphQLJSON },
  },
});

module.exports = {
  notificationType,
  insertNotification: async (notification) => {
    try {
      await Notification.create(notification);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getNotificationsByUserId: async (user_id, pagination) => {
    try {
      const { limit, offset } = pagination;
      const result = await Notification.findAll({
        where: {
          notification_for: { [Op.$eq]: user_id },
        },
        order: [['created_at', 'DESC']],
        limit: limit,
        offset: offset,
      });

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
