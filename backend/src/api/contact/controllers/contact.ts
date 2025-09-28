'use strict';

/**
 * A set of functions called "actions" for the contact controller
 */

module.exports = {
  send: async (ctx) => {
    try {
      const { name, email, message } = ctx.request.body;

      await strapi.plugins['email'].services.email.send({
        to: 'hritambh9@gmail.com',      // 👈 Replace with your email
        from: 'support@tripnexa.com', // 👈 Replace with a verified sender
        replyTo: email,
        subject: `New Contact Form Submission from ${name}`,
        text: message,
        html: `<p>${message}</p>`,
      });

      return ctx.send({ message: 'Email sent successfully!' });

    } catch (err) {
      strapi.log.error(err);
      return ctx.badRequest('An error occurred while sending the email.');
    }
  }
};