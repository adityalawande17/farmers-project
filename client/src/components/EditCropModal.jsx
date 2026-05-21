import { useState } from "react";
import axios from "axios";
import { API } from "../context/AuthContext";

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

export default function EditCropModal({ crop, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState({
    name: crop.name || "",
    variety: crop.variety || "",
    area: crop.area || "",
    season: crop.season || "rabi",
    plantingDate: crop.plantingDate?.slice(0, 10) || "",
    expectedHarvestDate: crop.expectedHarvestDate?.slice(0, 10) || "",
    actualHarvestDate: crop.actualHarvestDate?.slice(0, 10) || "",
    status: crop.status || "growing",
    yield: crop.yield || "",
    sellingPrice: crop.sellingPrice || "",
    notes: crop.notes || "",
  });

  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'harvest' | 'expenses'
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  // Expenses local state — start from existing
  const [expenses, setExpenses] = useState(crop.expenses || []);
  const [newExp, setNewExp] = useState({
    category: "seeds",
    amount: "",
    note: "",
  });
  const [showExpForm, setShowExpForm] = useState(false);

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const addExpense = () => {
    if (!newExp.amount) return;
    setExpenses((prev) => [
      ...prev,
      { ...newExp, amount: parseFloat(newExp.amount) },
    ]);
    setNewExp({ category: "seeds", amount: "", note: "" });
    setShowExpForm(false);
  };

  const removeExpense = (i) =>
    setExpenses((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        area: parseFloat(form.area) || crop.area,
        yield: parseFloat(form.yield) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        expenses,
      };
      const { data } = await axios.put(
        `${API}/farm/crops/${crop._id}`,
        payload,
      );
      onSaved(data);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/farm/crops/${crop._id}`);
      onDeleted(crop._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete.");
      setDeleting(false);
    }
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Edit Crop</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {crop.name} · {crop.area} acres
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {["details", "harvest", "expenses"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-medium py-3 px-4 capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-green-500 text-green-700"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
              {tab === "expenses" && expenses.length > 0 && (
                <span className="ml-1.5 bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full">
                  {expenses.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs px-4 py-3 rounded-xl mb-4 border border-red-100">
              {error}
            </div>
          )}

          {/* ── Details Tab ── */}
          {activeTab === "details" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Crop Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Variety
                  </label>
                  <input
                    value={form.variety}
                    onChange={(e) => update("variety", e.target.value)}
                    placeholder="e.g. HD-2967"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Area (acres)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={form.area}
                    onChange={(e) => update("area", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Season
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
                    Planting Date
                  </label>
                  <input
                    type="date"
                    value={form.plantingDate}
                    onChange={(e) => update("plantingDate", e.target.value)}
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
                    onChange={(e) =>
                      update("expectedHarvestDate", e.target.value)
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={3}
                  placeholder="Any notes about this crop..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none"
                />
              </div>
            </div>
          )}

          {/* ── Harvest Tab ── */}
          {activeTab === "harvest" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Status
                </label>
                <div className="flex gap-2">
                  {["growing", "harvested", "failed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => update("status", s)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-medium border capitalize transition-colors ${
                        form.status === s
                          ? s === "growing"
                            ? "bg-blue-50 border-blue-300 text-blue-700"
                            : s === "harvested"
                              ? "bg-green-50 border-green-300 text-green-700"
                              : "bg-red-50 border-red-300 text-red-700"
                          : "border-gray-200 text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {form.status === "harvested" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Actual Harvest Date
                    </label>
                    <input
                      type="date"
                      value={form.actualHarvestDate}
                      onChange={(e) =>
                        update("actualHarvestDate", e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Yield (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.yield}
                        onChange={(e) => update("yield", e.target.value)}
                        placeholder="e.g. 2500"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Selling Price (₹/quintal)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.sellingPrice}
                        onChange={(e) => update("sellingPrice", e.target.value)}
                        placeholder="e.g. 2180"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                      />
                    </div>
                  </div>
                  {form.yield && form.sellingPrice && (
                    <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                      <div className="text-xs text-green-700">
                        Estimated Revenue:{" "}
                        <span className="font-semibold">
                          ₹
                          {(
                            (parseFloat(form.yield) / 100) *
                            parseFloat(form.sellingPrice)
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {totalExpenses > 0 && (
                        <div className="text-xs text-green-700 mt-1">
                          Estimated Profit:{" "}
                          <span className="font-semibold">
                            ₹
                            {(
                              (parseFloat(form.yield) / 100) *
                                parseFloat(form.sellingPrice) -
                              totalExpenses
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Expenses Tab ── */}
          {activeTab === "expenses" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Total:{" "}
                  <span className="font-semibold text-gray-800">
                    ₹{totalExpenses.toLocaleString("en-IN")}
                  </span>
                </span>
              </div>

              {expenses.length > 0 && (
                <div className="flex flex-col gap-2">
                  {expenses.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5"
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
                          ₹{Number(e.amount).toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => removeExpense(i)}
                          className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showExpForm ? (
                <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Category
                      </label>
                      <select
                        value={newExp.category}
                        onChange={(e) =>
                          setNewExp((p) => ({ ...p, category: e.target.value }))
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
                        min="0"
                        value={newExp.amount}
                        onChange={(e) =>
                          setNewExp((p) => ({ ...p, amount: e.target.value }))
                        }
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
                      />
                    </div>
                  </div>
                  <input
                    value={newExp.note}
                    onChange={(e) =>
                      setNewExp((p) => ({ ...p, note: e.target.value }))
                    }
                    placeholder="Note (optional)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addExpense}
                      className="flex-1 bg-green-500 text-white text-sm py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowExpForm(false)}
                      className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowExpForm(true)}
                  className="w-full border border-dashed border-gray-200 text-gray-400 text-sm py-2.5 rounded-xl hover:border-green-300 hover:text-green-600 transition-colors"
                >
                  + Add Expense
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          {/* Delete */}
          {confirmDelete ? (
            <div className="flex gap-2 flex-1">
              <span className="text-xs text-red-600 self-center flex-1">
                Are you sure?
              </span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="border border-gray-200 text-gray-600 text-xs px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                className="border border-red-100 text-red-500 hover:bg-red-50 text-sm px-4 py-2.5 rounded-xl transition-colors"
              >
                Delete
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
