const graphql = require('graphql');

const categoryService = require('./category.service');
const Pagination = require('../../../utils/pagination');

module.exports = {
  findCategoryById: {
    type: categoryService.categoryType,
    args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) } },
    resolve: async (_, { id }) => {
      try {
        const result = await categoryService.getCategoryById(id);
        return result;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findAllCategory: {
    type: graphql.GraphQLList(categoryService.categoryType),
    args: {
      limit: { type: graphql.GraphQLInt },
      page: { type: graphql.GraphQLInt },
    },
    resolve: async (_, { limit, page }) => {
      try {
        const pagination = new Pagination(limit, page);
        return await categoryService.getCategories(pagination);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
