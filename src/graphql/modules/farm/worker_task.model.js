'use strict';

module.exports = (sequelize, DataTypes) => {
  const WorkerTask = sequelize.define('Worker_Task', {
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
    },
    started_at: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    ended_at: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
  });

  return WorkerTask;
};
