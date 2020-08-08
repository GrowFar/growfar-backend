'use strict';

module.exports = (sequelize, DataTypes) => {
  const Farm = sequelize.define('Farm', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      validate: {
        min: -90,
        max: 90,
      },
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      validate: {
        min: -180,
        max: 180,
      },
    },
  }, {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  });

  return Farm;
};
