import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

function MyBooking() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const email = user.email || localStorage.getItem("userEmail");

        const res = await axios.get(
          `http://localhost:1337/api/bookings?filters[User_email][$eq]=${email}&populate=tour_package`
        );

        setBookings(res.data.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (!user) {
    return <p className="p-6 text-red-500">Please log in to view your bookings.</p>;
  }

  if (loading) {
    return <p className="p-6">Loading your bookings...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-600">You have no bookings yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-left border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2">Booking ID</th>
                <th className="px-4 py-2">Tour Package</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Travelers</th>
                <th className="px-4 py-2">Start Date</th>
                <th className="px-4 py-2">Total Price</th>
                <th className="px-4 py-2">Booking Status</th>
                <th className="px-4 py-2">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{b.id}</td>
                  <td className="px-4 py-2">
                    {b.attributes?.tour_package?.data?.attributes?.Name || "N/A"}
                  </td>
                  <td className="px-4 py-2">{b.attributes?.User_name || "N/A"}</td>
                  <td className="px-4 py-2">{b.attributes?.User_email || "N/A"}</td>
                  <td className="px-4 py-2">{b.attributes?.Travelers_count || 0}</td>
                  <td className="px-4 py-2">{b.attributes?.Start_date || "-"}</td>
                  <td className="px-4 py-2">₹{b.attributes?.Total_price ?? 0}</td>
                  <td className="px-4 py-2">
                    {b.attributes?.Booking_status || "Pending"}
                  </td>
                  <td className="px-4 py-2">
                    {b.attributes?.Payment_method || "Unpaid"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyBooking;
