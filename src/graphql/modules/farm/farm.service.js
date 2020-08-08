const graphql = require('graphql');

const ErrorMessage = require('../../constant-error');
const { TILE_KEY_FARM, TILE_RADIUS } = require('../../constant-value');
const { Farm, User, Op } = require('../../../database');
const { userType } = require('../user/user.service');
const { tileClient } = require('../../../tile38');

const farmType = new graphql.GraphQLObjectType({
  name: 'Farm',
  fields: {
    id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    user: { type: graphql.GraphQLNonNull(userType) },
    address: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
  },
});

const farmInput = new graphql.GraphQLInputObjectType({
  name: 'FarmInput',
  fields: {
    name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    address: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
    longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
  },
});

const farmLocation = new graphql.GraphQLObjectType({
  name: 'FarmLocation',
  fields: {
    farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
  },
});

const farmLocationInput = new graphql.GraphQLInputObjectType({
  name: 'FarmLocationInput',
  fields: {
    farm_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
    longitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
    latitude: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
  },
});

module.exports = {
  farmType,
  farmInput,
  farmLocation,
  farmLocationInput,
  getFarmById: async (id) => {
    try {
      const result = await Farm.findOne({
        where: { id: { [Op.$eq]: id } },
      });

      if (!result) throw new Error(ErrorMessage.FARM_NOT_FOUND);
      return result.dataValues;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  insertNewFarm: async (farm) => {
    try {
      const result = await Farm.create(farm);
      return result.dataValues.id;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  insertNewLocation: async (farm) => {
    try {
      const { farm_id, user_id, longitude, latitude } = farm;
      const result = await Farm.update({
        longitude,
        latitude,
      }, {
        where: {
          id: { [Op.$eq]: farm_id },
          user_id: { [Op.$eq]: user_id },
        },
      });

      if (!result[0] || !result) {
        throw new Error(ErrorMessage.FARM_UPDATE_ERROR);
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  insertNewFarmTile: async (id, latitude, longitude) => {
    try {
      return await tileClient.set(TILE_KEY_FARM, `${TILE_KEY_FARM}-${id}`, [latitude, longitude]);
    } catch (error) {
      throw new Error(error);
    }
  },
  getFarmNearby: async (longitude, latitude, radius) => {
    try {
      const kmRadius = (radius * TILE_RADIUS);
      return await tileClient.nearbyQuery(TILE_KEY_FARM).output('points').point(latitude, longitude, kmRadius).execute();
    } catch (error) {
      throw new Error(error);
    }
  },
  getFarmDataNearby: async (points) => {
    try {
      const ids = [];
      const result = [];
      points.map(({ id }) => ids.push(id.split('-')[1]));

      const farmResult = await Farm.findAll({
        where: { id: { [Op.$in]: ids } },
        include: [{
          attributes: ['id', 'fullname', 'email', 'phone', 'role'],
          model: User,
        }],
        nested: true,
      });

      farmResult.map(res => {
        const farm = {
          id: res.id,
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude,
          user: res.User.dataValues,
        };
        result.push(farm);
      });

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
