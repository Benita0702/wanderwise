/**
 * itinerary controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::itinerary.itinerary', ({ strapi }) => ({
  /**
   * Custom controller to fetch itineraries for the logged-in user.
   */
  async findMine(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    // Find itineraries where the 'user' relation matches the logged-in user's ID
    const itineraries = await strapi.db.query('api::itinerary.itinerary').findMany({
      where: {
        user: {
          id: user.id,
        },
      },
      limit: 100
    });

    // Sanitize and transform the response
    const sanitizedItineraries = await this.sanitizeOutput(itineraries, ctx);
    return this.transformResponse(sanitizedItineraries);
  },
}));