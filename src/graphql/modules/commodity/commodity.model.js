'use strict';

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
    commodity.name = commodity.name
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    commodity.tag = commodity.name
      .trim()
      .replace(' ', '-')
      .toLowerCase();
  });

  return Commodity;
};
