'use strict';

/**
 * budget-optimizer router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::budget-optimizer.budget-optimizer', {
  config: {
    find: {
      middlewares: ['api::budget-optimizer.budget-optimizer'],
    },
    findOne: {},
    create: {},
    update: {},
    delete: {},
  },
});

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/optimize',
      handler: 'budget-optimizer.optimize',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};