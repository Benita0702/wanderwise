import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { destination, preferences, days, budget } = req.body;

    const prompt = `
    Create a ${days}-day travel itinerary for ${destination}.
    Preferences: ${preferences.join(", ")}
    Budget: ₹${budget}
    Return the response in JSON format like:
    [
      { "day": 1, "activities": ["...","..."] },
      { "day": 2, "activities": ["...","..."] }
    ]
    `;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
      }),
    });

    const data = await response.json();

    // Ollama streams, so sometimes response is in data.response
    res.json({ result: data.response || data });
  } catch (err) {
    console.error("Ollama API error:", err);
    res.status(500).json({ error: "Failed to generate AI itinerary" });
  }
});

export default router;
