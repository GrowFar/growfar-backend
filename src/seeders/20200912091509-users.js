'use strict';

/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const currentDate = new Date();
    const currentData = [
      {
        uid: 'S7X6U3qyvPWYtR0Yze1OFcaoPP83',
        fullname: 'Purwanto',
        phone: '+16505551234',
        role: 'FARMER',
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        uid: 'DTy07UF2PgO1S4Sj927tcogvtb93',
        fullname: 'Santoso',
        phone: '+16505551111',
        role: 'FARMER',
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        uid: 'LketFY9VmIfSEg70fkVAGBObm0u2',
        fullname: 'Gunawan',
        phone: '+16505552222',
        role: 'FARMER',
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        uid: 'WfXEfy9IvLPVhe82PPCgPaNT0qH2',
        fullname: 'Hermawan',
        phone: '+16505553333',
        role: 'FARMER',
        created_at: currentDate,
        updated_at: currentDate,
      },
    ];

    await queryInterface.bulkInsert('User', currentData, {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('User', null, {});
  },
};
