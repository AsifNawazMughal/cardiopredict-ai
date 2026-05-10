"use client";

const STYLES = {
  Low:    "bg-green-100 text-green-700 border-green-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  High:   "bg-red-100 text-red-700 border-red-200",
};

export default function RiskBadge({ risk }) {
  const style = STYLES[risk] || "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {risk}
    </span>
  );
}
