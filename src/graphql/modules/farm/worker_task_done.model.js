'use strict';

module.exports = (sequelize, DataTypes) => {
  const WorkerTaskDone = sequelize.define('Worker_Task_Done', {
    submit_at: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  });

  return WorkerTaskDone;
};
