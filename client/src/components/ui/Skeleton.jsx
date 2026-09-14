// Just the pulse animation — shape and color are entirely the caller's via
// className. Skeleton shapes differ too much per context (chat bubbles vs.
// history rows vs. stat cards) to hardcode, and Tailwind utility classes
// don't reliably override each other by source order in a class string, so
// baking in a default bg/rounding here would silently fight a caller's own
// classes instead of yielding to them.
export default function Skeleton({ className = "" }) {
  return <div className={`animate-pulse ${className}`} />;
}
