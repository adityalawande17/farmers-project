import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAuth, API } from "../context/AuthContext";
import EditCropModal from "../components/EditCropModal";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { buttonClasses } from "../components/ui/Button";

// ── helpers ───────────────────────────────────────────────────────────────────
const growthPercent = (plantDate, harvestDate) => {
  if (!plantDate || !harvestDate) return 0;
  const total = new Date(harvestDate) - new Date(plantDate);
  const elapsed = Date.now() - new Date(plantDate);
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

const daysUntil = (date) => {
  if (!date) return null;
  const diff = new Date(date) - Date.now();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
};

const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const SEASON_TONES = { kharif: "amber", rabi: "blue", zaid: "green" };

const PIE_COLORS = [
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

// ── sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, subColor = "text-green-600", icon }) => (
  <Card className="flex items-start gap-4">
    {icon && <div className="text-2xl mt-0.5">{icon}</div>}
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
    </div>
  </Card>
);

const CropCard = ({ crop, onEdit }) => {
  const pct = growthPercent(crop.plantingDate, crop.expectedHarvestDate);
  const days = daysUntil(crop.expectedHarvestDate);
  const totalExp = crop.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
  const revenue = crop.yield ? (crop.yield / 100) * crop.sellingPrice : 0;
  const isHarvested = crop.status === "harvested";

  return (
    <Card className="flex flex-col gap-3 hover:border-green-200 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-gray-900">{crop.name}</div>
          {crop.variety && (
            <div className="text-xs text-gray-400 mt-0.5">{crop.variety}</div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Badge tone={SEASON_TONES[crop.season] || "gray"}>{crop.season}</Badge>
          <Badge tone={isHarvested ? "green" : "blue"}>
            {isHarvested ? "Harvested" : "Growing"}
          </Badge>
          {/* Edit button */}
          <button
            onClick={() => onEdit(crop)}
            title="Edit crop"
            className="ml-1 text-gray-300 hover:text-green-500 hover:bg-green-50 rounded-lg p-1 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Key info row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-xl py-2">
          <div className="text-sm font-semibold text-gray-800">
            {crop.area}ac
          </div>
          <div className="text-xs text-gray-400">Area</div>
        </div>
        <div className="bg-gray-50 rounded-xl py-2">
          <div className="text-sm font-semibold text-gray-800">
            {formatCurrency(totalExp)}
          </div>
          <div className="text-xs text-gray-400">Spent</div>
        </div>
        <div className="bg-gray-50 rounded-xl py-2">
          <div
            className={`text-sm font-semibold ${revenue > 0 ? "text-green-700" : "text-gray-400"}`}
          >
            {revenue > 0 ? formatCurrency(revenue) : "—"}
          </div>
          <div className="text-xs text-gray-400">Revenue</div>
        </div>
      </div>

      {/* Growth bar */}
      {!isHarvested && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Growth progress</span>
            <span className="font-medium text-gray-600">{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct > 75 ? "bg-green-500" : pct > 40 ? "bg-amber-400" : "bg-blue-400"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {days !== null && (
            <div
              className={`text-xs mt-1.5 ${days <= 14 ? "text-green-600 font-medium" : "text-gray-400"}`}
            >
              {days === 0
                ? "Harvest today!"
                : days <= 14
                  ? `Harvest in ${days} days`
                  : `Harvest in ~${days} days`}
            </div>
          )}
        </div>
      )}

      {/* Harvested yield */}
      {isHarvested && crop.yield > 0 && (
        <div className="bg-green-50 rounded-xl px-3 py-2 flex justify-between items-center">
          <span className="text-xs text-green-700">
            Yield: <span className="font-semibold">{crop.yield} kg</span>
          </span>
          <span className="text-xs text-green-700">
            Profit:{" "}
            <span className="font-semibold">
              {formatCurrency(revenue - totalExp)}
            </span>
          </span>
        </div>
      )}

      {/* Expense tags */}
      {crop.expenses?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {crop.expenses.map((e, i) => (
            <span
              key={i}
              className="text-xs bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-lg capitalize"
            >
              {e.category}: {formatCurrency(e.amount)}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
};

// ── main component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [weather, setWeather] = useState(null);
  const [yieldData, setYieldData] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);

  // Load crops
  useEffect(() => {
    Promise.all([
      axios.get(`${API}/farm/dashboard`),
      axios.get(`${API}/farm/crops`),
    ])
      .then(([dashRes, cropsRes]) => {
        setStats(dashRes.data);
        setCrops(cropsRes.data);
      })
      .catch(() => {
        setStats(null);
        setCrops([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Yield chart
  useEffect(() => {
    axios
      .get(`${API}/farm/yield-chart`)
      .then((res) => setYieldData(res.data || []))
      .catch(() => setYieldData([]));
  }, []);

  // Weather
  useEffect(() => {
    const fetchWeather = (lat, lon) => {
      axios
        .get(`${API}/prices/weather?lat=${lat}&lon=${lon}`)
        .then((res) => setWeather(res.data))
        .catch(() => setWeather(null));
    };
    if (user?.coordinates?.lat) {
      fetchWeather(user.coordinates.lat, user.coordinates.lon);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => setWeather(null),
      );
    }
  }, [user]);

  // ── modal callbacks ───────────────────────────────────────────────────────
  const handleCropSaved = (updatedCrop) => {
    setCrops((prev) =>
      prev.map((c) => (c._id === updatedCrop._id ? updatedCrop : c)),
    );
  };

  const handleCropDeleted = (cropId) => {
    setCrops((prev) => prev.filter((c) => c._id !== cropId));
  };

  // ── derived values ────────────────────────────────────────────────────────
  const filteredCrops =
    activeTab === "all" ? crops : crops.filter((c) => c.status === activeTab);
  const activeCrops = crops.filter((c) => c.status === "growing");
  const harvestedCrops = crops.filter((c) => c.status === "harvested");
  const totalRevenue = crops.reduce(
    (s, c) => s + (c.yield / 100) * c.sellingPrice,
    0,
  );
  const totalExpenses = crops.reduce(
    (s, c) => s + (c.expenses?.reduce((es, e) => es + e.amount, 0) || 0),
    0,
  );

  const expenseByCategory = crops.reduce((acc, crop) => {
    crop.expenses?.forEach((e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
    });
    return acc;
  }, {});
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-sm text-gray-400">Loading your farm...</div>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title={`Good morning, ${user?.name?.split(" ")[0] || "Farmer"}`}
        subtitle={
          <>
            Rabi Season 2026 · {user?.location?.district || "Pune"},{" "}
            {user?.location?.state || "Maharashtra"}
            {weather?.city &&
              ` · ${weather.forecast?.[0]?.temp}°C ${weather.forecast?.[0]?.description}`}
          </>
        }
        action={
          <Link
            to="/add-crop"
            className={`${buttonClasses("primary")} flex items-center gap-2`}
          >
            <span>+</span> Add Crop
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active Crops"
          value={activeCrops.length}
          sub={`${harvestedCrops.length} harvested this season`}
        />
        <StatCard
          label="Total Yield"
          value={`${(crops.reduce((s, c) => s + c.yield, 0) / 1000).toFixed(1)}T`}
          sub="Across all crops"
        />
        <StatCard
          label="Net Profit"
          value={formatCurrency(totalRevenue - totalExpenses)}
          sub={`Revenue: ${formatCurrency(totalRevenue)}`}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          sub="Seeds, fertilizer, labor"
          subColor="text-amber-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Monthly Yield (kg)
            </h2>
            <span className="text-xs text-gray-400">
              Based on harvested crops
            </span>
          </div>
          {yieldData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={yieldData} barSize={32}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${v} kg`, "Yield"]}
                />
                <Bar dataKey="yield" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className="text-sm text-gray-400">No harvested crops yet</p>
              <p className="text-xs text-gray-300">
                Chart will appear after your first harvest
              </p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Expense Breakdown
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-gray-300">
              No expenses yet
            </div>
          )}
        </Card>
      </div>

      {/* Crops */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Your Crops</h2>
            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
              {["all", "growing", "harvested"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3 py-1 rounded-md capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-white shadow-sm text-gray-800 font-medium"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab}{" "}
                  {tab === "all"
                    ? `(${crops.length})`
                    : tab === "growing"
                      ? `(${activeCrops.length})`
                      : `(${harvestedCrops.length})`}
                </button>
              ))}
            </div>
          </div>

          {filteredCrops.length === 0 ? (
            <EmptyState
              title={`No ${activeTab !== "all" ? activeTab : ""} crops yet`}
              action={
                <Link to="/add-crop" className={buttonClasses("primary")}>
                  + Add your first crop
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCrops.map((crop) => (
                <CropCard key={crop._id} crop={crop} onEdit={setEditingCrop} />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit modal */}
      {editingCrop && (
        <EditCropModal
          crop={editingCrop}
          onClose={() => setEditingCrop(null)}
          onSaved={handleCropSaved}
          onDeleted={handleCropDeleted}
        />
      )}
    </div>
  );
}
