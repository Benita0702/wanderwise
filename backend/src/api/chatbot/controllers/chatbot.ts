const axios = require("axios");

module.exports = {
  async create(ctx) {
    try {
      let { message } = ctx.request.body;

      // ✅ Validate message
      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return ctx.throw(400, "Message is required and cannot be empty");
      }
      message = message.trim();

      // ✅ Call local Ollama Mistral model
      const res = await axios.post("http://127.0.0.1:11434/api/generate", {
        model: "mistral",
        prompt: message,
        options: { max_tokens: 500, temperature: 0.7 },
      });


      // ✅ Safely extract the response
      const reply = res.data?.completion?.trim() || "No response from Ollama";

      ctx.send({ response: reply });
    } catch (err) {
      console.error("⚠️ Ollama Chat API Error:", err.response?.data || err.message || err);
      ctx.send({
        response: "⚠️ Something went wrong while fetching response. Check backend logs.",
      });
    }
  },
};
