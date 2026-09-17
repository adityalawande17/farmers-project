import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { protect } from "../middleware/auth.js";
import { toolSchemas } from "../ai/tools.js";
import {
  getWeather,
  getPriceTrend,
  getCropCalendar,
  getSoilRequirements,
} from "../ai/toolExecutors.js";

const router = express.Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an agricultural advisor helping a farmer.

You have access to tools that can provide weather, crop price,
crop calendar, and soil requirement information. Use the tools
when they are relevant. Do not make up information when a tool
can provide the answer.

The farmer's location, coordinates, and farm size are given to you
below in FARMER CONTEXT — use them directly (e.g. pass the given
coordinates to get_weather) instead of asking the farmer to repeat
information you already have. Use get_crop_calendar to see the
farmer's own active crops rather than asking what they have planted.
Only ask the farmer directly for information that is genuinely
missing from FARMER CONTEXT and cannot be retrieved via a tool.

When you use information retrieved from documents through a tool,
cite the source document in your answer. Include the document name
and chunk index when available. Do not invent sources or citations.
`;

function buildFarmerContextBlock(user) {
  const place = [user.location?.village, user.location?.district, user.location?.state]
    .filter(Boolean)
    .join(", ");

  const hasCoordinates = user.coordinates?.lat != null && user.coordinates?.lon != null;

  return `FARMER CONTEXT:
- Location: ${place || "Unknown"}
- Coordinates: ${hasCoordinates ? `${user.coordinates.lat}, ${user.coordinates.lon}` : "Not available — ask the farmer for their city/village only if a weather-dependent question needs it"}
- Farm size: ${user.farmSize ? `${user.farmSize} acres` : "Unknown"}
- Preferred language: ${user.preferredLanguage || "en"}

Use get_crop_calendar for the farmer's active crops instead of asking.`;
}

const MAX_TOOL_ITERATIONS = 10;

// POST /api/ai/advisor
router.post("/advisor", protect, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const messages = [
      {
        role: "user",
        content: `${buildFarmerContextBlock(req.user)}\n\nFarmer's question: ${question}`,
      },
    ];

    // Why a loop? Because Claude might need multiple rounds of tools.
    let iterations = 0;

    while (true) {
      if (++iterations > MAX_TOOL_ITERATIONS) {
        throw new Error(
          `Advisor loop exceeded ${MAX_TOOL_ITERATIONS} tool-use iterations`,
        );
      }

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: toolSchemas,
        messages,
      });

      // Claude wants to use one or more tools.
      if (response.stop_reason === "tool_use") {
        // Add Claude's response to the conversation.
        messages.push({
          role: "assistant",
          content: response.content,
        });

        const toolResults = []; //An array because claude can ask for multiple tools at once

        for (const block of response.content) {
          if (block.type !== "tool_use") {
            continue;
          }

          console.log(`[advisor] tool call: ${block.name}`, block.input);

          try {
            let result;

            switch (block.name) {
              case "get_weather":
                result = await getWeather(block.input.lat, block.input.lon);
                break;

              case "get_price_trend":
                result = await getPriceTrend(
                  block.input.crop,
                  block.input.state,
                );
                break;

              case "get_crop_calendar":
                result = await getCropCalendar(req.user._id);
                break;

              case "get_soil_requirements":
                result = await getSoilRequirements(block.input.crop);
                break;

              default:
                throw new Error(`Unknown tool: ${block.name}`);
            }

            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify(result),
            });
          } catch (toolError) {
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify({
                error: toolError.message,
              }),
              is_error: true,
            });
          }
        }

        // All tool results go into ONE user message.
        messages.push({
          role: "user",
          content: toolResults,
        });

        // Go back to Claude with the tool results.
        continue;
      }

      // Claude is finished and has produced the final answer.
      const answer = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      return res.json({ answer });
    }
  } catch (err) {
    console.error("AI advisor error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;
