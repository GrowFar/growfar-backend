const graphql = require('graphql');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const ErrorMessage = require('../../constant-error');
const { User, Op } = require('../../../database');
const { USER_ROLE } = require('../../../config');
const { SALT_ROUND } = require('../../constant-value');

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
    fullname: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    email: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    phone: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    role: { type: graphql.GraphQLNonNull(roleEnum) },
  },
});

const userInput = new graphql.GraphQLInputObjectType({
  name: 'UserInput',
  fields: {
    fullname: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    email: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    password: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    phone: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    role: { type: graphql.GraphQLNonNull(roleEnum) },
  },
});

module.exports = {
  userType,
  userInput,
  hashUserPassword: async (password) => bcrypt.hash(password, SALT_ROUND),
  getUserById: async (id) => {
    try {
      const result = await User.findOne({
        attributes: ['id', 'fullname', 'email', 'phone', 'role'],
        where: { id: { [Op.$eq]: id } },
      });

      if (!result) throw new Error(ErrorMessage.USER_NOT_FOUND);
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getUserByEmail: async (email) => {
    try {
      const result = await User.findOne({
        attributes: ['id', 'fullname', 'email', 'phone', 'role'],
        where: { email: { [Op.$like]: email } },
      });

      if (!result) throw new Error(ErrorMessage.USER_NOT_FOUND);
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  checkUserIfExists: async (email, phone) => {
    try {
      const result = await User.findOne({
        attributes: ['id', 'fullname', 'email', 'phone'],
        where: { [Op.$or]: { email: { [Op.$eq]: email }, phone: { [Op.$eq]: phone } } },
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
