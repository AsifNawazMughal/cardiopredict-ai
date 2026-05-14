"use client";
import { Brain, TrendingUp, TrendingDown } from "lucide-react";

/**
 * Displays per-feature contributions to the predicted class's log-odds.
 * Positive impact = pushed toward the predicted class; negative = pushed away.
 * The model is multinomial logistic regression so contribution = coef * scaled_value.
 */
export default function FeatureContributions({ contributions, riskClass }) {
  if (!contributions || contributions.length === 0) return null;

  const top = contributions.slice(0, 8);
  const maxAbs = Math.max(...top.map((c) => Math.abs(c.impact)), 0.1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Brain className="w-4 h-4 text-red-500" />
          Why this prediction?
        </h3>
        <p className="text-xs text-gray-500">
          Top features driving the <strong className="text-gray-700">{riskClass} Risk</strong> classification
        </p>
      </div>

      <div className="space-y-2.5">
        {top.map(({ feature, label, impact }) => {
          const positive = impact > 0;
          const width = Math.min((Math.abs(impact) / maxAbs) * 50, 50); // % of half-width
          return (
            <div key={feature} className="flex items-center gap-3 text-sm">
              <div className="w-36 sm:w-44 text-gray-700 truncate" title={label}>
                {label}
              </div>
              <div className="flex-1 flex items-center">
                {/* Left half (negative / pushes away) */}
                <div className="flex-1 flex justify-end h-5 relative">
                  {!positive && (
                    <div
                      className="h-full bg-green-400 rounded-l"
                      style={{ width: `${width}%` }}
                    />
                  )}
                </div>
                <div className="w-px h-5 bg-gray-300" />
                {/* Right half (positive / pushes toward) */}
                <div className="flex-1 h-5 relative">
                  {positive && (
                    <div
                      className="h-full bg-red-500 rounded-r"
                      style={{ width: `${width}%` }}
                    />
                  )}
                </div>
              </div>
              <div className={`w-12 text-right text-xs font-mono font-semibold ${positive ? "text-red-600" : "text-green-600"}`}>
                {positive ? "+" : ""}{impact.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-red-500" />
          Pushed toward {riskClass} Risk
        </span>
        <span className="flex items-center gap-1.5">
          <TrendingDown className="w-3 h-3 text-green-500" />
          Pushed away
        </span>
        <span className="text-gray-400 italic ml-auto">
          Coefficients from the trained logistic-regression model.
        </span>
      </div>
    </div>
  );
}
