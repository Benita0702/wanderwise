export default {
  routes: [
    // Our custom route for fetching a user's own bookings
    {
      method: 'GET',
      path: '/bookings/my-bookings',
      handler: 'booking.findMine',
    },
    // Standard Strapi core routes
    {
      method: 'GET',
      path: '/bookings',
      handler: 'booking.find',
    },
    {
      method: 'GET',
      path: '/bookings/:id',
      handler: 'booking.findOne',
    },
    {
      method: 'POST',
      path: '/bookings',
      handler: 'booking.create',
    },
    // Add other core routes like PUT, DELETE if needed
  ]
};