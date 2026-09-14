// The "bg-white rounded-2xl border border-gray-100 p-5" pattern repeated
// across every page in the app, centralized so it can change in one place.
export default function Card({ children, className = "", padding = "p-5" }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 ${padding} ${className}`}>
      {children}
    </div>
  );
}
