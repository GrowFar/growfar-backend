const graphql = require('graphql');

const ErrorMessage = require('../../constant-error');
const { Commodity, Op, Category } = require('../../../database');
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

const commodityTypeInput = new graphql.GraphQLInputObjectType({
  name: 'CommodityInput',
  fields: {
    name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    categoryId: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
  },
});

module.exports = {
  commodityType,
  commodityTypeInput,
  insertNewCommodity: async (commodity) => {
    try {
      const result = await Commodity.create(commodity);
      return result.dataValues.id;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getCategoryById: async (id) => {
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
      const categoryResult = await Commodity.findAll({
        order: [['id', 'ASC']],
        offset: offset,
        limit: limit,
        include: [{
          attributes: ['id', 'name', 'description'],
          model: Category,
        }],
        nested: true,
      });

      categoryResult.map(res => {
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
};
