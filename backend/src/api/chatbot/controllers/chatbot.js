const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
  async test(ctx) {
    ctx.body = { message: "Chatbot route is working 🎉" };
  },

  async create(ctx) {
    try {
      const { message } = ctx.request.body;

      if (!message) {
        ctx.throw(400, "Message is required");
      }

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini", // or "gpt-3.5-turbo"
        messages: [{ role: "user", content: message }],
      });

      const reply = completion.choices[0].message.content;

      ctx.body = { response: reply };
    } catch (err) {
      console.error(err);
      ctx.body = { response: "⚠️ Error: Could not get AI response." };
    }
  },
};
