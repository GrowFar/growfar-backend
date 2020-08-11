const graphql = require('graphql');

const commodityService = require('./commodity.service');
const categoryService = require('../category/category.service');

const Commodity = require('./commodity');

module.exports = {
  createNewCommodity: {
    type: commodityService.commodityType,
    args: { commodityInput: { type: graphql.GraphQLNonNull(commodityService.commodityTypeInput) } },
    resolve: async (_, { commodityInput }) => {
      try {
        const { name, categoryId } = commodityInput;
        const commodity = new Commodity(name, categoryId);
        const category = await categoryService.getCategoryById(categoryId);
        const id = await commodityService.insertNewCommodity(commodity);
        return { id, ...commodity, category };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
