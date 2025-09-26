// src/api/ai.js
export async function getAISuggestions(destination, preferences, totalDays, budget) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destination, preferences, totalDays, budget })
  });

  if (!res.ok) throw new Error("AI request failed");

  const data = await res.json();
  return data; // returns [{day:1, activities:[...]}]
}
