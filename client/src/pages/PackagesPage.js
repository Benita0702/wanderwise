import React, { useEffect, useState } from 'react';
import api from '../api'; // Use the central api instance
import PackageCard from '../components/PackageCard';
import { Loader } from 'lucide-react';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        // Use populate=* to fetch all related fields, especially images
        const response = await api.get('/tour-packages?populate=*');
        setPackages(response.data.data);
      } catch (err) {
        console.error("Error fetching tour packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Our Tour Packages</h1>
          <p className="mt-4 text-xl text-gray-600">
            Handcrafted journeys for every type of traveler.
          </p>
        </div>

        {packages.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} packageData={pkg} />
            ))}
          </div>
        ) : (
          <p className="text-center mt-12 text-gray-500">No packages available at the moment. Please check back later.</p>
        )}
      </div>
    </div>
  );
}