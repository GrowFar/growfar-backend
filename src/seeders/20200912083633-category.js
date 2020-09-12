'use strict';

/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const currentData = [
      {
        name: 'Telur',
        description: 'Ini adalah kategori telur',
      },
      {
        name: 'Susu',
        description: 'Ini adalah kategori susu',
      },
    ];

    await queryInterface.bulkInsert('Category', currentData, {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Category', null, {});
  },
};
