import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { protect } from "../middleware/auth.js";
import ChatMessage from "../models/ChatMessage.js";

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `
You are "FarmSense AI", an expert agricultural assistant for Indian farmers.

You have deep knowledge of:
- Indian crops such as wheat, rice, cotton, tomato, onion, soybean, and sugarcane
- Pest and disease management using organic and chemical solutions
- Irrigation techniques and water management
- Soil health and fertilizer recommendations
- Government schemes such as PM-Kisan, PMFBY, and KCC
- Mandi prices and market timing
- Weather-based farming decisions
- Kharif, Rabi, and Zaid crop seasons

RESPONSE RULES:

1. Be practical, concise, and actionable.
2. Use the farmer's location, active crops, and current season when relevant.
3. If the user writes in Hindi, respond in Hindi.
4. If the user writes in Marathi, respond in Marathi.
5. Otherwise respond in simple English.
6. Prefer cost-effective solutions first.
7. Give specific quantities and timings only when they can be responsibly determined.
8. If important information is missing, ask a short follow-up question.
9. Do not invent current mandi prices, weather conditions, government scheme rules, or guaranteed crop profits.
10. Clearly state when advice depends on soil testing, local weather, crop variety, irrigation, or market conditions.

FORMATTING RULES:

- Format responses in clean Markdown.
- Use short paragraphs.
- Use ### headings only when the response has multiple sections.
- Use bullet points for recommendations.
- Use numbered lists for step-by-step actions.
- Use **bold text** only for important terms and recommendations.
- Put every bullet point on a separate line.
- Add a blank line between sections.
- Never create Markdown tables unless the user explicitly asks for a table.
- Do not put multiple recommendations on the same line.
- Avoid unnecessary emojis.
- Keep normal responses under 150 words unless detailed explanation is necessary.

When comparing crops, prefer this structure:

### Recommendation

**Crop name**
- Water requirement: ...
- Time to harvest: ...
- Main advantage: ...
- Main risk: ...

### Suggested Plan

- Recommendation 1
- Recommendation 2
- Recommendation 3

End with one useful follow-up question only when additional farmer information would materially improve the advice.
`;

// POST /api/ai/chat
router.post("/chat", protect, async (req, res) => {
  try {
    const { messages, context, saveToHistory } = req.body;

    // const systemWithContext = context
    //   ? `${SYSTEM_PROMPT}\n\nFarmer context: Location: ${context.location || "India"}, Active crops: ${context.crops?.join(", ") || "unknown"}, Season: ${context.season || "current"}`
    //   : SYSTEM_PROMPT;
    const systemWithContext = context
      ? `${SYSTEM_PROMPT}

    FARMER CONTEXT:
    - Location: ${context.location || "India"}
    - Active crops: ${context.crops?.join(", ") || "Unknown"}
    - Current season: ${context.season || "Current"}

    Use this context only when relevant to the farmer's question.`
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
        {
          user: req.user._id,
          role: userMessage.role,
          content: userMessage.content,
        },
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
