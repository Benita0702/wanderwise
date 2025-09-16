// src/components/profile/MyItineraries.js
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";   // ✅ inside src
import { fetchItinerariesForUser } from "../../api/itineraries";  // ✅ inside src
import { useNavigate } from "react-router-dom";


export default function MyItineraries() {
  const { user, token } = useContext(AuthContext);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setItineraries([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchItinerariesForUser(user.id, token);

        // ✅ Flatten Strapi data safely
        const cleaned = data.map((it) => ({
          id: it.id,
          title: it.title,
          destination: it.destination,
          startDate: it.startDate,
          endDate: it.endDate,
        }));

        setItineraries(cleaned);
      } catch (err) {
        console.error("Failed to load itineraries", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, token]);

  if (loading) return <div className="p-6">Loading your itineraries...</div>;
  if (!user)
    return <div className="p-6">Please login to view your itineraries.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Itineraries</h2>
      {itineraries.length === 0 ? (
        <div>No saved itineraries yet.</div>
      ) : (
        <div className="space-y-4">
          {itineraries.map((it) => (
            <div key={it.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {it.title || "Untitled"}
                  </h3>
                  <p className="text-gray-600">
                    {it.destination || "Unknown"} —{" "}
                    {it.startDate
                      ? new Date(it.startDate).toLocaleDateString()
                      : "?"}{" "}
                    to{" "}
                    {it.endDate
                      ? new Date(it.endDate).toLocaleDateString()
                      : "?"}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => navigate(`/itinerary/${it.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
