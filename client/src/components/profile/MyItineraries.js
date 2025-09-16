import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../../api"; // Make sure this path is correct
import { AuthContext } from "../../context/AuthContext"; // Make sure this path is correct

function MyItineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchItineraries = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // This is the updated API call to our new custom route
        const response = await api.get("/itineraries/my-itineraries");
        setItineraries(response.data.data || response.data); // Handle both Strapi v3 and v4 response structures
      } catch (err) {
        console.error("Error fetching itineraries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [user]);

  if (loading) return <p className="text-center mt-8">Loading your itineraries...</p>;

  if (!itineraries.length) {
    return (
      <div className="text-center mt-8">
        <p>You haven't created any itineraries yet.</p>
        <Link to="/planner" className="text-blue-600 hover:underline">
          Create a new itinerary
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">My Itineraries</h1>
      <div className="grid gap-6">
        {itineraries.map((itinerary) => {
          // Destructure attributes for easier access
          const { title, destination, startDate, endDate } = itinerary.attributes || itinerary;
          return (
            <div
              key={itinerary.id}
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-semibold mb-2">{title}</h2>
              <p className="text-gray-600 mb-4">
                {destination} | {new Date(startDate).toLocaleDateString()} -{" "}
                {new Date(endDate).toLocaleDateString()}
              </p>
              <div className="flex justify-end">
                <Link
                  to={`/itinerary/${itinerary.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyItineraries;