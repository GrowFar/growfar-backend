const graphql = require('graphql');

const { QueryTypes } = require('sequelize');

const ErrorMessage = require('../../constant-error');
const { Commodity, Op, Category, connection } = require('../../../database');
const { categoryType } = require('../category/category.service');

const commodityType = new graphql.GraphQLObjectType({
  name: 'Commodity',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    tag: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    category: { type: graphql.GraphQLNonNull(categoryType) },
  },
});

const commodityOwnerType = new graphql.GraphQLObjectType({
  name: 'CommodityOwner',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    tag: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    category: { type: graphql.GraphQLNonNull(categoryType) },
    price: { type: graphql.GraphQLInt },
  },
});

const commodityTypeInput = new graphql.GraphQLInputObjectType({
  name: 'CommodityInput',
  fields: {
    name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    category_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
  },
});

module.exports = {
  commodityType,
  commodityOwnerType,
  commodityTypeInput,
  insertNewCommodity: async (commodity) => {
    try {
      const result = await Commodity.create(commodity);
      return result.dataValues.id;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getCommodityById: async (id) => {
    try {
      const result = await Commodity.findOne({
        where: { id: { [Op.$eq]: id } },
      });

      if (!result) throw new Error(ErrorMessage.COMMODITY_NOT_FOUND);
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getCommodities: async (pagination) => {
    try {
      const result = [];
      const { limit, offset } = pagination;
      const commodityResult = await Commodity.findAll({
        order: [['id', 'ASC']],
        offset: offset,
        limit: limit,
        include: [{
          attributes: ['id', 'name', 'description'],
          model: Category,
        }],
        nested: true,
      });

      commodityResult.map(res => {
        const commodity = {
          id: res.id,
          name: res.name,
          tag: res.tag,
          category: res.Category.dataValues,
        };
        result.push(commodity);
      });

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getCommoditiesByFarmId: async (farm_id, pagination) => {
    try {
      const result = [];
      const { limit, offset } = pagination;

      const commodityResult = await connection.query(`
        SELECT m2.id, m2.price,
          Commodity.id AS commodity_id, Commodity.name AS commodity_name, Commodity.tag AS commodity_tag,
          \`Commodity->Category\`.id AS category_id, \`Commodity->Category\`.name AS category_name, \`Commodity->Category\`.description AS category_description
        FROM Market m2
        INNER JOIN (SELECT farm_id, commodity_id, max(submit_at) AS submit_at FROM Market m GROUP BY farm_id, commodity_id) AS latest_market
          ON m2.farm_id = latest_market.farm_id
        LEFT OUTER JOIN Commodity
          ON m2.commodity_id = Commodity.id
        LEFT OUTER JOIN Category AS \`Commodity->Category\`
          ON Commodity.category_id = \`Commodity->Category\`.id
        WHERE m2.farm_id = ${farm_id}
          AND m2.commodity_id = latest_market.commodity_id
          AND m2.submit_at = latest_market.submit_at
        ORDER BY m2.created_at DESC
        LIMIT ${offset}, ${limit};
      `, { type: QueryTypes.SELECT });

      commodityResult.map(res => {
        const commodity = {
          id: res.commodity_id,
          name: res.commodity_name,
          tag: res.commodity_tag,
          category: {
            id: res.category_id,
            name: res.category_name,
            description: res.category_description,
          },
          price: res.price,
        };
        result.push(commodity);
      });

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
