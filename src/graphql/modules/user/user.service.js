const graphql = require('graphql');
const _ = require('lodash');

const ErrorMessage = require('../../constant-error');
const { User, Op } = require('../../../database');
const { USER_ROLE } = require('../../../config');

const ROLES = _.assign({}, ...Object.keys(USER_ROLE).map(key => {
  const result = {};
  result[key] = { value: key };
  return result;
}));

const roleEnum = new graphql.GraphQLEnumType({
  name: 'role',
  values: ROLES,
});

const userType = new graphql.GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    uid: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    fullname: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    phone: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    role: { type: graphql.GraphQLNonNull(roleEnum) },
  },
});

const userInput = new graphql.GraphQLInputObjectType({
  name: 'UserInput',
  fields: {
    uid: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    fullname: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    phone: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    role: { type: graphql.GraphQLNonNull(roleEnum) },
  },
});

module.exports = {
  userType,
  userInput,
  getUserById: async (id) => {
    try {
      const result = await User.findOne({
        attributes: ['id', 'uid', 'fullname', 'phone', 'role'],
        where: { id: { [Op.$eq]: id } },
      });

      if (!result) throw new Error(ErrorMessage.USER_NOT_FOUND);
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getUserByIds: async (ids) => {
    try {
      const result = await User.findAll({
        attributes: ['id', 'uid', 'fullname', 'phone', 'role'],
        where: { id: { [Op.$in]: ids } },
        raw: true,
      });

      if (!result) {
        return null;
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getUserByPhone: async (phone) => {
    try {
      const result = await User.findOne({
        attributes: ['id', 'uid', 'fullname', 'phone', 'role'],
        where: { phone: { [Op.$eq]: phone } },
      });

      if (!result) throw new Error(ErrorMessage.USER_NOT_FOUND);
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  checkUserIfExists: async (phone, uid) => {
    try {
      const result = await User.findOne({
        attributes: ['id', 'fullname', 'phone', 'uid'],
        where: { [Op.$or]: { phone: { [Op.$eq]: phone }, uid: { [Op.$eq]: uid } } },
      });

      if (result) throw new Error(ErrorMessage.USER_IS_EXISTS);
      return result == null;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  insertNewUser: async (user) => {
    try {
      const result = await User.create(user);
      return result.dataValues.id;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
