import express from "express";
import Crop from "../models/Crop.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/farm/crops
router.get("/crops", protect, async (req, res) => {
  try {
    const crops = await Crop.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/farm/crops
router.post("/crops", protect, async (req, res) => {
  try {
    const crop = await Crop.create({ ...req.body, user: req.user._id });
    res.status(201).json(crop);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/farm/crops/:id
router.put("/crops/:id", protect, async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true },
    );
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.json(crop);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/farm/crops/:id
router.delete("/crops/:id", protect, async (req, res) => {
  try {
    const crop = await Crop.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.json({ message: "Crop deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/farm/crops/:id/expense
router.post("/crops/:id/expense", protect, async (req, res) => {
  try {
    const crop = await Crop.findOne({ _id: req.params.id, user: req.user._id });
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    crop.expenses.push(req.body);
    await crop.save();
    res.json(crop);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/farm/dashboard
router.get("/dashboard", protect, async (req, res) => {
  try {
    const crops = await Crop.find({ user: req.user._id });
    const activeCrops = crops.filter((c) => c.status === "growing");
    const totalRevenue = crops.reduce(
      (sum, c) => sum + (c.yield / 100) * c.sellingPrice,
      0,
    );
    const totalExpenses = crops.reduce(
      (sum, c) => sum + c.expenses.reduce((s, e) => s + e.amount, 0),
      0,
    );
    const totalYield = crops.reduce((sum, c) => sum + c.yield, 0);

    res.json({
      activeCrops: activeCrops.length,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalYield,
      crops: activeCrops,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/farm/yield-chart — real monthly yield from harvested crops
router.get("/yield-chart", protect, async (req, res) => {
  try {
    const crops = await Crop.find({ user: req.user._id, status: "harvested" });

    const MONTH_NAMES = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthly = {};

    crops.forEach((crop) => {
      if (crop.actualHarvestDate && crop.yield > 0) {
        const month = MONTH_NAMES[new Date(crop.actualHarvestDate).getMonth()];
        monthly[month] = (monthly[month] || 0) + crop.yield;
      } else if (crop.expectedHarvestDate && crop.yield > 0) {
        // Fall back to expected harvest date if actual not set
        const month =
          MONTH_NAMES[new Date(crop.expectedHarvestDate).getMonth()];
        monthly[month] = (monthly[month] || 0) + crop.yield;
      }
    });

    // Return in calendar order
    const chartData = MONTH_NAMES.filter((m) => monthly[m]).map((month) => ({
      month,
      yield: monthly[month],
    }));

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
