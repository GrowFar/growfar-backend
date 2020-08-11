'use strict';

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT('tiny'),
      allowNull: true,
    },
  }, {
    underscored: true,
    timestamps: false,
    freezeTableName: true,
  });

  Category.beforeCreate(category => {
    category.name = category.name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  });

  return Category;
};
