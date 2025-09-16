import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { STRAPI_URL } from '../api';
import { Loader, Clock, IndianRupee, Check, X, ArrowLeft } from 'lucide-react';

// A simple component to render Strapi's block content
const BlockContent = ({ blocks }) => {
  if (!blocks) return null;
  return blocks.map((block, i) =>
    block.children.map((child, j) => (
      <p key={`${i}-${j}`} className="mb-4 text-lg text-gray-700">{child.text}</p>
    ))
  );
};

export default function PackageDetailPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await api.get(`/tour-packages/${packageId}?populate=*`);
        setPkg(response.data.data);
      } catch (err) {
        console.error("Error fetching package details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [packageId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin h-12 w-12 text-blue-600" /></div>;
  }

  if (!pkg) {
    return <div className="text-center py-20">Package not found.</div>;
  }

  const { attributes } = pkg;
  const imageUrl = attributes.Images?.data?.[0]?.attributes?.url
    ? `${STRAPI_URL}${attributes.Images.data[0].attributes.url}`
    : 'https://placehold.co/1200x600';

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Packages
        </button>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <img src={imageUrl} alt={attributes.Title} className="w-full h-96 object-cover" />
          
          <div className="p-8">
            <h1 className="text-4xl font-extrabold text-gray-900">{attributes.Title}</h1>
            
            <div className="flex items-center text-gray-600 my-4 text-lg">
              <Clock className="h-5 w-5 mr-2" />
              <span>{attributes.Duration_days} Days</span>
              <span className="mx-3">|</span>
              <IndianRupee className="h-5 w-5 mr-1" />
              <span className="font-bold">{attributes.Price.toLocaleString()}</span>
              <span className="ml-1">per person</span>
            </div>

            <div className="prose prose-lg max-w-none mt-6">
              <BlockContent blocks={attributes.Description} />
            </div>

            <div className="mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Day-wise Itinerary</h2>
              <div className="prose prose-lg max-w-none border-l-4 border-blue-500 pl-6">
                <BlockContent blocks={attributes.Itinerary} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Inclusions</h2>
                <ul className="space-y-3">
                  {attributes.Inclusions.split(',').map((item, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-lg text-gray-700">{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Exclusions</h2>
                <ul className="space-y-3">
                  {attributes.Exclusions.split(',').map((item, i) => (
                    <li key={i} className="flex items-start">
                      <X className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                       <span className="text-lg text-gray-700">{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button onClick={() => navigate(`/booking/${pkg.id}`)} className="bg-blue-600 text-white font-bold py-4 px-10 rounded-lg text-xl hover:bg-blue-700 transition duration-300">
                Book This Tour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}