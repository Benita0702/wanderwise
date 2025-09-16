import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function DashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          "http://localhost:1337/api/bookings?populate=tour_package"
        );
        console.log("Bookings API response:", response.data); // 🔍 Debug
        setBookings(response.data.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <p>Loading your bookings...</p>;
  if (!bookings.length) return <p>No bookings found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Your Bookings</h1>
      {bookings.map((booking) => {
        // Strapi v4: attributes may exist, but your API shows direct fields too
        const attrs = booking.attributes || booking;

        return (
          <div
            key={booking.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
            }}
          >
            <p>
              <b>Booking ID:</b>{" "}
              {booking.documentId || attrs.documentId || booking.id}
            </p>
            <p>
              <b>Package:</b>{" "}
              {attrs.tour_package?.Title ||
                attrs.tour_package?.data?.attributes?.Title ||
                "N/A"}
            </p>
            <p>
              <b>Name:</b>{" "}
              {attrs.User_name || attrs.user_name || "N/A"}
            </p>
            <p>
              <b>Email:</b>{" "}
              {attrs.User_email || attrs.user_email || "N/A"}
            </p>
            <p>
              <b>Travelers:</b>{" "}
              {attrs.Travelers_count || attrs.travelers_count || "N/A"}
            </p>
            <p>
              <b>Start Date:</b>{" "}
              {attrs.Start_date || attrs.start_date || "N/A"}
            </p>
            <p>
              <b>Total Price:</b> ₹
              {attrs.Total_price || attrs.total_price || "0"}
            </p>
            <p>
              <b>Status:</b>{" "}
              {attrs.Booking_status || attrs.booking_status || "N/A"}
            </p>

            <Link
              to={`/confirmation/${
                booking.documentId || attrs.documentId
              }`}
              style={{
                marginTop: "10px",
                display: "inline-block",
                padding: "6px 12px",
                backgroundColor: "#007bff",
                color: "white",
                borderRadius: "5px",
                textDecoration: "none",
              }}
            >
              View Details
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardPage;
