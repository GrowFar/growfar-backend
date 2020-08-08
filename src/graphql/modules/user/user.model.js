'use strict';

const { USER_ROLE } = require('../../../config');
const ROLE = Object.keys(USER_ROLE).map(key => USER_ROLE[key]);

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    fullname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(250),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        min: 8,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        min: 10,
      },
    },
    role: {
      type: DataTypes.ENUM,
      values: ROLE,
      defaultValue: ROLE.GUEST,
    },
  }, {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  });
  return User;
};
