'use strict';

module.exports = (sequelize, DataTypes) => {
  const Market = sequelize.define('Market', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    submitAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('NOW'),
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  });
  return Market;
};
