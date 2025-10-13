import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Compass } from 'lucide-react';

// You can create this as a separate component later
const TeamMemberCard = ({ name, role, imageUrl }) => (
  <div className="text-center">
    <img
      src={imageUrl}
      alt={`Portrait of ${name}`}
      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
    />
    <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
    <p className="text-gray-500">{role}</p>
  </div>
);

export default function AboutPage() {
  const teamMembers = [
    { name: 'Alex Johnson', role: 'Founder & CEO', imageUrl: 'https://instasize.com/_next/image?url=%2FV169WnBir5QwcI5uGBAp%2Fs%2Ff9441ab6a2b96b2ae169206a33323f1c337bb6904179bc81fbb8151d7abe5c47&w=828&q=75' },
    { name: 'Maria Garcia', role: 'Lead Travel Specialist', imageUrl: 'https://instasize.com/_next/image?url=%2FV169WnBir5QwcI5uGBAp%2Fs%2Fcbb07b87f77d89afe79fe9efea8a900ea91a22fc89e9e91334c4ed3b54621cdc&w=828&q=75' },
    { name: 'Sam Chen', role: 'Head of Technology', imageUrl: 'https://instasize.com/V169WnBir5QwcI5uGBAp/s/60be164dded534692960126bf338886d4485e3a5faa28356f8f003a0168d52d0' },
    { name: 'Jessica Taylor', role: 'Marketing Director', imageUrl: 'https://blog-pixomatic.s3.appcnt.com/image/22/01/26/61f166e1e3b25/_orig/pixomatic_1572877090227.png' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900"
          >
            About TripNexa
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-gray-600"
          >
            Crafting unforgettable journeys, one itinerary at a time. We believe travel should be personal, seamless, and extraordinary.
          </motion.p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center"><Compass className="h-8 w-8 mr-3 text-blue-600" /> Our Story</h2>
            <p className="text-gray-600 text-lg mb-4">
              TripNexa was born from a simple passion: to make travel accessible and enjoyable for everyone. Frustrated by the hours spent planning and the generic advice found online, our founders set out to create a smarter, more intuitive way to explore the world.
            </p>
            <p className="text-gray-600 text-lg">
              We combine cutting-edge AI with the expertise of seasoned travel specialists to build personalized adventures that match your unique style and budget.
            </p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img src="https://triplinetours.com/wp-content/uploads/2024/09/Maldives-Honeymoon.jpg" alt="Collage of travel photos" className="rounded-lg shadow-xl"/>
          </motion.div>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center"><Target className="h-8 w-8 mr-3 text-blue-600"/>Our Mission</h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-600">
            Our mission is to empower travelers with the tools and confidence to discover the world. We aim to simplify the complexities of travel planning, foster a community of explorers, and promote responsible, sustainable tourism.
          </p>
        </div>
      </div>
      
      {/* Meet the Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center"><Users className="h-8 w-8 mr-3 text-blue-600" /> Meet the Team</h2>
            <p className="mt-2 text-lg text-gray-600">The passionate explorers behind TripNexa.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {teamMembers.map(member => (
              <TeamMemberCard key={member.name} {...member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}