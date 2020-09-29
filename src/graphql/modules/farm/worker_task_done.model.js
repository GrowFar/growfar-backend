'use strict';

module.exports = (sequelize, DataTypes) => {
  const WorkerTaskDone = sequelize.define('Worker_Task_Done', {
    submitAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('NOW'),
    },
  }, {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  });

  return WorkerTaskDone;
};
