export async function getAISuggestions(destination, preferences, totalDays, budget) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destination, preferences, totalDays, budget }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "AI request failed");
  }

  return res.json();
}
