import { FIELD_LABELS, humanize } from "./format";

export default function HealthParamsGrid({ healthData }) {
  if (!healthData || Object.keys(healthData).length === 0) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-3">Patient Health Parameters Used</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.entries(healthData).map(([k, v]) => (
          <div key={k} className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">{FIELD_LABELS[k] || k}</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{humanize(k, Number(v))}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
