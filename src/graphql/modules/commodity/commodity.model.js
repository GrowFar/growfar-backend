'use strict';

const { slug, capitalize } = require('../../../helpers/string.custom');

module.exports = (sequelize, DataTypes) => {
  const Commodity = sequelize.define('Commodity', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  });

  Commodity.beforeCreate(commodity => {
    commodity.name = capitalize(commodity.name);
    commodity.tag = slug(commodity.name);
  });

  return Commodity;
};
