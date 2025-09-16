import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";

function ConfirmationPage() {
  const { bookingId } = useParams(); // documentId from URL
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // ✅ fetch with populate
        const response = await axios.get(
          `http://localhost:1337/api/bookings/${bookingId}?populate=tour_package`
        );

        const data = response.data.data;

        setBooking({
          id: data.id,
          documentId: data.documentId,
          name: data.User_name || "N/A",
          email: data.User_email,
          travelers: data.Travelers_count,
          startDate: data.Start_date,
          totalPrice: data.Total_price,
          status: data.Booking_status,
          // ✅ FIXED: Strapi v4 returns relation directly (not inside .data.attributes)
          packageTitle: data.tour_package?.Title || "N/A",
        });
      } catch (err) {
        console.error("Error fetching booking:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const generatePDF = () => {
    if (!booking) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Booking Confirmation", 20, 20);

    doc.setFontSize(12);
    doc.text(`Booking ID: ${booking.documentId}`, 20, 40);
    doc.text(`Package: ${booking.packageTitle}`, 20, 50);
    doc.text(`Name: ${booking.name}`, 20, 60);
    doc.text(`Email: ${booking.email}`, 20, 70);
    doc.text(`Travelers: ${booking.travelers}`, 20, 80);
    doc.text(`Start Date: ${booking.startDate}`, 20, 90);
    doc.text(`Total Price: ₹${booking.totalPrice}`, 20, 100);
    doc.text(`Status: ${booking.status}`, 20, 110);

    doc.save(`booking_${booking.documentId}.pdf`);
  };

  if (loading) return <p>Loading confirmation...</p>;
  if (!booking) return <p>Booking not found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Booking Confirmed ✅</h1>
      <p><b>Booking ID:</b> {booking.documentId}</p>
      <p><b>Package:</b> {booking.packageTitle}</p>
      <p><b>Name:</b> {booking.name}</p>
      <p><b>Email:</b> {booking.email}</p>
      <p><b>Travelers:</b> {booking.travelers}</p>
      <p><b>Start Date:</b> {booking.startDate}</p>
      <p><b>Total Price:</b> ₹{booking.totalPrice}</p>
      <p><b>Status:</b> {booking.status}</p>

      <button
        onClick={generatePDF}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "15px",
        }}
      >
        Download PDF
      </button>

      <Link
        to="/dashboard"
        style={{
          marginTop: "20px",
          display: "inline-block",
          padding: "10px 20px",
          backgroundColor: "#008CBA",
          color: "white",
          borderRadius: "5px",
          textDecoration: "none",
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

export default ConfirmationPage;
