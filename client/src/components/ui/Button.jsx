// Consolidates the three button styles already in consistent use across
// the app: solid primary (brand green), outlined secondary, and the
// dashed "add something" button (see AddCrop's "+ Add Expense").
const VARIANTS = {
  primary: "bg-brand-500 hover:bg-brand-600 text-white",
  secondary: "border border-gray-200 text-gray-600 hover:bg-gray-50",
  dashed:
    "border border-dashed border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`font-medium rounded-xl text-sm px-5 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
