import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";
import diseaseRoutes from "./routes/disease.js";
import farmRoutes from "./routes/farm.js";
import priceRoutes from "./routes/prices.js";

dotenv.config({ path: "./.env" });

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/disease", diseaseRoutes);
app.use("/api/farm", farmRoutes);
app.use("/api/prices", priceRoutes);

app.get("/api/health", (req, res) =>
  res.json({ status: "AI FarmSense API running" }),
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`),
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));

export default app;
