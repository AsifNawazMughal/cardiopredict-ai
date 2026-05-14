/**
 * Animated placeholder for loading states. Tailwind's `animate-pulse` gives
 * the gentle gray fade. Tweak `className` for size/shape per usage.
 */
export default function Skeleton({ className = "" }) {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} aria-hidden="true" />
  );
}
