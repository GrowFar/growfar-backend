'use strict';

const { USER_ROLE } = require('../../../config');
const ROLE = Object.keys(USER_ROLE).map(key => USER_ROLE[key]);

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    uid: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fullname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
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

  User.beforeCreate(user => {

    if (user.phone.startsWith('0')) {
      user.phone = '+62' + user.phone.substring(1);
    }

  });

  return User;
};
