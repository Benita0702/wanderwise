import aiRoutes from './api/ai/routes/ai'; // make sure path matches

export default {
  register() {},
  bootstrap({ strapi }) {
    strapi.server.routes(aiRoutes);
  },
};
