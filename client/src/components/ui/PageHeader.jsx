// The <h1 className="text-2xl font-serif..."> + subtitle pattern repeated
// at the top of Dashboard, MandiPrices, AddCrop, DiseaseDetector, and
// WeatherAdvisor. `action` is for the occasional header-right button
// (Dashboard's "+ Add Crop" link).
export default function PageHeader({ title, subtitle, action, className = "" }) {
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
