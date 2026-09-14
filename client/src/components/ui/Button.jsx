// Consolidates the three button styles already in consistent use across
// the app: solid primary (brand green), outlined secondary, and the
// dashed "add something" button (see AddCrop's "+ Add Expense").
const VARIANTS = {
  primary: "bg-brand-500 hover:bg-brand-600 text-white",
  secondary: "border border-gray-200 text-gray-600 hover:bg-gray-50",
  dashed:
    "border border-dashed border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600",
};

// Three real sizes observed across the app, each repeated in multiple
// files: "sm" for compact inline-form buttons (expense Add/Cancel in
// AddCrop and EditCropModal), "md" (the original default) for buttons
// beside an input (Send/Ask, header actions), "lg" for full-width primary
// form-submit CTAs (Login, Register, AddCrop's bottom row).
const SIZES = {
  sm: "text-sm py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-sm py-3",
};

const BASE =
  "font-medium rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

// Exported so a <Link> (which needs router navigation, not a <button>
// element) can look identical to a real Button without duplicating the
// class strings — e.g. Dashboard's "+ Add Crop" link.
export function buttonClasses(variant = "primary", size = "md") {
  return `${BASE} ${SIZES[size] || SIZES.md} ${VARIANTS[variant] || VARIANTS.primary}`;
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <button className={`${buttonClasses(variant, size)} ${className}`} {...props}>
      {children}
    </button>
  );
}
