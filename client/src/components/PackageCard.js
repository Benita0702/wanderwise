import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, IndianRupee } from 'lucide-react';
import { STRAPI_URL } from '../api'; // Import your Strapi URL constant

export default function PackageCard({ packageData }) {
  const navigate = useNavigate();
  const { id, attributes: pkg } = packageData;

  // Get the first image URL or a placeholder
  const imageUrl = pkg.Images?.data?.[0]?.attributes?.url
    ? `${STRAPI_URL}${pkg.Images.data[0].attributes.url}`
    : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDl0koagaYSWUjgwdr2mNHABteHTWAxA_BdA&s';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer flex flex-col"
      onClick={() => navigate(`/packages/${id}`)}
    >
      <img
        src={imageUrl}
        alt={pkg.Title}
        className="w-full h-56 object-cover"
      />
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.Title}</h3>
        
        <div className="flex items-center text-gray-600 mb-4">
          <Clock className="h-4 w-4 mr-2" />
          <span>{pkg.Duration_days} Days</span>
          <span className="mx-2">|</span>
          <MapPin className="h-4 w-4 mr-2" />
          <span>{pkg.Package_type}</span>
        </div>

        <p className="text-gray-700 flex-grow mb-4">
          {pkg.Description[0]?.children[0]?.text.slice(0, 100) || 'No description available'}...
        </p>

        <div className="mt-auto flex justify-between items-center">
          <p className="text-2xl font-bold text-blue-600 flex items-center">
            <IndianRupee className="h-6 w-6 mr-1" />
            {pkg.Price.toLocaleString()}
          </p>
          <span className="text-sm text-gray-500">per person</span>
        </div>
      </div>
    </motion.div>
  );
}