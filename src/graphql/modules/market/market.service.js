const graphql = require('graphql');

const ErrorMessage = require('../../constant-error');
const { DAY_IN_MILLIS, WEEK_IN_MILLIS, MAX_DAY } = require('../../constant-value');
const { Market, Op, Farm } = require('../../../database');
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
    farm: { type: graphql.GraphQLNonNull(farmService.farmType) },
    price: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
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
      const data = [];

      const currentDate = Date.now();

      let currentPriceData = 0;
      let previousPriceData = 0;

      let maxCurrentPrice = 0;
      let maxPreviousPrice = 0;

      points.map(({ id }) => ids.push(id.split('-')[1]));

      const farmMarketResult = await Market.findAll({
        where: {
          farm_id: { [Op.$in]: ids },
          commodity_id: { [Op.$eq]: commodity_id },
          submit_at: { [Op.$between]: [new Date(currentDate - (2 * WEEK_IN_MILLIS)), currentDate] },
        },
        include: Farm,
      });

      farmMarketResult.map(res => {
        const farmMarketSub = {
          id: res.id,
          submit_at: res.submitAt,
          farm: res.Farm.dataValues,
          price: res.price,
        };

        const dday = (currentDate - new Date(res.submitAt).getTime()) / DAY_IN_MILLIS;

        if (Math.round(dday) < MAX_DAY) {
          currentPriceData++;
          maxCurrentPrice += res.price;
        } else {
          previousPriceData++;
          maxPreviousPrice += res.price;
        }

        data.push(farmMarketSub);

      });

      return {
        previousPrice: maxPreviousPrice / previousPriceData || 0,
        currentPrice: maxCurrentPrice / currentPriceData || 0,
        data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
