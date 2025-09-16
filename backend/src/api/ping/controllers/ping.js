module.exports = {
  async ping(ctx) {
    ctx.body = { ok: true, msg: 'pong' };
  },
};
