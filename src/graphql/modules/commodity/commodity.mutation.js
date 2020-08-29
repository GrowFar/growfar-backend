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
        const { name, category_id } = commodityInput;
        const commodityEntity = new Commodity(name, category_id);
        const category = await categoryService.getCategoryById(category_id);
        const id = await commodityService.insertNewCommodity(commodityEntity);
        const commodity = await commodityService.getCommodityById(id);
        return { ...commodity, category };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
