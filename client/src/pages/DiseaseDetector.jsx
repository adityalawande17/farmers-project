import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API } from "../context/AuthContext";

const SEVERITY_COLORS = {
  None: "bg-green-50 text-green-800",
  Mild: "bg-yellow-50 text-yellow-800",
  Moderate: "bg-amber-50 text-amber-800",
  Severe: "bg-red-50 text-red-800",
};

const URGENCY_COLORS = {
  Immediate: "text-red-600",
  "Within a week": "text-amber-600",
  Monitor: "text-green-600",
};

export default function DiseaseDetector() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const inputRef = useRef();

  // Load real detection history from backend on mount
  useEffect(() => {
    axios
      .get(`${API}/disease/history`)
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const detect = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await axios.post(`${API}/disease/detect`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data.result);
      // Add to local history immediately without refetching
      setHistory((prev) => [
        {
          disease: data.result.disease,
          severity: data.result.severity,
          crop: data.result.affected_part || "Unknown",
          createdAt: new Date().toISOString(),
          result: data.result,
        },
        ...prev,
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Detection failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setFile(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-medium text-gray-900">
          Crop Disease Detector
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Upload a photo of your crop or leaf for instant AI diagnosis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Upload Crop Photo
            </h2>
            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
              AI Vision
            </span>
          </div>

          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-600">
                Click or drag & drop
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG · Max 5MB</p>
              <p className="text-xs text-gray-400 mt-3">
                Take a clear photo of the affected leaf or crop area
              </p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="uploaded"
                className="w-full h-64 object-cover rounded-xl"
              />
              <button
                onClick={reset}
                className="absolute top-2 right-2 bg-white text-gray-600 text-xs px-3 py-1 rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200"
              >
                ✕ Remove
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {error && (
            <div className="bg-red-50 text-red-700 text-xs px-4 py-3 rounded-lg mt-4 border border-red-100">
              {error}
            </div>
          )}

          {file && !result && (
            <button
              onClick={detect}
              disabled={loading}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
            >
              {loading ? " Analyzing image..." : " Detect Disease"}
            </button>
          )}

          {/* Result */}
          {result && (
            <div className="mt-4 flex flex-col gap-3">
              <div
                className={`p-4 rounded-xl ${result.disease === "Healthy" ? "bg-green-50" : "bg-amber-50"}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div
                      className={`font-semibold text-sm ${result.disease === "Healthy" ? "text-green-800" : "text-amber-800"}`}
                    >
                      {result.disease === "Healthy" ? "✅ " : "⚠️ "}
                      {result.disease}
                    </div>
                    {result.affected_part && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Affects: {result.affected_part}
                      </div>
                    )}
                  </div>
                  {result.severity && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLORS[result.severity] || "bg-gray-100 text-gray-600"}`}
                    >
                      {result.severity}
                    </span>
                  )}
                </div>
                {result.cause && (
                  <p className="text-xs text-gray-600 mt-1">{result.cause}</p>
                )}
                {result.urgency && (
                  <p
                    className={`text-xs font-medium mt-2 ${URGENCY_COLORS[result.urgency] || "text-gray-600"}`}
                  >
                    Urgency: {result.urgency}
                  </p>
                )}
              </div>

              {result.treatment?.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-xs font-semibold text-blue-800 mb-2">
                    Treatment Steps
                  </div>
                  <ol className="flex flex-col gap-1">
                    {result.treatment.map((t, i) => (
                      <li key={i} className="text-xs text-blue-700 flex gap-2">
                        <span className="font-medium shrink-0">{i + 1}.</span>
                        {t}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {result.organic_solution && (
                <div className="bg-green-50 p-3 rounded-xl">
                  <div className="text-xs font-semibold text-green-800 mb-1">
                    🌿 Organic Option
                  </div>
                  <p className="text-xs text-green-700">
                    {result.organic_solution}
                  </p>
                </div>
              )}

              <button
                onClick={reset}
                className="text-xs text-gray-500 hover:text-gray-700 underline text-center"
              >
                Scan another photo
              </button>
            </div>
          )}
        </div>

        {/* Recent Detections — real data only */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Your Detection History
          </h2>

          {historyLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-gray-50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <p className="text-sm text-gray-400">No detections yet</p>
              <p className="text-xs text-gray-300">
                Upload a crop photo to get started
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {d.disease}
                    </div>
                    <div className="text-xs text-gray-400">
                      {d.crop && `${d.crop} · `}
                      {new Date(d.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLORS[d.severity] || "bg-gray-100 text-gray-600"}`}
                  >
                    {d.severity === "None" ? "Healthy" : d.severity || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Photo Tips */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Photo Tips
            </h3>
            <div className="flex flex-col gap-2">
              {[
                " Take photo in natural daylight",
                " Focus on the affected area clearly",
                " Include both healthy and diseased parts",
                " Hold camera 15–20 cm from leaf",
              ].map((tip, i) => (
                <p key={i} className="text-xs text-gray-400">
                  {tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
