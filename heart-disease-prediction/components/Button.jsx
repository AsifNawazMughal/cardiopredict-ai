"use client";

const VARIANTS = {
  primary: "bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  blue:    "bg-blue-600 hover:bg-blue-700 text-white font-medium",
};

const SIZES = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {children}
    </button>
  );
}
