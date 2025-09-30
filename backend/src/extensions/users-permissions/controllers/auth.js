// path: src/extensions/users-permissions/controllers/auth.js

module.exports = (plugin) => {
  // ✅ attach changePassword controller
  plugin.controllers.auth.changePassword = async (ctx) => {
    const { currentPassword, newPassword } = ctx.request.body;
    const user = ctx.state.user; // logged-in user from JWT

    if (!user) return ctx.badRequest("No authenticated user");

    const validPassword = await strapi
      .plugin("users-permissions")
      .service("user")
      .validatePassword(currentPassword, user.password);

    if (!validPassword) {
      return ctx.badRequest("Current password is incorrect");
    }

    await strapi.entityService.update(
      "plugin::users-permissions.user",
      user.id,
      {
        data: { password: newPassword },
      }
    );

    ctx.send({ ok: true });
  };

  return plugin;
};
