import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { STRAPI_URL } from '../api';
import { Loader, Ticket } from 'lucide-react';

const BookingCard = ({ booking }) => {
  const { id, attributes } = booking;
  const tourPackage = attributes.tour_package?.data?.attributes;

  if (!tourPackage) {
    return null; // Or a placeholder for bookings with no package
  }

  const imageUrl = tourPackage.Images?.data?.[0]?.attributes?.url
    ? `${STRAPI_URL}${tourPackage.Images.data[0].attributes.url}`
    : 'https://placehold.co/600x400';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
      <img src={imageUrl} alt={tourPackage.Title} className="w-full md:w-1/3 h-56 md:h-auto object-cover" />
      <div className="p-6 flex flex-col justify-between">
        <div>
          <p className={`capitalize font-semibold ${attributes.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>
            {attributes.status}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{tourPackage.Title}</h3>
          <p className="text-gray-600 mt-2">
            Booked on: {new Date(attributes.booking_date).toLocaleDateString()}
          </p>
          <p className="text-xl font-semibold text-gray-800 mt-3">
            Total: ₹{attributes.total_amount.toLocaleString()}
          </p>
        </div>
        <div className="mt-4">
          <Link to={`/packages/${attributes.tour_package.data.id}`} className="text-blue-600 font-semibold hover:underline">
            View Package Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings/my-bookings');
        setBookings(response.data.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin h-12 w-12 text-blue-600" /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center justify-center">
            <Ticket className="h-10 w-10 mr-4 text-blue-600" /> My Bookings
          </h1>
          <p className="mt-4 text-xl text-gray-600">Your travel history and upcoming adventures.</p>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-8">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800">No Trips Booked Yet</h2>
            <p className="mt-2 text-gray-600">You haven't booked any trips. When you do, they'll show up here.</p>
            <Link to="/packages" className="mt-6 inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition">
              Explore Packages
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}