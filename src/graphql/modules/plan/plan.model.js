'use strict';

const SequelizeSlugify = require('sequelize-slugify');

module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    duration: {
      type: DataTypes.INTEGER(5),
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: false,
    freezeTableName: true,
  });

  SequelizeSlugify.slugifyModel(Plan, {
    source: ['slug'],
  });

  return Plan;
};
