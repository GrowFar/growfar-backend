'use strict';

/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // const category = await queryInterface.sequelize.query(`
    //   SELECT id FROM Category WHERE name IN('Telur', 'Susu') ORDER BY id ASC
    // `, { type: queryInterface.sequelize.QueryTypes.SELECT });

    const currentDate = new Date();
    const currentData = [
      {
        id: '1',
        name: 'Telur Ayam',
        tag: 'telur-ayam',
        created_at: currentDate,
        updated_at: currentDate,
        category_id: '1',
      },
      {
        id: '2',
        name: 'Telur Bebek',
        tag: 'telur-bebek',
        created_at: currentDate,
        updated_at: currentDate,
        category_id: '1',
      },
      {
        id: '3',
        name: 'Telur Puyuh',
        tag: 'telur-puyuh',
        created_at: currentDate,
        updated_at: currentDate,
        category_id: '1',
      },
      {
        id: '4',
        name: 'Susu Sapi',
        tag: 'susu-sapi',
        created_at: currentDate,
        updated_at: currentDate,
        category_id: '2',
      },
      {
        id: '5',
        name: 'Susu Kambing',
        tag: 'susu-kambing',
        created_at: currentDate,
        updated_at: currentDate,
        category_id: '2',
      },
    ];

    await queryInterface.bulkInsert('Commodity', currentData, {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Commodity', null, {});
  },
};
