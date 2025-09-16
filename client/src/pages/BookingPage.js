import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function BookingPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    travelers: 1,
    startDate: "",
    travelerType: "Solo",
  });

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axios.get("http://localhost:1337/api/tour-packages");
        const item = response.data.data.find(pkg => pkg.id === parseInt(packageId));
        if (!item) return;

        setPackageData({
          title: item.Title.replace(/“|”/g, ""),
          price: item.Price,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchPackage();
  }, [packageId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!packageData) return;

    const totalPrice = packageData.price * formData.travelers;

    const bookingData = {
      data: {
        User_name: formData.name,
        User_email: formData.email,
        Travelers_count: formData.travelers,
        Start_date: formData.startDate,
        Total_price: totalPrice,
        Booking_status: "Confirmed",
        tour_package: parseInt(packageId), // ✅ Correct way to link package
      },
    };

    try {
      const response = await axios.post(
        "http://localhost:1337/api/bookings",
        bookingData,
        { headers: { "Content-Type": "application/json" } }
      );

      // ✅ Use documentId instead of numeric id
      const bookingDocId = response.data.data.documentId;
      navigate(`/confirmation/${bookingDocId}`);
    } catch (err) {
      console.error("Booking error:", JSON.stringify(err.response?.data, null, 2));
      alert("Booking failed. Check console for details.");
    }
  };

  if (!packageData) return <p>Loading package info...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Book: {packageData.title}</h1>
      <p className="mb-2">Price per person: ₹{packageData.price}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full p-3 border rounded-lg"
        />
        <div className="flex gap-4">
          <input
            type="number"
            min="1"
            value={formData.travelers}
            onChange={(e) =>
              setFormData({ ...formData, travelers: parseInt(e.target.value) })
            }
            required
            className="flex-1 p-3 border rounded-lg"
          />
          <select
            value={formData.travelerType}
            onChange={(e) =>
              setFormData({ ...formData, travelerType: e.target.value })
            }
            className="flex-1 p-3 border rounded-lg"
          >
            {["Solo", "Couple", "Family", "Corporate"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
          required
          className="w-full p-3 border rounded-lg"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
}

export default BookingPage;
