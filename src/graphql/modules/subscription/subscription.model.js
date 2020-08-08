'use strict';

module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: false,
    freezeTableName: true,
  });
  return Subscription;
};
