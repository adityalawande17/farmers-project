// The centered "nothing here yet" pattern repeated in DiseaseDetector,
// Dashboard's crop list, MandiPrices, etc.
export default function EmptyState({ title, subtitle, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center gap-2 ${className}`}>
      <p className="text-sm text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      {action}
    </div>
  );
}
