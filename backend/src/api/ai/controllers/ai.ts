import { Context } from 'koa';

export default {
  async generate(ctx: Context) {
    const { destination, preferences, totalDays, budget } = ctx.request.body;

    ctx.body = {
      message: `AI route works ✅ Received destination=${destination || 'none'}`,
    };
  },
};
