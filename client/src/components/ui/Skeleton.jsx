// The animate-pulse loading block repeated with slightly different shapes
// everywhere (Dashboard's AI alerts, DiseaseDetector's history, chat
// bubbles). Deliberately unopinionated about size — pass height/width via
// className to fit each context, same as before, just without duplicating
// the base classes.
export default function Skeleton({ className = "" }) {
  return <div className={`bg-gray-50 rounded-xl animate-pulse ${className}`} />;
}
