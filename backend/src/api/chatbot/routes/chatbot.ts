// ./src/api/chatbot/routes/chatbot.js
module.exports = {
  routes: [
    {
      method: "POST",
      path: "/chatbot",
      handler: "chatbot.create",
      config: { auth: false },
    },
  ],
};
  