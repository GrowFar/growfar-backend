'use strict';

const moment = require('moment');
const { DATE_FORMAT, WEEK_IN_MILLIS } = require('../graphql/constant-value');

/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const currentDate = Date.now();
    const dateNowWeek = moment(currentDate).format(DATE_FORMAT);
    const dateOneWeekAgo = moment(new Date(currentDate - (1.3 * WEEK_IN_MILLIS))).format(DATE_FORMAT);
    const dateTwoWeekAgo = moment(new Date(currentDate - (2.3 * WEEK_IN_MILLIS))).format(DATE_FORMAT);

    const currentData = [
      // Farm 1
      {
        id: '7',
        submit_at: dateNowWeek,
        price: 18100,
        created_at: dateNowWeek,
        updated_at: dateNowWeek,
        farm_id: '1',
        commodity_id: '1',
      },
      {
        id: '4',
        submit_at: dateOneWeekAgo,
        price: 18500,
        created_at: dateOneWeekAgo,
        updated_at: dateOneWeekAgo,
        farm_id: '1',
        commodity_id: '1',
      },
      {
        id: '1',
        submit_at: dateTwoWeekAgo,
        price: 18300,
        created_at: dateTwoWeekAgo,
        updated_at: dateTwoWeekAgo,
        farm_id: '1',
        commodity_id: '1',
      },
      // Farm 2
      {
        id: '8',
        submit_at: dateNowWeek,
        price: 17900,
        created_at: dateNowWeek,
        updated_at: dateNowWeek,
        farm_id: '2',
        commodity_id: '1',
      },
      {
        id: '5',
        submit_at: dateOneWeekAgo,
        price: 18400,
        created_at: dateOneWeekAgo,
        updated_at: dateOneWeekAgo,
        farm_id: '2',
        commodity_id: '1',
      },
      {
        id: '2',
        submit_at: dateTwoWeekAgo,
        price: 18300,
        created_at: dateTwoWeekAgo,
        updated_at: dateTwoWeekAgo,
        farm_id: '2',
        commodity_id: '1',
      },
      // Farm 3
      {
        id: '9',
        submit_at: dateNowWeek,
        price: 18300,
        created_at: dateNowWeek,
        updated_at: dateNowWeek,
        farm_id: '3',
        commodity_id: '1',
      },
      {
        id: '6',
        submit_at: dateOneWeekAgo,
        price: 18100,
        created_at: dateOneWeekAgo,
        updated_at: dateOneWeekAgo,
        farm_id: '3',
        commodity_id: '1',
      },
      {
        id: '3',
        submit_at: dateTwoWeekAgo,
        price: 18400,
        created_at: dateTwoWeekAgo,
        updated_at: dateTwoWeekAgo,
        farm_id: '3',
        commodity_id: '1',
      },
    ];

    await queryInterface.bulkInsert('Market', currentData, {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Market', null, {});
  },
};
