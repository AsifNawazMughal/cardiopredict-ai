import { Loader2 } from "lucide-react";

/**
 * Reusable loading indicator.
 *
 * <Loading />                       // small inline spinner
 * <Loading label="Loading…" />      // spinner with caption
 * <Loading size="lg" />             // bigger
 * <Loading center />                // centers itself inside its container
 */
export default function Loading({ label, size = "md", center = false, className = "" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-9 h-9",
    xl: "w-12 h-12",
  };
  const spinner = (
    <Loader2 className={`${sizes[size] || sizes.md} text-red-600 animate-spin`} />
  );
  const content = label ? (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {spinner}
      <span>{label}</span>
    </div>
  ) : (
    spinner
  );
  if (center) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {content}
      </div>
    );
  }
  return <span className={className}>{content}</span>;
}
