'use strict';

// eslint-disable-next-line no-unused-vars
module.exports = (sequelize, DataTypes) => {
  const FarmWorker = sequelize.define('Farm_Worker', {}, {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  });

  return FarmWorker;
};
