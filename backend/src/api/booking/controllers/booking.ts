/**
 * booking controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::booking.booking', ({ strapi }) => ({
  /**
   * Custom controller to fetch bookings for the logged-in user.
   */
  async findMine(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const bookings = await strapi.db.query('api::booking.booking').findMany({
      where: { user: { id: user.id } },
      populate: { tour_package: { populate: { Images: true } } }, // Populate relations
      orderBy: { booking_date: 'desc' },
      limit: 1000,
    });

    const sanitizedBookings = await this.sanitizeOutput(bookings, ctx);
    return this.transformResponse(sanitizedBookings);
  }
}));