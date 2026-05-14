"use client";
import Field from "@/components/Field";
import { Activity, ChevronDown } from "lucide-react";

const CHEST_PAIN = ["Typical Angina","Atypical Angina","Non-Anginal Pain","Asymptomatic"];
const ECG       = ["Normal","ST-T Wave Abnormality","Left Ventricular Hypertrophy"];
const ST_SLOPE  = ["Upsloping","Flat","Downsloping"];
const THAL      = ["Normal","Fixed Defect","Reversible Defect","Unknown"];

export default function ClinicalSection({ form, set }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-500"/> Clinical Health Parameters
        </h2>
        <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap">Risk Model Inputs</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <Field label="Cholesterol (mg/dl)" type="number" value={form.cholesterol} onChange={v=>set("cholesterol",v)} min="0" max="600" placeholder="e.g. 200" required hint="Normal: <200 mg/dl"/>
        <Field label="Max Heart Rate (bpm)" type="number" value={form.max_heart_rate} onChange={v=>set("max_heart_rate",v)} min="60" max="220" placeholder="e.g. 150" required hint="Normal: 60–100 bpm"/>
        <Field label="ST Depression" type="number" value={form.st_depression} onChange={v=>set("st_depression",v)} step="0.1" min="0" max="10" placeholder="e.g. 1.0" hint="Range: 0.0–6.2"/>

        <Select label="Chest Pain Type" value={form.chest_pain_type} onChange={v=>set("chest_pain_type",v)} options={CHEST_PAIN}/>
        <Select label="Resting ECG"     value={form.resting_ecg}     onChange={v=>set("resting_ecg",v)}     options={ECG}/>
        <Select label="ST Slope"        value={form.st_slope}        onChange={v=>set("st_slope",v)}        options={ST_SLOPE}/>

        <YesNoRadio label="Fasting Blood Sugar >120 mg/dl" name="fbs" value={form.fasting_blood_sugar} onChange={v=>set("fasting_blood_sugar",v)}/>
        <YesNoRadio label="Exercise-Induced Angina" name="ang" value={form.exercise_angina} onChange={v=>set("exercise_angina",v)}/>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Major Vessels (0–3)</label>
          <div className="flex gap-2 mt-1.5">
            {[0,1,2,3].map(n => (
              <button key={n} type="button" onClick={() => set("vessels_count", String(n))}
                className={`w-10 h-10 rounded-lg text-sm font-bold border transition-colors ${form.vessels_count===String(n) ? "bg-red-600 text-white border-red-600" : "border-gray-300 text-gray-700 hover:border-red-400"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <Select label="Thalassemia" value={form.thalassemia} onChange={v=>set("thalassemia",v)} options={THAL}/>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <select value={value} onChange={e=>onChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white pr-8">
          {options.map((o,i) => <option key={i} value={i}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"/>
      </div>
    </div>
  );
}

function YesNoRadio({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-3 mt-2">
        {["No","Yes"].map((l,i) => (
          <label key={l} className="flex items-center gap-1.5 text-sm text-gray-900 cursor-pointer">
            <input type="radio" name={name} checked={value===String(i)} onChange={() => onChange(String(i))} className="text-red-600"/>
            {l}
          </label>
        ))}
      </div>
    </div>
  );
}
