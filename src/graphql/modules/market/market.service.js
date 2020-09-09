const graphql = require('graphql');

const { QueryTypes } = require('sequelize');

const ErrorMessage = require('../../constant-error');
const { WEEK_IN_MILLIS, DATE_FORMAT, PERCENTAGE } = require('../../constant-value');
const { Market, Op, connection } = require('../../../database');
const farmService = require('../farm/farm.service');
const moment = require('moment');

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
    farm: { type: graphql.GraphQLNonNull(farmService.farmType) },
    price: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
  },
});

const marketPriceReportType = new graphql.GraphQLObjectType({
  name: 'MarketPriceReport',
  fields: {
    previousPrice: { type: graphql.GraphQLInt },
    previousPercentage: { type: graphql.GraphQLFloat },
    currentPrice: { type: graphql.GraphQLInt },
    currentPercentage: { type: graphql.GraphQLFloat },
    data: { type: graphql.GraphQLList(farmMarketType) },
  },
});

const marketPriceCommodityType = new graphql.GraphQLObjectType({
  name: 'MarketPriceCommodity',
  fields: {
    currentPrice: { type: graphql.GraphQLInt },
    nearbyPrice: { type: graphql.GraphQLInt },
    percentage: { type: graphql.GraphQLFloat },
    commodityName: { type: graphql.GraphQLString },
  },
});

const percentageDecision = (percentage) => {
  if (percentage >= PERCENTAGE) {
    percentage = percentage - PERCENTAGE;
  } else {
    percentage = percentage - PERCENTAGE;
  }

  return percentage;
};

const normalizePercentage = (percentage) => {
  if (percentage == Infinity) {
    percentage = PERCENTAGE;
  } else if (isNaN(percentage)) {
    percentage = 0;
  } else {
    percentage = percentage.toFixed(2);
  }

  return percentage;
};

module.exports = {
  marketType,
  marketInput,
  farmMarketType,
  farmMarketAllType,
  marketPriceReportType,
  marketPriceCommodityType,
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
  getMarketByFarmIdAndCommodityId: async (commodity_id, farm_id) => {
    try {
      const userFarmMarketResult = await Market.findOne({
        attributes: ['price'],
        where: {
          farm_id: { [Op.$eq]: farm_id },
          commodity_id: { [Op.$eq]: commodity_id },
        },
        order: [['submit_at', 'desc']],
      }) || {};

      const { 'price': currentPrice = 0 } = userFarmMarketResult.dataValues || {};

      return currentPrice;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getFarmMarketDataNearby: async (points, commodity_id) => {
    try {
      const ids = [0];
      const data = [];

      const currentDate = Date.now();
      const dateNowWeek = moment(currentDate).format(DATE_FORMAT);
      const dateOneWeekAgo = moment(new Date(currentDate - (1 * WEEK_IN_MILLIS))).format(DATE_FORMAT);
      const dateTwoWeekAgo = moment(new Date(currentDate - (2 * WEEK_IN_MILLIS))).format(DATE_FORMAT);
      const dateThreeWeekAgo = moment(new Date(currentDate - (3 * WEEK_IN_MILLIS))).format(DATE_FORMAT);

      points.map(({ id }) => ids.push(id.split('-')[1]));

      const farmMarketDataResult = await connection.query(`
        SELECT f.id AS farm_id, f.name AS farm_name, f.address AS farm_address, f.longitude AS farm_longitude, f.latitude AS farm_latitude,
        u.id AS user_id, u.uid AS user_uid, u.fullname AS user_fullname, u.phone AS user_phone, u.\`role\` AS user_role, m2.price
        FROM Market m2
        INNER JOIN (
          SELECT farm_id, commodity_id, max(submit_at) AS submit_at FROM Market m
          WHERE commodity_id = ${commodity_id}
          AND submit_at BETWEEN '${dateOneWeekAgo}' AND '${dateNowWeek}'
          GROUP BY farm_id, commodity_id
          ) AS latest_market
          ON m2.farm_id = latest_market.farm_id
        JOIN Farm f ON f.id = m2.farm_id
        JOIN User u ON u.id = f.user_id
        WHERE m2.farm_id IN (${ids})
        AND m2.commodity_id = ${commodity_id}
        AND m2.submit_at = latest_market.submit_at
      `, { type: QueryTypes.SELECT }) || {};

      farmMarketDataResult.map(res => {
        const farmMarketSub = {
          farm: {
            id: res.farm_id,
            name: res.farm_name,
            user: {
              id: res.user_id,
              uid: res.user_uid,
              fullname: res.user_fullname,
              phone: res.user_phone,
              role: res.user_role,
            },
            address: res.farm_address,
            longitude: res.farm_longitude,
            latitude: res.farm_latitude,
          },
          price: res.price,
        };

        data.push(farmMarketSub);
      });

      const farmMarketPriceResult = [{ price: 0 }, { price: 0 }, { price: 0 }];

      const priceResult = await connection.query(`
        SELECT IFNULL(sum(m2.price), 0) AS price, (SELECT 2) AS idx
        FROM Market m2
        INNER JOIN (
          SELECT farm_id, commodity_id, max(submit_at) AS submit_at FROM Market m
          WHERE commodity_id = ${commodity_id}
          AND submit_at BETWEEN '${dateThreeWeekAgo}' AND '${dateTwoWeekAgo}'
          GROUP BY farm_id, commodity_id
          ) AS latest_market
          WHERE m2.farm_id IN (${ids})
        AND m2.commodity_id = ${commodity_id}
        AND m2.submit_at = latest_market.submit_at
        UNION
        SELECT IFNULL(sum(m2.price), 0) AS price, (SELECT 1) AS idx
        FROM Market m2
        INNER JOIN (
          SELECT farm_id, commodity_id, max(submit_at) AS submit_at FROM Market m
          WHERE commodity_id = ${commodity_id}
          AND submit_at BETWEEN '${dateTwoWeekAgo}' AND '${dateOneWeekAgo}'
          GROUP BY farm_id, commodity_id
          ) AS latest_market
          WHERE m2.farm_id IN (${ids})
        AND m2.commodity_id = ${commodity_id}
        AND m2.submit_at = latest_market.submit_at
        UNION
        SELECT IFNULL(sum(m2.price), 0) AS price, (SELECT 0) AS idx
        FROM Market m2
        INNER JOIN (
          SELECT farm_id, commodity_id, max(submit_at) AS submit_at FROM Market m
          WHERE commodity_id = ${commodity_id}
          AND submit_at BETWEEN '${dateOneWeekAgo}' AND '${dateNowWeek}'
          GROUP BY farm_id, commodity_id
          ) AS latest_market
          ON m2.farm_id = latest_market.farm_id
        WHERE m2.farm_id IN (${ids})
        AND m2.commodity_id = ${commodity_id}
        AND m2.submit_at = latest_market.submit_at
      `, { type: QueryTypes.SELECT });

      priceResult.map(({ price, idx }) => {
        price = parseInt(price);
        farmMarketPriceResult[idx].price = !price ? 0 : price;
      });

      const [weekOne, weekTwo, weekThree] = farmMarketPriceResult;

      weekThree.price = weekThree.price / ids.length;
      weekTwo.price = weekTwo.price / ids.length;
      weekOne.price = weekOne.price / ids.length;

      let currentPercentage = (weekOne.price / weekTwo.price) * PERCENTAGE;
      let previousPercentage = (weekTwo.price / weekThree.price) * PERCENTAGE;

      currentPercentage = percentageDecision(currentPercentage);
      previousPercentage = percentageDecision(previousPercentage);

      currentPercentage = normalizePercentage(currentPercentage);
      previousPercentage = normalizePercentage(previousPercentage);

      return {
        previousPrice: Math.round(weekTwo.price) || 0,
        previousPercentage: previousPercentage,
        currentPrice: Math.round(weekOne.price) || 0,
        currentPercentage: currentPercentage,
        data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getFarmMarketCommodityNearby: async (points, commodity_id) => {
    try {
      const ids = [0];

      points.map(({ id }) => ids.push(id.split('-')[1]));

      const currentDate = Date.now();
      const dateNowWeek = moment(currentDate).format(DATE_FORMAT);
      const dateOneWeekAgo = moment(new Date(currentDate - (1 * WEEK_IN_MILLIS))).format(DATE_FORMAT);
      const dateTwoWeekAgo = moment(new Date(currentDate - (2 * WEEK_IN_MILLIS))).format(DATE_FORMAT);

      const farmMarketResult = [{ price: 0 }, { price: 0 }];

      const priceResult = await connection.query(`
        SELECT IFNULL(sum(m2.price), 0) AS price, (SELECT 1) AS idx
        FROM Market m2
        INNER JOIN (
          SELECT farm_id, commodity_id, max(submit_at) AS submit_at FROM Market m
          WHERE commodity_id = ${commodity_id}
          AND submit_at BETWEEN '${dateTwoWeekAgo}' AND '${dateOneWeekAgo}'
          GROUP BY farm_id, commodity_id
          ) AS latest_market
          WHERE m2.farm_id IN (${ids})
        AND m2.commodity_id = ${commodity_id}
        AND m2.submit_at = latest_market.submit_at
        UNION
        SELECT IFNULL(sum(m2.price), 0) AS price, (SELECT 0) AS idx
        FROM Market m2
        INNER JOIN (
          SELECT farm_id, commodity_id, max(submit_at) AS submit_at FROM Market m
          WHERE commodity_id = ${commodity_id}
          AND submit_at BETWEEN '${dateOneWeekAgo}' AND '${dateNowWeek}'
          GROUP BY farm_id, commodity_id
          ) AS latest_market
          ON m2.farm_id = latest_market.farm_id
        WHERE m2.farm_id IN (${ids})
        AND m2.commodity_id = ${commodity_id}
        AND m2.submit_at = latest_market.submit_at
      `, { type: QueryTypes.SELECT }) || {};

      priceResult.map(({ price, idx }) => {
        price = parseInt(price);
        farmMarketResult[idx].price = !price ? 0 : price;
      });

      const [weekOne, weekTwo] = farmMarketResult;

      weekTwo.price = weekTwo.price / ids.length;
      weekOne.price = weekOne.price / ids.length;

      let percentage = (weekOne.price / weekTwo.price) * PERCENTAGE;
      percentage = percentageDecision(percentage);
      percentage = normalizePercentage(percentage);

      return {
        nearbyPrice: Math.round(weekOne.price),
        percentage,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
