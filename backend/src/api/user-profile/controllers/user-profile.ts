import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::user-profile.user-profile', ({ strapi }) => ({
  /**
   * CREATE a user profile
   */
  async create(ctx) {
    // 1. Get the authenticated user from the context
    const user = ctx.state.user;

    // Log the user to the console for debugging
    console.log('Attempting to create profile for user:', user);

    // If there is no user, deny access
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a profile.');
    }

    // 2. Prepare the data for the new profile
    const data = {
      ...ctx.request.body.data,
      users_permissions_user: user.id, // Explicitly set the user relationship
      publishedAt: new Date(),        // Ensure the profile is published
    };

    // 3. Create the user profile using the entity service
    const entry = await strapi.entityService.create('api::user-profile.user-profile', {
      data,
    });

    // 4. Return the newly created entry
    return this.transformResponse(entry);
  },

  /**
   * UPDATE a user profile
   */
  async update(ctx) {
    const { id: userId } = ctx.state.user;
    const { id: profileId } = ctx.params;

    // Find the profile and ensure it belongs to the logged-in user
    const userProfile = await strapi.db.query('api::user-profile.user-profile').findOne({
      where: {
        id: profileId,
        users_permissions_user: { id: userId }
      }
    });

    // If the profile doesn't belong to the user, throw an error
    if (!userProfile) {
      return ctx.unauthorized(`You are not allowed to update this profile.`);
    }

    // Proceed with the update
    const response = await super.update(ctx);
    return response;
  },
}));