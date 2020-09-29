'use strict';

module.exports = (sequelize, DataTypes) => {
  const WorkerTaskDiscussion = sequelize.define('Worker_Task_Discussion', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  });

  return WorkerTaskDiscussion;
};
