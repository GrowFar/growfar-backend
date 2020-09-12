'use strict';

const { insertNewFarmTile } = require('../graphql/modules/farm/farm.service');
const { flushDb } = require('../tile38/connection');

/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // const user = await queryInterface.sequelize.query(`
    //   SELECT id, uid FROM User AS u
    //   WHERE uid IN ('S7X6U3qyvPWYtR0Yze1OFcaoPP83', 'DTy07UF2PgO1S4Sj927tcogvtb93', 'LketFY9VmIfSEg70fkVAGBObm0u2', 'WfXEfy9IvLPVhe82PPCgPaNT0qH2')
    //   ORDER BY id ASC
    // `, { type: queryInterface.sequelize.QueryTypes.SELECT });

    const currentDate = new Date();
    const currentData = [
      {
        id: '1',
        name: 'Purwanto Jaya',
        address: 'Dusun Sidodadi No 1, Desa Kedawung, Kabupaten Blitar',
        latitude: -8.00585447,
        longitude: 112.20029164,
        created_at: currentDate,
        updated_at: currentDate,
        user_id: '1',
      },
      {
        id: '2',
        name: 'Sinar Makmur',
        address: 'Dusun Sidodadi No 2, Desa Kedawung, Kabupaten Blitar',
        latitude: -7.99169738,
        longitude: 112.19810028,
        created_at: currentDate,
        updated_at: currentDate,
        user_id: '2',
      },
      {
        id: '3',
        name: 'Kandang Sentosa',
        address: 'Dusun Sidodadi No 3, Desa Kedawung, Kabupaten Blitar',
        latitude: -6.31041210,
        longitude: 106.70491140,
        created_at: currentDate,
        updated_at: currentDate,
        user_id: '3',
      },
    ];

    await queryInterface.bulkInsert('Farm', currentData, {});
    currentData.map(async value => {
      await insertNewFarmTile(value.id, value.latitude, value.longitude);
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Farm', null, {});
    await flushDb();
  },
};
