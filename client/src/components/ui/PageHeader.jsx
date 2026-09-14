// Two real header patterns observed across the app:
// - "page" (default): the <h1 text-2xl font-serif> + subtitle + mb-6 block
//   used by Dashboard, MandiPrices, AddCrop, DiseaseDetector, WeatherAdvisor.
// - "bordered": the smaller text-xl header with a white bg + bottom border,
//   embedded in a flex-col layout — used by Chatbot and Advisor.
export default function PageHeader({
  title,
  subtitle,
  action,
  variant = "page",
  className = "",
}) {
  if (variant === "bordered") {
    return (
      <div className={`bg-white border-b border-gray-100 px-6 py-4 ${className}`}>
        <h1 className="text-xl font-serif font-medium text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className={`flex items-start justify-between gap-3 flex-wrap mb-6 ${className}`}>
      <div>
        <h1 className="text-2xl font-serif font-medium text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
