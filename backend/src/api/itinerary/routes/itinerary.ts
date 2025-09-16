export default {
  routes: [
    {
      method: 'GET',
      path: '/itineraries/my-itineraries',
      handler: 'itinerary.findMine',
    },
    {
      method: 'GET',
      path: '/itineraries',
      handler: 'itinerary.find',
    },
    {
      method: 'GET',
      path: '/itineraries/:id',
      handler: 'itinerary.findOne',
    },
    {
      method: 'POST',
      path: '/itineraries',
      handler: 'itinerary.create',
    },
    {
      method: 'PUT',
      path: '/itineraries/:id',
      handler: 'itinerary.update',
    },
    {
      method: 'DELETE',
      path: '/itineraries/:id',
      handler: 'itinerary.delete',
    }
  ]
}