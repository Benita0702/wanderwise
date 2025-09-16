module.exports = {
  routes: [
    {
      method: "GET",
      path: "/chatbot/test",
      handler: "chatbot.test",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/chatbot",
      handler: "chatbot.create",
      config: {
        auth: false,
      },
    },
  ],
};
