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
        const categoryEntity = new Category(name, description);
        await categoryService.checkCategoryIfExist(categoryEntity);
        const id = await categoryService.insertNewCategory(categoryEntity);
        const category = await categoryService.getCategoryById(id);
        return category;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
