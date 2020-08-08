const graphql = require('graphql');
const categoryService = require('./category.service');
const Category = require('./category');

module.exports = {
  createNewCategory: {
    type: categoryService.categoryType,
    args: { name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) } },
    resolve: async (_, { name }) => {
      try {
        const category = new Category(name);
        await categoryService.checkCategoryIfExist(category);
        const id = await categoryService.insertNewCategory(category);
        return { id, ...category };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
