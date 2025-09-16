// src/components/ItineraryDetail.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";  // ✅ FIXED
import { fetchItineraryById } from "../api/itineraries"; // ✅ FIXED


export default function ItineraryDetail() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchItineraryById(id, token);
        setItinerary(data);
      } catch (err) {
        console.error("Failed to fetch itinerary", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token]);

  if (loading) return <div className="p-6">Loading itinerary...</div>;
  if (!itinerary) return <div className="p-6">Itinerary not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded"
      >
        ← Back
      </button>
      <h2 className="text-2xl font-bold mb-2">{itinerary.title}</h2>
      <p className="text-gray-600 mb-4">
        {itinerary.destination} —{" "}
        {itinerary.startDate
          ? new Date(itinerary.startDate).toLocaleDateString()
          : "?"}{" "}
        to{" "}
        {itinerary.endDate
          ? new Date(itinerary.endDate).toLocaleDateString()
          : "?"}
      </p>

      {/* Example extra fields */}
      {itinerary.travelerType && (
        <p>
          <strong>Traveler Type:</strong> {itinerary.travelerType}
        </p>
      )}
      {itinerary.preferences && (
        <p>
          <strong>Preferences:</strong> {itinerary.preferences}
        </p>
      )}
      {itinerary.activities && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Activities</h3>
          <ul className="list-disc pl-5">
            {Array.isArray(itinerary.activities) ? (
              itinerary.activities.map((a, idx) => <li key={idx}>{a}</li>)
            ) : (
              <li>{itinerary.activities}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
