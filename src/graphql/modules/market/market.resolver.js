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
};
