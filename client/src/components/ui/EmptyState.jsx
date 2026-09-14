// The centered "nothing here yet" pattern repeated in DiseaseDetector,
// Dashboard's crop list, MandiPrices, etc. `padding` is a controlled prop
// (same pattern as Card's `padding`) rather than a className override,
// since a caller-supplied padding class can't reliably beat a hardcoded
// one baked into the same string — this is deliberately not the same
// mistake Skeleton/Button/ErrorBanner made before being fixed.
export default function EmptyState({
  title,
  subtitle,
  action,
  padding = "py-12",
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center ${padding} text-center gap-2 ${className}`}>
      <p className="text-sm text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      {action}
    </div>
  );
}
