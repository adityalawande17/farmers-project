import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import { protect } from "../middleware/auth.js";
import Detection from "../models/Detection.js";

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/diseases";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()))
      cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// POST /api/disease/detect
router.post("/detect", protect, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  try {
    const imageData = fs.readFileSync(req.file.path);
    const base64Image = imageData.toString("base64");
    const mediaType = req.file.mimetype;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Analyze this crop/plant image as an expert plant pathologist. Respond in JSON format only:
{
  "disease": "disease name or 'Healthy'",
  "confidence": "High/Medium/Low",
  "severity": "None/Mild/Moderate/Severe",
  "affected_part": "leaves/stem/fruit/roots",
  "cause": "brief cause",
  "symptoms": ["symptom1", "symptom2"],
  "treatment": ["step1", "step2", "step3"],
  "prevention": ["tip1", "tip2"],
  "organic_solution": "organic treatment option",
  "urgency": "Immediate/Within a week/Monitor"
}`,
            },
          ],
        },
      ],
    });

    let result;
    try {
      const text = response.content[0].text;
      result = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      result = { disease: "Analysis complete", raw: response.content[0].text };
    }

    await Detection.create({
      user: req.user._id,
      disease: result.disease,
      severity: result.severity || null,
      confidence: result.confidence || null,
      affected_part: result.affected_part || null,
      cause: result.cause || null,
      urgency: result.urgency || null,
      symptoms: result.symptoms || [],
      treatment: result.treatment || [],
      prevention: result.prevention || [],
      organic_solution: result.organic_solution || null,
      crop: req.body.crop || null,
    });

    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

// GET /api/disease/history — real detections for logged-in user
router.get("/history", protect, async (req, res) => {
  try {
    const detections = await Detection.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(detections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
