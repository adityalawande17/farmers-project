// Consolidates the repeated per-page color-mapping objects (DiseaseDetector's
// SEVERITY_COLORS, Dashboard's SEASON_COLORS, the old WeatherAdvisor colorMap,
// etc.) into one component with a fixed set of tones, so status coloring
// stays consistent across pages instead of being reinvented per file.
const TONES = {
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  teal: "bg-teal-50 text-teal-700",
  gray: "bg-gray-100 text-gray-600",
};

export default function Badge({ tone = "gray", children, className = "" }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full capitalize ${TONES[tone] || TONES.gray} ${className}`}
    >
      {children}
    </span>
  );
}
