'use strict';

/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const category = await queryInterface.sequelize.query(`
      SELECT id FROM Category WHERE name IN('Telur', 'Susu') ORDER BY id ASC
    `, { type: queryInterface.sequelize.QueryTypes.SELECT });

    const currentDate = new Date();
    const currentData = [
      {
        name: 'Telur Ayam',
        tag: 'telur-ayam',
        created_at: currentDate,
        updated_at: currentDate,
        category_id: category[0].id,
      },
      {
        name: 'Telur Bebek',
        tag: 'telur-bebek',
        created_at: currentDate,
        updated_at: currentDate,
        category_id: category[0].id,
      },
      {
        name: 'Telur Puyuh',
        tag: 'telur-puyuh',
        created_at: currentDate,
        updated_at: currentDate,
        category_id: category[0].id,
      },
      {
        name: 'Susu Sapi',
        tag: 'susu-sapi',
        created_at: currentDate,
        updated_at: currentDate,
        category_id: category[1].id,
      },
      {
        name: 'Susu Kambing',
        tag: 'susu-kambing',
        created_at: currentDate,
        updated_at: currentDate,
        category_id: category[1].id,
      },
    ];

    await queryInterface.bulkInsert('Commodity', currentData, {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Commodity', null, {});
  },
};
