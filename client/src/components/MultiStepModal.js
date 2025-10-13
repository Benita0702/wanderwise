import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Mail,
  Phone,
  Star,
  CreditCard,
  Truck,
  Package,
  Clock,
  Plane,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const MultiStepModal = ({ isOpen, onClose, packageData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    from: "",
    to: packageData?.title || "",
    departureDate: "",
    email: "",
    phone: "",
    whatsapp: false,
    hotelRating: "",
    flights: "",
    budget: "",
    adults: 2,
    infants: 0,
    children: 0,
    bookingTimeline: "",
    cabOption: "",
    packageType: "",
    callTime: "",
    travelType: "",
    additionalNotes: "",
  });

  useEffect(() => {
    if (packageData) {
      setFormData((prev) => ({ ...prev, to: packageData.title || "" }));
    }
  }, [packageData]);

  const todayISO = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateStep = () => {
    const errors = [];
    if (step === 1) {
      if (!formData.from.trim()) errors.push("From is required.");
      if (!formData.to.trim()) errors.push("To is required.");
      if (!formData.departureDate) errors.push("Departure Date is required.");
    }
    if (step === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{10}$/;
      if (!emailRegex.test(formData.email))
        errors.push("Valid Email is required.");
      if (!phoneRegex.test(formData.phone))
        errors.push("Valid 10-digit Phone number is required.");
    }
    if (step === 3) {
      if (!formData.hotelRating) errors.push("Hotel Rating is required.");
      if (!formData.flights) errors.push("Please select flight option.");
      if (!formData.budget || Number(formData.budget) <= 0)
        errors.push("Budget must be greater than 0.");
    }
    if (step === 4) {
      if (!formData.cabOption) errors.push("Please select cab option.");
      if (!formData.packageType) errors.push("Please select package type.");
      if (!formData.callTime) errors.push("Please select preferred call time.");
    }
    return errors;
  };

  const handleNext = () => {
    const errors = validateStep();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateStep();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }
    console.log("TripNexa Form Submitted:", formData);
    setStep(5);
  };

  if (!isOpen) return null;

  // Animation variants for step transitions
  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 overflow-auto p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 z-10"
        >
          ✕
        </button>

        {/* LEFT PANEL */}
        <div className="md:w-1/3 bg-gradient-to-b from-teal-600 to-teal-800 text-white p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
            <ul className="space-y-3 text-teal-50">
              <li className="flex gap-3 items-start">
                <span className="font-bold">1.</span> Tell us details of your
                holiday plan.
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-bold">2.</span> Get multiple quotes from
                expert agents & customize.
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-bold">3.</span> Select & book the best
                deal.
              </li>
            </ul>
          </div>

          <div className="mt-8 border-t border-teal-400 pt-4 text-sm space-y-2">
            <p className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" /> 650+ Verified Agents
            </p>
            <p className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-200" /> Quality Control
            </p>
            <p>40 Lac+ Travelers | 65+ Destinations</p>
            <p className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-300" /> Call:{" "}
              <span className="font-medium">1800-123-5555</span>
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="md:w-2/3 bg-white p-8">
          <p className="text-gray-500 text-sm mb-4 text-right">
            Step {step} of 4
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Steps */}
              {step === 1 && (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Tell us details of your holiday plan
                  </h2>
                  <div className="flex items-center border rounded-lg px-3 py-2">
                    <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="from"
                      placeholder="From"
                      value={formData.from}
                      onChange={handleChange}
                      className="flex-1 outline-none"
                    />
                  </div>
                  <div className="flex items-center border rounded-lg px-3 py-2">
                    <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="to"
                      placeholder="To"
                      value={formData.to}
                      onChange={handleChange}
                      className="flex-1 outline-none"
                    />
                  </div>
                  <div className="flex items-center border rounded-lg px-3 py-2">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="date"
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleChange}
                      min={todayISO}
                      className="flex-1 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleNext}
                    className="bg-teal-600 hover:bg-teal-700 text-white w-full py-2 rounded-lg font-semibold transition"
                  >
                    Next
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    How do we contact you?
                  </h2>
                  <div className="flex items-center border rounded-lg px-3 py-2">
                    <Mail className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="flex-1 outline-none"
                    />
                  </div>
                  <div className="flex items-center border rounded-lg px-3 py-2">
                    <Phone className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="flex-1 outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-gray-600">
                    <Zap className="w-5 h-5 text-green-500" />
                    <input
                      type="checkbox"
                      name="whatsapp"
                      checked={formData.whatsapp}
                      onChange={handleChange}
                    />
                    Send trip updates on WhatsApp
                  </label>
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handleBack}
                      className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition"
                    >
                      Plan My Holidays
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Great! Tell Us What You Prefer
                  </h2>
                  <div className="flex items-center border rounded-lg px-3 py-2">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <select
                      name="hotelRating"
                      value={formData.hotelRating}
                      onChange={handleChange}
                      className="flex-1 outline-none"
                    >
                      <option value="">Select Hotel Rating</option>
                      <option value="5">5 Star</option>
                      <option value="4">4 Star</option>
                      <option value="3">3 Star</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <Plane className="w-5 h-5 text-blue-500" />
                    <label>
                      <input
                        type="radio"
                        name="flights"
                        value="yes"
                        checked={formData.flights === "yes"}
                        onChange={handleChange}
                      />{" "}
                      Include Flights
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="flights"
                        value="no"
                        checked={formData.flights === "no"}
                        onChange={handleChange}
                      />{" "}
                      Without Flights
                    </label>
                  </div>
                  <div className="flex items-center border rounded-lg px-3 py-2">
                    <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="number"
                      name="budget"
                      placeholder="Budget (per person)"
                      value={formData.budget}
                      onChange={handleChange}
                      className="flex-1 outline-none"
                    />
                  </div>
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handleBack}
                      className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Almost Done!
                  </h2>
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-gray-500" />
                    <label>
                      <input
                        type="radio"
                        name="cabOption"
                        value="yes"
                        checked={formData.cabOption === "yes"}
                        onChange={handleChange}
                      />{" "}
                      Include Cab
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="cabOption"
                        value="no"
                        checked={formData.cabOption === "no"}
                        onChange={handleChange}
                      />{" "}
                      No Cab
                    </label>
                  </div>
                  <div className="flex items-center border rounded-lg px-3 py-2">
                    <Package className="w-5 h-5 text-gray-500 mr-2" />
                    <select
                      name="packageType"
                      value={formData.packageType}
                      onChange={handleChange}
                      className="flex-1 outline-none"
                    >
                      <option value="">Select Package Type</option>
                      <option value="custom">Customizable Package</option>
                      <option value="bestselling">
                        Bestselling Standard Package
                      </option>
                    </select>
                  </div>
                  <div className="flex items-center border rounded-lg px-3 py-2">
                    <Clock className="w-5 h-5 text-gray-500 mr-2" />
                    <select
                      name="callTime"
                      value={formData.callTime}
                      onChange={handleChange}
                      className="flex-1 outline-none"
                    >
                      <option value="">Preferred time to call</option>
                      <option value="anytime">Anytime</option>
                      <option value="10-12">10 AM - 12 PM</option>
                      <option value="12-2">12 PM - 2 PM</option>
                      <option value="2-4">2 PM - 4 PM</option>
                      <option value="4-6">4 PM - 6 PM</option>
                      <option value="after6">After 6 PM</option>
                    </select>
                  </div>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    placeholder="Additional requirements..."
                    className="w-full border rounded-lg p-3 outline-none resize-none"
                    rows={3}
                  />
                  <p
                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                    onClick={() => setStep(5)}
                  >
                    Skip! I will do it later
                  </p>
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handleBack}
                      className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Submit
                    </button>
                  </div>
                </>
              )}

              {step === 5 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-8"
                >
                  <h2 className="text-2xl font-bold text-green-600 mb-3">
                    ✅ Success!
                  </h2>
                  <p className="text-gray-600">
                    TripNexa will contact you within 24 hours.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-5 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default MultiStepModal;
