'use strict';

const { PERMIT_CATEGORY } = require('../../../config');
const PERMIT = Object.keys(PERMIT_CATEGORY).map(key => PERMIT_CATEGORY[key]);

module.exports = (sequelize, DataTypes) => {
  const WorkerPermit = sequelize.define('Worker_Permit', {
    category: {
      type: DataTypes.ENUM,
      values: PERMIT,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    duration: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 7,
      },
    },
    isAllowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  });

  return WorkerPermit;
};
