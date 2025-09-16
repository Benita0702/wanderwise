import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default {
  async test(ctx) {
    ctx.body = { message: "Chatbot route is working 🎉" };
  },

  async create(ctx) {
    try {
      const { message } = ctx.request.body as { message: string };

      if (!message) {
        return ctx.throw(400, "Message is required");
      }

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      });

      const reply = completion.choices[0].message.content;

      ctx.body = { response: reply };
    } catch (err) {
      // --- ENHANCED ERROR LOGGING ---
      console.error("--- OpenAI API Error ---");
      if (err instanceof OpenAI.APIError) {
        console.error("Status:", err.status);
        console.error("Message:", err.message);
        console.error("Code:", err.code);
        console.error("Type:", err.type);
      } else {
        console.error("Non-API Error:", err);
      }
      console.error("--- End of Error ---");
      // --- END OF ENHANCED LOGGING ---

      ctx.body = { response: "⚠️ Error: Could not get AI response." };
    }
  },
};