"use client";
import { CheckCircle2 } from "lucide-react";

const MODELS = [
  { id: "ANN",                label: "ANN (Deep Learning)", hint: "Best accuracy" },
  { id: "LogisticRegression", label: "Logistic Regression", hint: "Baseline model" },
  { id: "RandomForest",       label: "Random Forest",       hint: "Baseline model" },
];

export default function ModelSelector({ value, onChange }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 mb-3">AI Model Selection</h2>
      <div className="grid grid-cols-3 gap-3">
        {MODELS.map(m => {
          const selected = value === m.id;
          return (
            <label key={m.id}
              className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${selected ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300"}`}>
              <input type="radio" name="model" value={m.id} checked={selected} onChange={() => onChange(m.id)} className="sr-only"/>
              <span className="font-semibold text-sm text-gray-900">{m.label}</span>
              <span className="text-xs text-gray-500 mt-1">{m.hint}</span>
              {selected && <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-red-600"/>}
            </label>
          );
        })}
      </div>
    </div>
  );
}
