module.exports = (plugin) => {
  const originalRegister = plugin.controllers.auth.register;

  plugin.controllers.auth.register = async (ctx) => {
    const response = await originalRegister(ctx);
    const user = response.user;

    if (user && user.id) {
      try {
        await strapi.entityService.create("api::user-profile.user-profile", {
          data: {
            FullName: user.username,
            Email: user.email,
            users_permissions_user: user.id, // ✅ exact field name from schema.json
          },
        });
      } catch (err) {
        strapi.log.error("❌ Failed to create UserProfile:", err);
      }
    }

    return response;
  };

  // Add custom change-password route
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/auth/change-password",
    handler: "auth.changePassword",
    config: {
      auth: true,
    },
  });

  return plugin; // ✅ make sure to return the plugin
};
