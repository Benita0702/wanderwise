import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function MyBookingsPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [packageData, setPackageData] = useState(null); // ✅ package info
  const [loading, setLoading] = useState(true);

  const [travelers, setTravelers] = useState([
    { fullName: "", age: "", email: user?.email || "", phone: "" },
  ]);
  const [addons, setAddons] = useState({
    flight: false,
    insurance: false,
    car: false,
  });
  const [payment, setPayment] = useState({
    method: "card",
    cardNumber: "",
    expiry: "",
    cvv: "",
    upi: "",
  });

  // ✅ Fetch package from backend
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await axios.get(
          `http://localhost:1337/api/packages/${packageId}?populate=*`
        );
        setPackageData(res.data.data);
      } catch (err) {
        console.error("Error fetching package:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [packageId]);

  // ✅ Use dynamic package price (fallback if missing)
  const basePrice = packageData?.attributes?.price || 15000;
  const taxes = Math.round(basePrice * 0.1); // 10% tax
  const addonPrices = { flight: 8000, insurance: 500, car: 3000 };

  const calcTotal = () => {
    const addonsTotal = Object.keys(addons)
      .filter((k) => addons[k])
      .reduce((sum, k) => sum + addonPrices[k], 0);
    return basePrice + taxes + addonsTotal;
  };

  const updateTraveler = (idx, field, value) => {
    const updated = [...travelers];
    updated[idx][field] = value;
    setTravelers(updated);
  };

  const addTraveler = () => {
    setTravelers([
      ...travelers,
      { fullName: "", age: "", email: "", phone: "" },
    ]);
  };

  const removeTraveler = (idx) => {
    if (travelers.length > 1) {
      setTravelers(travelers.filter((_, i) => i !== idx));
    }
  };

  const validateStep = () => {
    if (step === 1) {
      for (const t of travelers) {
        if (!t.fullName || !t.age || !t.email || !t.phone) {
          alert("Please fill all traveler details.");
          return false;
        }
      }
    }
    if (step === 3) {
      if (payment.method === "card") {
        if (!payment.cardNumber || !payment.expiry || !payment.cvv) {
          alert("Enter valid card details.");
          return false;
        }
      }
      if (payment.method === "upi") {
        if (!payment.upi) {
          alert("Enter a valid UPI ID.");
          return false;
        }
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateStep()) return;

    try {
      const bookingData = {
        User_email: travelers[0].email || user?.email,
        User_name: travelers[0].fullName || user?.username,
        Travelers_count: travelers.length,
        Start_date: new Date().toISOString().split("T")[0],
        Add_ons: addons,
        Total_price: calcTotal(),
        Booking_status: "Confirmed",
        Payment_method: payment.method,
        tour_package: packageId,
      };

      await axios.post("http://localhost:1337/api/bookings", {
        data: bookingData,
      });

      alert("🎉 Booking Confirmed!");
      navigate("/my-bookings");
    } catch (err) {
      console.error("Booking error:", err.response?.data || err.message);
      alert("Payment failed. Try again.");
    }
  };

  const steps = ["Traveler Details", "Add-ons", "Payment"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT */}
      <div className="lg:col-span-2">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
        <p className="text-gray-600 mb-6">
          {loading
            ? "Loading package..."
            : packageData
            ? `${packageData.attributes.title} - ${packageData.attributes.duration}`
            : "Package not found"}
        </p>

        {/* Stepper */}
        <div className="flex justify-between mb-8">
          {steps.map((label, i) => (
            <div key={i} className="flex-1 text-center relative">
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  step === i + 1
                    ? "bg-blue-600 text-white"
                    : step > i + 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {step > i + 1 ? "✔" : i + 1}
              </div>
              <p className="mt-2 text-sm">{label}</p>
              {i < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Sections */}
        {step === 1 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Traveler Information</h2>
            {travelers.map((t, idx) => (
              <div key={idx} className="mb-6 border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Traveler {idx + 1}</p>
                  {idx > 0 && (
                    <button
                      onClick={() => removeTraveler(idx)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={t.fullName}
                    onChange={(e) =>
                      updateTraveler(idx, "fullName", e.target.value)
                    }
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={t.age}
                    onChange={(e) => updateTraveler(idx, "age", e.target.value)}
                    className="border p-2 rounded"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={t.email}
                    onChange={(e) =>
                      updateTraveler(idx, "email", e.target.value)
                    }
                    className="border p-2 rounded"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={t.phone}
                    onChange={(e) =>
                      updateTraveler(idx, "phone", e.target.value)
                    }
                    className="border p-2 rounded"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addTraveler}
              className="border-dashed border-2 px-4 py-2 rounded w-full text-gray-600"
            >
              + Add Another Traveler
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Choose Add-ons</h2>
            {Object.keys(addons).map((k) => (
              <label key={k} className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={addons[k]}
                  onChange={() =>
                    setAddons({ ...addons, [k]: !addons[k] })
                  }
                  className="mr-2"
                />
                {k.charAt(0).toUpperCase() + k.slice(1)} (+₹{addonPrices[k]})
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Payment</h2>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Payment Method</label>
              <select
                value={payment.method}
                onChange={(e) =>
                  setPayment({ ...payment, method: e.target.value })
                }
                className="border p-2 rounded w-full"
              >
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash on Arrival</option>
              </select>
            </div>

            {payment.method === "card" && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={payment.cardNumber}
                  onChange={(e) =>
                    setPayment({ ...payment, cardNumber: e.target.value })
                  }
                  className="border p-2 rounded col-span-2"
                />
                <input
                  type="text"
                  placeholder="Expiry (MM/YY)"
                  value={payment.expiry}
                  onChange={(e) =>
                    setPayment({ ...payment, expiry: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="password"
                  placeholder="CVV"
                  value={payment.cvv}
                  onChange={(e) =>
                    setPayment({ ...payment, cvv: e.target.value })
                  }
                  className="border p-2 rounded"
                />
              </div>
            )}

            {payment.method === "upi" && (
              <input
                type="text"
                placeholder="UPI ID"
                value={payment.upi}
                onChange={(e) => setPayment({ ...payment, upi: e.target.value })}
                className="border p-2 rounded w-full"
              />
            )}

            {payment.method === "cash" && (
              <p className="text-green-600 font-medium">
                ✅ You chose Cash on Arrival. Please pay at the start of your trip.
              </p>
            )}
          </div>
        )}
        
        {/* Footer Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => {
                if (validateStep()) setStep(step + 1);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handlePayment}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {payment.method === "cash"
                ? "Confirm Booking"
                : `Pay ₹${calcTotal().toLocaleString()}`}
            </button>
          )}
        </div>
      </div>

      {/* RIGHT (Summary) */}
      <div className="bg-white p-6 rounded-lg shadow h-fit">
        <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
        <p className="font-medium">
          {packageData ? packageData.attributes.title : "Selected Package"}
        </p>
        <p>
          Package ({travelers.length} traveler
          {travelers.length > 1 ? "s" : ""}) ₹{basePrice}
        </p>
        <p>Taxes & fees ₹{taxes}</p>
        {Object.keys(addons).map(
          (k) =>
            addons[k] && (
              <p key={k} className="capitalize">
                {k}: ₹{addonPrices[k]}
              </p>
            )
        )}
        <hr className="my-2" />
        <p className="font-bold text-lg">
          Total Amount ₹{calcTotal().toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default MyBookingsPage;
