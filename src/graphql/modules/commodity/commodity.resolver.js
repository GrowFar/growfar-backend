const graphql = require('graphql');

const commodityService = require('./commodity.service');
const categoryService = require('../category/category.service');

const Pagination = require('../../../utils/pagination');

module.exports = {
  findCommodityById: {
    type: commodityService.commodityType,
    args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) } },
    resolve: async (_, { id }) => {
      try {
        const commodity = await commodityService.getCommodityById(id);
        const category = await categoryService.getCategoryById(commodity.category_id);
        return { ...commodity, category };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findAllCommodity: {
    type: graphql.GraphQLList(commodityService.commodityType),
    args: {
      limit: { type: graphql.GraphQLInt },
      page: { type: graphql.GraphQLInt },
    },
    resolve: async (_, { limit, page }) => {
      try {
        const pagination = new Pagination(limit, page);
        const result = await commodityService.getCommodities(pagination);
        return result;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findCommodityByFarmId: {
    type: graphql.GraphQLList(commodityService.commodityOwnerType),
    args: {
      farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      limit: { type: graphql.GraphQLInt },
      page: { type: graphql.GraphQLInt },
    },
    resolve: async (_, { farm_id, limit, page }) => {
      try {
        const pagination = new Pagination(limit, page);
        const result = await commodityService.getCommoditiesByFarmId(farm_id, pagination);
        return result;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
