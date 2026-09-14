// Consolidates the three button styles already in consistent use across
// the app: solid primary (brand green), outlined secondary, and the
// dashed "add something" button (see AddCrop's "+ Add Expense").
const VARIANTS = {
  primary: "bg-brand-500 hover:bg-brand-600 text-white",
  secondary: "border border-gray-200 text-gray-600 hover:bg-gray-50",
  dashed:
    "border border-dashed border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600",
};

const BASE =
  "font-medium rounded-xl text-sm px-5 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

// Exported so a <Link> (which needs router navigation, not a <button>
// element) can look identical to a real Button without duplicating the
// class strings — e.g. Dashboard's "+ Add Crop" link.
export function buttonClasses(variant = "primary") {
  return `${BASE} ${VARIANTS[variant] || VARIANTS.primary}`;
}

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button className={`${buttonClasses(variant)} ${className}`} {...props}>
      {children}
    </button>
  );
}
