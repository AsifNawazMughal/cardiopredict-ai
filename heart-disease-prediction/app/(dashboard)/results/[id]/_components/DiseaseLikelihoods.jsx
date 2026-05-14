"use client";
import { Stethoscope, Lock } from "lucide-react";

/**
 * Maps the model's risk classification to specific cardiac-disease likelihoods.
 *
 * The UCI Heart Disease dataset is essentially measuring Coronary Artery
 * Disease (CAD), so we report that one as a real percentage derived from the
 * model output (P(Medium) + P(High)). The rest are flagged "Coming soon"
 * because they'd need additional datasets and separately trained models —
 * showing them here previews the roadmap without pretending we have signal
 * we don't.
 */
export default function DiseaseLikelihoods({ probabilities }) {
  const cadLikelihood = Math.round((probabilities?.medium || 0) + (probabilities?.high || 0));

  const diseases = [
    {
      name: "Coronary Artery Disease (CAD)",
      desc: "Narrowing of the coronary arteries — the disease the UCI dataset directly measures.",
      percent: cadLikelihood,
      ready: true,
    },
    {
      name: "Hypertensive Heart Disease",
      desc: "Long-term effects of high blood pressure on the heart muscle.",
      ready: false,
    },
    {
      name: "Atrial Fibrillation",
      desc: "Irregular and often rapid heart rhythm.",
      ready: false,
    },
    {
      name: "Heart Failure",
      desc: "Heart's inability to pump enough blood to meet the body's needs.",
      ready: false,
    },
    {
      name: "Valvular Heart Disease",
      desc: "Damage to one or more of the heart's valves.",
      ready: false,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-red-500" /> Specific Heart-Disease Likelihoods
        </h3>
        <p className="text-xs text-gray-500">
          Per-condition probabilities. Only CAD is currently modeled.
        </p>
      </div>

      <div className="space-y-3">
        {diseases.map((d) => (
          <div
            key={d.name}
            className={`rounded-lg border p-3 ${d.ready ? "border-gray-200 bg-white" : "border-dashed border-gray-200 bg-gray-50"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${d.ready ? "text-gray-900" : "text-gray-500"}`}>
                  {d.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{d.desc}</p>
              </div>
              {d.ready ? (
                <div className="text-right shrink-0">
                  <p className={`text-2xl font-bold ${d.percent >= 70 ? "text-red-600" : d.percent >= 40 ? "text-amber-600" : "text-green-600"}`}>
                    {d.percent}<span className="text-base">%</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">likelihood</p>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full shrink-0">
                  <Lock className="w-3 h-3" /> Coming soon
                </span>
              )}
            </div>
            {d.ready && (
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${d.percent >= 70 ? "bg-red-500" : d.percent >= 40 ? "bg-amber-500" : "bg-green-500"}`}
                  style={{ width: `${d.percent}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
