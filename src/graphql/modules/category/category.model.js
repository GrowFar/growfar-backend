'use strict';

const { capitalize } = require('../../../helpers/string.custom');

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT('tiny'),
      allowNull: true,
    },
  }, {
    underscored: true,
    timestamps: false,
    freezeTableName: true,
  });

  Category.beforeCreate(category => {
    category.name = capitalize(category.name);
  });

  return Category;
};
