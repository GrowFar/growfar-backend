'use strict';

module.exports = (sequelize, DataTypes) => {
  const WorkerRegistration = sequelize.define('Worker_Registration', {
    generated_token: {
      type: DataTypes.STRING(4),
      allowNull: false,
    },
    ended_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('NOW'),
    },
  }, {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  });

  return WorkerRegistration;
};
