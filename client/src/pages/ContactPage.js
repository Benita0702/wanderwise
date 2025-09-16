import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">Get in Touch</h1>
          <p className="mt-3 text-xl text-gray-600">We'd love to hear from you! Whether you have a question about features, trials, or anything else, our team is ready to answer all your questions.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 bg-white p-8 rounded-lg shadow-lg">
          {/* Contact Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Send us a Message</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="name" name="name" className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Your Name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" id="email" name="email" className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea id="message" name="message" rows="5" className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="How can we help?"></textarea>
              </div>
              <div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Send Message
                </motion.button>
              </div>
            </form>
          </div>

          {/* Contact Details & Map */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h2>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-center"><MapPin className="h-5 w-5 mr-3 text-blue-600" /> 123 Travel Lane, Adventure City, World</p>
                <p className="flex items-center"><Mail className="h-5 w-5 mr-3 text-blue-600" /> support@wanderwise.com</p>
                <p className="flex items-center"><Phone className="h-5 w-5 mr-3 text-blue-600" /> +1 (234) 567-8900</p>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Location</h2>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md">
                {/* Replace with your actual Google Maps embed iframe */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.086431952591!2d144.95373531590415!3d-37.817209742021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0x5045675218ce7e0!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sus!4v1620202020202"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Google Maps Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}