const graphql = require('graphql');

const ErrorMessage = require('../../constant-error');
const { Market, Op, Farm, Commodity } = require('../../../database');
const farmService = require('../farm/farm.service');

const marketType = new graphql.GraphQLObjectType({
  name: 'Market',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    submit_at: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    price: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
  },
});

const marketInput = new graphql.GraphQLInputObjectType({
  name: 'MarketInput',
  fields: {
    price: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
    farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    commodity_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
  },
});

const farmMarketAllType = new graphql.GraphQLObjectType({
  name: 'FarmMarketAll',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    submit_at: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    price: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
    farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    commodity_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
  },
});

const farmMarketType = new graphql.GraphQLObjectType({
  name: 'FarmMarket',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    submit_at: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    price: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
    farm: { type: graphql.GraphQLNonNull(farmService.farmShortType) },
  },
});

const marketPriceReportType = new graphql.GraphQLObjectType({
  name: 'MarketPriceReport',
  fields: {
    previousPrice: { type: graphql.GraphQLInt },
    currentPrice: { type: graphql.GraphQLInt },
    data: { type: graphql.GraphQLList(farmMarketType) },
  },
});

module.exports = {
  marketType,
  marketInput,
  farmMarketType,
  farmMarketAllType,
  marketPriceReportType,
  insertNewMarket: async (market) => {
    try {
      const result = await Market.create(market);
      return result.dataValues.id;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getMarketById: async (id) => {
    try {
      const result = await Market.findOne({
        attributes: ['id', 'submit_at', 'price', 'commodity_id', 'farm_id'],
        where: { id: { [Op.$eq]: id } },
      });

      if (!result) throw new Error(ErrorMessage.MARKET_NOT_FOUND);
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getFarmMarketDataNearby: async (points, commodity_id) => {
    try {
      const ids = [];
      const result = [];
      const data = [];
      points.map(({ id }) => ids.push(id.split('-')[1]));

      const farmMarketResult = await Market.findAll({
        where: { farm_id: { [Op.$in]: ids } },
        include: [
          {
            attributes: ['id', 'name'],
            model: Farm,
          },
          {
            attributes: ['id', 'name', 'tag'],
            model: Commodity,
            where: { id: { [Op.$eq]: commodity_id } },
          },
        ],
        nested: true,
      });

      farmMarketResult.map(res => {
        const farmMarketSub = {
          id: res.id,
          submit_at: res.submit_at,
          farm: res.Farm.dataValues,
          price: res.price,
        };
        data.push(farmMarketSub);
      });

      const mergedResult = {
        previousPrice: 1,
        currentPrice: 0,
        data,
      };

      result.push(mergedResult);

      console.log(result);

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
