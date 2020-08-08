'use strict';

const SequelizeSlugify = require('sequelize-slugify');

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

  SequelizeSlugify.slugifyModel(Commodity, {
    source: ['tag'],
  });

  return Commodity;
};
