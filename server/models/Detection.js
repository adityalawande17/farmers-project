import mongoose from 'mongoose';

const detectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  disease: { type: String, required: true },
  severity: { type: String, default: null },
  confidence: { type: String, default: null },
  affected_part: { type: String, default: null },
  cause: { type: String, default: null },
  urgency: { type: String, default: null },
  symptoms: [{ type: String }],
  treatment: [{ type: String }],
  prevention: [{ type: String }],
  organic_solution: { type: String, default: null },
  crop: { type: String, default: null }, // user can optionally tag which crop
}, { timestamps: true });

export default mongoose.model('Detection', detectionSchema);
