import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../context/AuthContext";

const CROP_NAMES = [
  "Wheat",
  "Rice",
  "Tomato",
  "Onion",
  "Potato",
  "Cotton",
  "Soybean",
  "Sugarcane",
  "Maize",
  "Chilli",
  "Garlic",
  "Brinjal",
  "Cabbage",
  "Cauliflower",
  "Groundnut",
];
const SEASONS = [
  { value: "kharif", label: "Kharif (June–Oct)" },
  { value: "rabi", label: "Rabi (Oct–Mar)" },
  { value: "zaid", label: "Zaid (Mar–Jun)" },
];
const EXPENSE_CATEGORIES = [
  "seeds",
  "fertilizer",
  "pesticide",
  "labor",
  "irrigation",
  "other",
];

export default function AddCrop() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    variety: "",
    area: "",
    season: "rabi",
    plantingDate: "",
    expectedHarvestDate: "",
    notes: "",
    expenses: [],
  });
  const [expense, setExpense] = useState({
    category: "seeds",
    amount: "",
    note: "",
  });
  const [showExpense, setShowExpense] = useState(false);

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const addExpense = () => {
    if (!expense.amount) return;
    setForm((prev) => ({
      ...prev,
      expenses: [
        ...prev.expenses,
        { ...expense, amount: parseFloat(expense.amount) },
      ],
    }));
    setExpense({ category: "seeds", amount: "", note: "" });
    setShowExpense(false);
  };

  const removeExpense = (i) =>
    setForm((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((_, idx) => idx !== i),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/farm/crops`, {
        ...form,
        area: parseFloat(form.area),
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add crop.");
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = form.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-medium text-gray-900">
          Add New Crop
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Track your crop from sowing to harvest
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Crop Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Crop Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Crop Name *
              </label>
              <select
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
              >
                <option value="">Select crop</option>
                {CROP_NAMES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Variety
              </label>
              <input
                value={form.variety}
                onChange={(e) => update("variety", e.target.value)}
                placeholder="e.g. HD-2967, Pusa Ruby"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Area (acres) *
              </label>
              <input
                type="number"
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
                placeholder="e.g. 2.5"
                step="0.1"
                min="0.1"
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Season *
              </label>
              <select
                value={form.season}
                onChange={(e) => update("season", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
              >
                {SEASONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Planting Date *
              </label>
              <input
                type="date"
                value={form.plantingDate}
                onChange={(e) => update("plantingDate", e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Expected Harvest
              </label>
              <input
                type="date"
                value={form.expectedHarvestDate}
                onChange={(e) => update("expectedHarvestDate", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Any additional notes about this crop..."
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none"
            />
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Initial Expenses
            </h2>
            {totalExpenses > 0 && (
              <span className="text-xs font-medium text-gray-500">
                Total: ₹{totalExpenses.toLocaleString()}
              </span>
            )}
          </div>

          {form.expenses.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              {form.expenses.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {e.category}
                    </span>
                    {e.note && (
                      <span className="text-xs text-gray-400 ml-2">
                        — {e.note}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-800">
                      ₹{e.amount.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExpense(i)}
                      className="text-gray-300 hover:text-red-400 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showExpense ? (
            <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Category
                  </label>
                  <select
                    value={expense.category}
                    onChange={(e) =>
                      setExpense((p) => ({ ...p, category: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-green-400 capitalize"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={expense.amount}
                    onChange={(e) =>
                      setExpense((p) => ({ ...p, amount: e.target.value }))
                    }
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>
              <input
                value={expense.note}
                onChange={(e) =>
                  setExpense((p) => ({ ...p, note: e.target.value }))
                }
                placeholder="Note (optional)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addExpense}
                  className="flex-1 bg-green-500 text-white text-sm py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpense(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowExpense(true)}
              className="w-full border border-dashed border-gray-200 text-gray-500 text-sm py-2.5 rounded-xl hover:border-green-300 hover:text-green-600 transition-colors"
            >
              + Add Expense
            </button>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : " Add Crop"}
          </button>
        </div>
      </form>
    </div>
  );
}
