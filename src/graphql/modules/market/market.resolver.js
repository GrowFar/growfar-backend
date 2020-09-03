const graphql = require('graphql');
const marketService = require('./market.service');
const farmService = require('../farm/farm.service');

module.exports = {
  findFarmMarketNearby: {
    type: marketService.marketPriceReportType,
    args: {
      commodity_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      radius: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    },
    resolve: async (_, { commodity_id, longitude, latitude, radius }) => {
      try {
        const { points } = await farmService.getFarmNearby(longitude, latitude, radius);
        const farmMarketResult = await marketService.getFarmMarketDataNearby(points, commodity_id);
        return farmMarketResult;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  findFarmMarketCommodityNearby: {
    type: marketService.marketPriceCommodityType,
    args: {
      commodity_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      radius: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    },
    resolve: async (_, { commodity_id, user_id, longitude, latitude, radius }) => {
      try {
        const { points } = await farmService.getFarmNearby(longitude, latitude, radius);
        const { 'id': farm_id } = await farmService.getFarmByUserId(user_id);
        const farmMarketCommodityResult = await marketService.getFarmMarketCommodityNearby(points, commodity_id, farm_id);
        return farmMarketCommodityResult;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
