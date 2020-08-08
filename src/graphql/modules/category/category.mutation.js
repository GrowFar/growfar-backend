const graphql = require('graphql');
const categoryService = require('./category.service');
const Category = require('./category');

module.exports = {
  createNewCategory: {
    type: categoryService.categoryType,
    args: { categoryInput: { type: graphql.GraphQLNonNull(categoryService.categoryTypeInput) } },
    resolve: async (_, { categoryInput }) => {
      try {
        const { name, description } = categoryInput;
        const category = new Category(name, description);
        await categoryService.checkCategoryIfExist(category);
        const id = await categoryService.insertNewCategory(category);
        return { id, ...category };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
