const graphql = require('graphql');

const ErrorMessage = require('../../constant-error');
const { Category, Op } = require('../../../database');

const categoryType = new graphql.GraphQLObjectType({
  name: 'Category',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    description: { type: graphql.GraphQLString },
  },
});

const categoryTypeInput = new graphql.GraphQLInputObjectType({
  name: 'CategoryInput',
  fields: {
    name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    description: { type: graphql.GraphQLString },
  },
});

module.exports = {
  categoryType,
  categoryTypeInput,
  insertNewCategory: async (category) => {
    try {
      const result = await Category.create(category);
      return result.dataValues.id;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getCategoryById: async (id) => {
    try {
      const result = await Category.findOne({
        where: { id: { [Op.$eq]: id } },
      });

      if (!result) throw new Error(ErrorMessage.CATEGORY_NOT_FOUND);
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getCategories: async (pagination) => {
    try {
      const result = [];
      const { limit, offset } = pagination;
      const categoryResult = await Category.findAll({
        order: [['id', 'ASC']],
        offset: offset,
        limit: limit,
      });

      for (const item of categoryResult) {
        const { dataValues } = item;
        result.push(dataValues);
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  checkCategoryIfExist: async (category) => {
    try {
      const { name } = category;
      const result = await Category.findOne({
        where: { name: { [Op.$eq]: name } },
      });

      if (result) throw new Error(ErrorMessage.CATEGORY_IS_EXISTS);
      return result == null;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
