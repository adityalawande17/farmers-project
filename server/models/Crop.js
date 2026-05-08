import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["seeds", "fertilizer", "pesticide", "labor", "irrigation", "other"],
  },
  amount: Number,
  date: { type: Date, default: Date.now },
  note: String,
});

const cropSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    variety: String,
    area: { type: Number, required: true }, // acres
    plantingDate: { type: Date, required: true },
    expectedHarvestDate: Date,
    actualHarvestDate: Date,
    status: {
      type: String,
      enum: ["growing", "harvested", "failed"],
      default: "growing",
    },
    yield: { type: Number, default: 0 }, // kg
    sellingPrice: { type: Number, default: 0 }, // per quintal
    expenses: [expenseSchema],
    notes: String,
    season: { type: String, enum: ["kharif", "rabi", "zaid"], required: true },
  },
  { timestamps: true },
);

cropSchema.virtual("totalExpenses").get(function () {
  return this.expenses.reduce((sum, e) => sum + e.amount, 0);
});

cropSchema.virtual("revenue").get(function () {
  return (this.yield / 100) * this.sellingPrice;
});

cropSchema.virtual("profit").get(function () {
  return this.revenue - this.totalExpenses;
});

export default mongoose.model("Crop", cropSchema);
