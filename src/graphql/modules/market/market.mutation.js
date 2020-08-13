const graphql = require('graphql');
const marketService = require('./market.service');
const farmService = require('../farm/farm.service');
const commodityService = require('../commodity/commodity.service');
const Market = require('./market');

module.exports = {
  createNewMarket: {
    type: marketService.farmMarketAllType,
    args: { marketInput: { type: graphql.GraphQLNonNull(marketService.marketInput) } },
    resolve: async (_, { marketInput }) => {
      try {
        const { price, farm_id, commodity_id } = marketInput;
        const market = new Market(null, price, farm_id, commodity_id);
        await farmService.getFarmById(farm_id);
        await commodityService.getCommodityById(commodity_id);
        const id = await marketService.insertNewMarket(market);
        const result = await marketService.getMarketById(id);
        return result;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
