// The red error-message banner repeated across every form in the app
// (Login, Register, AddCrop, EditCropModal, WeatherAdvisor) — previously
// duplicated with inconsistent rounding (rounded-lg in some places,
// rounded-xl in others); standardized on rounded-xl here. Returns null
// when there's nothing to show, so callers can write
// <ErrorBanner>{error}</ErrorBanner> unconditionally instead of
// {error && <div>...}</div>} at every call site.
export default function ErrorBanner({ children, className = "" }) {
  if (!children) return null;
  return (
    <div
      className={`bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100 ${className}`}
    >
      {children}
    </div>
  );
}
