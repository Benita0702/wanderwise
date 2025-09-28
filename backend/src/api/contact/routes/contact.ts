export default {
  routes: [
    {
      method: 'POST',
      path: '/contact',
      handler: 'api::contact.contact.send',
      config: {
        auth: false,
      },
    },
  ],
};