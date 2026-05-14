import { Heart } from "lucide-react";

/**
 * On-brand loading indicator — a heart that beats in a real lub-dub rhythm,
 * with a soft red glow pulsing behind it. The keyframes live in globals.css.
 *
 * <Loading />                       // small heartbeat
 * <Loading label="Loading…" />      // heartbeat with caption to the right
 * <Loading size="lg" />             // bigger
 * <Loading center />                // centers itself in its container
 */
export default function Loading({ label, size = "md", center = false, className = "" }) {
  const sizes = {
    sm: { wrapper: "w-6 h-6",  heart: "w-4 h-4",  text: "text-xs" },
    md: { wrapper: "w-8 h-8",  heart: "w-5 h-5",  text: "text-sm" },
    lg: { wrapper: "w-12 h-12", heart: "w-7 h-7",  text: "text-sm" },
    xl: { wrapper: "w-16 h-16", heart: "w-10 h-10", text: "text-base" },
  };
  const s = sizes[size] || sizes.md;

  const heart = (
    <span className={`relative inline-flex items-center justify-center ${s.wrapper}`}>
      <span className={`absolute inset-0 rounded-full bg-red-400/50 animate-heart-glow`} aria-hidden="true" />
      <Heart
        className={`relative ${s.heart} text-red-600 animate-heartbeat`}
        fill="currentColor"
      />
    </span>
  );

  const content = label ? (
    <div className={`flex items-center gap-3 ${s.text} text-gray-600`}>
      {heart}
      <span>{label}</span>
    </div>
  ) : (
    heart
  );

  if (center) {
    return (
      <div className={`flex items-center justify-center ${className}`} role="status" aria-label={label || "Loading"}>
        {content}
      </div>
    );
  }
  return <span className={className} role="status" aria-label={label || "Loading"}>{content}</span>;
}
