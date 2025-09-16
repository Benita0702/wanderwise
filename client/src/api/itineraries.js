// Helper to interact with Strapi's itineraries collection
const API_URL = process.env.REACT_APP_API_URL || '';

export async function createItinerary(payload, token = null) {
  try {
    const res = await fetch(`${API_URL}/api/itineraries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        data: {
          title: payload.title,
          destination: payload.destination,
          startDate: payload.startDate,
          endDate: payload.endDate,
          travelerType: payload.travelerType,
          preferences: payload.preferences,
          activities: payload.activities,
          // ✅ correct relation field in your Strapi model
          users_permissions_user: payload.userId,
        },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Failed: ${res.status} ${txt}`);
    }

    const json = await res.json();
    return json.data?.id
      ? { id: json.data.id, ...json.data.attributes }
      : json;
  } catch (err) {
    console.error('createItinerary error', err);
    throw err;
  }
}

// Fetch all itineraries for a user
export async function fetchItinerariesForUser(userId, token = null) {
  try {
    if (!userId) return [];

    const res = await fetch(
      `${API_URL}/api/itineraries?filters[user][id][$eq]=${userId}&populate=*`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Fetch failed: ${res.status} ${txt}`);
    }

    const json = await res.json();

    return (json.data || []).map((item) => ({
      id: item.id,
      ...item.attributes,
    }));
  } catch (err) {
    console.error("fetchItinerariesForUser error", err);
    return [];
  }
}
  

// Fetch a single itinerary by ID
export async function fetchItineraryById(id, token = null) {
  try {
    const res = await fetch(`${API_URL}/api/itineraries/${id}?populate=*`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Fetch failed: ${res.status} ${txt}`);
    }

    const json = await res.json();
    return json.data ? { id: json.data.id, ...json.data.attributes } : null;
  } catch (err) {
    console.error("fetchItineraryById error", err);
    return null;
  }
}
