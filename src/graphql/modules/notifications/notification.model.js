'use strict';

const { NOTIFICATION_TYPE } = require('../../../config');
const NOTIFICATION = Object.keys(NOTIFICATION_TYPE).map(key => NOTIFICATION_TYPE[key]);

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    notificationType: {
      type: DataTypes.ENUM,
      values: NOTIFICATION,
      allowNull: false,
    },
    information: {
      type: DataTypes.JSON,
    },
    is_readed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  });

  return Notification;
};
