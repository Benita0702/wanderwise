// server.js or routes/ai.js
import express from "express";
import { HfInference } from "@huggingface/inference";

const router = express.Router();
const hf = new HfInference(process.env.HF_TOKEN); // your HF token in .env

router.post("/ai", async (req, res) => {
  const { destination, preferences, totalDays, budget } = req.body;

  if (!destination || !totalDays || !budget) {
    return res.status(400).json({ error: "Destination, totalDays, and budget are required" });
  }

  const prompt = `
You are a travel assistant. Generate a ${totalDays}-day trip plan for ${destination}.
Budget: ₹${budget}.
Preferences: ${preferences.join(", ") || "General"}.
Give **realistic daily activities** suitable for the budget.
Format your response as JSON array like:
[
  {"day": 1, "activities": ["Activity 1 description", "Activity 2 description"]},
  {"day": 2, "activities": ["..."]}
]
`;

  try {
    const response = await hf.textGeneration({
      model: "google/gemma-7b-it",
      inputs: prompt,
      max_new_tokens: 500,
    });

    // Parse AI response safely
    let suggestions = [];
    try {
      suggestions = JSON.parse(response.generated_text);
    } catch {
      // fallback if parsing fails
      suggestions = Array.from({ length: totalDays }, (_, i) => ({
        day: i + 1,
        activities: [`Explore ${destination}`, `Enjoy local food`]
      }));
    }

    res.json(suggestions);
  } catch (err) {
    console.error("AI generation error:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;
