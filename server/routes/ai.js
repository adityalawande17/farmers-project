import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { protect } from "../middleware/auth.js";
import ChatMessage from "../models/ChatMessage.js";

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert AI farming assistant called "FarmSense AI" for Indian farmers.
You have deep knowledge about:
- Indian crops (wheat, rice, cotton, tomato, onion, soybean, sugarcane, etc.)
- Pest and disease management with organic and chemical solutions
- Irrigation techniques and water management
- Soil health and fertilizer recommendations
- Government schemes like PM-Kisan, Fasal Bima Yojana, KCC
- Mandi prices and market timing advice
- Weather-based farming decisions
- Kharif, Rabi, and Zaid season crops

Always:
- Be practical and actionable
- Give specific quantities, timings, and product names when relevant
- Mention cost-effective solutions first
- If asked in Hindi or Marathi, respond in that language
- Keep responses concise (under 150 words unless detail is needed)
- Reference the farmer's crops and location when provided in context`;

// POST /api/ai/chat
router.post("/chat", protect, async (req, res) => {
  try {
    const { messages, context, saveToHistory } = req.body;

    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\nFarmer context: Location: ${context.location || "India"}, Active crops: ${context.crops?.join(", ") || "unknown"}, Season: ${context.season || "current"}`
      : SYSTEM_PROMPT;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemWithContext,
      messages,
    });

    const reply = response.content[0].text;

    if (saveToHistory) {
      const userMessage = messages[messages.length - 1];
      await ChatMessage.insertMany([
        { user: req.user._id, role: userMessage.role, content: userMessage.content },
        { user: req.user._id, role: "assistant", content: reply },
      ]);
    }

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ai/history
router.get("/history", protect, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/crop-advice
router.post("/crop-advice", protect, async (req, res) => {
  try {
    const { crop, issue, weather } = req.body;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Give specific advice for: Crop: ${crop}, Issue/Question: ${issue}, Current weather: ${JSON.stringify(weather || {})}. Format as: Problem, Cause, Solution steps, Prevention.`,
        },
      ],
    });

    res.json({ advice: response.content[0].text });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/sell-advice
router.post("/sell-advice", protect, async (req, res) => {
  try {
    const { crop, quantity, currentPrice, priceHistory, location } = req.body;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Selling advice: Crop: ${crop}, Quantity: ${quantity} quintals, Current price: ₹${currentPrice}/q, Location: ${location}, Price trend (last 7 days): ${JSON.stringify(priceHistory)}. Should I sell now or wait? Give a clear recommendation with reasoning.`,
        },
      ],
    });

    res.json({ advice: response.content[0].text });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
