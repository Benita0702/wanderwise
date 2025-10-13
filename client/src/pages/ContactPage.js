import React, { useState } from "react";

  // Handle input changes
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const response = await fetch('http://localhost:1337/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('Message sent successfully!');
        setFormData({
          name: '',
          email: '',
          message: '',
        });
      } else {
        setStatus('Failed to send message. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div
        className="relative h-[80vh] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/contact-bg.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Contact
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl">
            “Travel is the only thing you buy that makes you richer. Let’s plan
            your next adventure together.”
          </p>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold mb-6">Our Contact Information</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8 px-6">
          <div className="bg-white shadow-lg rounded-xl p-6 w-72 hover:shadow-xl transition">
            <div className="text-3xl text-orange-400 mb-2">📍</div>
            <h3 className="font-semibold">Our Location</h3>
            <p className="text-gray-600 mt-1">Shimoga, Karnataka, India</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 w-72 hover:shadow-xl transition">
            <div className="text-3xl text-orange-400 mb-2">📞</div>
            <h3 className="font-semibold">Phone Number</h3>
            <p className="text-gray-600 mt-1">+91 98765 43210</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 w-72 hover:shadow-xl transition">
            <div className="text-3xl text-orange-400 mb-2">✉️</div>
            <h3 className="font-semibold">Email Address</h3>
            <p className="text-gray-600 mt-1">info@example.com</p>
          </div>
        </div>
      </div>

      {/* Message Section */}
      <div className="bg-orange-50 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Left Image */}
          <div className="h-full">
            <img
              src="/images/contact.jpg"
              alt="Contact"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Form */}
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center md:text-left">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-6 rounded-lg w-full transition"
              >
                Send Message
              </button>
            </form>

            {status && (
              <p className="mt-4 text-center text-sm text-gray-700">{status}</p>
            )}
          </div>
        </div>
      </div>

      {/* Google Map Embed */}
      <div className="w-full">
        <iframe
          title="map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3872.3531158908495!2d75.56207827485947!3d13.937568086474002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbbaf57f79fa44b%3A0x52cfb826cb1dda25!2sEkathva%20Innovations%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1758083584913!5m2!1sen!2sin"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 bg-gray-800 text-white text-sm">
        © 2025 TripNexa. All rights reserved.
      </footer>
    </div>
  );
};

export default ContactPage;
